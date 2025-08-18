import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, transaction } from "./src/utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeMigration(filename) {
  console.log(`🔄 Executing migration: ${filename}`);

  try {
    const migrationPath = path.join(__dirname, "migrations", filename);
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Execute in transaction for safety
    await transaction(async (client) => {
      await client.query(sql);
      console.log(`✅ Migration ${filename} executed successfully`);

      // Record migration
      await client.query(
        "INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
        [filename],
      );
    });
  } catch (error) {
    console.error(`❌ Error executing migration ${filename}:`, error.message);
    throw error;
  }
}

async function checkDatabaseStructure() {
  console.log("\n🔍 Checking database structure...");

  try {
    // Check devices
    const devices = await query("SELECT COUNT(*) as count FROM devices");
    console.log(`📱 Devices: ${devices.rows[0].count} records`);

    // Check remotes
    const remotes = await query("SELECT COUNT(*) as count FROM remotes");
    console.log(`🎛️  Remotes: ${remotes.rows[0].count} records`);

    // Check TV interfaces
    const tvInterfaces = await query(
      "SELECT COUNT(*) as count FROM tv_interfaces",
    );
    console.log(`📺 TV Interfaces: ${tvInterfaces.rows[0].count} records`);

    // Check users
    const users = await query("SELECT COUNT(*) as count FROM users");
    console.log(`👥 Users: ${users.rows[0].count} records`);

    // Check problems
    const problems = await query("SELECT COUNT(*) as count FROM problems");
    console.log(`⚠️  Problems: ${problems.rows[0].count} records`);

    // Check diagnostic steps
    const steps = await query("SELECT COUNT(*) as count FROM diagnostic_steps");
    console.log(`🔧 Diagnostic Steps: ${steps.rows[0].count} records`);

    // Check markings
    const tvMarks = await query(
      "SELECT COUNT(*) as count FROM tv_interface_marks",
    );
    console.log(`🎯 TV Interface Marks: ${tvMarks.rows[0].count} records`);

    const remoteMarks = await query(
      "SELECT COUNT(*) as count FROM remote_marks",
    );
    console.log(`🎯 Remote Marks: ${remoteMarks.rows[0].count} records`);
  } catch (error) {
    console.error("❌ Error checking database structure:", error.message);
  }
}

async function main() {
  console.log("🚀 Starting complete database restructure...\n");

  const migrations = [
    "010_complete_database_restructure.sql",
    "011_diagnostic_steps_and_marks.sql",
  ];

  for (const migration of migrations) {
    await executeMigration(migration);
  }

  console.log("\n🎉 All migrations executed successfully!\n");

  // Check final structure
  await checkDatabaseStructure();

  console.log("\n✅ Database restructure completed!");
  console.log("📋 Summary:");
  console.log("   - Cleaned old test data");
  console.log("   - Created fresh real data for all sections");
  console.log("   - Added remote_marks table for marking system");
  console.log("   - Linked all diagnostic steps with UI markings");
  console.log("   - Ready for full CRUD operations testing");

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Database restructure failed:", error);
  process.exit(1);
});
