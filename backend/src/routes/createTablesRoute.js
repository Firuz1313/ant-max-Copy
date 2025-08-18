import express from "express";
import { query } from "../utils/database.js";

const router = express.Router();

/**
 * Create missing tables
 * GET /api/v1/create-tables
 */
router.get("/", async (req, res) => {
  try {
    console.log("🔧 Creating missing tables...");

    // Create site_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'settings',
        site_name VARCHAR(255) NOT NULL DEFAULT 'ANT Support',
        site_description TEXT,
        default_language VARCHAR(10) NOT NULL DEFAULT 'ru',
        supported_languages JSONB DEFAULT '["ru", "tj", "uz"]'::jsonb,
        theme VARCHAR(50) NOT NULL DEFAULT 'professional',
        primary_color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
        accent_color VARCHAR(50) NOT NULL DEFAULT '#10b981',
        logo_url VARCHAR(500),
        favicon_url VARCHAR(500),
        enable_analytics BOOLEAN NOT NULL DEFAULT true,
        enable_feedback BOOLEAN NOT NULL DEFAULT true,
        enable_offline_mode BOOLEAN NOT NULL DEFAULT false,
        enable_notifications BOOLEAN NOT NULL DEFAULT true,
        max_steps_per_problem INTEGER NOT NULL DEFAULT 20,
        max_media_size INTEGER NOT NULL DEFAULT 10,
        session_timeout INTEGER NOT NULL DEFAULT 30,
        api_settings JSONB DEFAULT '{}'::jsonb,
        email_settings JSONB DEFAULT '{}'::jsonb,
        storage_settings JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Insert default settings
    await query(`
      INSERT INTO site_settings (id, site_name, site_description) VALUES (
        'settings',
        'ANT Support',
        'Профессиональная платформа для д��агностики цифровых ТВ-приставок'
      ) ON CONFLICT (id) DO NOTHING
    `);

    console.log("✅ Tables created successfully!");

    res.json({
      success: true,
      message: "Missing tables created successfully",
      tablesCreated: ["site_settings"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Table creation failed:", error.message);
    res.status(500).json({
      success: false,
      error: "Table creation failed",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
