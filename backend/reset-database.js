import fs from 'fs';
import path from 'path';
import db from './src/utils/database.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetDatabase() {
  try {
    console.log('🔄 Сброс и пересоздание базы данных...');
    
    // Read migration files
    const resetMigration = fs.readFileSync(
      path.join(__dirname, 'migrations', '012_reset_and_create_full_database.sql'),
      'utf8'
    );
    
    const seedMigration = fs.readFileSync(
      path.join(__dirname, 'migrations', '013_seed_full_database.sql'),
      'utf8'
    );
    
    console.log('📊 Выполняем сброс базы данных...');
    await db.query(resetMigration);
    console.log('✅ База данных сброшена и пересоздана');
    
    console.log('📊 Загружаем данные...');
    await db.query(seedMigration);
    console.log('✅ Данные загружены успешно');
    
    // Get statistics
    const stats = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM devices'),
      db.query('SELECT COUNT(*) as count FROM problems'),
      db.query('SELECT COUNT(*) as count FROM diagnostic_steps'),
      db.query('SELECT COUNT(*) as count FROM remotes'),
      db.query('SELECT COUNT(*) as count FROM tv_interfaces'),
      db.query('SELECT COUNT(*) as count FROM tv_interface_marks'),
      db.query('SELECT COUNT(*) as count FROM remote_marks'),
    ]);
    
    console.log('\n📊 Статистика наполнения базы данных:');
    console.log(`👥 Пользователи: ${stats[0].rows[0].count}`);
    console.log(`📱 Устройства: ${stats[1].rows[0].count}`);
    console.log(`⚠️ Проблемы: ${stats[2].rows[0].count}`);
    console.log(`🔧 Шаги диагностики: ${stats[3].rows[0].count}`);
    console.log(`🎛 Пульты: ${stats[4].rows[0].count}`);
    console.log(`📺 TV Интерф��йсы: ${stats[5].rows[0].count}`);
    console.log(`🎯 Маркировки интерфейсов: ${stats[6].rows[0].count}`);
    console.log(`🎯 Маркировки пультов: ${stats[7].rows[0].count}`);
    
    console.log('\n🎉 База данных успешно инициализирована!');
    
  } catch (error) {
    console.error('❌ Ошибка при сбросе базы данных:', error.message);
    throw error;
  } finally {
    await db.closePool();
  }
}

resetDatabase().catch(console.error);
