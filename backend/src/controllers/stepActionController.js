import StepAction from '../models/StepAction.js';

const stepActionModel = new StepAction();

/**
 * Получить все действия
 */
export const getAllStepActions = async (req, res) => {
  try {
    const filters = {
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
    };
    
    const options = {
      limit: parseInt(req.query.limit) || undefined,
      offset: parseInt(req.query.offset) || undefined,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };
    
    const actions = await stepActionModel.findAll(filters, options);
    
    res.json({
      success: true,
      data: actions,
      pagination: {
        limit: options.limit,
        offset: options.offset
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить действие по ID
 */
export const getStepActionById = async (req, res) => {
  try {
    const { id } = req.params;
    const action = await stepActionModel.findById(id);
    
    if (!action) {
      return res.status(404).json({
        success: false,
        error: 'Действие не найдено',
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить действия по шагу
 */
export const getActionsByStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const options = {
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
    };
    
    const actions = await stepActionModel.findByStep(stepId, options);
    
    res.json({
      success: true,
      data: actions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить действия по типу
 */
export const getActionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || undefined
    };
    
    const actions = await stepActionModel.findByType(type, options);
    
    res.json({
      success: true,
      data: actions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Создать новое действие
 */
export const createStepAction = async (req, res) => {
  try {
    const actionData = req.body;
    const newAction = await stepActionModel.createStepAction(actionData);
    
    res.status(201).json({
      success: true,
      data: newAction,
      message: 'Действие успешно создано',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      errorType: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Обновить действие
 */
export const updateStepAction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedAction = await stepActionModel.updateStepAction(id, updateData);
    
    res.json({
      success: true,
      data: updatedAction,
      message: 'Действие успешно обновлено',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const statusCode = error.message.includes('не найдено') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: statusCode === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Удалить действие
 */
export const deleteStepAction = async (req, res) => {
  try {
    const { id } = req.params;
    await stepActionModel.softDelete(id);
    
    res.json({
      success: true,
      message: 'Действие успешно удалено',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const statusCode = error.message.includes('не найдено') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: statusCode === 404 ? 'NOT_FOUND' : 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Дублировать действие
 */
export const duplicateStepAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { step_id: newStepId } = req.body;
    
    const duplicatedAction = await stepActionModel.duplicateAction(id, newStepId);
    
    res.status(201).json({
      success: true,
      data: duplicatedAction,
      message: 'Действие успешно дублировано',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const statusCode = error.message.includes('не найдено') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: statusCode === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить статистику действий
 */
export const getActionStats = async (req, res) => {
  try {
    const stats = await stepActionModel.getActionStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

export default {
  getAllStepActions,
  getStepActionById,
  getActionsByStep,
  getActionsByType,
  createStepAction,
  updateStepAction,
  deleteStepAction,
  duplicateStepAction,
  getActionStats
};
