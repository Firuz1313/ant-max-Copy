import express from 'express';
import stepActionController from '../controllers/stepActionController.js';

const router = express.Router();

/**
 * @route GET /api/v1/step-actions
 * @desc Получить все действия
 * @access Public
 */
router.get('/', stepActionController.getAllStepActions);

/**
 * @route GET /api/v1/step-actions/:id
 * @desc Получить действие по ID
 * @access Public
 */
router.get('/:id', stepActionController.getStepActionById);

/**
 * @route GET /api/v1/step-actions/step/:stepId
 * @desc Получить действия по шагу
 * @access Public
 */
router.get('/step/:stepId', stepActionController.getActionsByStep);

/**
 * @route GET /api/v1/step-actions/type/:type
 * @desc Получить действия по типу
 * @access Public
 */
router.get('/type/:type', stepActionController.getActionsByType);

/**
 * @route POST /api/v1/step-actions
 * @desc Создать новое действие
 * @access Public
 */
router.post('/', stepActionController.createStepAction);

/**
 * @route PUT /api/v1/step-actions/:id
 * @desc Обновить действие
 * @access Public
 */
router.put('/:id', stepActionController.updateStepAction);

/**
 * @route DELETE /api/v1/step-actions/:id
 * @desc Удалить действие
 * @access Public
 */
router.delete('/:id', stepActionController.deleteStepAction);

/**
 * @route POST /api/v1/step-actions/:id/duplicate
 * @desc Дублировать действие
 * @access Public
 */
router.post('/:id/duplicate', stepActionController.duplicateStepAction);

/**
 * @route GET /api/v1/step-actions/stats
 * @desc Получить статистику действий
 * @access Public
 */
router.get('/stats', stepActionController.getActionStats);

export default router;
