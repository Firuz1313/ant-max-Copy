import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, transaction } from "../utils/database.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Execute specific migration
router.post("/execute/:filename", async (req, res) => {
  const { filename } = req.params;

  try {
    console.log(`🔄 API: Executing migration: ${filename}`);

    const migrationPath = path.join(__dirname, "../../migrations", filename);

    if (!fs.existsSync(migrationPath)) {
      return res.status(404).json({
        success: false,
        error: `Migration file not found: ${filename}`,
      });
    }

    const sql = fs.readFileSync(migrationPath, "utf8");

    await transaction(async (client) => {
      await client.query(sql);

      // Record migration
      await client.query(
        "INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
        [filename],
      );
    });

    console.log(`✅ API: Migration ${filename} executed successfully`);

    res.json({
      success: true,
      message: `Migration ${filename} executed successfully`,
      filename,
    });
  } catch (error) {
    console.error(
      `❌ API: Error executing migration ${filename}:`,
      error.message,
    );
    res.status(500).json({
      success: false,
      error: `Failed to execute migration: ${error.message}`,
      filename,
    });
  }
});

// Execute all new migrations
router.post("/execute-all", async (req, res) => {
  const migrations = [
    "010_complete_database_restructure.sql",
    "011_diagnostic_steps_and_marks.sql",
  ];

  const results = [];

  try {
    for (const migration of migrations) {
      console.log(`🔄 API: Executing migration: ${migration}`);

      const migrationPath = path.join(__dirname, "../../migrations", migration);
      const sql = fs.readFileSync(migrationPath, "utf8");

      await transaction(async (client) => {
        await client.query(sql);
        await client.query(
          "INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
          [migration],
        );
      });

      results.push({
        filename: migration,
        status: "success",
        message: "Executed successfully",
      });

      console.log(`✅ API: Migration ${migration} completed`);
    }

    res.json({
      success: true,
      message: "All migrations executed successfully",
      results,
      total: migrations.length,
    });
  } catch (error) {
    console.error("❌ API: Migration execution failed:", error.message);
    res.status(500).json({
      success: false,
      error: `Migration failed: ${error.message}`,
      results,
    });
  }
});

// Check database structure
router.get("/check-structure", async (req, res) => {
  try {
    const structure = {};

    // Check each table
    const tables = [
      "devices",
      "remotes",
      "tv_interfaces",
      "users",
      "problems",
      "diagnostic_steps",
      "tv_interface_marks",
      "remote_marks",
    ];

    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
        structure[table] = parseInt(result.rows[0].count);
      } catch (error) {
        structure[table] = `Error: ${error.message}`;
      }
    }

    res.json({
      success: true,
      structure,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// List available migrations
router.get("/list", async (req, res) => {
  try {
    const migrationsDir = path.join(__dirname, "../../migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Check which migrations are executed
    const executedResult = await query(
      "SELECT filename FROM migrations ORDER BY id",
    );
    const executed = new Set(executedResult.rows.map((row) => row.filename));

    const migrations = files.map((file) => ({
      filename: file,
      executed: executed.has(file),
      path: `/migrations/${file}`,
    }));

    res.json({
      success: true,
      migrations,
      total: files.length,
      executed: executed.size,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
