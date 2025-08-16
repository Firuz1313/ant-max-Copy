import db from './src/utils/database.js';

async function testAndSeed() {
  try {
    // Test connection
    console.log('Testing database connection...');
    const connection = await db.testConnection();
    console.log('Connection successful:', connection);

    // Check existing tables
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Existing tables:', tables.rows.map(r => r.table_name));

    // Check if we need to create tables
    const deviceTable = tables.rows.find(r => r.table_name === 'devices');
    
    if (!deviceTable) {
      console.log('Creating tables...');
      await db.query(`
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
        );
      `);

      await db.query(`
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
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS diagnostic_steps (
          id VARCHAR(255) PRIMARY KEY,
          problem_id VARCHAR(255) NOT NULL,
          step_number INTEGER NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          instruction TEXT NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'info',
          expected_result TEXT,
          troubleshooting_tips TEXT,
          time_estimate INTEGER DEFAULT 60,
          is_active BOOLEAN NOT NULL DEFAULT true,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS diagnostic_sessions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          device_id VARCHAR(255),
          problem_id VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          end_time TIMESTAMP WITH TIME ZONE,
          current_step_id VARCHAR(255),
          completed_steps JSONB DEFAULT '[]'::jsonb,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS change_logs (
          id VARCHAR(255) PRIMARY KEY,
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL,
          user_id VARCHAR(255),
          changes JSONB,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('Tables created successfully');
    }

    // Seed test data
    console.log('Seeding test data...');
    
    // Check if data already exists
    const deviceCount = await db.query('SELECT COUNT(*) FROM devices');
    
    if (parseInt(deviceCount.rows[0].count) === 0) {
      // Insert test devices
      await db.query(`
        INSERT INTO devices (id, name, brand, model, description, color, order_index) VALUES
        ('device-1', 'ANT TV Box Pro', 'ANT', 'TV-Pro-2024', 'Современная ТВ-приставка с поддержкой 4K', 'from-blue-500 to-blue-600', 1),
        ('device-2', 'ANT Mini', 'ANT', 'Mini-2024', 'Компактная ТВ-приставка для базовых задач', 'from-green-500 to-green-600', 2),
        ('device-3', 'ANT Ultra', 'ANT', 'Ultra-2024', 'Флагманская модель с расширенными возможностями', 'from-purple-500 to-purple-600', 3)
      `);

      // Insert test problems
      await db.query(`
        INSERT INTO problems (id, device_id, title, description, category, status, priority) VALUES
        ('problem-1', 'device-1', 'Нет сигнала', 'Приставка не показывает изображение', 'critical', 'published', 1),
        ('problem-2', 'device-1', 'Зависает при загрузке', 'Приставка останавливается на экране загрузки', 'moderate', 'published', 2),
        ('problem-3', 'device-2', 'Не подключается к WiFi', 'Проблемы с беспроводным подключением', 'moderate', 'published', 3),
        ('problem-4', 'device-3', 'Звук пропадает', 'Периодически исчезает звуковое сопровождение', 'minor', 'draft', 4)
      `);

      // Insert test steps
      await db.query(`
        INSERT INTO diagnostic_steps (id, problem_id, step_number, title, instruction, type) VALUES
        ('step-1', 'problem-1', 1, 'Проверка кабелей', 'Убедитесь, что все кабели надежно подключены', 'check'),
        ('step-2', 'problem-1', 2, 'Перезагрузка приставки', 'Отключите приставку от питания на 30 секунд', 'action'),
        ('step-3', 'problem-2', 1, 'Очистка кэша', 'Перейдите в настройки и очистите кэш приложений', 'action'),
        ('step-4', 'problem-3', 1, 'Проверка пароля WiFi', 'Убедитесь, что пароль введен правильно', 'check'),
        ('step-5', 'problem-4', 1, 'Проверка аудио кабелей', 'Проверьте подключение аудио кабелей', 'check')
      `);

      // Insert test sessions
      await db.query(`
        INSERT INTO diagnostic_sessions (id, device_id, problem_id, status) VALUES
        ('session-1', 'device-1', 'problem-1', 'completed'),
        ('session-2', 'device-2', 'problem-3', 'active'),
        ('session-3', 'device-1', 'problem-2', 'active')
      `);

      console.log('Test data seeded successfully');
    } else {
      console.log('Data already exists, skipping seed');
    }

    // Show current stats
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM devices) as devices,
        (SELECT COUNT(*) FROM problems) as problems,
        (SELECT COUNT(*) FROM diagnostic_steps) as steps,
        (SELECT COUNT(*) FROM diagnostic_sessions) as sessions
    `);
    
    console.log('Current database stats:', stats.rows[0]);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.closePool();
  }
}

testAndSeed();
