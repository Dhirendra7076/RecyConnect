import * as pricingService from "../services/pricing.service.js";
import { success } from "../utils/response.js";

export async function estimate(req, res, next) {
  try {
    const result = await pricingService.estimatePrice(req.body);
    return success(res, { estimate: result });
  } catch (err) {
    next(err);
  }
}