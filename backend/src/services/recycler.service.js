import { RecyclerProfile, User } from "../models/index.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ─────────────────────────────────────────────────────────
// Get current user's recycler profile
// ─────────────────────────────────────────────────────────
export async function getMyProfile(user) {
  const profile = await RecyclerProfile.findOne({ userId: user._id }).lean();
  if (!profile) {
    throw new NotFoundError("Recycler profile not found");
  }

  // Attach the user's basic info
  const owner = await User.findById(user._id)
    .select("displayName email phone")
    .lean();

  return { ...profile, owner };
}

// ─────────────────────────────────────────────────────────
// Update recycler profile
// ─────────────────────────────────────────────────────────
export async function updateMyProfile(user, payload) {
  const profile = await RecyclerProfile.findOne({ userId: user._id });
  if (!profile) throw new NotFoundError("Recycler profile not found");

  // ── businessName ───────────────────────────────────────
  if (payload.businessName !== undefined) {
    profile.businessName = payload.businessName;
  }

  // ── serviceAreas ───────────────────────────────────────
  if (payload.serviceAreas) {
    profile.serviceAreas = payload.serviceAreas.map((a) => ({
      type: "Point",
      coordinates: [a.lng, a.lat],
      radiusKm: a.radiusKm,
    }));
  }

  // ── acceptedMaterials ──────────────────────────────────
  if (payload.acceptedMaterials) {
    profile.acceptedMaterials = payload.acceptedMaterials;
  }

  // ── minimumPickupKg ────────────────────────────────────
  if (payload.minimumPickupKg !== undefined) {
    profile.minimumPickupKg = payload.minimumPickupKg;
  }

  // ── operatingHours ─────────────────────────────────────
  if (payload.operatingHours) {
    profile.operatingHours = payload.operatingHours;
  }

  // ── indicativePrices ───────────────────────────────────
  if (payload.indicativePrices) {
    const now = new Date();
    profile.indicativePrices = payload.indicativePrices.map((p) => ({
      materialCode: p.materialCode,
      pricePerKg: p.pricePerKg,
      updatedAt: now,
      source: "self_declared",
    }));
  }

  await profile.save();
  logger.info(`Recycler profile updated: ${profile._id}`);
  return profile.toJSON();
}

// ─────────────────────────────────────────────────────────
// Get public recycler profile by ID
// ─────────────────────────────────────────────────────────
export async function getPublicProfile(recyclerId) {
  const profile = await RecyclerProfile.findById(recyclerId).lean();
  if (!profile) throw new NotFoundError("Recycler not found");

  const owner = await User.findById(profile.userId)
    .select("displayName email phone")
    .lean();

  // Redact contact — user can only reach out via accepting a listing
  return {
    id: profile._id,
    businessName: profile.businessName,
    serviceAreas: profile.serviceAreas,
    acceptedMaterials: profile.acceptedMaterials,
    minimumPickupKg: profile.minimumPickupKg,
    operatingHours: profile.operatingHours,
    indicativePrices: profile.indicativePrices,
    completedPickups: profile.completedPickups,
    averageRating: profile.averageRating,
    totalRatings: profile.totalRatings,
    verificationStatus: profile.verificationStatus,
    owner: { displayName: owner?.displayName },
    createdAt: profile.createdAt,
  };
}