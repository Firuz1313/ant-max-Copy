import ChangeLog from '../models/ChangeLog.js';

const changeLogModel = new ChangeLog();

/**
 * Получить все записи журнала
 */
export const getAllChangeLogs = async (req, res) => {
  try {
    const filters = {
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true
    };
    
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };
    
    const logs = await changeLogModel.findAll(filters, options);
    
    res.json({
      success: true,
      data: logs,
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
 * Получить журнал по сущности
 */
export const getLogsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || undefined
    };
    
    const logs = await changeLogModel.findByEntity(entityType, entityId, options);
    
    res.json({
      success: true,
      data: logs,
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
 * Получить журнал по пользователю
 */
export const getLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || undefined
    };
    
    const logs = await changeLogModel.findByUser(userId, options);
    
    res.json({
      success: true,
      data: logs,
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
 * Получи��ь журнал по действию
 */
export const getLogsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || undefined
    };
    
    const logs = await changeLogModel.findByAction(action, options);
    
    res.json({
      success: true,
      data: logs,
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
 * Получить последние изменения
 */
export const getRecentChanges = async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 50
    };
    
    const logs = await changeLogModel.getRecentChanges(options);
    
    res.json({
      success: true,
      data: logs,
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
 * Создать запись журнала
 */
export const createChangeLog = async (req, res) => {
  try {
    const logData = {
      ...req.body,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };
    
    const newLog = await changeLogModel.createLog(logData);
    
    res.status(201).json({
      success: true,
      data: newLog,
      message: 'Запись журнала создана',
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
 * Получить статистику журнала
 */
export const getLogStats = async (req, res) => {
  try {
    const options = {
      days: parseInt(req.query.days) || 30
    };
    
    const stats = await changeLogModel.getLogStats(options);
    
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

/**
 * Получить аудит по IP адресам
 */
export const getIPAudit = async (req, res) => {
  try {
    const options = {
      days: parseInt(req.query.days) || 7,
      limit: parseInt(req.query.limit) || 20
    };
    
    const audit = await changeLogModel.getIPAudit(options);
    
    res.json({
      success: true,
      data: audit,
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
 * Архивировать старые записи
 */
export const archiveOldLogs = async (req, res) => {
  try {
    const daysOld = parseInt(req.body.days_old) || 365;
    const result = await changeLogModel.archiveOldLogs(daysOld);
    
    res.json({
      success: true,
      data: result,
      message: `Архивировано ${result.archivedCount} записей`,
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
  getAllChangeLogs,
  getLogsByEntity,
  getLogsByUser,
  getLogsByAction,
  getRecentChanges,
  createChangeLog,
  getLogStats,
  getIPAudit,
  archiveOldLogs
};
