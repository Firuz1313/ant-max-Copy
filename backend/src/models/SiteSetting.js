import BaseModel from "./BaseModel.js";
import { query } from "../utils/database.js";

/**
 * Модель для работы с настройками сайта
 */
class SiteSetting extends BaseModel {
  constructor() {
    super("site_settings");
  }

  /**
   * Получить настройки сайта (всегда ID = 'settings')
   */
  async getSettings() {
    try {
      const result = await this.findById("settings");

      if (!result) {
        // Создать настройки по умолчанию если их нет
        return await this.createDefaultSettings();
      }

      return this.formatSettings(result);
    } catch (error) {
      console.error("Ошибка получения настроек сайта:", error.message);
      throw error;
    }
  }

  /**
   * Обновить настройки сайта
   */
  async updateSettings(settingsData) {
    try {
      const updateData = this.prepareForUpdate({
        ...settingsData,
        supported_languages: settingsData.supported_languages
          ? JSON.stringify(settingsData.supported_languages)
          : undefined,
        api_settings: settingsData.api_settings
          ? JSON.stringify(settingsData.api_settings)
          : undefined,
        email_settings: settingsData.email_settings
          ? JSON.stringify(settingsData.email_settings)
          : undefined,
        storage_settings: settingsData.storage_settings
          ? JSON.stringify(settingsData.storage_settings)
          : undefined,
        metadata: settingsData.metadata
          ? JSON.stringify(settingsData.metadata)
          : undefined,
      });

      const { sql, values } = this.buildUpdateQuery("settings", updateData);
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        throw new Error("Настройки не найдены");
      }

      return this.formatSettings(result.rows[0]);
    } catch (error) {
      console.error("Ошибка обновления настроек сайта:", error.message);
      throw error;
    }
  }

  /**
   * Создать настройки по умолчанию
   */
  async createDefaultSettings() {
    try {
      const defaultSettings = {
        id: "settings",
        site_name: "ANT Support",
        site_description:
          "Профессиональная платформа для диагностики цифровых ТВ-приставо��",
        default_language: "ru",
        supported_languages: ["ru", "tj", "uz"],
        theme: "professional",
        primary_color: "#3b82f6",
        accent_color: "#10b981",
        enable_analytics: true,
        enable_feedback: true,
        enable_offline_mode: false,
        enable_notifications: true,
        max_steps_per_problem: 20,
        max_media_size: 10,
        session_timeout: 30,
        api_settings: {
          rate_limit: {
            window_ms: 900000, // 15 минут
            max_requests: 100,
          },
          cors_origins: ["*"],
          enable_swagger: true,
        },
        email_settings: {
          smtp_host: "",
          smtp_port: 587,
          smtp_secure: false,
          smtp_user: "",
          smtp_password: "",
          from_email: "noreply@antsupport.local",
          from_name: "ANT Support",
        },
        storage_settings: {
          max_file_size: 10485760, // 10MB
          allowed_extensions: ["jpg", "jpeg", "png", "gif", "svg", "pdf"],
          storage_path: "/uploads",
        },
        metadata: {
          version: "1.0.0",
          initialized_at: new Date().toISOString(),
        },
      };

      const prepared = this.prepareForInsert(defaultSettings);
      const { sql, values } = this.buildInsertQuery(prepared);
      const result = await query(sql, values);

      return this.formatSettings(result.rows[0]);
    } catch (error) {
      console.error("Ошибка создания настроек по умолчанию:", error.message);
      throw error;
    }
  }

  /**
   * Получить конкретную настройку
   */
  async getSetting(key) {
    try {
      const settings = await this.getSettings();
      return settings[key] || null;
    } catch (error) {
      console.error(`Ошибка получения настройки ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Обновить конкретную настройку
   */
  async updateSetting(key, value) {
    try {
      const currentSettings = await this.getSettings();
      const updateData = { [key]: value };

      return await this.updateSettings(updateData);
    } catch (error) {
      console.error(`Ошибка обновления настройки ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Сбросить настройки к значениям по умолчанию
   */
  async resetToDefaults() {
    try {
      // Удалить текущие настройки
      await query("DELETE FROM site_settings WHERE id = $1", ["settings"]);

      // Создать новые настройки по умолчанию
      return await this.createDefaultSettings();
    } catch (error) {
      console.error("Ошибка сброса настроек:", error.message);
      throw error;
    }
  }

  /**
   * Экспорт настроек
   */
  async exportSettings() {
    try {
      const settings = await this.getSettings();

      // Удаляем чувствительные данные
      const exportData = { ...settings };
      if (exportData.emailSettings && exportData.emailSettings.smtp_password) {
        exportData.emailSettings.smtp_password = "[HIDDEN]";
      }

      return {
        exported_at: new Date().toISOString(),
        version: "1.0",
        settings: exportData,
      };
    } catch (error) {
      console.error("Ошибка экспорта настроек:", error.message);
      throw error;
    }
  }

  /**
   * Импорт настроек
   */
  async importSettings(importData) {
    try {
      if (!importData.settings) {
        throw new Error("Некорректный формат данных для импорта");
      }

      // Исключаем системные поля
      const { id, createdAt, updatedAt, ...settingsToImport } =
        importData.settings;

      return await this.updateSettings(settingsToImport);
    } catch (error) {
      console.error("Ошибка импорта настроек:", error.message);
      throw error;
    }
  }

  /**
   * Форматирование настроек для ответа
   */
  formatSettings(settings) {
    if (!settings) return null;

    return {
      id: settings.id,
      siteName: settings.site_name,
      siteDescription: settings.site_description,
      defaultLanguage: settings.default_language,
      supportedLanguages: this.parseJSON(settings.supported_languages, [
        "ru",
        "tj",
        "uz",
      ]),
      theme: settings.theme,
      primaryColor: settings.primary_color,
      accentColor: settings.accent_color,
      logoUrl: settings.logo_url,
      faviconUrl: settings.favicon_url,

      // Возможности
      enableAnalytics: settings.enable_analytics,
      enableFeedback: settings.enable_feedback,
      enableOfflineMode: settings.enable_offline_mode,
      enableNotifications: settings.enable_notifications,

      // Лимиты
      maxStepsPerProblem: settings.max_steps_per_problem,
      maxMediaSize: settings.max_media_size,
      sessionTimeout: settings.session_timeout,

      // Расширенные настро��ки
      apiSettings: this.parseJSON(settings.api_settings, {}),
      emailSettings: this.parseJSON(settings.email_settings, {}),
      storageSettings: this.parseJSON(settings.storage_settings, {}),

      isActive: settings.is_active,
      metadata: this.parseJSON(settings.metadata, {}),
      createdAt: settings.created_at,
      updatedAt: settings.updated_at,
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

export default SiteSetting;
