import * as matchingService from "../services/matching.service.js";
import { success } from "../utils/response.js";
import { ValidationError } from "../utils/errors.js";

export async function matchForListing(req, res, next) {
  try {
    const { listingId } = req.query;
    if (!listingId) throw new ValidationError("listingId query param required");

    const result = await matchingService.matchRecyclers(listingId, req.user);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}