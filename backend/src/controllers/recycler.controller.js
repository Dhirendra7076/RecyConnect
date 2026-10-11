import * as recyclerService from "../services/recycler.service.js";
import { success } from "../utils/response.js";

export async function getMe(req, res, next) {
  try {
    const profile = await recyclerService.getMyProfile(req.user);
    return success(res, { profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const profile = await recyclerService.updateMyProfile(req.user, req.body);
    return success(res, { profile });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const profile = await recyclerService.getPublicProfile(req.params.id);
    return success(res, { profile });
  } catch (err) {
    next(err);
  }
}