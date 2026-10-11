import { Listing, RecyclerProfile, MaterialCategory } from "../models/index.js";
import { NotFoundError } from "../utils/errors.js";
import { haversineKm } from "../utils/geo.js";
import { LISTING_STATUS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

const MAX_SEARCH_RADIUS_KM = 50;
const MAX_RESULTS = 20;

// ─────────────────────────────────────────────────────────
// Current IST hour as a decimal (e.g. 14.5 = 2:30 PM)
// ─────────────────────────────────────────────────────────
function getCurrentISTHour() {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  return ist.getUTCHours() + ist.getUTCMinutes() / 60;
}

// ─────────────────────────────────────────────────────────
// Is the recycler within their operating hours right now?
// ─────────────────────────────────────────────────────────
function isWithinOperatingHours(hours) {
  if (!hours?.start || !hours?.end) return true;
  const [sh, sm] = hours.start.split(":").map(Number);
  const [eh, em] = hours.end.split(":").map(Number);
  const start = sh + sm / 60;
  const end = eh + em / 60;
  const now = getCurrentISTHour();

  if (start <= end) return now >= start && now <= end;
  // Overnight hours, e.g. 22:00 → 06:00
  return now >= start || now <= end;
}

// ─────────────────────────────────────────────────────────
// Find candidate recyclers near a listing's pickup point
// ─────────────────────────────────────────────────────────
async function findCandidateRecyclers(materialCode, location) {
  const [lng, lat] = location;

  // Step 1: Geospatial prefilter using $centerSphere
  const maxRadians = MAX_SEARCH_RADIUS_KM / 6378.1;
  const candidates = await RecyclerProfile.find({
    acceptedMaterials: materialCode,
    serviceAreas: {
      $geoWithin: {
        $centerSphere: [[lng, lat], maxRadians],
      },
    },
  }).lean();

  // Step 2: Filter by each recycler's own radiusKm per service area
  return candidates.filter((r) => {
    return r.serviceAreas.some((area) => {
      const distance = haversineKm([lng, lat], area.coordinates);
      return distance <= (area.radiusKm || 5);
    });
  });
}

// ─────────────────────────────────────────────────────────
// Compute the closest distance from listing to any of a recycler's areas
// ─────────────────────────────────────────────────────────
function closestDistance(listingLocation, serviceAreas) {
  let best = Infinity;
  for (const area of serviceAreas) {
    const d = haversineKm(listingLocation, area.coordinates);
    if (d < best) best = d;
  }
  return best;
}

// ─────────────────────────────────────────────────────────
// Score one recycler for a given listing + pricing context
// ─────────────────────────────────────────────────────────
function scoreRecycler({ recycler, listing, distanceKm, maxPrice }) {
  const listingLocation = listing.pickupAddress.location.coordinates;

  // ── Proximity (0–1) — closer is better
  const proximity = Math.max(0, 1 - distanceKm / MAX_SEARCH_RADIUS_KM);

  // ── Availability (0.5 or 1) — within operating hours
  const availability = isWithinOperatingHours(recycler.operatingHours) ? 1 : 0.5;

  // ── Price (0–1) — higher price is better for household
  const priceEntry = recycler.indicativePrices.find(
    (p) => p.materialCode === listing.materialCode
  );
  const price = priceEntry ? priceEntry.pricePerKg : 0;
  const priceScore = maxPrice > 0 ? price / maxPrice : 0.5;

  // ── Reliability (0–1) — based on completed pickups and rating
  const pickupScore = Math.min(recycler.completedPickups / 20, 1);
  const ratingScore = recycler.totalRatings > 0 ? recycler.averageRating / 5 : 0.5;
  const reliability = 0.6 * pickupScore + 0.4 * ratingScore;

  // ── Capacity (0 or 1) — meets minimum pickup
  const capacity = listing.estimatedWeightKg >= (recycler.minimumPickupKg || 0) ? 1 : 0;

  // ── Weighted total
  const score =
    0.40 * proximity +
    0.15 * availability +
    0.15 * priceScore +
    0.20 * reliability +
    0.10 * capacity;

  return {
    score: Math.round(score * 1000) / 1000,
    breakdown: {
      proximity: Math.round(proximity * 1000) / 1000,
      availability,
      price: Math.round(priceScore * 1000) / 1000,
      reliability: Math.round(reliability * 1000) / 1000,
      capacity,
    },
  };
}

// ─────────────────────────────────────────────────────────
// Public: match recyclers for a listing
// ─────────────────────────────────────────────────────────
export async function matchRecyclers(listingId, user) {
  const listing = await Listing.findById(listingId).lean();
  if (!listing) throw new NotFoundError("Listing not found");
  if (String(listing.householdId) !== String(user._id)) {
    throw new NotFoundError("Listing not found"); // Don't leak existence
  }
  if (listing.status !== LISTING_STATUS.OPEN) {
    return { listing: { id: listing._id, status: listing.status }, matches: [] };
  }

  const location = listing.pickupAddress.location.coordinates;
  const candidates = await findCandidateRecyclers(listing.materialCode, location);

  if (candidates.length === 0) {
    logger.info(`No recycler candidates for listing ${listingId}`);
    return { listing: { id: listing._id, status: listing.status }, matches: [] };
  }

  // Compute max price across candidates for normalization
  const maxPrice = Math.max(
    ...candidates.map((r) => {
      const p = r.indicativePrices.find(
        (x) => x.materialCode === listing.materialCode
      );
      return p ? p.pricePerKg : 0;
    }),
    1
  );

  // Score every candidate
  const scored = candidates.map((r) => {
    const distanceKm = closestDistance(location, r.serviceAreas);
    const { score, breakdown } = scoreRecycler({
      recycler: r,
      listing,
      distanceKm,
      maxPrice,
    });
    const priceEntry = r.indicativePrices.find(
      (p) => p.materialCode === listing.materialCode
    );

    return {
      recyclerId: r._id,
      businessName: r.businessName,
      distanceKm: Math.round(distanceKm * 10) / 10,
      indicativePricePerKg: priceEntry ? priceEntry.pricePerKg : null,
      estimatedPayout:
        priceEntry && listing.estimatedWeightKg
          ? Math.round(priceEntry.pricePerKg * listing.estimatedWeightKg * 100) / 100
          : null,
      minimumPickupKg: r.minimumPickupKg,
      operatingHours: r.operatingHours,
      completedPickups: r.completedPickups,
      averageRating: r.averageRating,
      totalRatings: r.totalRatings,
      verificationStatus: r.verificationStatus,
      score,
      scoreBreakdown: breakdown,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const matches = scored.slice(0, MAX_RESULTS);

  logger.info(
    `Matching for listing ${listingId}: ${candidates.length} candidates → ${matches.length} returned`
  );

  return {
    listing: {
      id: listing._id,
      status: listing.status,
      materialCode: listing.materialCode,
      estimatedWeightKg: listing.estimatedWeightKg,
    },
    matches,
  };
}

// ─────────────────────────────────────────────────────────
// Public: get candidate recyclers for pricing estimation
// (exported so pricing.service can reuse)
// ─────────────────────────────────────────────────────────
export async function getCandidatesForPricing(materialCode, location) {
  return findCandidateRecyclers(materialCode, location);
}