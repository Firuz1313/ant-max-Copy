import express from 'express';
import sessionStepController from '../controllers/sessionStepController.js';

const router = express.Router();

/**
 * @route GET /api/v1/session-steps/session/:sessionId
 * @desc Получи��ь шаги по сессии
 * @access Public
 */
router.get('/session/:sessionId', sessionStepController.getSessionSteps);

/**
 * @route POST /api/v1/session-steps
 * @desc Создать новый шаг сессии
 * @access Public
 */
router.post('/', sessionStepController.createSessionStep);

/**
 * @route PUT /api/v1/session-steps/:id/complete
 * @desc Завершить шаг сессии
 * @access Public
 */
router.put('/:id/complete', sessionStepController.completeSessionStep);

/**
 * @route GET /api/v1/session-steps/step/:stepId/stats
 * @desc Получить статистику по шагу
 * @access Public
 */
router.get('/step/:stepId/stats', sessionStepController.getStepStats);

/**
 * @route GET /api/v1/session-steps/problematic
 * @desc Получить проблемные шаги
 * @access Public
 */
router.get('/problematic', sessionStepController.getProblematicSteps);

/**
 * @route GET /api/v1/session-steps/analytics/time
 * @desc Получить временную аналитику
 * @access Public
 */
router.get('/analytics/time', sessionStepController.getTimeAnalytics);

export default router;
