import * as impactService from "../services/impact.service.js";
import { success } from "../utils/response.js";

export async function getSummary(req, res, next) {
  try {
    const summary = await impactService.getSummaryForUser(req.user);
    return success(res, { summary });
  } catch (err) {
    next(err);
  }
}

export async function getBreakdown(req, res, next) {
  try {
    const result = await impactService.getBreakdownForUser(req.user);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getRecent(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || "10", 10);
    const records = await impactService.getRecentForUser(req.user, limit);
    return success(res, { records });
  } catch (err) {
    next(err);
  }
}

export async function getForListing(req, res, next) {
  try {
    const record = await impactService.getForListing(req.user, req.params.listingId);
    return success(res, { record });
  } catch (err) {
    next(err);
  }
}