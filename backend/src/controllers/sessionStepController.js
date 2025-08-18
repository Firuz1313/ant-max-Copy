import SessionStep from "../models/SessionStep.js";

const sessionStepModel = new SessionStep();

/**
 * Получить шаги по сессии
 */
export const getSessionSteps = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const steps = await sessionStepModel.findBySession(sessionId);

    res.json({
      success: true,
      data: steps,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создать новый шаг сессии
 */
export const createSessionStep = async (req, res, next) => {
  try {
    const stepData = req.body;
    const newStep = await sessionStepModel.createSessionStep(stepData);

    res.status(201).json({
      success: true,
      data: newStep,
      message: "Шаг сессии успешно создан",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Завершить шаг сессии
 */
export const completeSessionStep = async (req, res) => {
  try {
    const { id } = req.params;
    const completionData = req.body;

    const completedStep = await sessionStepModel.completeSessionStep(
      id,
      completionData,
    );

    res.json({
      success: true,
      data: completedStep,
      message: "Шаг сессии успешно завершен",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const statusCode = error.message.includes("не найден") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: statusCode === 404 ? "NOT_FOUND" : "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Получить статистику по шагу
 */
export const getStepStats = async (req, res) => {
  try {
    const { stepId } = req.params;
    const stats = await sessionStepModel.getStepStats(stepId);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: "DATABASE_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Получить проблемные шаги
 */
export const getProblematicSteps = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const steps = await sessionStepModel.getProblematicSteps(limit);

    res.json({
      success: true,
      data: steps,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: "DATABASE_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Получить временную аналитику
 */
export const getTimeAnalytics = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const analytics = await sessionStepModel.getTimeAnalytics(filters);

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: "DATABASE_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

export default {
  getSessionSteps,
  createSessionStep,
  completeSessionStep,
  getStepStats,
  getProblematicSteps,
  getTimeAnalytics,
};
