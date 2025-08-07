import BaseModel from "./BaseModel.js";
import { query } from "../utils/database.js";

/**
 * Модель для работы с действиями в диагностических шагах
 */
class StepAction extends BaseModel {
  constructor() {
    super("step_actions");
  }

  /**
   * Получить действия по шагу
   */
  async findByStep(stepId, options = {}) {
    try {
      const filters = { step_id: stepId };
      if (options.is_active !== undefined) {
        filters.is_active = options.is_active;
      }

      const sql = `
        SELECT 
          sa.*,
          ds.title as step_title,
          ds.step_number
        FROM step_actions sa
        LEFT JOIN diagnostic_steps ds ON sa.step_id = ds.id
        WHERE sa.step_id = $1 ${options.is_active !== undefined ? "AND sa.is_active = $2" : ""}
        ORDER BY sa.created_at ASC
      `;

      const values = [stepId];
      if (options.is_active !== undefined) {
        values.push(options.is_active);
      }

      const result = await query(sql, values);
      return result.rows.map(this.formatStepAction);
    } catch (error) {
      console.error("Ошибка получения действий шага:", error.message);
      throw error;
    }
  }

  /**
   * Создать новое действие
   */
  async createStepAction(actionData) {
    try {
      // Валидация обязательных полей
      if (!actionData.step_id) {
        throw new Error("ID шага обязателен");
      }

      if (!actionData.name || !actionData.name.trim()) {
        throw new Error("Название действия обязательно");
      }

      if (!actionData.type) {
        throw new Error("Тип действия обязателен");
      }

      // Проверяем существование шага
      const stepExists = await query(
        "SELECT id FROM diagnostic_steps WHERE id = $1",
        [actionData.step_id],
      );
      if (stepExists.rows.length === 0) {
        throw new Error("Шаг не найден");
      }

      const prepared = this.prepareForInsert({
        ...actionData,
        name: actionData.name.trim(),
        description: actionData.description?.trim() || "",
        color: actionData.color || "#000000",
        coordinates: actionData.coordinates
          ? JSON.stringify(actionData.coordinates)
          : null,
        timeout: actionData.timeout || null,
        retry_count: actionData.retry_count || 3,
        metadata: actionData.metadata || {},
      });

      const { sql, values } = this.buildInsertQuery(prepared);
      const result = await query(sql, values);

      return this.formatStepAction(result.rows[0]);
    } catch (error) {
      console.error("Оши��ка создания действия шага:", error.message);
      throw error;
    }
  }

  /**
   * Обновить действие
   */
  async updateStepAction(id, updateData) {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error("Действие не найдено");
      }

      const prepared = this.prepareForUpdate({
        ...updateData,
        coordinates: updateData.coordinates
          ? JSON.stringify(updateData.coordinates)
          : undefined,
        metadata: updateData.metadata
          ? JSON.stringify(updateData.metadata)
          : undefined,
      });

      const { sql, values } = this.buildUpdateQuery(id, prepared);
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        throw new Error("Действие не найдено");
      }

      return this.formatStepAction(result.rows[0]);
    } catch (error) {
      console.error("Ошибка обновления действия шага:", error.message);
      throw error;
    }
  }

  /**
   * Получить действия по типу
   */
  async findByType(type, options = {}) {
    try {
      const sql = `
        SELECT 
          sa.*,
          ds.title as step_title,
          ds.step_number,
          p.title as problem_title
        FROM step_actions sa
        LEFT JOIN diagnostic_steps ds ON sa.step_id = ds.id
        LEFT JOIN problems p ON ds.problem_id = p.id
        WHERE sa.type = $1 AND sa.is_active = true
        ORDER BY sa.created_at DESC
        ${options.limit ? `LIMIT ${options.limit}` : ""}
      `;

      const result = await query(sql, [type]);
      return result.rows.map(this.formatStepAction);
    } catch (error) {
      console.error("Ошибка получения действий по типу:", error.message);
      throw error;
    }
  }

  /**
   * Получить статистику действий
   */
  async getActionStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_actions,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_actions,
          COUNT(DISTINCT type) as unique_types,
          COUNT(DISTINCT step_id) as steps_with_actions,
          type,
          COUNT(*) as count_by_type
        FROM step_actions 
        GROUP BY type
        ORDER BY count_by_type DESC
      `;

      const result = await query(sql);

      const summary = {
        totalActions: 0,
        activeActions: 0,
        uniqueTypes: 0,
        stepsWithActions: 0,
      };

      const typeStats = [];

      result.rows.forEach((row) => {
        if (row.type) {
          typeStats.push({
            type: row.type,
            count: parseInt(row.count_by_type),
          });
        } else {
          summary.totalActions = parseInt(row.total_actions || 0);
          summary.activeActions = parseInt(row.active_actions || 0);
          summary.uniqueTypes = parseInt(row.unique_types || 0);
          summary.stepsWithActions = parseInt(row.steps_with_actions || 0);
        }
      });

      return { summary, typeStats };
    } catch (error) {
      console.error("Ошибка получения статистики действий:", error.message);
      throw error;
    }
  }

  /**
   * Дублировать действие
   */
  async duplicateAction(actionId, newStepId = null) {
    try {
      const original = await this.findById(actionId);
      if (!original) {
        throw new Error("Действие не найдено");
      }

      const duplicateData = {
        ...original,
        id: undefined, // Будет сгенерирован новый
        step_id: newStepId || original.stepId,
        name: `${original.name} (копия)`,
        created_at: undefined,
        updated_at: undefined,
      };

      // Удаляем поля, которые не нужно дублировать
      delete duplicateData.stepTitle;
      delete duplicateData.stepNumber;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      return await this.createStepAction(duplicateData);
    } catch (error) {
      console.error("Ошибка дублирования действия:", error.message);
      throw error;
    }
  }

  /**
   * Форматирование действия для ответа
   */
  formatStepAction(action) {
    if (!action) return null;

    return {
      id: action.id,
      stepId: action.step_id,
      type: action.type,
      name: action.name,
      description: action.description,
      svgPath: action.svg_path,
      iconUrl: action.icon_url,
      color: action.color,
      animation: action.animation,
      targetElement: action.target_element,
      coordinates: this.parseJSON(action.coordinates, null),
      gesture: action.gesture,
      expectedResult: action.expected_result,
      timeout: action.timeout,
      retryCount: action.retry_count,
      isActive: action.is_active,
      metadata: this.parseJSON(action.metadata, {}),
      createdAt: action.created_at,
      updatedAt: action.updated_at,
      // Связанные данные
      stepTitle: action.step_title,
      stepNumber: action.step_number,
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

export default StepAction;
