import mongoose from "mongoose";
import { MATERIAL_CODES } from "../config/constants.js";

const serviceAreaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    radiusKm: { type: Number, default: 5, min: 0.5, max: 50 },
  },
  { _id: false }
);

const priceEntrySchema = new mongoose.Schema(
  {
    materialCode: { type: String, enum: MATERIAL_CODES, required: true },
    pricePerKg: { type: Number, required: true, min: 0 },
    updatedAt: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ["self_declared", "verified"],
      default: "self_declared",
    },
  },
  { _id: false }
);

const recyclerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    businessName: { type: String, trim: true, maxlength: 150 },
    serviceAreas: {
      type: [serviceAreaSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one service area is required",
      },
    },
    acceptedMaterials: {
      type: [{ type: String, enum: MATERIAL_CODES }],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one accepted material is required",
      },
    },
    minimumPickupKg: { type: Number, default: 1, min: 0 },
    operatingHours: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "20:00" },
    },
    indicativePrices: { type: [priceEntrySchema], default: [] },
    completedPickups: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified",
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

recyclerProfileSchema.index({ "serviceAreas": "2dsphere" });
recyclerProfileSchema.index({ acceptedMaterials: 1 });

export const RecyclerProfile = mongoose.model(
  "RecyclerProfile",
  recyclerProfileSchema
);