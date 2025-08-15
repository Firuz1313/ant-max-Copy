import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// Debug endpoint to check users table
router.get('/users-table', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking users table...');

    // Check if users table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    console.log('📊 Users table exists:', tableExists.rows[0].exists);

    if (!tableExists.rows[0].exists) {
      return res.json({
        success: false,
        error: 'Users table does not exist',
        recommendation: 'Initialize database first'
      });
    }

    // Check table structure
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📊 Users table columns:', columns.rows.length);

    // Try to count users
    const count = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(count.rows[0].count);

    console.log('📊 Users count:', userCount);

    // Get sample user (without password)
    const sampleUser = await db.query(`
      SELECT id, username, email, role, created_at 
      FROM users 
      LIMIT 1
    `);

    res.json({
      success: true,
      table: {
        exists: true,
        columns: columns.rows,
        recordCount: userCount,
        sampleRecord: sampleUser.rows[0] || null
      },
      message: `Users table is ready with ${userCount} records`
    });

  } catch (error) {
    console.error('❌ Debug users table error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Debug endpoint to test user controller directly
router.get('/test-user-controller', async (req, res) => {
  try {
    console.log('🔍 Debug: Testing user controller...');
    
    // Import and test the controller function directly
    const { getAllUsers } = await import('../controllers/userController.js');
    
    // Create mock req/res objects
    const mockReq = {
      query: {}
    };
    
    const mockRes = {
      json: (data) => {
        console.log('📊 Controller response:', data);
        res.json({
          success: true,
          message: 'User controller test completed',
          controllerResponse: data
        });
      },
      status: (code) => ({
        json: (data) => {
          console.log('📊 Controller error response:', code, data);
          res.status(200).json({
            success: false,
            message: 'User controller returned error',
            errorCode: code,
            controllerResponse: data
          });
        }
      })
    };

    await getAllUsers(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Debug controller test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
