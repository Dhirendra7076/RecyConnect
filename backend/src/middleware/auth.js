import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/index.js";
import { UnauthorizedError } from "../utils/errors.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }

    const token = header.slice(7).trim();
    const payload = verifyToken(token);

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User not found or inactive");
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (err) {
    next(err);
  }
}