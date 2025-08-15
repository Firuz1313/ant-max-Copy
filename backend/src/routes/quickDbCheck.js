import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// Quick database check endpoint
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Quick database check...');

    // Check connection
    const connectionTest = await db.testConnection();
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: connectionTest.error
      });
    }

    // Check tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    const requiredTables = ['users', 'devices', 'problems', 'diagnostic_steps'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));

    // Count records in main tables
    const counts = {};
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        try {
          const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
          counts[table] = parseInt(countResult.rows[0].count);
        } catch (error) {
          counts[table] = `Error: ${error.message}`;
        }
      } else {
        counts[table] = 'Table missing';
      }
    }

    const isReady = missingTables.length === 0 && 
                   Object.values(counts).every(count => typeof count === 'number' && count > 0);

    res.json({
      success: true,
      database: {
        connected: true,
        tablesFound: tables.length,
        requiredTables,
        missingTables,
        allTables: tables,
        recordCounts: counts,
        isReady: isReady,
        recommendation: isReady ? 
          'Database is ready!' : 
          'Database needs initialization. Go to /admin/database and click "Initialize Database"'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Quick database check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
