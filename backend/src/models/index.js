import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

import { User } from "./User.js";
import { HouseholdProfile } from "./HouseholdProfile.js";
import { RecyclerProfile } from "./RecyclerProfile.js";
import { MaterialCategory } from "./MaterialCategory.js";
import { Listing } from "./Listing.js";
import { Transaction } from "./Transaction.js";
import { ImpactRecord } from "./ImpactRecord.js";

export async function syncIndexes() {
  try {
    await Promise.all([
      User.syncIndexes(),
      HouseholdProfile.syncIndexes(),
      RecyclerProfile.syncIndexes(),
      MaterialCategory.syncIndexes(),
      Listing.syncIndexes(),
      Transaction.syncIndexes(),
      ImpactRecord.syncIndexes(),
    ]);
    logger.info("MongoDB indexes synced");
  } catch (err) {
    logger.error(`Index sync failed: ${err.message}`);
  }
}

export async function dropAllIndexes() {
  if (process.env.NODE_ENV === "production") return;
  const collections = [
    "users",
    "householdprofiles",
    "recyclerprofiles",
    "materialcategories",
    "listings",
    "transactions",
    "impactrecords",
  ];
  for (const name of collections) {
    try {
      const col = mongoose.connection.collection(name);
      const exists = await col.indexExists("_id_");
      if (exists) {
        await col.dropIndexes();
        logger.warn(`Dropped indexes on ${name}`);
      }
    } catch {
      /* collection may not exist yet */
    }
  }
}

export {
  User,
  HouseholdProfile,
  RecyclerProfile,
  MaterialCategory,
  Listing,
  Transaction,
  ImpactRecord,
};