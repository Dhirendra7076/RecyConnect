import { Listing, RecyclerProfile } from "../models/index.js";
import * as transactionsService from "./transactions.service.js";
import * as notificationService from "./notification.service.js";
import * as impactService from "./impact.service.js";
import {
  LISTING_STATUS,
  LISTING_TRANSITIONS,
  ROLES,
} from "../config/constants.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.js";
import { logger } from "../utils/logger.js";

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ─────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────
export async function createListing(user, payload) {
  const {
    materialCode,
    estimatedWeightKg,
    pickupAddress,
    preferredTime,
    notes,
    photos = [],
  } = payload;

  const listing = await Listing.create({
    householdId: user._id,
    materialCode,
    estimatedWeightKg,
    photos,
    pickupAddress: {
      line1: pickupAddress.line1,
      line2: pickupAddress.line2,
      city: pickupAddress.city || "Delhi",
      pincode: pickupAddress.pincode,
      location: {
        type: "Point",
        coordinates: [pickupAddress.location.lng, pickupAddress.location.lat],
      },
    },
    preferredTime,
    notes,
    status: LISTING_STATUS.OPEN,
  });

  logger.info(`Listing created: ${listing._id} by user ${user._id}`);
  return listing;
}

// ─────────────────────────────────────────────────────────
// List my listings (household)
// ─────────────────────────────────────────────────────────
export async function getMyListings(user, { status, page = 1, limit = 20 } = {}) {
  const filter = { householdId: user._id };
  if (status) filter.status = status;

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const skip = (Math.max(page, 1) - 1) * safeLimit;

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  return {
    listings,
    total,
    page: Math.max(page, 1),
    limit: safeLimit,
    pages: Math.ceil(total / safeLimit) || 1,
  };
}

// ─────────────────────────────────────────────────────────
// Get one (owner or recycler or admin)
// ─────────────────────────────────────────────────────────
export async function getListingById(user, listingId) {
  const listing = await Listing.findById(listingId)
    .populate("householdId", "displayName phone email role")
    .populate("acceptedRecyclerId", "displayName phone email role")
    .lean();

  if (!listing) throw new NotFoundError("Listing not found");

  const userId = String(user._id);
  const ownerId = String(listing.householdId?._id || listing.householdId);
  const isOwner = ownerId === userId;
  const isRecycler = user.role === ROLES.RECYCLER;
  const isAdmin = user.role === ROLES.ADMIN;

  if (user.role === ROLES.HOUSEHOLD && !isOwner) {
    throw new ForbiddenError("You can only view your own listings");
  }
  if (!isOwner && !isRecycler && !isAdmin) {
    throw new ForbiddenError("Access denied");
  }

  if (
    listing.status === LISTING_STATUS.OPEN &&
    !isOwner &&
    !isAdmin
  ) {
    if (listing.pickupAddress) {
      listing.pickupAddress = {
        city: listing.pickupAddress.city,
        pincode: listing.pickupAddress.pincode,
        location: {
          type: "Point",
          coordinates: listing.pickupAddress.location?.coordinates
            ? [
                Math.round(listing.pickupAddress.location.coordinates[0] * 100) / 100,
                Math.round(listing.pickupAddress.location.coordinates[1] * 100) / 100,
              ]
            : undefined,
        },
      };
    }
  }

  return listing;
}

