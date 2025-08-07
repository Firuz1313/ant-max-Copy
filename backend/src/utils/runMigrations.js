import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
export async function runMigrations() {
  console.log("🚀 Starting database migrations...");

  try {
    // Create migrations tracking table if it doesn't exist
    await createMigrationsTable();

    // Get migration files
    const migrationsDir = path.join(__dirname, "../../migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Get already applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`✅ ${appliedMigrations.length} migrations already applied`);

    // Run pending migrations
    for (const file of migrationFiles) {
      const migrationName = path.basename(file, ".sql");

      if (appliedMigrations.includes(migrationName)) {
        console.log(`⏭️  Skipping ${migrationName} (already applied)`);
        continue;
      }

      console.log(`🔄 Running migration: ${migrationName}`);

      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      try {
        await query(migrationSQL);
        await markMigrationAsApplied(migrationName);
        console.log(`✅ Migration ${migrationName} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migrationName} failed:`, error.message);
        throw error;
      }
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("💥 Migration process failed:", error.message);
    throw error;
  }
}

/**
 * Create migrations tracking table
 */
async function createMigrationsTable() {
  const createMigrationsTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await query(createMigrationsTableSQL);
  console.log("📋 Migrations tracking table ready");
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations() {
  try {
    const result = await query(
      "SELECT name FROM migrations ORDER BY applied_at",
    );
    return result.rows.map((row) => row.name);
  } catch (error) {
    console.warn("⚠️  Could not fetch applied migrations:", error.message);
    return [];
  }
}

/**
 * Mark migration as applied
 */
async function markMigrationAsApplied(migrationName) {
  await query(
    "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
    [migrationName],
  );
}

/**
 * Rollback last migration (for development)
 */
export async function rollbackLastMigration() {
  try {
    const result = await query(
      "SELECT name FROM migrations ORDER BY applied_at DESC LIMIT 1",
    );

    if (result.rows.length === 0) {
      console.log("📭 No migrations to rollback");
      return;
    }

    const lastMigration = result.rows[0].name;
    console.log(`🔄 Rolling back migration: ${lastMigration}`);

    // Remove from migrations table
    await query("DELETE FROM migrations WHERE name = $1", [lastMigration]);

    console.log(`✅ Migration ${lastMigration} rolled back`);
    console.log(
      "⚠️  Note: You may need to manually drop tables/indexes created by this migration",
    );
  } catch (error) {
    console.error("💥 Rollback failed:", error.message);
    throw error;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus() {
  try {
    const appliedMigrations = await getAppliedMigrations();

    const migrationsDir = path.join(__dirname, "../../migrations");
    const availableMigrations = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => path.basename(file, ".sql"))
      .sort();

    const pendingMigrations = availableMigrations.filter(
      (migration) => !appliedMigrations.includes(migration),
    );

    return {
      applied: appliedMigrations,
      pending: pendingMigrations,
      total: availableMigrations.length,
    };
  } catch (error) {
    console.error("💥 Could not get migration status:", error.message);
    throw error;
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case "up":
      runMigrations().catch(process.exit);
      break;
    case "rollback":
      rollbackLastMigration().catch(process.exit);
      break;
    case "status":
      getMigrationStatus()
        .then((status) => {
          console.log("📊 Migration Status:");
          console.log(`   Applied: ${status.applied.length}`);
          console.log(`   Pending: ${status.pending.length}`);
          console.log(`   Total: ${status.total}`);

          if (status.pending.length > 0) {
            console.log("\n⏳ Pending migrations:");
            status.pending.forEach((migration) =>
              console.log(`   - ${migration}`),
            );
          } else {
            console.log("\n✅ All migrations are up to date");
          }
        })
        .catch(process.exit);
      break;
    default:
      console.log("Usage: node runMigrations.js [up|rollback|status]");
      process.exit(1);
  }
}
