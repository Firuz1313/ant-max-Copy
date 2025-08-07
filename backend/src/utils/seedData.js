import { query, transaction } from "./database.js";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const createTimestamp = () => {
  return new Date().toISOString();
};

// NO SEED DATA - Database should start completely empty
const testDevices = [];
const testProblems = [];
const testSteps = [];

// Функция заполнения базы данных
export const seedDatabase = async () => {
  try {
    console.log("🌱 Начинаем заполнение базы данных тестовыми данными...");

    // Skip seeding - keep database empty for production use
    console.log("✅ Database seeding skipped - database will remain empty");
    
    return {
      success: true,
      message: "Database seeding skipped - no test data added",
      data: {
        devices: 0,
        problems: 0,
        steps: 0,
        sessions: 0,
      },
    };
  } catch (error) {
    console.error("❌ Ошибка при заполнении базы данных:", error);
    throw error;
  }
};

// Функция очистки базы данных
export const clearDatabase = async () => {
  try {
    console.log("🧹 Начинаем очистку базы данных...");

    await transaction(async (client) => {
      // Отключаем проверки внешних ключей для безопасного удаления
      await client.query("SET FOREIGN_KEY_CHECKS = 0");

      // Очищаем все таблицы в правильном порядке
      await client.query("DELETE FROM session_steps");
      await client.query("DELETE FROM step_actions");
      await client.query("DELETE FROM diagnostic_sessions");
      await client.query("DELETE FROM diagnostic_steps");
      await client.query("DELETE FROM tv_interface_marks");
      await client.query("DELETE FROM tv_interfaces");
      await client.query("DELETE FROM remotes");
      await client.query("DELETE FROM problems");
      await client.query("DELETE FROM devices");
      await client.query("DELETE FROM change_logs");
      await client.query("DELETE FROM users WHERE id != 'admin-001'"); // Оставляем админа
      await client.query("DELETE FROM site_settings WHERE id != 'settings'"); // Оставляем настройки

      // Включаем обратно проверки внешних ключей
      await client.query("SET FOREIGN_KEY_CHECKS = 1");

      console.log("✅ База данных успешн�� очищена");
    });

    return {
      success: true,
      message: "База данных успешно очищена",
    };
  } catch (error) {
    console.error("❌ Ошибка при очистке базы данных:", error);
    throw error;
  }
};

export default {
  seedDatabase,
  clearDatabase,
};
