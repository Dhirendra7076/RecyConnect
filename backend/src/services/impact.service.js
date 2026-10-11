import { ImpactRecord, Transaction, MaterialCategory } from "../models/index.js";
import { ROLES } from "../config/constants.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ─────────────────────────────────────────────────────────
// Create ImpactRecord from a completed transaction.
// Idempotent — returns existing record if already present.
// Called by listings.service.completeListing().
// ─────────────────────────────────────────────────────────
export async function createFromTransaction(transaction) {
  const existing = await ImpactRecord.findOne({
    listingId: transaction.listingId,
  });
  if (existing) {
    logger.warn(`ImpactRecord already exists for listing ${transaction.listingId}`);
    return existing;
  }

  const material = await MaterialCategory.findOne({
    code: transaction.materialCode,
  }).lean();

  if (!material) {
    logger.error(
      `Cannot create impact record — material ${transaction.materialCode} not found`
    );
    return null;
  }

  const factor = Number(material.co2AvoidedPerKg || 0);
  const co2AvoidedKg = round2(transaction.finalWeightKg * factor);

  const record = await ImpactRecord.create({
    listingId: transaction.listingId,
    transactionId: transaction._id,
    householdId: transaction.householdId,
    recyclerId: transaction.recyclerId,
    materialCode: transaction.materialCode,
    weightKg: transaction.finalWeightKg,
    co2AvoidedKg,
    emissionFactorUsed: factor,
    recoveryStatus: "COLLECTED", // starts here; upgraded when evidence arrives
  });

  logger.info(
    `ImpactRecord created: ${record._id} — ${record.weightKg}kg → ${co2AvoidedKg}kg CO₂e avoided`
  );

  return record;
}

// ─────────────────────────────────────────────────────────
// Aggregate impact summary for the current user (role-aware)
// ─────────────────────────────────────────────────────────
export async function getSummaryForUser(user) {
  const match = {};
  if (user.role === ROLES.HOUSEHOLD) {
    match.householdId = user._id;
  } else if (user.role === ROLES.RECYCLER) {
    match.recyclerId = user._id;
  } else if (user.role === ROLES.ADMIN) {
    // all records
  } else {
    throw new ForbiddenError("Unsupported role");
  }

  const agg = await ImpactRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalWeightKg: { $sum: "$weightKg" },
        totalCo2AvoidedKg: { $sum: "$co2AvoidedKg" },
        recordCount: { $sum: 1 },
        // Track the recovery lifecycle honestly
        collectedKg: {
          $sum: {
            $cond: [{ $eq: ["$recoveryStatus", "COLLECTED"] }, "$weightKg", 0],
          },
        },
        recoveredKg: {
          $sum: {
            $cond: [{ $eq: ["$recoveryStatus", "RECOVERED"] }, "$weightKg", 0],
          },
        },
        verifiedRecycledKg: {
          $sum: {
            $cond: [
              { $eq: ["$recoveryStatus", "VERIFIED_RECYCLED"] },
              "$weightKg",
              0,
            ],
          },
        },
      },
    },
  ]);

  const row = agg[0] || {
    totalWeightKg: 0,
    totalCo2AvoidedKg: 0,
    recordCount: 0,
    collectedKg: 0,
    recoveredKg: 0,
    verifiedRecycledKg: 0,
  };
  delete row._id;

  // Round
  for (const k of Object.keys(row)) {
    row[k] = round2(row[k]);
  }

  // Household-specific extras
  let householdsServed = null;
  if (user.role !== ROLES.HOUSEHOLD) {
    const hhAgg = await ImpactRecord.distinct("householdId", match);
    householdsServed = hhAgg.length;
  }

  // Recycler-specific extras: earnings + pickups
  let earningsINR = null;
  let pickups = null;
  if (user.role === ROLES.RECYCLER) {
    const txAgg = await Transaction.aggregate([
      { $match: { recyclerId: user._id } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$householdPayout" },
          count: { $sum: 1 },
        },
      },
    ]);
    if (txAgg[0]) {
      earningsINR = round2(txAgg[0].totalEarnings);
      pickups = txAgg[0].count;
    } else {
      earningsINR = 0;
      pickups = 0;
    }
  }

  return {
    ...row,
    householdsServed,
    earningsINR,
    pickups,
    // Honest labels — client should show these disclaimers
    notes: {
      collected: "Picked up from the household.",
      recovered: "Delivered to a processing facility.",
      verifiedRecycled: "Confirmed recycled with evidence from an authorized partner.",
      emissionsDisclaimer:
        "CO₂e savings are estimates based on published emission factors. Actual impact depends on final processing.",
    },
  };
}

