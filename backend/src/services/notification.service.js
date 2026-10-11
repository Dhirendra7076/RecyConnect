import { User, Listing, Transaction, MaterialCategory } from "../models/index.js";
import { sendEmail } from "../utils/mailer.js";
import { logger } from "../utils/logger.js";

// ─────────────────────────────────────────────────────────
// Wrapper: look up users, compose, send. Never throws.
// ─────────────────────────────────────────────────────────
async function safeSendEmail(to, subject, text, html) {
  if (!to) return;
  try {
    await sendEmail({ to, subject, text, html });
  } catch (err) {
    logger.error(`Notification failed: ${err.message}`);
  }
}

function formatINR(n) {
  if (n === null || n === undefined) return "—";
  return `₹${Number(n).toFixed(2)}`;
}

// ─────────────────────────────────────────────────────────
// LISTING ACCEPTED
// ─────────────────────────────────────────────────────────
export async function notifyListingAccepted(listing) {
  try {
    const [household, recycler, material] = await Promise.all([
      User.findById(listing.householdId).lean(),
      User.findById(listing.acceptedRecyclerId).lean(),
      MaterialCategory.findOne({ code: listing.materialCode }).lean(),
    ]);

    const materialName = material?.displayName || listing.materialCode;

    if (household?.email) {
      await safeSendEmail(
        household.email,
        `Your ${materialName} pickup was accepted`,
        `Hi ${household.displayName},

Good news! ${recycler?.displayName || "A recycler"} has accepted your ${materialName} listing (approx ${listing.estimatedWeightKg} kg).

You can see their details in the RecyConnect app.

— RecyConnect`,
        `<p>Hi <strong>${household.displayName}</strong>,</p>
         <p>Good news! <strong>${recycler?.displayName || "A recycler"}</strong> has accepted your
         <strong>${materialName}</strong> listing (approx ${listing.estimatedWeightKg} kg).</p>
         <p>You can see their details in the RecyConnect app.</p>
         <p>— RecyConnect</p>`
      );
    }

    if (recycler?.email) {
      await safeSendEmail(
        recycler.email,
        `New pickup accepted — ${materialName}`,
        `Hi ${recycler.displayName},

You accepted a pickup for ${materialName} (approx ${listing.estimatedWeightKg} kg).

Pickup address and household contact are visible in the app.

— RecyConnect`,
        `<p>Hi <strong>${recycler.displayName}</strong>,</p>
         <p>You accepted a pickup for <strong>${materialName}</strong> (approx ${listing.estimatedWeightKg} kg).</p>
         <p>Pickup address and household contact are visible in the app.</p>
         <p>— RecyConnect</p>`
      );
    }
  } catch (err) {
    logger.error(`notifyListingAccepted failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────
// LISTING COMPLETED
// ─────────────────────────────────────────────────────────
export async function notifyListingCompleted(transaction, listing) {
  try {
    const [household, recycler, material] = await Promise.all([
      User.findById(transaction.householdId).lean(),
      User.findById(transaction.recyclerId).lean(),
      MaterialCategory.findOne({ code: transaction.materialCode }).lean(),
    ]);

    const materialName = material?.displayName || transaction.materialCode;

    if (household?.email) {
      await safeSendEmail(
        household.email,
        `Pickup completed — you earned ${formatINR(transaction.householdPayout)}`,
        `Hi ${household.displayName},

Your ${materialName} pickup has been completed.

Final weight: ${transaction.finalWeightKg} kg
Rate: ${formatINR(transaction.finalPricePerKg)}/kg
Gross: ${formatINR(transaction.grossAmount)}
Deductions: ${formatINR(transaction.totalDeductions)}
Your payout: ${formatINR(transaction.householdPayout)}

Thank you for recycling with RecyConnect.

— RecyConnect`,
        `<p>Hi <strong>${household.displayName}</strong>,</p>
         <p>Your <strong>${materialName}</strong> pickup has been completed.</p>
         <ul>
           <li>Final weight: <strong>${transaction.finalWeightKg} kg</strong></li>
           <li>Rate: <strong>${formatINR(transaction.finalPricePerKg)}/kg</strong></li>
           <li>Gross: ${formatINR(transaction.grossAmount)}</li>
           <li>Deductions: ${formatINR(transaction.totalDeductions)}</li>
           <li><strong>Your payout: ${formatINR(transaction.householdPayout)}</strong></li>
         </ul>
         <p>Thank you for recycling with RecyConnect.</p>`
      );
    }

    if (recycler?.email) {
      await safeSendEmail(
        recycler.email,
        `Pickup recorded — ${materialName}`,
        `Hi ${recycler.displayName},

You completed a ${materialName} pickup.

Weight: ${transaction.finalWeightKg} kg
Household payout: ${formatINR(transaction.householdPayout)}
Platform fee: ${formatINR(transaction.platformFee)}

— RecyConnect`,
        `<p>Hi <strong>${recycler.displayName}</strong>,</p>
         <p>You completed a <strong>${materialName}</strong> pickup.</p>
         <ul>
           <li>Weight: <strong>${transaction.finalWeightKg} kg</strong></li>
           <li>Household payout: ${formatINR(transaction.householdPayout)}</li>
           <li>Platform fee: ${formatINR(transaction.platformFee)}</li>
         </ul>
         <p>— RecyConnect</p>`
      );
    }
  } catch (err) {
    logger.error(`notifyListingCompleted failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────
// LISTING CANCELLED
// ─────────────────────────────────────────────────────────
export async function notifyListingCancelled(listing, reason, cancelledByUser) {
  try {
    const recipients = new Set();
    if (listing.householdId) recipients.add(String(listing.householdId));
    if (listing.acceptedRecyclerId) recipients.add(String(listing.acceptedRecyclerId));
    recipients.delete(String(cancelledByUser._id));

    if (recipients.size === 0) return;

    const users = await User.find({ _id: { $in: [...recipients] } }).lean();
    const material = await MaterialCategory.findOne({ code: listing.materialCode }).lean();
    const materialName = material?.displayName || listing.materialCode;

    for (const user of users) {
      if (!user.email) continue;
      await safeSendEmail(
        user.email,
        `Listing cancelled — ${materialName}`,
        `Hi ${user.displayName},

The ${materialName} listing has been cancelled by ${cancelledByUser.displayName}.${reason ? `\n\nReason: ${reason}` : ""}

— RecyConnect`,
        `<p>Hi <strong>${user.displayName}</strong>,</p>
         <p>The <strong>${materialName}</strong> listing has been cancelled by ${cancelledByUser.displayName}.</p>
         ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
         <p>— RecyConnect</p>`
      );
    }
  } catch (err) {
    logger.error(`notifyListingCancelled failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────
// Generic helpers used by other code paths
// ─────────────────────────────────────────────────────────
export async function notifyUser(userId, subject, text, html) {
  try {
    const user = await User.findById(userId).lean();
    if (user?.email) {
      await safeSendEmail(user.email, subject, text, html);
    }
  } catch (err) {
    logger.error(`notifyUser failed: ${err.message}`);
  }
}