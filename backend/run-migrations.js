#!/usr/bin/env node

/**
 * Скрипт для проверки и запуска миграций базы данных
 * Usage: node run-migrations.js [command]
 * Commands: check, up, status, rollback
 */

import {
  runMigrations,
  getMigrationStatus,
  rollbackLastMigration,
} from "./src/utils/runMigrations.js";

const command = process.argv[2] || "check";

async function main() {
  try {
    console.log(`🚀 ANT Support - Migration Tool`);
    console.log(`Command: ${command}\n`);

    switch (command) {
      case "check":
      case "status":
        const status = await getMigrationStatus();
        console.log("📊 Migration Status:");
        console.log(`   Applied: ${status.applied.length}`);
        console.log(`   Pending: ${status.pending.length}`);
        console.log(`   Total: ${status.total}`);

        if (status.applied.length > 0) {
          console.log("\n✅ Applied migrations:");
          status.applied.forEach((migration) =>
            console.log(`   - ${migration}`),
          );
        }

        if (status.pending.length > 0) {
          console.log("\n⏳ Pending migrations:");
          status.pending.forEach((migration) =>
            console.log(`   - ${migration}`),
          );
          console.log(
            '\n💡 Run "node run-migrations.js up" to apply pending migrations',
          );
        } else {
          console.log("\n🎉 All migrations are up to date!");
        }
        break;

      case "up":
      case "migrate":
        await runMigrations();
        break;

      case "rollback":
      case "down":
        await rollbackLastMigration();
        break;

      case "help":
      case "--help":
      case "-h":
        console.log("Available commands:");
        console.log("  check, status  - Check migration status");
        console.log("  up, migrate    - Run pending migrations");
        console.log("  rollback, down - Rollback last migration");
        console.log("  help           - Show this help");
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Run "node run-migrations.js help" for available commands');
        process.exit(1);
    }
  } catch (error) {
    console.error("💥 Migration tool failed:", error.message);
    process.exit(1);
  }
}

main();
