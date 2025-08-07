import BaseModel from "./BaseModel.js";
import { query } from "../utils/database.js";

class Remote extends BaseModel {
  constructor() {
    super("remotes");
  }

  /**
   * Получить все пульты
   */
  async getAllRemotes(filters = {}) {
    let queryText = `
      SELECT 
        r.*,
        d.name as device_name,
        d.brand as device_brand,
        d.model as device_model
      FROM remotes r
      LEFT JOIN devices d ON r.device_id = d.id
      WHERE r.is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    // Фильтрация по устройству
    if (filters.device_id) {
      queryText += ` AND r.device_id = $${paramIndex}`;
      params.push(filters.device_id);
      paramIndex++;
    }

    // Фильтрация по производителю
    if (filters.manufacturer) {
      queryText += ` AND r.manufacturer ILIKE $${paramIndex}`;
      params.push(`%${filters.manufacturer}%`);
      paramIndex++;
    }

    // Фильтрация по layout
    if (filters.layout) {
      queryText += ` AND r.layout = $${paramIndex}`;
      params.push(filters.layout);
      paramIndex++;
    }

    // Фильтрация по default статусу
    if (filters.is_default !== undefined) {
      queryText += ` AND r.is_default = $${paramIndex}`;
      params.push(filters.is_default);
      paramIndex++;
    }

    // Поиск по названию или модели
    if (filters.search) {
      queryText += ` AND (r.name ILIKE $${paramIndex} OR r.manufacturer ILIKE $${paramIndex} OR r.model ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    queryText +=
      " ORDER BY r.is_default DESC, r.usage_count DESC, r.created_at DESC";

    if (filters.limit) {
      queryText += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      queryText += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await query(queryText, params);
    return result.rows.map(this.formatRemote);
  }

  /**
   * Получить пульт по ID
   */
  async getRemoteById(id) {
    const queryText = `
      SELECT 
        r.*,
        d.name as device_name,
        d.brand as device_brand,
        d.model as device_model
      FROM remotes r
      LEFT JOIN devices d ON r.device_id = d.id
      WHERE r.id = $1 AND r.is_active = true
    `;

    const result = await query(queryText, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const remote = this.formatRemote(result.rows[0]);

    // Получить статистику использования
    remote.usage_stats = await this.getRemoteUsageStats(id);

    return remote;
  }

  /**
   * Получить пульты по устройству
   */
  async getRemotesByDevice(deviceId) {
    const queryText = `
      SELECT r.*
      FROM remotes r
      WHERE r.device_id = $1 AND r.is_active = true
      ORDER BY r.is_default DESC, r.usage_count DESC, r.created_at DESC
    `;

    const result = await query(queryText, [deviceId]);
    return result.rows.map(this.formatRemote);
  }

  /**
   * Получить пульт по умолчанию для устройства
   */
  async getDefaultRemoteForDevice(deviceId) {
    const queryText = `
      SELECT r.*
      FROM remotes r
      WHERE r.device_id = $1 AND r.is_default = true AND r.is_active = true
      LIMIT 1
    `;

    const result = await query(queryText, [deviceId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.formatRemote(result.rows[0]);
  }

  /**
   * Создать новый пульт
   */
  async createRemote(remoteData) {
    const {
      id,
      device_id,
      name,
      manufacturer,
      model,
      description,
      layout = "standard",
      color_scheme = "dark",
      image_url,
      image_data,
      svg_data,
      dimensions = { width: 200, height: 500 },
      buttons = [],
      zones = [],
      is_default = false,
      is_active = true,
      metadata = {},
    } = remoteData;

    // Если устанавливается как пульт по умолчанию для устройства,
    // снимаем флаг default с других пул��тов этого устройства
    if (is_default && device_id) {
      await this.clearDefaultRemoteForDevice(device_id);
    }

    const queryText = `
      INSERT INTO remotes (
        id, device_id, name, manufacturer, model, description,
        layout, color_scheme, image_url, image_data, svg_data,
        dimensions, buttons, zones, is_default, is_active, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `;

    const values = [
      id,
      device_id,
      name,
      manufacturer,
      model,
      description,
      layout,
      color_scheme,
      image_url,
      image_data,
      svg_data,
      JSON.stringify(dimensions),
      JSON.stringify(buttons),
      JSON.stringify(zones),
      is_default,
      is_active,
      JSON.stringify(metadata),
    ];

    const result = await query(queryText, values);
    return this.formatRemote(result.rows[0]);
  }

  /**
   * Обновить пульт
   */
  async updateRemote(id, updateData) {
    const currentRemote = await this.getRemoteById(id);
    if (!currentRemote) {
      throw new Error(`Пульт с ID ${id} не найден`);
    }

    const allowedFields = [
      "device_id",
      "name",
      "manufacturer",
      "model",
      "description",
      "layout",
      "color_scheme",
      "image_url",
      "image_data",
      "svg_data",
      "dimensions",
      "buttons",
      "zones",
      "is_default",
      "is_active",
      "metadata",
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Если устанавливается как пульт по умолчанию для устройства,
    // снимаем флаг default с других пультов этого устройства
    if (
      updateData.is_default &&
      (updateData.device_id || currentRemote.deviceId)
    ) {
      const deviceId = updateData.device_id || currentRemote.deviceId;
      await this.clearDefaultRemoteForDevice(deviceId, id);
    }

    Object.keys(updateData).forEach((field) => {
      if (allowedFields.includes(field)) {
        let value = updateData[field];

        // JSON поля
        if (["dimensions", "buttons", "zones", "metadata"].includes(field)) {
          value = JSON.stringify(value);
        }

        updateFields.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return currentRemote;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const queryText = `
      UPDATE remotes 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const result = await query(queryText, values);
    return this.formatRemote(result.rows[0]);
  }

  /**
   * Удалить пульт (мягкое удаление)
   */
  async deleteRemote(id) {
    const remote = await this.getRemoteById(id);
    if (!remote) {
      throw new Error(`Пульт с ID ${id} не найден`);
    }

    // Проверяем, не используется ли пульт в шагах диагностики
    const usageCheck = await this.checkRemoteUsage(id);
    if (usageCheck.inUse) {
      throw new Error(
        `Пульт "${remote.name}" используется в ${usageCheck.stepsCount} диагностических шагах. Сначала обновите или удалите эти шаги.`,
      );
    }

    const queryText = `
      UPDATE remotes 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `;

    await query(queryText, [id]);
    return { id, deleted: true };
  }

  /**
   * Дублировать пульт
   */
  async duplicateRemote(id, newName = null) {
    const original = await this.getRemoteById(id);
    if (!original) {
      throw new Error(`Пульт с ID ${id} не найден`);
    }

    const duplicateData = {
      ...original,
      id: `${original.id}-copy-${Date.now()}`,
      name: newName || `${original.name} (копия)`,
      is_default: false, // Копия не может быть пультом по умолчанию
      usage_count: 0,
      last_used: null,
    };

    // Удаляем поля, которые не нужно дублировать
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.deviceName;
    delete duplicateData.deviceBrand;
    delete duplicateData.deviceModel;
    delete duplicateData.usage_stats;

    return await this.createRemote(duplicateData);
  }

  /**
   * Обновить статистику использования пульта
   */
  async updateUsageStats(id) {
    const queryText = `
      UPDATE remotes 
      SET usage_count = usage_count + 1, last_used = NOW(), updated_at = NOW()
      WHERE id = $1
    `;

    await query(queryText, [id]);
  }

  /**
   * Получить статистику использования пульта
   */
  async getRemoteUsageStats(id) {
    const queryText = `
      SELECT 
        COUNT(ds.id) as total_steps,
        COUNT(DISTINCT ds.problem_id) as problems_count,
        COUNT(DISTINCT ds.device_id) as devices_count
      FROM diagnostic_steps ds
      WHERE ds.remote_id = $1 AND ds.is_active = true
    `;

    const result = await query(queryText, [id]);
    const stats = result.rows[0];

    return {
      totalSteps: parseInt(stats.total_steps || 0),
      problemsCount: parseInt(stats.problems_count || 0),
      devicesCount: parseInt(stats.devices_count || 0),
    };
  }

  /**
   * Проверить использование пульта в диагностических шагах
   */
  async checkRemoteUsage(id) {
    const queryText = `
      SELECT COUNT(*) as count
      FROM diagnostic_steps 
      WHERE remote_id = $1 AND is_active = true
    `;

    const result = await query(queryText, [id]);
    const stepsCount = parseInt(result.rows[0].count);

    return {
      inUse: stepsCount > 0,
      stepsCount,
    };
  }

  /**
   * Снять флаг default с других пультов устройства
   */
  async clearDefaultRemoteForDevice(deviceId, excludeId = null) {
    let queryText = `
      UPDATE remotes 
      SET is_default = false, updated_at = NOW()
      WHERE device_id = $1 AND is_default = true
    `;
    const params = [deviceId];

    if (excludeId) {
      queryText += ` AND id != $2`;
      params.push(excludeId);
    }

    await query(queryText, params);
  }

  /**
   * Получить статистику пультов
   */
  async getRemoteStats() {
    const queryText = `
      SELECT 
        COUNT(*) as total_remotes,
        COUNT(CASE WHEN device_id IS NOT NULL THEN 1 END) as device_specific_count,
        COUNT(CASE WHEN device_id IS NULL THEN 1 END) as universal_count,
        COUNT(CASE WHEN is_default = true THEN 1 END) as default_count,
        COUNT(DISTINCT manufacturer) as manufacturers_count,
        COUNT(DISTINCT layout) as layouts_count,
        AVG(usage_count) as avg_usage
      FROM remotes 
      WHERE is_active = true
    `;

    const result = await query(queryText);
    const stats = result.rows[0] || {};

    return {
      totalRemotes: parseInt(stats.total_remotes || 0),
      deviceSpecificCount: parseInt(stats.device_specific_count || 0),
      universalCount: parseInt(stats.universal_count || 0),
      defaultCount: parseInt(stats.default_count || 0),
      manufacturersCount: parseInt(stats.manufacturers_count || 0),
      layoutsCount: parseInt(stats.layouts_count || 0),
      avgUsage: parseFloat(stats.avg_usage || 0).toFixed(1),
    };
  }

  /**
   * Получить популярные пульты
   */
  async getPopularRemotes(limit = 10) {
    const queryText = `
      SELECT r.*, d.name as device_name
      FROM remotes r
      LEFT JOIN devices d ON r.device_id = d.id
      WHERE r.is_active = true
      ORDER BY r.usage_count DESC, r.created_at DESC
      LIMIT $1
    `;

    const result = await query(queryText, [limit]);
    return result.rows.map(this.formatRemote);
  }

  /**
   * Форматирование пульта для ответа
   */
  formatRemote(remote) {
    if (!remote) return null;

    return {
      id: remote.id,
      deviceId: remote.device_id,
      name: remote.name,
      manufacturer: remote.manufacturer,
      model: remote.model,
      description: remote.description,
      layout: remote.layout,
      colorScheme: remote.color_scheme,
      imageUrl: remote.image_url,
      imageData: remote.image_data,
      svgData: remote.svg_data,
      dimensions: this.parseJSON(remote.dimensions, {
        width: 200,
        height: 500,
      }),
      buttons: this.parseJSON(remote.buttons, []),
      zones: this.parseJSON(remote.zones, []),
      isDefault: remote.is_default,
      usageCount: remote.usage_count || 0,
      lastUsed: remote.last_used,
      isActive: remote.is_active,
      metadata: this.parseJSON(remote.metadata, {}),
      createdAt: remote.created_at,
      updatedAt: remote.updated_at,
      // Связанные данные
      deviceName: remote.device_name,
      deviceBrand: remote.device_brand,
      deviceModel: remote.device_model,
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

export default Remote;
