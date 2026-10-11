import { User, HouseholdProfile, RecyclerProfile } from "../models/index.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { normalizePhone } from "../utils/phone.js";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors.js";
import { sendEmail } from "../utils/mailer.js";
import { ROLES } from "../config/constants.js";
import { logger } from "../utils/logger.js";

function toPublicUser(user) {
  return {
    id: user._id,
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    displayName: user.displayName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function register(input) {
  const { email, phone, password, role, displayName } = input;

  const normalizedPhone = phone ? normalizePhone(phone) : undefined;

  // ── Duplicate checks (pre-empt DB unique errors for nicer messages) ──
  if (email) {
    const existing = await User.findOne({ email });
    if (existing) throw new ConflictError("Email already registered");
  }
  if (normalizedPhone) {
    const existing = await User.findOne({ phone: normalizedPhone });
    if (existing) throw new ConflictError("Phone number already registered");
  }

  const passwordHash = await hashPassword(password);

  // ── Create user ────────────────────────────────────────
  const user = await User.create({
    email: email || undefined,
    phone: normalizedPhone,
    passwordHash,
    role,
    displayName,
  });

  // ── Create role-specific profile ───────────────────────
  try {
    if (role === ROLES.HOUSEHOLD) {
      await HouseholdProfile.create({ userId: user._id });
    } else if (role === ROLES.RECYCLER) {
      // Recyclers fill their profile later via PATCH /api/recyclers/me.
      // We insert a minimal placeholder so the profile always exists.
      await RecyclerProfile.create({
        userId: user._id,
        businessName: displayName,
        // These will be updated via profile edit before they can accept pickups
        serviceAreas: [{ coordinates: [77.209, 28.6139] }], // Delhi center placeholder
        acceptedMaterials: ["newspaper"],                    // placeholder
      });
    }
  } catch (err) {
    // Roll back user creation if profile creation fails
    logger.error(`Profile creation failed for user ${user._id}: ${err.message}`);
    await User.findByIdAndDelete(user._id);
    throw new ValidationError("Failed to create user profile");
  }

  const token = signToken({ userId: user._id, role: user.role });

  // ── Welcome email (fire-and-forget) ────────────────────
  if (user.email) {
    sendEmail({
      to: user.email,
      subject: "Welcome to RecyConnect",
      text: `Hi ${user.displayName},\n\nWelcome to RecyConnect. Start recycling and tracking your impact today.`,
      html: `<p>Hi <strong>${user.displayName}</strong>,</p>
             <p>Welcome to RecyConnect. Start recycling and tracking your impact today.</p>`,
    }).catch((e) => logger.error(`Welcome email error: ${e.message}`));
  }

  return { token, user: toPublicUser(user) };
}

export async function login({ identifier, password }) {
  // Try email first (lowercased by validator), then phone (normalized)
  const normalizedId = identifier.toLowerCase();
  const normalizedPhone = normalizePhone(normalizedId);

  const user = await User.findOne({
    $or: [
      { email: normalizedId },
      { phone: normalizedPhone },
    ],
  }).select("+passwordHash");

  if (!user || !user.isActive) {
    // Same message for both — don't leak which field is wrong
    throw new UnauthorizedError("Invalid credentials");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError("Invalid credentials");

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ userId: user._id, role: user.role });
  return { token, user: toPublicUser(user) };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError("User not found");
  return toPublicUser(user);
}