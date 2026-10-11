import { z } from "zod";

export const markPaidSchema = z.object({
  paymentMethod: z
    .enum(["cash", "upi", "bank_transfer", "other"])
    .default("cash"),
  paymentReference: z.string().trim().max(120).optional(),
});