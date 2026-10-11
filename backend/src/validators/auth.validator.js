import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

const phoneField = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .refine(
    (v) => /^(\+91)?[6-9]\d{9}$/.test(v) || /^\+91[6-9]\d{9}$/.test(v),
    "Invalid Indian mobile number"
  );

export const registerSchema = z
  .object({
    email: emailField.optional(),
    phone: phoneField.optional(),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
    role: z.enum(["household", "recycler"], {
      errorMap: () => ({ message: "Role must be household or recycler" }),
    }),
    displayName: z.string().trim().min(2).max(100),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Email or phone is required")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});