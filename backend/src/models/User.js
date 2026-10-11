import mongoose from "mongoose";
import { ROLE_VALUES, ROLES } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,          // allows many docs without email
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,          // allows many docs without phone
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,         // never returned in queries by default
    },
    role: {
      type: String,
      required: true,
      enum: ROLE_VALUES,
      default: ROLES.HOUSEHOLD,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
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
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// At least one of email / phone required
userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("At least one of email or phone is required"));
  }
  next();
});


export const User = mongoose.model("User", userSchema);