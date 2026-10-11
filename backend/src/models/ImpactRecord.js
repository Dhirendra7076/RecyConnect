import mongoose from "mongoose";
import { MATERIAL_CODES } from "../config/constants.js";

const impactRecordSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      unique: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      index: true,
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recyclerId: {
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
    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },
    co2AvoidedKg: {
      type: Number,
      required: true,
      min: 0,
    },
    emissionFactorUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    // Three levels — honest reporting of what we actually know
    recoveryStatus: {
      type: String,
      enum: ["COLLECTED", "RECOVERED", "VERIFIED_RECYCLED"],
      default: "COLLECTED",
      index: true,
    },
    methodology: {
      type: String,
      default: "Ecoinvent v3.12 + published India-specific LCA studies",
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

impactRecordSchema.index({ householdId: 1, recordedAt: -1 });
impactRecordSchema.index({ recyclerId: 1, recordedAt: -1 });

export const ImpactRecord = mongoose.model("ImpactRecord", impactRecordSchema);