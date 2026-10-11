import { connectDB, disconnectDB } from "../config/db.js";
import { syncIndexes } from "../models/index.js";
import { seedMaterials } from "./materials.seed.js";
import { logger } from "../utils/logger.js";

async function run() {
  try {
    logger.info("Seeding started");

    await connectDB();
    await syncIndexes();

    await seedMaterials();

    // Future seeds go here:
    // await seedUsers();
    // await seedRecyclers();
    // await seedPrices();

    await disconnectDB();
    logger.info("Seeding complete");
    process.exit(0);
  } catch (err) {
    logger.error(`Seeding failed: ${err.message}`);
    process.exit(1);
  }
}

run();