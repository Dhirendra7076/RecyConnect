import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken({ userId, role }) {
  return jwt.sign(
    { sub: String(userId), role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}