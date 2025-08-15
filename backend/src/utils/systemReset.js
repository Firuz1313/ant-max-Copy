import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Utility for complete system reset and initialization
 */
export class SystemReset {

  static async resetDatabase() {
    try {
      console.log('🔄 Starting database reset...');

      // Drop all tables in correct order (reverse dependencies)
      const dropQueries = [
        'DROP TABLE IF EXISTS session_steps CASCADE;',
        'DROP TABLE IF EXISTS diagnostic_sessions CASCADE;',
        'DROP TABLE IF EXISTS step_actions CASCADE;',
        'DROP TABLE IF EXISTS diagnostic_steps CASCADE;',
        'DROP TABLE IF EXISTS tv_interface_marks CASCADE;',
        'DROP TABLE IF EXISTS tv_interfaces CASCADE;',
        'DROP TABLE IF EXISTS remotes CASCADE;',
        'DROP TABLE IF EXISTS problems CASCADE;',
        'DROP TABLE IF EXISTS devices CASCADE;',
        'DROP TABLE IF EXISTS change_logs CASCADE;',
        'DROP TABLE IF EXISTS site_settings CASCADE;',
        'DROP TABLE IF EXISTS users CASCADE;',
        'DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;'
      ];

      for (const query of dropQueries) {
        await db.query(query);
      }

      console.log('✅ All tables dropped successfully');
      return { success: true, message: 'Database reset completed' };

    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async createSchema() {
    try {
      console.log('🏗️ Creating database schema...');

      // Read and execute schema migration
      const migrationPath = path.join(__dirname, '../../migrations', '003_clean_setup.sql');
      
      if (!fs.existsSync(migrationPath)) {
        throw new Error('Schema migration file not found');
      }

      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await db.query(migrationSQL);

      console.log('�� Database schema created successfully');
      return { success: true, message: 'Schema creation completed' };

    } catch (error) {
      console.error('❌ Schema creation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async seedData() {
    try {
      console.log('🌱 Seeding database with sample data...');

      // Read and execute seed data
      const seedPath = path.join(__dirname, '../../migrations', '002_seed_data.sql');
      
      if (!fs.existsSync(seedPath)) {
        throw new Error('Seed data file not found');
      }

      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      await db.query(seedSQL);

      console.log('✅ Sample data inserted successfully');
      return { success: true, message: 'Data seeding completed' };

    } catch (error) {
      console.error('❌ Data seeding failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async verifyInstallation() {
    try {
      console.log('🔍 Verifying installation...');

      // Check table counts
      const counts = {};
      const tables = ['devices', 'problems', 'diagnostic_steps', 'remotes', 'tv_interfaces'];
      
      for (const table of tables) {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = parseInt(result.rows[0].count);
      }

      // Check if we have the expected data
      const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
      const isValid = totalRecords > 0;

      console.log(`📊 Verification completed. Total records: ${totalRecords}`);
      
      return { 
        success: isValid, 
        message: isValid ? 'Installation verified successfully' : 'Installation verification failed - no data found',
        counts,
        totalRecords
      };

    } catch (error) {
      console.error('❌ Installation verification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async performCompleteReset() {
    console.log('🚀 Starting complete system reset...');
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: {},
      success: false
    };

    try {
      // Step 1: Reset database
      results.steps.reset = await this.resetDatabase();
      if (!results.steps.reset.success) {
        throw new Error('Database reset failed');
      }

      // Step 2: Create schema
      results.steps.schema = await this.createSchema();
      if (!results.steps.schema.success) {
        throw new Error('Schema creation failed');
      }

      // Step 3: Seed data
      results.steps.seed = await this.seedData();
      if (!results.steps.seed.success) {
        throw new Error('Data seeding failed');
      }

      // Step 4: Verify installation
      results.steps.verify = await this.verifyInstallation();
      if (!results.steps.verify.success) {
        throw new Error('Installation verification failed');
      }

      results.success = true;
      results.message = 'Complete system reset successful';
      
      console.log('✅ Complete system reset finished successfully');

    } catch (error) {
      results.success = false;
      results.error = error.message;
      console.error('❌ Complete system reset failed:', error.message);
    }

    return results;
  }
}

export default SystemReset;
