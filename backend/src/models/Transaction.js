import mongoose from "mongoose";
import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  MATERIAL_CODES,
} from "../config/constants.js";

const transactionSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      unique: true,          // one transaction per listing
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
    },

    // ── Money ──────────────────────────────────────────────
    finalWeightKg: { type: Number, required: true, min: 0 },
    finalPricePerKg: { type: Number, required: true, min: 0 },
    grossAmount: { type: Number, required: true, min: 0 },
    totalDeductions: { type: Number, default: 0, min: 0 },
    deductions: [
      {
        reason: { type: String, trim: true, maxlength: 120 },
        amount: { type: Number, min: 0 },
      },
    ],
    // Amount the recycler pays the household
    householdPayout: { type: Number, required: true, min: 0 },
    // Platform's cut (5% of gross by default)
    platformFeePercent: { type: Number, default: 5, min: 0, max: 100 },
    platformFee: { type: Number, default: 0, min: 0 },
    // What the recycler actually keeps after paying household + fee
    recyclerNetAmount: { type: Number, default: 0 },

    // ── Payment ────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "other"],
      default: "cash",
    },
    paymentReference: { type: String, trim: true, maxlength: 120 },
    paidAt: { type: Date },

    // ── Timestamps ─────────────────────────────────────────
    completedAt: { type: Date, required: true },
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

// Compound indexes for role-based listing
transactionSchema.index({ householdId: 1, createdAt: -1 });
transactionSchema.index({ recyclerId: 1, createdAt: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);