import { MaterialCategory } from "../models/index.js";
import { logger } from "../utils/logger.js";

// ─────────────────────────────────────────────────────────
// 8 core material categories.
// Prices (INR/kg) are ADVISORY fallbacks — real prices come from
// recycler price records. Values are illustrative for urban India
// and MUST be validated with local recyclers before launch.
//
// co2AvoidedPerKg = (virgin production EF) - (recycling EF × yield)
// Sources: Ecoinvent v3.12 & published India-specific LCA studies.
// ─────────────────────────────────────────────────────────
const MATERIALS = [
  {
    code: "newspaper",
    displayName: "Newspaper",
    emoji: "📰",
    category: "paper",
    unit: "kg",
    description:
      "Dry newspapers, magazines, and office paper. Keep dry and free of food waste.",
    requiresAuthorizedPartner: false,
    displayOrder: 1,
    co2AvoidedPerKg: 0.9,
    typicalPricePerKg: 14,
  },
  {
    code: "cardboard",
    displayName: "Cardboard",
    emoji: "📦",
    category: "paper",
    unit: "kg",
    description:
      "Corrugated cardboard boxes, cartons, and packaging. Flatten before pickup.",
    requiresAuthorizedPartner: false,
    displayOrder: 2,
    co2AvoidedPerKg: 0.8,
    typicalPricePerKg: 10,
  },
  {
    code: "pet_plastic",
    displayName: "PET Plastic (Bottles)",
    emoji: "🧴",
    category: "plastic",
    unit: "kg",
    description:
      "Clear PET water and beverage bottles. Rinse and remove caps.",
    requiresAuthorizedPartner: false,
    displayOrder: 3,
    co2AvoidedPerKg: 2.3,
    typicalPricePerKg: 12,
  },
  {
    code: "hdpe_plastic",
    displayName: "HDPE Plastic (Containers)",
    emoji: "🪣",
    category: "plastic",
    unit: "kg",
    description:
      "Milk jugs, detergent bottles, and thick plastic containers. Rinse before pickup.",
    requiresAuthorizedPartner: false,
    displayOrder: 4,
    co2AvoidedPerKg: 1.5,
    typicalPricePerKg: 15,
  },
  {
    code: "aluminium",
    displayName: "Aluminium",
    emoji: "🥫",
    category: "metal",
    unit: "kg",
    description:
      "Aluminium cans, foils, and small aluminium items. High value per kg.",
    requiresAuthorizedPartner: false,
    displayOrder: 5,
    co2AvoidedPerKg: 12.0,
    typicalPricePerKg: 140,
  },
  {
    code: "copper",
    displayName: "Copper",
    emoji: "🔶",
    category: "metal",
    unit: "kg",
    description:
      "Copper wires, pipes, and fittings. Very high value per kg.",
    requiresAuthorizedPartner: false,
    displayOrder: 6,
    co2AvoidedPerKg: 4.0,
    typicalPricePerKg: 550,
  },
  {
    code: "steel",
    displayName: "Steel / Iron",
    emoji: "⚙️",
    category: "metal",
    unit: "kg",
    description:
      "Iron and steel scrap — utensils, tools, and structural pieces.",
    requiresAuthorizedPartner: false,
    displayOrder: 7,
    co2AvoidedPerKg: 1.7,
    typicalPricePerKg: 30,
  },
  {
    code: "e_waste",
    displayName: "E-Waste",
    emoji: "📱",
    category: "e_waste",
    unit: "kg",
    description:
      "Old phones, laptops, chargers, and circuit boards. Routed to CPCB-authorized recyclers only.",
    requiresAuthorizedPartner: true,
    displayOrder: 8,
    co2AvoidedPerKg: 5.0,
    typicalPricePerKg: 40,
  },
];

export async function seedMaterials() {
  let inserted = 0;
  let updated = 0;

  const now = new Date();

  for (const mat of MATERIALS) {
    const existing = await MaterialCategory.findOne({ code: mat.code });

    if (existing) {
      await MaterialCategory.updateOne(
        { code: mat.code },
        { $set: { ...mat, priceLastReviewedAt: now } }
      );
      updated++;
    } else {
      await MaterialCategory.create({
        ...mat,
        priceLastReviewedAt: now,
      });
      inserted++;
    }
  }

  logger.info(`Materials seed: ${inserted} inserted, ${updated} updated`);
}