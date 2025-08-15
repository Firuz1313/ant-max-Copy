import db from './src/utils/database.js';

try {
  console.log('🔍 Checking database connection...');
  const testResult = await db.testConnection();
  console.log('✅ Connection test:', testResult);

  console.log('🔍 Checking existing tables...');
  const result = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('📋 Existing tables:', result.rows.map(r => r.table_name));

  console.log('🔍 Checking migrations table...');
  const migrationsCheck = await db.query("SELECT filename FROM migrations ORDER BY executed_at").catch(() => null);
  console.log('📋 Applied migrations:', migrationsCheck ? migrationsCheck.rows.map(r => r.filename) : 'No migrations table');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  process.exit(0);
}
