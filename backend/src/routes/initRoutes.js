import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../utils/database.js";
import ApiValidator from "../utils/apiValidator.js";
import SystemReset from "../utils/systemReset.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database with clean schema and sample data
router.post("/init", async (req, res) => {
  try {
    console.log("🚀 Starting database initialization...");

    // Test connection first
    const testResult = await db.testConnection();
    if (!testResult.success) {
      return res.status(500).json({
        success: false,
        error: "Database connection failed",
        details: testResult.error,
      });
    }

    // Execute clean setup migration
    const migrationPath = path.join(
      __dirname,
      "../../migrations",
      "003_clean_setup.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("🔄 Executing database schema migration...");
    await db.query(migrationSQL);
    console.log("✅ Database schema created successfully");

    // Insert sample data
    const seedPath = path.join(
      __dirname,
      "../../migrations",
      "002_seed_data.sql",
    );
    const seedSQL = fs.readFileSync(seedPath, "utf8");

    console.log("🌱 Seeding database with sample data...");
    await db.query(seedSQL);
    console.log("✅ Sample data inserted successfully");

    // Verify data
    const devicesResult = await db.query(
      "SELECT COUNT(*) as count FROM devices",
    );
    const problemsResult = await db.query(
      "SELECT COUNT(*) as count FROM problems",
    );
    const stepsResult = await db.query(
      "SELECT COUNT(*) as count FROM diagnostic_steps",
    );

    const stats = {
      devices: parseInt(devicesResult.rows[0].count),
      problems: parseInt(problemsResult.rows[0].count),
      steps: parseInt(stepsResult.rows[0].count),
    };

    console.log(`📊 Database ready with:`, stats);

    res.json({
      success: true,
      message: "Database initialized successfully",
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    res.status(500).json({
      success: false,
      error: "Database initialization failed",
      details: error.message,
    });
  }
});

// Cache for status endpoint (5 minute cache)
let statusCache = null;
let statusCacheTime = 0;
const STATUS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check database status
router.get("/status", async (req, res) => {
  try {
    // Return cached result if still valid
    const now = Date.now();
    if (statusCache && now - statusCacheTime < STATUS_CACHE_DURATION) {
      return res.json(statusCache);
    }

    const testResult = await db.testConnection();

    if (!testResult.success) {
      return res.status(500).json({
        success: false,
        connected: false,
        error: testResult.error,
      });
    }

    // Get tables and stats in a single optimized query
    const result = await db.query(`
      WITH table_info AS (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      ),
      table_counts AS (
        SELECT
          'devices' as table_name,
          (SELECT COUNT(*) FROM devices) as count
        WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'devices' AND table_schema = 'public')
        UNION ALL
        SELECT
          'problems' as table_name,
          (SELECT COUNT(*) FROM problems) as count
        WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'problems' AND table_schema = 'public')
        UNION ALL
        SELECT
          'diagnostic_steps' as table_name,
          (SELECT COUNT(*) FROM diagnostic_steps) as count
        WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diagnostic_steps' AND table_schema = 'public')
        UNION ALL
        SELECT
          'remotes' as table_name,
          (SELECT COUNT(*) FROM remotes) as count
        WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'remotes' AND table_schema = 'public')
        UNION ALL
        SELECT
          'tv_interfaces' as table_name,
          (SELECT COUNT(*) FROM tv_interfaces) as count
        WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tv_interfaces' AND table_schema = 'public')
        UNION ALL
        SELECT
          'users' as table_name,
          (SELECT COUNT(*) FROM users) as count
        WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')
      )
      SELECT
        json_agg(DISTINCT ti.table_name ORDER BY ti.table_name) as tables,
        json_object_agg(tc.table_name, tc.count) as stats
      FROM table_info ti
      LEFT JOIN table_counts tc ON true
    `);

    const tables = result.rows[0].tables || [];
    const stats = result.rows[0].stats || {};

    const response = {
      success: true,
      connected: true,
      tables: tables,
      stats: stats,
      database: testResult,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    // Cache the response
    statusCache = response;
    statusCacheTime = now;

    res.json(response);
  } catch (error) {
    console.error("❌ Database status check failed:", error.message);
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message,
    });
  }
});

// Validate complete API functionality
router.get("/validate", async (req, res) => {
  try {
    console.log("🔍 Running API validation...");

    const validation = await ApiValidator.runFullValidation();

    if (validation.success) {
      res.json({
        success: true,
        message: "API validation completed successfully",
        validation: validation,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "API validation found issues",
        validation: validation,
      });
    }
  } catch (error) {
    console.error("❌ API validation failed:", error.message);
    res.status(500).json({
      success: false,
      error: "API validation failed",
      details: error.message,
    });
  }
});

// Complete system reset and initialization
router.post("/reset", async (req, res) => {
  try {
    console.log("🚀 Starting complete system reset...");

    const resetResult = await SystemReset.performCompleteReset();

    if (resetResult.success) {
      res.json({
        success: true,
        message: "System reset completed successfully",
        results: resetResult,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "System reset failed",
        results: resetResult,
      });
    }
  } catch (error) {
    console.error("❌ System reset failed:", error.message);
    res.status(500).json({
      success: false,
      error: "System reset failed",
      details: error.message,
    });
  }
});

export default router;
