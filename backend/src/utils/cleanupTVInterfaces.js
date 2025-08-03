import { query, transaction } from "./database.js";
import { v4 as uuidv4 } from "uuid";

// Функция очистки тестовых TV интерфейсов и создания пользовател��ских
export const cleanupAndCreateUserTVInterfaces = async () => {
  try {
    console.log("🧹 Начинаем очистку TV интерфейсов...");

    await transaction(async (client) => {
      // Удаляем все существующие TV интерфейсы (тестовые)
      console.log("🗑️ Удаление всех существующих TV интерфейсов...");
      await client.query("DELETE FROM tv_interfaces");

      // Получаем ID устройств для создания пользовательских интерфейсов
      const devicesResult = await client.query(
        "SELECT id, name, brand, model FROM devices ORDER BY name",
      );
      const devices = devicesResult.rows;

      if (devices.length === 0) {
        throw new Error("Нет устройств в базе данных для создания интерфейсов");
      }

      console.log(
        `📱 Найдено ${devices.length} устройств для создания интерфейсов`,
      );

      // Создаем базовый скриншот для каждого устройства
      const createDeviceScreenshot = (deviceName, deviceBrand) => {
        const canvas = {
          width: 800,
          height: 600,
        };

        // ��енерируем SVG вместо canvas для лучшей совместимости
        const svg = `
          <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
              </linearGradient>
            </defs>
            
            <!-- Background -->
            <rect width="100%" height="100%" fill="url(#bg)"/>
            
            <!-- Header -->
            <rect x="0" y="0" width="100%" height="80" fill="#333"/>
            <text x="50" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#fff">${deviceBrand}</text>
            <text x="50" y="60" font-family="Arial, sans-serif" font-size="14" fill="#ccc">${deviceName}</text>
            
            <!-- Time -->
            <text x="720" y="35" font-family="Arial, sans-serif" font-size="18" fill="#fff" text-anchor="end">${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</text>
            
            <!-- Menu Items -->
            <g>
              <!-- Channels -->
              <rect x="100" y="150" width="150" height="120" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
              <text x="175" y="200" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">Каналы</text>
              <text x="175" y="220" font-family="Arial, sans-serif" font-size="12" fill="#fff" text-anchor="middle">TV Guide</text>
              
              <!-- Settings -->
              <rect x="300" y="150" width="150" height="120" fill="#10b981" stroke="#fff" stroke-width="2"/>
              <text x="375" y="200" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">Настройки</text>
              <text x="375" y="220" font-family="Arial, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Settings</text>
              
              <!-- Apps -->
              <rect x="500" y="150" width="150" height="120" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
              <text x="575" y="200" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">Приложения</text>
              <text x="575" y="220" font-family="Arial, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Apps</text>
              
              <!-- Movies -->
              <rect x="100" y="320" width="150" height="120" fill="#ef4444" stroke="#fff" stroke-width="2"/>
              <text x="175" y="370" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">Фильмы</text>
              <text x="175" y="390" font-family="Arial, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Movies</text>
              
              <!-- Music -->
              <rect x="300" y="320" width="150" height="120" fill="#8b5cf6" stroke="#fff" stroke-width="2"/>
              <text x="375" y="370" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">Музыка</text>
              <text x="375" y="390" font-family="Arial, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Music</text>
              
              <!-- Games -->
              <rect x="500" y="320" width="150" height="120" fill="#06b6d4" stroke="#fff" stroke-width="2"/>
              <text x="575" y="370" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">Игры</text>
              <text x="575" y="390" font-family="Arial, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Games</text>
            </g>
            
            <!-- Footer -->
            <rect x="0" y="520" width="100%" height="80" fill="#222"/>
            <text x="50" y="550" font-family="Arial, sans-serif" font-size="12" fill="#999">Главное меню</text>
            <text x="50" y="570" font-family="Arial, sans-serif" font-size="10" fill="#666">Используйте стрелки для навигации</text>
          </svg>
        `;

        // Конвертируем SVG в base64 data URL
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
      };

      // Создаем интерфейсы для каждого устройства
      let createdCount = 0;
      for (const device of devices) {
        console.log(`📺 Создание интерфейса для ${device.name}...`);

        const screenshotData = createDeviceScreenshot(
          device.name,
          device.brand,
        );

        const tvInterfaceData = {
          id: uuidv4(),
          name: `Главное меню ${device.name}`,
          description: `Основной интерфейс главного меню для ${device.brand} ${device.model}`,
          type: "home",
          device_id: device.id,
          screenshot_url: null,
          screenshot_data: screenshotData,
          clickable_areas: JSON.stringify([
            {
              id: "channels",
              x: 100,
              y: 150,
              width: 150,
              height: 120,
              label: "Каналы",
              action: "open_channels",
              color: "#3b82f6",
              shape: "rectangle",
            },
            {
              id: "settings",
              x: 300,
              y: 150,
              width: 150,
              height: 120,
              label: "Настройки",
              action: "open_settings",
              color: "#10b981",
              shape: "rectangle",
            },
            {
              id: "apps",
              x: 500,
              y: 150,
              width: 150,
              height: 120,
              label: "Приложения",
              action: "open_apps",
              color: "#f59e0b",
              shape: "rectangle",
            },
          ]),
          highlight_areas: JSON.stringify([]),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const columns = Object.keys(tvInterfaceData);
        const values = Object.values(tvInterfaceData);
        const placeholders = columns.map((_, index) => `$${index + 1}`);

        await client.query(
          `INSERT INTO tv_interfaces (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
          values,
        );

        createdCount++;
      }

      console.log(`✅ Создано ${createdCount} пользовательских TV интерфейсов`);
    });

    console.log("🎉 Очистка и создание интерфейсов завершена успешно!");
    return {
      success: true,
      created: devices.length,
    };
  } catch (error) {
    console.error("❌ Ошибка при очистке TV интерфейсов:", error);
    throw error;
  }
};

// Функция для запуска из командной строки
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupAndCreateUserTVInterfaces()
    .then((result) => {
      console.log("🎉 Очистка завершена успешно!", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Ошибка:", error);
      process.exit(1);
    });
}

export default cleanupAndCreateUserTVInterfaces;
