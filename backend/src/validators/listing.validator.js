import { z } from "zod";
import {
  LISTING_STATUS_VALUES,
  MATERIAL_CODES,
} from "../config/constants.js";

const coordinateSchema = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
});

const addressSchema = z.object({
  line1: z.string().trim().max(200).optional(),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().max(80).default("Delhi"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .optional(),
  location: coordinateSchema,
});

export const createListingSchema = z.object({
  materialCode: z.enum(MATERIAL_CODES),
  estimatedWeightKg: z.coerce.number().min(0.1).max(5000),
  pickupAddress: addressSchema,
  preferredTime: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(LISTING_STATUS_VALUES),
  reason: z.string().trim().max(500).optional(),
});

export const completeListingSchema = z.object({
  finalWeightKg: z.coerce.number().min(0.01).max(5000),
  finalPricePerKg: z.coerce.number().min(0).max(100000),
  deductions: z
    .array(
      z.object({
        reason: z.string().trim().min(1).max(120),
        amount: z.coerce.number().min(0),
      })
    )
    .max(10)
    .optional()
    .default([]),
});