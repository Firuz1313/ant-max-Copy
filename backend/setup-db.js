import { testConnection, query } from './src/utils/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Create basic tables if they don't exist
    console.log('📊 Creating basic tables...');
    
    // Create devices table
    await query(`
      CREATE TABLE IF NOT EXISTS devices (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        logo_url VARCHAR(500),
        color VARCHAR(100) NOT NULL DEFAULT 'from-gray-500 to-gray-600',
        order_index INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Create problems table
    await query(`
      CREATE TABLE IF NOT EXISTS problems (
        id VARCHAR(255) PRIMARY KEY,
        device_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'other',
        icon VARCHAR(100) NOT NULL DEFAULT 'HelpCircle',
        color VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
        tags JSONB DEFAULT '[]'::jsonb,
        priority INTEGER NOT NULL DEFAULT 1,
        estimated_time INTEGER NOT NULL DEFAULT 5,
        difficulty VARCHAR(50) NOT NULL DEFAULT 'beginner',
        success_rate INTEGER NOT NULL DEFAULT 100,
        completed_count INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Insert sample device
    await query(`
      INSERT INTO devices (id, name, brand, model, description) VALUES 
      ('device-1', 'ANT Digital TV Box', 'ANT', 'Model A1', 'Standard digital TV receiver')
      ON CONFLICT (id) DO NOTHING
    `);

    // Insert sample problem
    await query(`
      INSERT INTO problems (id, device_id, title, description) VALUES
      ('problem-1', 'device-1', 'No signal received', 'TV shows no signal or black screen')
      ON CONFLICT (id) DO NOTHING
    `);

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

    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
