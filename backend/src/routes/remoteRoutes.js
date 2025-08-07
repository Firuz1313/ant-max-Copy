import express from "express";
import {
  getAllRemotes,
  getRemoteById,
  getRemotesByDevice,
  getDefaultRemoteForDevice,
  createRemote,
  updateRemote,
  deleteRemote,
  duplicateRemote,
  getRemoteStats,
  getPopularRemotes,
  searchRemotes,
  updateRemoteUsage
} from "../controllers/remoteController.js";
import { remoteValidation, validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Remotes
 *   description: Управление пультами дистанционного управления
 */

/**
 * Получить список всех пультов
 * @route GET /remotes
 * @desc Получение списка пультов с поддержкой фильтрации и пагинации
 * @query {string} [device_id] - Фильтр по устройству
 * @query {string} [manufacturer] - Фильтр по производителю
 * @query {string} [layout] - Фильтр по layout (standard, compact, smart, custom)
 * @query {boolean} [is_default] - Фильтр по статусу "по умолчанию"
 * @query {string} [search] - Поиск по названию, производителю или модели
 * @query {number} [limit=50] - Количество записей на странице
 * @query {number} [offset=0] - Смещение для пагинации
 * @access Public
 * @example
 * GET /api/v1/remotes?device_id=device-123&limit=10
 * GET /api/v1/remotes?search=samsung&manufacturer=Samsung
 */
router.get("/", getAllRemotes);

/**
 * Получить статистику пультов
 * @route GET /remotes/stats
 * @desc Получение общей статистики по пультам
 * @access Public
 */
router.get("/stats", getRemoteStats);

/**
 * Получить популярные пульты
 * @route GET /remotes/popular
 * @desc Получение списка популярных пультов по количеству использований
 * @query {number} [limit=10] - Количество популярных пультов
 * @access Public
 * @example
 * GET /api/v1/remotes/popular?limit=5
 */
router.get("/popular", getPopularRemotes);

/**
 * Поиск пультов
 * @route GET /remotes/search
 * @desc Поиск пультов по различным критериям
 * @query {string} q - Поисковый запрос (минимум 2 символа)
 * @query {string} [device_id] - Фильтр по устройству
 * @query {string} [manufacturer] - Фильтр по производителю
 * @query {string} [layout] - Фильтр по layout
 * @query {number} [limit=20] - Количество результатов
 * @access Public
 * @example
 * GET /api/v1/remotes/search?q=samsung&layout=standard
 * GET /api/v1/remotes/search?q=remote&device_id=device-123
 */
router.get("/search", searchRemotes);

/**
 * Получить пульты по устройству
 * @route GET /remotes/device/:deviceId
 * @desc Получение всех пультов для конкретного устройства
 * @param {string} deviceId - Уникальный идентификатор устройства
 * @access Public
 * @example
 * GET /api/v1/remotes/device/device-123
 */
router.get("/device/:deviceId", getRemotesByDevice);

/**
 * Получить пульт по умолчанию для устройства
 * @route GET /remotes/device/:deviceId/default
 * @desc Получение пульта по умолчанию для конкретного устройства
 * @param {string} deviceId - Уникальный идентификатор устройства
 * @access Public
 * @example
 * GET /api/v1/remotes/device/device-123/default
 */
router.get("/device/:deviceId/default", getDefaultRemoteForDevice);

/**
 * Получить пульт по ID
 * @route GET /remotes/:id
 * @desc Получение детальной информации о пульте включая статистику использования
 * @param {string} id - Уникальный идентификатор пульта
 * @access Public
 * @example
 * GET /api/v1/remotes/remote-123
 */
router.get("/:id", getRemoteById);

/**
 * Создать новый пульт
 * @route POST /remotes
 * @desc Создание нового пульта дистанционного управления
 * @body {object} remote - Данные пульта
 * @body {string} remote.name - Название пульта (обязательно)
 * @body {string} remote.manufacturer - Производитель (обязательно)
 * @body {string} remote.model - Модель пульта (обязательно)
 * @body {string} [remote.device_id] - ID связанного устройства (null для универсального)
 * @body {string} [remote.description] - Описание пульта
 * @body {string} [remote.layout=standard] - Layout пульта (standard, compact, smart, custom)
 * @body {string} [remote.color_scheme=dark] - Цветовая схема
 * @body {string} [remote.image_url] - URL изображения
 * @body {string} [remote.image_data] - Base64 изображение
 * @body {string} [remote.svg_data] - SVG данные
 * @body {object} [remote.dimensions] - Размеры пульта {width, height}
 * @body {array} [remote.buttons] - Массив кнопок пульта
 * @body {array} [remote.zones] - Массив зон пульта
 * @body {boolean} [remote.is_default=false] - Пульт по умолчанию для устройства
 * @body {boolean} [remote.is_active=true] - Активность пульта
 * @body {object} [remote.metadata] - Дополнительные метаданные
 * @access Private/Admin
 * @example
 * POST /api/v1/remotes
 * {
 *   "name": "Samsung Standard Remote",
 *   "manufacturer": "Samsung",
 *   "model": "BN59-01315A",
 *   "device_id": "device-123",
 *   "layout": "standard",
 *   "dimensions": {"width": 200, "height": 500},
 *   "buttons": [...],
 *   "is_default": true
 * }
 */
router.post("/", validateRequest(remoteValidation.create), createRemote);

/**
 * Дублировать пульт
 * @route POST /remotes/:id/duplicate
 * @desc Создание копии существующего пульта
 * @param {string} id - Уникальный идентификатор пульта для дублирования
 * @body {object} [options] - Опции дублирования
 * @body {string} [options.name] - Новое название для копии (по умолчанию: "{original_name} (копия)")
 * @access Private/Admin
 * @example
 * POST /api/v1/remotes/remote-123/duplicate
 * {
 *   "name": "Samsung Remote - Копия для тестирования"
 * }
 */
router.post("/:id/duplicate", duplicateRemote);

/**
 * Обновить статистику использования пульта
 * @route POST /remotes/:id/usage
 * @desc Увеличение счетчика использования пульта
 * @param {string} id - Уникальный идентификатор пульта
 * @access Public
 * @example
 * POST /api/v1/remotes/remote-123/usage
 */
router.post("/:id/usage", updateRemoteUsage);

/**
 * Обновить пульт
 * @route PUT /remotes/:id
 * @desc Обновление данных пульта
 * @param {string} id - Уникальный идентификатор пульта
 * @body {object} remote - Данные для обновления
 * @body {string} [remote.name] - Новое название пульта
 * @body {string} [remote.manufacturer] - Новый производитель
 * @body {string} [remote.model] - Новая модель пульта
 * @body {string} [remote.device_id] - Новый ID связанного устройства
 * @body {string} [remote.description] - Новое описание
 * @body {string} [remote.layout] - Новый layout
 * @body {string} [remote.color_scheme] - Новая цветовая схема
 * @body {string} [remote.image_url] - Новый URL изображения
 * @body {string} [remote.image_data] - Новое Base64 изображение
 * @body {string} [remote.svg_data] - Новые SVG данные
 * @body {object} [remote.dimensions] - Новые размеры
 * @body {array} [remote.buttons] - Новый массив кнопок
 * @body {array} [remote.zones] - Новый массив зон
 * @body {boolean} [remote.is_default] - Статус пульта по умолчанию
 * @body {boolean} [remote.is_active] - Активность пульта
 * @body {object} [remote.metadata] - Новые метаданные
 * @access Private/Admin
 * @example
 * PUT /api/v1/remotes/remote-123
 * {
 *   "name": "Samsung Advanced Remote",
 *   "layout": "smart",
 *   "is_default": true,
 *   "buttons": [...]
 * }
 */
router.put("/:id", remoteValidation?.update || ((req, res, next) => next()), updateRemote);

/**
 * Удалить пульт
 * @route DELETE /remotes/:id
 * @desc Удаление пульта (мягкое удаление - пульт помечается как неактивный)
 * @param {string} id - Уникальный идентификатор пульта
 * @access Private/Admin
 * @example
 * DELETE /api/v1/remotes/remote-123
 */
router.delete("/:id", deleteRemote);

export default router;
