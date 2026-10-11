import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number], // [lng, lat]
      validate: {
        validator: (v) =>
          Array.isArray(v) && v.length === 2 &&
          v[0] >= -180 && v[0] <= 180 &&
          v[1] >= -90 && v[1] <= 90,
        message: "Coordinates must be [lng, lat]",
      },
    },
  },
  { _id: false }
);

const householdProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    address: {
      line1: { type: String, trim: true, maxlength: 200 },
      line2: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, default: "Delhi" },
      pincode: { type: String, trim: true, match: /^\d{6}$/ },
      location: { type: pointSchema, default: undefined },
    },
    preferredPickupTime: {
      type: String,
      enum: ["morning", "afternoon", "evening", "anytime"],
      default: "anytime",
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

householdProfileSchema.index({ "address.location": "2dsphere" });

export const HouseholdProfile = mongoose.model(
  "HouseholdProfile",
  householdProfileSchema
);