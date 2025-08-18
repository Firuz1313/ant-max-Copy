import { query } from "./src/utils/database.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function cleanupDuplicates() {
  try {
    console.log("🧹 Cleaning up duplicate devices...");

    // Find duplicate device names
    const duplicates = await query(`
      SELECT name, COUNT(*) as count, array_agg(id) as ids
      FROM devices 
      WHERE is_active = true
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);

    console.log(`Found ${duplicates.rows.length} duplicate device names`);

    for (const dup of duplicates.rows) {
      console.log(`- "${dup.name}": ${dup.count} devices`);
      const ids = dup.ids;

      // Keep the first one, deactivate the rest
      for (let i = 1; i < ids.length; i++) {
        await query(
          `
          UPDATE devices 
          SET is_active = false, name = name || ' (duplicate-' || $1 || ')'
          WHERE id = $2
        `,
          [i, ids[i]],
        );
        console.log(`  Deactivated duplicate: ${ids[i]}`);
      }
    }

    // List all active devices
    const activeDevices = await query(`
      SELECT id, name FROM devices WHERE is_active = true ORDER BY name
    `);

    console.log("\\n✅ Active devices after cleanup:");
    activeDevices.rows.forEach((device) => {
      console.log(`- ${device.id}: ${device.name}`);
    });

    console.log("\\n🎉 Cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
  }
}

cleanupDuplicates();
