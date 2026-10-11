import mongoose from "mongoose";
import {
  LISTING_STATUS,
  LISTING_STATUS_VALUES,
  MATERIAL_CODES,
} from "../config/constants.js";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number], // [lng, lat]
      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length === 2 &&
          v[0] >= -180 && v[0] <= 180 &&
          v[1] >= -90 && v[1] <= 90,
        message: "Coordinates must be [lng, lat]",
      },
    },
  },
  { _id: false }
);

const deductionSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    materialCode: {
      type: String,
      required: true,
      enum: MATERIAL_CODES,
      index: true,
    },
    estimatedWeightKg: {
      type: Number,
      required: true,
      min: 0.1,
      max: 5000,
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length <= 5,
        message: "Maximum 5 photos per listing",
      },
    },
    status: {
      type: String,
      enum: LISTING_STATUS_VALUES,
      default: LISTING_STATUS.OPEN,
      index: true,
    },
    pickupAddress: {
      line1: { type: String, trim: true, maxlength: 200 },
      line2: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, default: "Delhi" },
      pincode: { type: String, trim: true, match: /^\d{6}$/ },
      location: { type: pointSchema, required: true },
    },
    preferredTime: { type: Date },
    notes: { type: String, trim: true, maxlength: 500 },

    // ── Acceptance ─────────────────────────────────────────
    acceptedRecyclerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    acceptedAt: { type: Date },

    // ── Completion (set by recycler) ───────────────────────
    finalWeightKg: { type: Number, min: 0 },
    finalPricePerKg: { type: Number, min: 0 },
    grossAmount: { type: Number, min: 0 },
    deductions: { type: [deductionSchema], default: [] },
    totalAmount: { type: Number, min: 0 },
    completedAt: { type: Date },

    // ── Cancellation / dispute ─────────────────────────────
    cancelledAt: { type: Date },
    cancellationReason: { type: String, trim: true, maxlength: 300 },
    disputedAt: { type: Date },
    disputeReason: { type: String, trim: true, maxlength: 500 },
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

// Geospatial index — used by the matching engine in Step 5
listingSchema.index({ "pickupAddress.location": "2dsphere" });

// Compound index for the matching engine's hot path:
// "show me all OPEN listings of material X, newest first"
listingSchema.index({ status: 1, materialCode: 1, createdAt: -1 });

export const Listing = mongoose.model("Listing", listingSchema);