// ─────────────────────────────────────────────────────────
// Breakdown by material for the current user
// ─────────────────────────────────────────────────────────
export async function getBreakdownForUser(user) {
  const match = {};
  if (user.role === ROLES.HOUSEHOLD) {
    match.householdId = user._id;
  } else if (user.role === ROLES.RECYCLER) {
    match.recyclerId = user._id;
  } else if (user.role !== ROLES.ADMIN) {
    throw new ForbiddenError("Unsupported role");
  }

  const rows = await ImpactRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$materialCode",
        weightKg: { $sum: "$weightKg" },
        co2AvoidedKg: { $sum: "$co2AvoidedKg" },
        count: { $sum: 1 },
      },
    },
    { $sort: { weightKg: -1 } },
  ]);

  // Join display names and emojis from MaterialCategory
  const codes = rows.map((r) => r._id);
  const materials = await MaterialCategory.find({ code: { $in: codes } }).lean();
  const materialMap = new Map(materials.map((m) => [m.code, m]));

  const breakdown = rows.map((r) => {
    const m = materialMap.get(r._id);
    return {
      materialCode: r._id,
      displayName: m?.displayName || r._id,
      emoji: m?.emoji || "♻️",
      category: m?.category || "other",
      weightKg: round2(r.weightKg),
      co2AvoidedKg: round2(r.co2AvoidedKg),
      count: r.count,
    };
  });

  return { breakdown };
}

// ─────────────────────────────────────────────────────────
// Recent impact records (last N)
// ─────────────────────────────────────────────────────────
export async function getRecentForUser(user, limit = 10) {
  const filter = {};
  if (user.role === ROLES.HOUSEHOLD) filter.householdId = user._id;
  else if (user.role === ROLES.RECYCLER) filter.recyclerId = user._id;
  else if (user.role !== ROLES.ADMIN) throw new ForbiddenError("Unsupported role");

  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const records = await ImpactRecord.find(filter)
    .sort({ recordedAt: -1 })
    .limit(safeLimit)
    .populate("listingId", "materialCode status")
    .lean();

  // Enrich with display names
  const codes = [...new Set(records.map((r) => r.materialCode))];
  const materials = await MaterialCategory.find({ code: { $in: codes } }).lean();
  const materialMap = new Map(materials.map((m) => [m.code, m]));

  return records.map((r) => ({
    id: r._id,
    materialCode: r.materialCode,
    displayName: materialMap.get(r.materialCode)?.displayName || r.materialCode,
    emoji: materialMap.get(r.materialCode)?.emoji || "♻️",
    weightKg: r.weightKg,
    co2AvoidedKg: r.co2AvoidedKg,
    recoveryStatus: r.recoveryStatus,
    recordedAt: r.recordedAt,
  }));
}

// ─────────────────────────────────────────────────────────
// Per-listing impact (used on listing detail page)
// ─────────────────────────────────────────────────────────
export async function getForListing(user, listingId) {
  const record = await ImpactRecord.findOne({ listingId })
    .populate("listingId")
    .lean();

  if (!record) throw new NotFoundError("No impact record for this listing");

  const uid = String(user._id);
  const isHousehold = String(record.householdId) === uid;
  const isRecycler = String(record.recyclerId) === uid;
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isHousehold && !isRecycler && !isAdmin) {
    throw new ForbiddenError("You cannot view this impact record");
  }

  const material = await MaterialCategory.findOne({
    code: record.materialCode,
  }).lean();

  return {
    id: record._id,
    listingId: record.listingId,
    materialCode: record.materialCode,
    displayName: material?.displayName || record.materialCode,
    emoji: material?.emoji || "♻️",
    weightKg: record.weightKg,
    co2AvoidedKg: record.co2AvoidedKg,
    emissionFactorUsed: record.emissionFactorUsed,
    recoveryStatus: record.recoveryStatus,
    methodology: record.methodology,
    recordedAt: record.recordedAt,
  };
}

// ─────────────────────────────────────────────────────────
// Upgrade recovery status (admin / future integration)
// ─────────────────────────────────────────────────────────
export async function setRecoveryStatus(recordId, newStatus) {
  const allowed = ["COLLECTED", "RECOVERED", "VERIFIED_RECYCLED"];
  if (!allowed.includes(newStatus)) {
    throw new ForbiddenError(`Invalid recovery status: ${newStatus}`);
  }

  const record = await ImpactRecord.findByIdAndUpdate(
    recordId,
    { $set: { recoveryStatus: newStatus } },
    { new: true }
  );
  if (!record) throw new NotFoundError("Impact record not found");

  logger.info(`ImpactRecord ${recordId} → ${newStatus}`);
  return record;
}