#!/usr/bin/env tsx
import { seedDatabase } from "../server/seed";

async function seedProduction() {
  try {
    console.log("Starting production database seeding...");
    await seedDatabase();
    console.log("Production database seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Production database seeding failed:", error);
    process.exit(1);
  }
}

seedProduction();