// ─────────────────────────────────────────────────────────
// Accept (atomic — prevents double accept)
// ─────────────────────────────────────────────────────────
export async function acceptListing(user, listingId) {
  if (user.role !== ROLES.RECYCLER) {
    throw new ForbiddenError("Only recyclers can accept listings");
  }

  const existing = await Listing.findById(listingId);
  if (!existing) throw new NotFoundError("Listing not found");

  if (existing.householdId.toString() === user._id.toString()) {
    throw new ForbiddenError("You cannot accept your own listing");
  }

  const recyclerProfile = await RecyclerProfile.findOne({ userId: user._id });
  if (!recyclerProfile) {
    throw new ForbiddenError(
      "Complete your recycler profile before accepting listings"
    );
  }
  if (!recyclerProfile.acceptedMaterials.includes(existing.materialCode)) {
    throw new ForbiddenError(
      `You do not accept ${existing.materialCode}. Update your profile to accept this material.`
    );
  }

  const listing = await Listing.findOneAndUpdate(
    {
      _id: listingId,
      status: LISTING_STATUS.OPEN,
      acceptedRecyclerId: null,
    },
    {
      $set: {
        status: LISTING_STATUS.ACCEPTED,
        acceptedRecyclerId: user._id,
        acceptedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!listing) {
    throw new ConflictError(
      "This listing is no longer available (already accepted or closed)"
    );
  }

    logger.info(`Listing ${listing._id} accepted by recycler ${user._id}`);

  // Fire-and-forget notifications — errors never break the response
  notificationService
    .notifyListingAccepted(listing)
    .catch((err) => logger.error(`notifyListingAccepted failed: ${err.message}`));

  return listing;
}

// ─────────────────────────────────────────────────────────
// Update status
// ─────────────────────────────────────────────────────────
export async function updateStatus(user, listingId, { status: newStatus, reason }) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new NotFoundError("Listing not found");

  const userId = String(user._id);
  const isOwner = listing.householdId.toString() === userId;
  const isAssignedRecycler =
    listing.acceptedRecyclerId &&
    listing.acceptedRecyclerId.toString() === userId;
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isOwner && !isAssignedRecycler && !isAdmin) {
    throw new ForbiddenError("You cannot modify this listing");
  }

  const allowed = LISTING_TRANSITIONS[listing.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(
      `Invalid transition: ${listing.status} → ${newStatus}. Allowed: ${
        allowed.join(", ") || "none"
      }`
    );
  }

  const recyclerOnlyStatuses = [
    LISTING_STATUS.COLLECTED,
    LISTING_STATUS.PRICE_CONFIRMED,
  ];
  if (
    recyclerOnlyStatuses.includes(newStatus) &&
    !isAssignedRecycler &&
    !isAdmin
  ) {
    throw new ForbiddenError(
      "Only the assigned recycler can set this status"
    );
  }

  const updates = { status: newStatus };

  if (newStatus === LISTING_STATUS.CANCELLED) {
    updates.cancelledAt = new Date();
    if (reason) updates.cancellationReason = reason;
  }
  if (newStatus === LISTING_STATUS.DISPUTED) {
    updates.disputedAt = new Date();
    if (reason) updates.disputeReason = reason;
  }

  const updated = await Listing.findByIdAndUpdate(
    listingId,
    { $set: updates },
    { new: true }
  );

  // Fire-and-forget email on cancellation
  if (newStatus === LISTING_STATUS.CANCELLED) {
    notificationService
      .notifyListingCancelled(updated, reason, user)
      .catch((err) => logger.error(`notifyListingCancelled failed: ${err.message}`));
  }

  return updated;
}

// ─────────────────────────────────────────────────────────
// Complete
// ─────────────────────────────────────────────────────────
export async function completeListing(user, listingId, payload) {
  const { finalWeightKg, finalPricePerKg, deductions = [] } = payload;

  const listing = await Listing.findById(listingId);
  if (!listing) throw new NotFoundError("Listing not found");

  if (!listing.acceptedRecyclerId) {
    throw new ValidationError("This listing has no assigned recycler");
  }

  const userId = String(user._id);
  const isAssignedRecycler = listing.acceptedRecyclerId.toString() === userId;
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isAssignedRecycler && !isAdmin) {
    throw new ForbiddenError(
      "Only the assigned recycler can complete this listing"
    );
  }

  const allowedStatuses = [
    LISTING_STATUS.COLLECTED,
    LISTING_STATUS.PICKUP_SCHEDULED,
    LISTING_STATUS.ACCEPTED,
  ];
  if (!allowedStatuses.includes(listing.status)) {
    throw new ValidationError(
      `Cannot complete a listing in status ${listing.status}`
    );
  }

  const grossAmount = round2(finalWeightKg * finalPricePerKg);
  const totalDeductions = round2(
    deductions.reduce((s, d) => s + Number(d.amount || 0), 0)
  );
  const totalAmount = round2(Math.max(0, grossAmount - totalDeductions));

  const updated = await Listing.findByIdAndUpdate(
    listingId,
    {
      $set: {
        status: LISTING_STATUS.PRICE_CONFIRMED,
        finalWeightKg,
        finalPricePerKg,
        grossAmount,
        deductions,
        totalAmount,
        completedAt: new Date(),
      },
    },
    { new: true }
  );

    logger.info(
    `Listing ${listing._id} completed: ${finalWeightKg}kg @ ₹${finalPricePerKg}/kg = ₹${totalAmount}`
  );

    // Auto-create the transaction record (idempotent)
  let transaction = null;
  try {
    transaction = await transactionsService.createFromListing(updated);
  } catch (err) {
    logger.error(`Transaction creation failed for listing ${listing._id}: ${err.message}`);
  }

  // Auto-create the impact record (needs the transaction to exist)
  if (transaction) {
    try {
      await impactService.createFromTransaction(transaction);
    } catch (err) {
      logger.error(`Impact creation failed for listing ${listing._id}: ${err.message}`);
    }

    // Fire-and-forget email
    notificationService
      .notifyListingCompleted(transaction, updated)
      .catch((err) => logger.error(`notifyListingCompleted failed: ${err.message}`));
  }

  return updated;
}