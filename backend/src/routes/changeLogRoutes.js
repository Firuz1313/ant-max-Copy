import express from 'express';
import changeLogController from '../controllers/changeLogController.js';

const router = express.Router();

/**
 * @route GET /api/v1/change-logs
 * @desc Получить все записи журнала
 * @access Public
 */
router.get('/', changeLogController.getAllChangeLogs);

/**
 * @route GET /api/v1/change-logs/entity/:entityType/:entityId
 * @desc Получить журнал по сущности
 * @access Public
 */
router.get('/entity/:entityType/:entityId', changeLogController.getLogsByEntity);

/**
 * @route GET /api/v1/change-logs/user/:userId
 * @desc Получить журнал по пользователю
 * @access Public
 */
router.get('/user/:userId', changeLogController.getLogsByUser);

/**
 * @route GET /api/v1/change-logs/action/:action
 * @desc Получить журнал по действию
 * @access Public
 */
router.get('/action/:action', changeLogController.getLogsByAction);

/**
 * @route GET /api/v1/change-logs/recent
 * @desc Получить последние изменения
 * @access Public
 */
router.get('/recent', changeLogController.getRecentChanges);

/**
 * @route POST /api/v1/change-logs
 * @desc Создать запись журнала
 * @access Public
 */
router.post('/', changeLogController.createChangeLog);

/**
 * @route GET /api/v1/change-logs/stats
 * @desc Получить статистику журнала
 * @access Public
 */
router.get('/stats', changeLogController.getLogStats);

/**
 * @route GET /api/v1/change-logs/audit/ip
 * @desc Получить аудит по IP адресам
 * @access Public
 */
router.get('/audit/ip', changeLogController.getIPAudit);

/**
 * @route POST /api/v1/change-logs/archive
 * @desc Архивировать старые записи
 * @access Public
 */
router.post('/archive', changeLogController.archiveOldLogs);

export default router;
