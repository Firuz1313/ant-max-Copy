import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Running clean database setup...');
    
    // Test connection
    const testResult = await db.testConnection();
    if (!testResult.success) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connected successfully');

    // Read and execute clean setup migration
    const migrationPath = path.join(__dirname, 'migrations', '003_clean_setup.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Executing migration...');
    await db.query(migrationSQL);
    console.log('✅ Database schema created successfully');

    // Insert sample data
    const seedPath = path.join(__dirname, 'migrations', '002_seed_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Seeding database with sample data...');
    await db.query(seedSQL);
    console.log('✅ Sample data inserted successfully');

    // Verify data
    const devicesResult = await db.query('SELECT COUNT(*) as count FROM devices');
    const problemsResult = await db.query('SELECT COUNT(*) as count FROM problems');
    
    console.log(`📊 Database ready with:`);
    console.log(`  - ${devicesResult.rows[0].count} devices`);
    console.log(`  - ${problemsResult.rows[0].count} problems`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await db.closePool();
  }
}

runMigration();
