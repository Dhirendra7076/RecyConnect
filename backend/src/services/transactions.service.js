import { Transaction, Listing, User } from "../models/index.js";
import { PLATFORM_FEE_PERCENT, ROLES } from "../config/constants.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ─────────────────────────────────────────────────────────
// Auto-create transaction when a listing is completed.
// Called by listings.service.completeListing().
// Idempotent: if a transaction already exists for the listing, returns it.
// ─────────────────────────────────────────────────────────
export async function createFromListing(listing) {
  const existing = await Transaction.findOne({ listingId: listing._id });
  if (existing) {
    logger.warn(`Transaction already exists for listing ${listing._id}`);
    return existing;
  }

  const grossAmount = round2(listing.grossAmount || 0);
  const totalDeductions = round2(
    (listing.deductions || []).reduce((s, d) => s + Number(d.amount || 0), 0)
  );
  const householdPayout = round2(Math.max(0, grossAmount - totalDeductions));
  const platformFee = round2((grossAmount * PLATFORM_FEE_PERCENT) / 100);
  const recyclerNetAmount = round2(householdPayout - platformFee);

  const transaction = await Transaction.create({
    listingId: listing._id,
    householdId: listing.householdId,
    recyclerId: listing.acceptedRecyclerId,
    materialCode: listing.materialCode,
    finalWeightKg: listing.finalWeightKg,
    finalPricePerKg: listing.finalPricePerKg,
    grossAmount,
    totalDeductions,
    deductions: listing.deductions || [],
    householdPayout,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    platformFee,
    recyclerNetAmount,
    paymentStatus: "PENDING",
    paymentMethod: "cash",
    completedAt: listing.completedAt || new Date(),
  });

  logger.info(
    `Transaction created: ${transaction._id} — ₹${householdPayout} payout, ₹${platformFee} platform fee`
  );

  return transaction;
}

// ─────────────────────────────────────────────────────────
// List transactions for the current user
// ─────────────────────────────────────────────────────────
export async function listForUser(user, { page = 1, limit = 20, paymentStatus } = {}) {
  const filter = {};
  if (user.role === ROLES.HOUSEHOLD) {
    filter.householdId = user._id;
  } else if (user.role === ROLES.RECYCLER) {
    filter.recyclerId = user._id;
  } else if (user.role === ROLES.ADMIN) {
    // admins see all
  } else {
    throw new ForbiddenError("Unsupported role");
  }

  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const skip = (Math.max(page, 1) - 1) * safeLimit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("listingId", "materialCode status photos")
      .populate("householdId", "displayName")
      .populate("recyclerId", "displayName")
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  // Aggregate totals for this user
  const totalsAgg = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalGross: { $sum: "$grossAmount" },
        totalPayout: { $sum: "$householdPayout" },
        totalWeightKg: { $sum: "$finalWeightKg" },
        totalPlatformFee: { $sum: "$platformFee" },
        count: { $sum: 1 },
      },
    },
  ]);

  const totals = totalsAgg[0] || {
    totalGross: 0,
    totalPayout: 0,
    totalWeightKg: 0,
    totalPlatformFee: 0,
    count: 0,
  };
  delete totals._id;

  return {
    transactions,
    totals,
    total,
    page: Math.max(page, 1),
    limit: safeLimit,
    pages: Math.ceil(total / safeLimit) || 1,
  };
}

// ─────────────────────────────────────────────────────────
// Get one transaction (household, recycler, admin)
// ─────────────────────────────────────────────────────────
export async function getById(user, transactionId) {
  const tx = await Transaction.findById(transactionId)
    .populate("listingId")
    .populate("householdId", "displayName email phone")
    .populate("recyclerId", "displayName email phone")
    .lean();

  if (!tx) throw new NotFoundError("Transaction not found");

  const uid = String(user._id);
  const isHousehold = String(tx.householdId?._id || tx.householdId) === uid;
  const isRecycler = String(tx.recyclerId?._id || tx.recyclerId) === uid;
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isHousehold && !isRecycler && !isAdmin) {
    throw new ForbiddenError("You cannot view this transaction");
  }

  return tx;
}

// ─────────────────────────────────────────────────────────
// Mark payment as completed
// ─────────────────────────────────────────────────────────
export async function markPaid(user, transactionId, { paymentMethod, paymentReference }) {
  const tx = await Transaction.findById(transactionId);
  if (!tx) throw new NotFoundError("Transaction not found");

  const uid = String(user._id);
  const isRecycler = String(tx.recyclerId) === uid;
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isRecycler && !isAdmin) {
    throw new ForbiddenError("Only the recycler can mark payment as done");
  }

  if (tx.paymentStatus === "COMPLETED") {
    return tx.toJSON(); // idempotent
  }

  tx.paymentStatus = "COMPLETED";
  tx.paymentMethod = paymentMethod || tx.paymentMethod;
  if (paymentReference) tx.paymentReference = paymentReference;
  tx.paidAt = new Date();
  await tx.save();

  // Bump recycler's total earnings + pickup count
  await User.findByIdAndUpdate(tx.recyclerId, {
    $inc: { "stats.totalEarnings": tx.householdPayout },
  }).catch(() => {}); // ignore if user has no stats field yet

  logger.info(`Transaction ${tx._id} marked COMPLETED`);
  return tx.toJSON();
}