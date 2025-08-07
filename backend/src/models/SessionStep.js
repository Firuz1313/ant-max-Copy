import BaseModel from './BaseModel.js';
import { query } from '../utils/database.js';

/**
 * Модель для работы с шагами в сессиях диагностики
 */
class SessionStep extends BaseModel {
  constructor() {
    super('session_steps');
  }

  /**
   * Получить шаги по сессии
   */
  async findBySession(sessionId, options = {}) {
    try {
      const sql = `
        SELECT 
          ss.*,
          ds.title as step_title,
          ds.description as step_description,
          ds.instruction as step_instruction,
          ds.estimated_time as step_estimated_time
        FROM session_steps ss
        LEFT JOIN diagnostic_steps ds ON ss.step_id = ds.id
        WHERE ss.session_id = $1
        ORDER BY ss.step_number ASC, ss.started_at ASC
      `;

      const result = await query(sql, [sessionId]);
      return result.rows.map(this.formatSessionStep);
    } catch (error) {
      console.error('Ошибка получения шагов сессии:', error.message);
      throw error;
    }
  }

  /**
   * Создать новый шаг сессии
   */
  async createSessionStep(stepData) {
    try {
      const prepared = this.prepareForInsert({
        ...stepData,
        completed: false,
        time_spent: null,
        errors: stepData.errors || [],
        user_input: stepData.user_input || null,
        metadata: stepData.metadata || {}
      });

      const { sql, values } = this.buildInsertQuery(prepared);
      const result = await query(sql, values);
      
      return this.formatSessionStep(result.rows[0]);
    } catch (error) {
      console.error('Ошибка создания шага сессии:', error.message);
      throw error;
    }
  }

