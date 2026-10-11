import { MaterialCategory } from "../models/index.js";
import { getCandidatesForPricing } from "./matching.service.js";
import { NotFoundError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ─────────────────────────────────────────────────────────
// Estimate an indicative price for a material
// ─────────────────────────────────────────────────────────
export async function estimatePrice({ materialCode, estimatedWeightKg, location }) {
  // ── Verify the material exists and is active ───────────
  const material = await MaterialCategory.findOne({
    code: materialCode,
    isActive: true,
  }).lean();
  if (!material) {
    throw new NotFoundError(`Material "${materialCode}" not found`);
  }

  // ── Find recyclers near the location who accept this material ──
  const coords = [location.lng, location.lat];
  const candidates = await getCandidatesForPricing(materialCode, coords);

  // ── Gather their prices for this material ──────────────
  const prices = [];
  const now = Date.now();
  const STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  for (const r of candidates) {
    const entry = r.indicativePrices.find((p) => p.materialCode === materialCode);
    if (!entry || typeof entry.pricePerKg !== "number") continue;
    const isStale = entry.updatedAt && now - new Date(entry.updatedAt).getTime() > STALE_MS;
    prices.push({
      value: entry.pricePerKg,
      weight: isStale ? 0.5 : 1,
      updatedAt: entry.updatedAt,
    });
  }

  let estimatedPerKg = null;
  let range = null;
  let confidence = "none";
  let sourceCount = 0;
  let fallbackUsed = false;

  if (prices.length > 0) {
    // ── Weighted median ──────────────────────────────────
    const expanded = [];
    for (const p of prices) {
      const w = Math.round(p.weight * 10); // scale to ints for repetition
      for (let i = 0; i < w; i++) expanded.push(p.value);
    }
    estimatedPerKg = round2(median(expanded));

    const values = prices.map((p) => p.value);
    range = {
      low: round2(Math.min(...values)),
      high: round2(Math.max(...values)),
    };
    sourceCount = prices.length;
    confidence =
      prices.length >= 5 ? "high" : prices.length >= 2 ? "medium" : "low";
  } else if (material.typicalPricePerKg) {
    // ── Fallback to advisory typical price ───────────────
    estimatedPerKg = round2(material.typicalPricePerKg);
    range = {
      low: round2(material.typicalPricePerKg * 0.85),
      high: round2(material.typicalPricePerKg * 1.15),
    };
    confidence = "advisory";
    fallbackUsed = true;
  }

  const estimatedTotal = estimatedPerKg
    ? round2(estimatedPerKg * estimatedWeightKg)
    : null;

  const result = {
    materialCode,
    materialDisplayName: material.displayName,
    estimatedWeightKg,
    estimatedPerKg,
    estimatedTotal,
    range,
    confidence,
    sourceCount,
    fallbackUsed,
    priceLastReviewedAt: material.priceLastReviewedAt,
    disclaimer:
      "This is an indicative estimate only. Final price is set after physical weighing and quality check by the recycler.",
  };

  logger.info(
    `Price estimate for ${materialCode}: ₹${estimatedPerKg}/kg × ${estimatedWeightKg}kg = ₹${estimatedTotal} (${confidence})`
  );

  return result;
}