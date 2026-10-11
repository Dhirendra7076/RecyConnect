import * as transactionsService from "../services/transactions.service.js";
import { success } from "../utils/response.js";

export async function list(req, res, next) {
  try {
    const result = await transactionsService.listForUser(req.user, {
      page: parseInt(req.query.page || "1", 10),
      limit: parseInt(req.query.limit || "20", 10),
      paymentStatus: req.query.paymentStatus,
    });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const transaction = await transactionsService.getById(
      req.user,
      req.params.id
    );
    return success(res, { transaction });
  } catch (err) {
    next(err);
  }
}

export async function markPaid(req, res, next) {
  try {
    const transaction = await transactionsService.markPaid(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, { transaction });
  } catch (err) {
    next(err);
  }
}