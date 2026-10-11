import mongoose from "mongoose";
import { MATERIAL_CODES } from "../config/constants.js";

const materialCategorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,              // creates the index — do NOT also call schema.index({code:1})
      enum: MATERIAL_CODES,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    emoji: {
      type: String,
      default: "♻️",
      maxlength: 8,
    },
    category: {
      type: String,
      required: true,
      enum: ["paper", "plastic", "metal", "e_waste"],
      index: true,
    },
    unit: {
      type: String,
      default: "kg",
      enum: ["kg", "g", "piece"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    // E-waste must be routed to CPCB-authorized partners only
    requiresAuthorizedPartner: {
      type: Boolean,
      default: false,
    },
    // Display ordering in the frontend dropdown
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Emission factor for the impact calculator (kg CO2e avoided per kg)
    co2AvoidedPerKg: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Advisory fallback price when no recycler prices exist yet.
    // Clearly labeled as advisory — real price comes from recycler price records.
    typicalPricePerKg: {
      type: Number,
      min: 0,
    },
    priceLastReviewedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const MaterialCategory = mongoose.model(
  "MaterialCategory",
  materialCategorySchema
);