  /**
   * Завершить шаг сессии
   */
  async completeSessionStep(sessionStepId, completionData = {}) {
    try {
      const updateData = {
        completed: true,
        completed_at: new Date().toISOString(),
        result: completionData.result || 'success',
        time_spent: completionData.time_spent,
        errors: completionData.errors || [],
        user_input: completionData.user_input,
        metadata: completionData.metadata || {}
      };

      const prepared = this.prepareForUpdate(updateData);
      const { sql, values } = this.buildUpdateQuery(sessionStepId, prepared);
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        throw new Error('Шаг сессии не найден');
      }

      return this.formatSessionStep(result.rows[0]);
    } catch (error) {
      console.error('Ошибка завершения шага сессии:', error.message);
      throw error;
    }
  }

  /**
   * Получить статистику по шагу
   */
  async getStepStats(stepId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN completed = true THEN 1 END) as completed_attempts,
          COUNT(CASE WHEN result = 'success' THEN 1 END) as successful_attempts,
          COUNT(CASE WHEN result = 'failure' THEN 1 END) as failed_attempts,
          COUNT(CASE WHEN result = 'skipped' THEN 1 END) as skipped_attempts,
          COUNT(CASE WHEN result = 'timeout' THEN 1 END) as timeout_attempts,
          AVG(time_spent) as avg_time_spent,
          MIN(time_spent) as min_time_spent,
          MAX(time_spent) as max_time_spent
        FROM session_steps 
        WHERE step_id = $1
      `;

      const result = await query(sql, [stepId]);
      const stats = result.rows[0] || {};

      return {
        totalAttempts: parseInt(stats.total_attempts || 0),
        completedAttempts: parseInt(stats.completed_attempts || 0),
        successfulAttempts: parseInt(stats.successful_attempts || 0),
        failedAttempts: parseInt(stats.failed_attempts || 0),
        skippedAttempts: parseInt(stats.skipped_attempts || 0),
        timeoutAttempts: parseInt(stats.timeout_attempts || 0),
        avgTimeSpent: parseFloat(stats.avg_time_spent || 0),
        minTimeSpent: parseInt(stats.min_time_spent || 0),
        maxTimeSpent: parseInt(stats.max_time_spent || 0),
        successRate: parseInt(stats.completed_attempts || 0) > 0 
          ? ((parseInt(stats.successful_attempts || 0) / parseInt(stats.completed_attempts || 0)) * 100).toFixed(1)
          : 0
      };
    } catch (error) {
      console.error('Ошибка получения статистики шага:', error.message);
      throw error;
    }
  }

  /**
   * Получить шаги с проблемами
   */
  async getProblematicSteps(limit = 10) {
    try {
      const sql = `
        SELECT 
          ss.step_id,
          ds.title as step_title,
          ds.step_number,
          p.title as problem_title,
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN ss.result = 'failure' THEN 1 END) as failures,
          COUNT(CASE WHEN ss.result = 'timeout' THEN 1 END) as timeouts,
          (COUNT(CASE WHEN ss.result IN ('failure', 'timeout') THEN 1 END)::float / COUNT(*)::float * 100) as failure_rate
        FROM session_steps ss
        JOIN diagnostic_steps ds ON ss.step_id = ds.id
        JOIN problems p ON ds.problem_id = p.id
        WHERE ss.completed = true
        GROUP BY ss.step_id, ds.title, ds.step_number, p.title
        HAVING COUNT(*) >= 5
        ORDER BY failure_rate DESC, total_attempts DESC
        LIMIT $1
      `;

      const result = await query(sql, [limit]);
      return result.rows.map(row => ({
        stepId: row.step_id,
        stepTitle: row.step_title,
        stepNumber: row.step_number,
        problemTitle: row.problem_title,
        totalAttempts: parseInt(row.total_attempts),
        failures: parseInt(row.failures),
        timeouts: parseInt(row.timeouts),
        failureRate: parseFloat(row.failure_rate).toFixed(1)
      }));
    } catch (error) {
      console.error('Ошибка получения проблемных шагов:', error.message);
      throw error;
    }
  }

  /**
   * Получить временную аналитику
   */
  async getTimeAnalytics(filters = {}) {
    try {
      let sql = `
        SELECT 
          DATE_TRUNC('day', ss.started_at) as date,
          COUNT(*) as total_steps,
          COUNT(CASE WHEN ss.completed = true THEN 1 END) as completed_steps,
          AVG(ss.time_spent) as avg_time_spent
        FROM session_steps ss
        WHERE ss.started_at >= $1
      `;
      
      const params = [filters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)];
      let paramIndex = 2;

      if (filters.end_date) {
        sql += ` AND ss.started_at <= $${paramIndex}`;
        params.push(filters.end_date);
        paramIndex++;
      }

      sql += `
        GROUP BY DATE_TRUNC('day', ss.started_at)
        ORDER BY date ASC
      `;

      const result = await query(sql, params);
      return result.rows.map(row => ({
        date: row.date,
        totalSteps: parseInt(row.total_steps),
        completedSteps: parseInt(row.completed_steps),
        avgTimeSpent: parseFloat(row.avg_time_spent || 0).toFixed(1)
      }));
    } catch (error) {
      console.error('Ошибка получения временной аналитики:', error.message);
      throw error;
    }
  }

  /**
   * Форматирование шага сессии для ответа
   */
  formatSessionStep(sessionStep) {
    if (!sessionStep) return null;

    return {
      id: sessionStep.id,
      sessionId: sessionStep.session_id,
      stepId: sessionStep.step_id,
      stepNumber: sessionStep.step_number,
      startedAt: sessionStep.started_at,
      completedAt: sessionStep.completed_at,
      completed: sessionStep.completed,
      result: sessionStep.result,
      timeSpent: sessionStep.time_spent,
      errors: this.parseJSON(sessionStep.errors, []),
      userInput: this.parseJSON(sessionStep.user_input, null),
      metadata: this.parseJSON(sessionStep.metadata, {}),
      createdAt: sessionStep.created_at,
      updatedAt: sessionStep.updated_at,
      // Связанные данные шага
      stepTitle: sessionStep.step_title,
      stepDescription: sessionStep.step_description,
      stepInstruction: sessionStep.step_instruction,
      stepEstimatedTime: sessionStep.step_estimated_time
    };
  }

  /**
   * Безопасное парсирование JSON
   */
  parseJSON(jsonString, defaultValue = null) {
    try {
      return jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
}

export default SessionStep;
