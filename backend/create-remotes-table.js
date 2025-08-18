import { query } from "./src/utils/database.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function createRemotesTable() {
  try {
    console.log("🚀 Creating remotes table...");

    // Create remotes table
    await query(`
      CREATE TABLE IF NOT EXISTS remotes (
        id VARCHAR(255) PRIMARY KEY,
        device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        description TEXT,
        layout VARCHAR(50) NOT NULL DEFAULT 'standard',
        color_scheme VARCHAR(50) NOT NULL DEFAULT 'dark',
        image_url VARCHAR(500),
        image_data TEXT,
        svg_data TEXT,
        dimensions JSONB NOT NULL DEFAULT '{"width": 200, "height": 500}'::jsonb,
        buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
        zones JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_default BOOLEAN NOT NULL DEFAULT false,
        usage_count INTEGER NOT NULL DEFAULT 0,
        last_used TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Insert sample remote
    await query(`
      INSERT INTO remotes (id, device_id, name, manufacturer, model, description) VALUES 
      ('remote-1', 'device-1', 'ANT Universal Remote', 'ANT', 'Remote-A1', 'Universal remote control for ANT devices')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log("✅ Remotes table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create remotes table:", error.message);
    process.exit(1);
  }
}

createRemotesTable();
