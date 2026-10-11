import { MaterialCategory } from "../models/index.js";
import { success } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

export async function getAll(req, res, next) {
  try {
    const materials = await MaterialCategory.find({ isActive: true })
      .sort({ displayOrder: 1, displayName: 1 })
      .lean();

    return success(res, { materials, count: materials.length });
  } catch (err) {
    next(err);
  }
}

export async function getByCode(req, res, next) {
  try {
    const { code } = req.params;
    const material = await MaterialCategory.findOne({
      code,
      isActive: true,
    }).lean();

    if (!material) {
      throw new NotFoundError(`Material "${code}" not found`);
    }
    return success(res, { material });
  } catch (err) {
    next(err);
  }
}