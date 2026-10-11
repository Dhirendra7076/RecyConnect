import { z } from "zod";
import { MATERIAL_CODES } from "../config/constants.js";

export const estimatePriceSchema = z.object({
  materialCode: z.enum(MATERIAL_CODES),
  estimatedWeightKg: z.coerce.number().min(0.1).max(5000),
  location: z.object({
    lng: z.coerce.number().min(-180).max(180),
    lat: z.coerce.number().min(-90).max(90),
  }),
});