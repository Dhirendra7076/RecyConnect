import { z } from "zod";
import { MATERIAL_CODES } from "../config/constants.js";

const serviceAreaInput = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  radiusKm: z.coerce.number().min(0.5).max(50).default(5),
});

const priceInput = z.object({
  materialCode: z.enum(MATERIAL_CODES),
  pricePerKg: z.coerce.number().min(0).max(100000),
});

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM (24-hour)");

export const updateRecyclerProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(150).optional(),
  serviceAreas: z.array(serviceAreaInput).min(1).max(10).optional(),
  acceptedMaterials: z.array(z.enum(MATERIAL_CODES)).min(1).max(20).optional(),
  minimumPickupKg: z.coerce.number().min(0).max(1000).optional(),
  operatingHours: z
    .object({ start: timeString, end: timeString })
    .optional(),
  indicativePrices: z.array(priceInput).max(20).optional(),
});