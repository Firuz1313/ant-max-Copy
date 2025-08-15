import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../utils/database.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database with clean schema and sample data
router.post('/init', async (req, res) => {
  try {
    console.log('🚀 Starting database initialization...');

    // Test connection first
    const testResult = await db.testConnection();
    if (!testResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: testResult.error
      });
    }

    // Execute clean setup migration
    const migrationPath = path.join(__dirname, '../../migrations', '003_clean_setup.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Executing database schema migration...');
    await db.query(migrationSQL);
    console.log('✅ Database schema created successfully');

    // Insert sample data
    const seedPath = path.join(__dirname, '../../migrations', '002_seed_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Seeding database with sample data...');
    await db.query(seedSQL);
    console.log('✅ Sample data inserted successfully');

    // Verify data
    const devicesResult = await db.query('SELECT COUNT(*) as count FROM devices');
    const problemsResult = await db.query('SELECT COUNT(*) as count FROM problems');
    const stepsResult = await db.query('SELECT COUNT(*) as count FROM diagnostic_steps');
    
    const stats = {
      devices: parseInt(devicesResult.rows[0].count),
      problems: parseInt(problemsResult.rows[0].count),
      steps: parseInt(stepsResult.rows[0].count)
    };

    console.log(`📊 Database ready with:`, stats);

    res.json({
      success: true,
      message: 'Database initialized successfully',
      stats: stats
    });

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Database initialization failed',
      details: error.message
    });
  }
});

// Check database status
router.get('/status', async (req, res) => {
  try {
    const testResult = await db.testConnection();
    
    if (!testResult.success) {
      return res.status(500).json({
        success: false,
        connected: false,
        error: testResult.error
      });
    }

    // Check if tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    
    // Count data in main tables
    const stats = {};
    const mainTables = ['devices', 'problems', 'diagnostic_steps', 'remotes', 'tv_interfaces'];
    
    for (const table of mainTables) {
      if (tables.includes(table)) {
        try {
          const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = parseInt(countResult.rows[0].count);
        } catch {
          stats[table] = 'error';
        }
      } else {
        stats[table] = 'missing';
      }
    }

    res.json({
      success: true,
      connected: true,
      tables: tables,
      stats: stats,
      database: testResult
    });

  } catch (error) {
    console.error('❌ Database status check failed:', error.message);
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message
    });
  }
});

export default router;
