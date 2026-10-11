import * as listingsService from "../services/listings.service.js";
import { success } from "../utils/response.js";

export async function create(req, res, next) {
  try {
    const photos = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const listing = await listingsService.createListing(req.user, {
      ...req.body,
      photos,
    });
    return success(res, { listing }, 201);
  } catch (err) {
    next(err);
  }
}

export async function getMine(req, res, next) {
  try {
    const result = await listingsService.getMyListings(req.user, {
      status: req.query.status,
      page: parseInt(req.query.page || "1", 10),
      limit: parseInt(req.query.limit || "20", 10),
    });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const listing = await listingsService.getListingById(
      req.user,
      req.params.id
    );
    return success(res, { listing });
  } catch (err) {
    next(err);
  }
}

export async function accept(req, res, next) {
  try {
    const listing = await listingsService.acceptListing(
      req.user,
      req.params.id
    );
    return success(res, { listing });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const listing = await listingsService.updateStatus(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, { listing });
  } catch (err) {
    next(err);
  }
}

export async function complete(req, res, next) {
  try {
    const listing = await listingsService.completeListing(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, { listing });
  } catch (err) {
    next(err);
  }
}