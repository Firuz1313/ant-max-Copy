import express from 'express';
import siteSettingController from '../controllers/siteSettingController.js';

const router = express.Router();

/**
 * @route GET /api/v1/settings
 * @desc Получить настройки сайта
 * @access Public
 */
router.get('/', siteSettingController.getSettings);

/**
 * @route PUT /api/v1/settings
 * @desc Обновить настройки сайта
 * @access Public
 */
router.put('/', siteSettingController.updateSettings);

/**
 * @route GET /api/v1/settings/:key
 * @desc Получить конкретную настройку
 * @access Public
 */
router.get('/:key', siteSettingController.getSetting);

/**
 * @route PUT /api/v1/settings/:key
 * @desc Обновить конкретную настройку
 * @access Public
 */
router.put('/:key', siteSettingController.updateSetting);

/**
 * @route POST /api/v1/settings/reset
 * @desc Сбросить настройки к значениям по умолчанию
 * @access Public
 */
router.post('/reset', siteSettingController.resetToDefaults);

/**
 * @route GET /api/v1/settings/export
 * @desc Экспорт настр��ек
 * @access Public
 */
router.get('/export', siteSettingController.exportSettings);

/**
 * @route POST /api/v1/settings/import
 * @desc Импорт настроек
 * @access Public
 */
router.post('/import', siteSettingController.importSettings);

/**
 * @route POST /api/v1/settings/validate
 * @desc Проверить валидность настроек
 * @access Public
 */
router.post('/validate', siteSettingController.validateSettings);

export default router;
