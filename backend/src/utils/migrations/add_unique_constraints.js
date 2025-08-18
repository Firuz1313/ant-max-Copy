import { query } from "../database.js";

/**
 * Миграция для добавления недостающих UNIQUE ограничений
 */
export const up = async () => {
  console.log("🔄 Добавляем UNIQUE ограничения...");

  try {
    // 1. Добавляем UNIQUE на devices.name для активных устройств
    console.log(
      "1. Добавляем частичный UNIQUE индекс на devices.name (только для активных)...",
    );
    await query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_devices_name_unique_active 
      ON devices(name) 
      WHERE is_active = true;
    `);

    // 2. Добавляем ком��озитный UNIQUE на problems (title, device_id) для активных записей
    console.log(
      "2. Добавляем композитный UNIQUE индекс на problems (title, device_id)...",
    );
    await query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_title_device_unique_active 
      ON problems(title, device_id) 
      WHERE is_active = true;
    `);

    // 3. Добавляем UNIQUE на remotes (name, device_id) для активных записей
    console.log(
      "3. Добавляем композитный UNIQUE индекс на remotes (name, device_id)...",
    );
    await query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_remotes_name_device_unique_active 
      ON remotes(name, device_id) 
      WHERE is_active = true;
    `);

    // 4. Добавляем UNIQUE на diagnostic_steps (problem_id, step_number) - уже есть в схеме, проверяем
    console.log(
      "4. Проверяем UNIQUE ограничение на diagnostic_steps (problem_id, step_number)...",
    );
    const stepConstraintExists = await query(`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'diagnostic_steps_problem_id_step_number_key'
      AND table_name = 'diagnostic_steps';
    `);

    if (stepConstraintExists.rows.length === 0) {
      await query(`
        ALTER TABLE diagnostic_steps 
        ADD CONSTRAINT diagnostic_steps_problem_id_step_number_key 
        UNIQUE (problem_id, step_number);
      `);
      console.log("   ✅ Добавлен UNIQUE constraint на diagnostic_steps");
    } else {
      console.log(
        "   ℹ️  UNIQUE constraint на diagnostic_steps уже существует",
      );
    }

    // 5. Добавляем UNIQUE на tv_interfaces.name для активных записей
    console.log("5. Добавляем UNIQUE индекс на tv_interfaces.name...");
    await query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_tv_interfaces_name_unique_active 
      ON tv_interfaces(name) 
      WHERE is_active = true;
    `);

    console.log("✅ Все UNIQUE ограничения добавлены успешно!");
    return true;
  } catch (error) {
    console.error(
      "❌ Ошибка при добавлении UNIQUE ограничений:",
      error.message,
    );

    // Если ошибка связана с дубликатами, выводим подробную информацию
    if (error.code === "23505") {
      console.error(
        "💡 Найдены дублирующиеся записи. Необходимо очистить данные перед применением ограничений.",
      );

      // Показываем дубликаты в devices
      try {
        const deviceDupes = await query(`
          SELECT name, COUNT(*) as count 
          FROM devices 
          WHERE is_active = true 
          GROUP BY name 
          HAVING COUNT(*) > 1;
        `);
        if (deviceDupes.rows.length > 0) {
          console.error("🔍 Дублирующиеся устройства:", deviceDupes.rows);
        }
      } catch (e) {
        // Игнорируем ошибки диагностики
      }

      // Показываем дубликаты в problems
      try {
        const problemDupes = await query(`
          SELECT title, device_id, COUNT(*) as count 
          FROM problems 
          WHERE is_active = true 
          GROUP BY title, device_id 
          HAVING COUNT(*) > 1;
        `);
        if (problemDupes.rows.length > 0) {
          console.error("🔍 Дублирующиеся проблемы:", problemDupes.rows);
        }
      } catch (e) {
        // Игнорируем ошибки диагностики
      }
    }

    throw error;
  }
};

/**
 * Откат миграции
 */
export const down = async () => {
  console.log("🔄 Удаляем UNIQUE ограничения...");

  try {
    // Удаляем индексы в обратном порядке
    await query(
      "DROP INDEX CONCURRENTLY IF EXISTS idx_tv_interfaces_name_unique_active;",
    );
    await query(
      "ALTER TABLE diagnostic_steps DROP CONSTRAINT IF EXISTS diagnostic_steps_problem_id_step_number_key;",
    );
    await query(
      "DROP INDEX CONCURRENTLY IF EXISTS idx_remotes_name_device_unique_active;",
    );
    await query(
      "DROP INDEX CONCURRENTLY IF EXISTS idx_problems_title_device_unique_active;",
    );
    await query(
      "DROP INDEX CONCURRENTLY IF EXISTS idx_devices_name_unique_active;",
    );

    console.log("✅ Все UNIQUE ограничения удалены успешно!");
    return true;
  } catch (error) {
    console.error("❌ Ошибка при удалении UNIQUE ограничений:", error.message);
    throw error;
  }
};

export default { up, down };
