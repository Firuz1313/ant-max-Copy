import express from 'express';
import { query } from '../utils/database.js';

const router = express.Router();

/**
 * Clean up duplicate devices
 * GET /api/v1/cleanup/devices
 */
router.get('/devices', async (req, res) => {
  try {
    console.log('🧹 Cleaning up duplicate devices...');
    
    // Find duplicate device names
    const duplicates = await query(`
      SELECT name, COUNT(*) as count, array_agg(id) as ids
      FROM devices 
      WHERE is_active = true
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);

    console.log(`Found ${duplicates.rows.length} duplicate device names`);
    const results = [];

    for (const dup of duplicates.rows) {
      console.log(`- "${dup.name}": ${dup.count} devices`);
      const ids = dup.ids;
      
      // Keep the first one, deactivate the rest
      for (let i = 1; i < ids.length; i++) {
        await query(`
          UPDATE devices 
          SET is_active = false, name = name || ' (duplicate-' || $1 || ')'
          WHERE id = $2
        `, [i, ids[i]]);
        console.log(`  Deactivated duplicate: ${ids[i]}`);
        results.push(`Deactivated duplicate: ${ids[i]}`);
      }
    }

    // List all active devices
    const activeDevices = await query(`
      SELECT id, name FROM devices WHERE is_active = true ORDER BY name
    `);
    
    res.json({
      success: true,
      message: 'Device cleanup completed',
      duplicatesFound: duplicates.rows.length,
      duplicatesFixed: results.length,
      activeDevices: activeDevices.rows,
      details: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Cleanup failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
