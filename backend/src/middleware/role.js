import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Requires role: ${roles.join(" or ")} (you are ${req.user.role})`
        )
      );
    }
    next();
  };
}