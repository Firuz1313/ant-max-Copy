import BaseModel from "./BaseModel.js";
import { query } from "../utils/database.js";

/**
 * Модель для работы с журналом изменений
 */
class ChangeLog extends BaseModel {
  constructor() {
    super("change_logs");
  }

  /**
   * Создать запись в журнале изменений
   */
  async createLog(logData) {
    try {
      const prepared = this.prepareForInsert({
        entity_type: logData.entity_type,
        entity_id: logData.entity_id,
        action: logData.action,
        changes: JSON.stringify(logData.changes || {}),
        user_id: logData.user_id || null,
        user_role: logData.user_role || null,
        reason: logData.reason || null,
        ip_address: logData.ip_address || null,
        user_agent: logData.user_agent || null,
        metadata: logData.metadata || {},
      });

      const { sql, values } = this.buildInsertQuery(prepared);
      const result = await query(sql, values);

      return this.formatChangeLog(result.rows[0]);
    } catch (error) {
      console.error("Ошибка создания записи журнала:", error.message);
      throw error;
    }
  }

  /**
   * Получить журнал по сущности
   */
  async findByEntity(entityType, entityId, options = {}) {
    try {
      const sql = `
        SELECT 
          cl.*,
          u.username as user_username,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM change_logs cl
        LEFT JOIN users u ON cl.user_id = u.id
        WHERE cl.entity_type = $1 AND cl.entity_id = $2 
        AND cl.is_active = true
        ORDER BY cl.created_at DESC
        ${options.limit ? `LIMIT ${options.limit}` : ""}
      `;

      const result = await query(sql, [entityType, entityId]);
      return result.rows.map(this.formatChangeLog);
    } catch (error) {
      console.error("Ошибка получения журнала по сущности:", error.message);
      throw error;
    }
  }

  /**
   * Получить журнал по пользователю
   */
  async findByUser(userId, options = {}) {
    try {
      const sql = `
        SELECT 
          cl.*,
          u.username as user_username,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM change_logs cl
        LEFT JOIN users u ON cl.user_id = u.id
        WHERE cl.user_id = $1 AND cl.is_active = true
        ORDER BY cl.created_at DESC
        ${options.limit ? `LIMIT ${options.limit}` : ""}
      `;

      const result = await query(sql, [userId]);
      return result.rows.map(this.formatChangeLog);
    } catch (error) {
      console.error("Ошибка получения журнала по пользователю:", error.message);
      throw error;
    }
  }

  /**
   * Получить журнал по типу действия
   */
  async findByAction(action, options = {}) {
    try {
      const sql = `
        SELECT 
          cl.*,
          u.username as user_username,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM change_logs cl
        LEFT JOIN users u ON cl.user_id = u.id
        WHERE cl.action = $1 AND cl.is_active = true
        ORDER BY cl.created_at DESC
        ${options.limit ? `LIMIT ${options.limit}` : ""}
      `;

      const result = await query(sql, [action]);
      return result.rows.map(this.formatChangeLog);
    } catch (error) {
      console.error("Ошибка получения журнала по действию:", error.message);
      throw error;
    }
  }

  /**
   * Получить п��следние изменения
   */
  async getRecentChanges(options = {}) {
    try {
      const limit = options.limit || 50;
      const sql = `
        SELECT 
          cl.*,
          u.username as user_username,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM change_logs cl
        LEFT JOIN users u ON cl.user_id = u.id
        WHERE cl.is_active = true
        ORDER BY cl.created_at DESC
        LIMIT $1
      `;

      const result = await query(sql, [limit]);
      return result.rows.map(this.formatChangeLog);
    } catch (error) {
      console.error("Ошибка получения последних изменений:", error.message);
      throw error;
    }
  }

  /**
   * Получить статистику журнала
   */
  async getLogStats(options = {}) {
    try {
      const days = options.days || 30;
      const sql = `
        SELECT 
          COUNT(*) as total_changes,
          COUNT(DISTINCT entity_type) as entity_types,
          COUNT(DISTINCT user_id) as active_users,
          entity_type,
          COUNT(*) as changes_by_type,
          action,
          COUNT(*) as changes_by_action
        FROM change_logs 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        AND is_active = true
        GROUP BY GROUPING SETS ((entity_type), (action), ())
        ORDER BY changes_by_type DESC, changes_by_action DESC
      `;

      const result = await query(sql);

      const summary = {
        totalChanges: 0,
        entityTypes: 0,
        activeUsers: 0,
      };

      const typeStats = [];
      const actionStats = [];

      result.rows.forEach((row) => {
        if (row.entity_type && !row.action) {
          typeStats.push({
            entityType: row.entity_type,
            count: parseInt(row.changes_by_type),
          });
        } else if (row.action && !row.entity_type) {
          actionStats.push({
            action: row.action,
            count: parseInt(row.changes_by_action),
          });
        } else if (!row.entity_type && !row.action) {
          summary.totalChanges = parseInt(row.total_changes || 0);
          summary.entityTypes = parseInt(row.entity_types || 0);
          summary.activeUsers = parseInt(row.active_users || 0);
        }
      });

      return { summary, typeStats, actionStats };
    } catch (error) {
      console.error("Ошибка получения статистики журнала:", error.message);
      throw error;
    }
  }

  /**
   * Получить аудит по IP адресам
   */
  async getIPAudit(options = {}) {
    try {
      const days = options.days || 7;
      const sql = `
        SELECT 
          ip_address,
          COUNT(*) as change_count,
          COUNT(DISTINCT user_id) as user_count,
          MIN(created_at) as first_seen,
          MAX(created_at) as last_seen,
          array_agg(DISTINCT action) as actions
        FROM change_logs 
        WHERE ip_address IS NOT NULL 
        AND created_at >= NOW() - INTERVAL '${days} days'
        AND is_active = true
        GROUP BY ip_address
        ORDER BY change_count DESC
        LIMIT ${options.limit || 20}
      `;

      const result = await query(sql);
      return result.rows.map((row) => ({
        ipAddress: row.ip_address,
        changeCount: parseInt(row.change_count),
        userCount: parseInt(row.user_count),
        firstSeen: row.first_seen,
        lastSeen: row.last_seen,
        actions: row.actions || [],
      }));
    } catch (error) {
      console.error("Ошибка получения аудита IP:", error.message);
      throw error;
    }
  }

  /**
   * Архивировать старые записи
   */
  async archiveOldLogs(daysOld = 365) {
    try {
      const sql = `
        UPDATE change_logs 
        SET is_active = false, updated_at = NOW()
        WHERE created_at < NOW() - INTERVAL '${daysOld} days'
        AND is_active = true
      `;

      const result = await query(sql);
      return {
        archivedCount: result.rowCount,
      };
    } catch (error) {
      console.error("Ошибка архивирования журнала:", error.message);
      throw error;
    }
  }

  /**
   * Форматирование записи журнала для ответа
   */
  formatChangeLog(log) {
    if (!log) return null;

    return {
      id: log.id,
      entityType: log.entity_type,
      entityId: log.entity_id,
      action: log.action,
      changes: this.parseJSON(log.changes, {}),
      userId: log.user_id,
      userRole: log.user_role,
      reason: log.reason,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      isActive: log.is_active,
      metadata: this.parseJSON(log.metadata, {}),
      createdAt: log.created_at,
      updatedAt: log.updated_at,
      // Данные пользователя
      username: log.user_username,
      userFirstName: log.user_first_name,
      userLastName: log.user_last_name,
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

export default ChangeLog;
