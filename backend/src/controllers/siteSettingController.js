import SiteSetting from "../models/SiteSetting.js";

const siteSettingModel = new SiteSetting();

/**
 * Получить настройки сайта
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await siteSettingModel.getSettings();

    res.json({
      success: true,
      data: settings,
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
 * Обновить настройки сайта
 */
export const updateSettings = async (req, res) => {
  try {
    const settingsData = req.body;
    const updatedSettings = await siteSettingModel.updateSettings(settingsData);

    res.json({
      success: true,
      data: updatedSettings,
      message: "Настройки успешно обновлены",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const statusCode = error.message.includes("не найдены") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: statusCode === 404 ? "NOT_FOUND" : "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Получить конкретную настройку
 */
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const value = await siteSettingModel.getSetting(key);

    if (value === null) {
      return res.status(404).json({
        success: false,
        error: "Настройка не найдена",
        errorType: "NOT_FOUND",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: { [key]: value },
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
 * Обновить конкретную настройку
 */
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const updatedSettings = await siteSettingModel.updateSetting(key, value);

    res.json({
      success: true,
      data: updatedSettings,
      message: `Настройка "${key}" успешно обновлена`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      errorType: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Сбросить настройки к значениям по умолчанию
 */
export const resetToDefaults = async (req, res) => {
  try {
    const defaultSettings = await siteSettingModel.resetToDefaults();

    res.json({
      success: true,
      data: defaultSettings,
      message: "Настройки сброшены к значениям по умолчанию",
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
 * Экспорт настроек
 */
export const exportSettings = async (req, res) => {
  try {
    const exportData = await siteSettingModel.exportSettings();

    res.set({
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ant-support-settings-${Date.now()}.json"`,
    });

    res.json(exportData);
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
 * Импорт настроек
 */
export const importSettings = async (req, res) => {
  try {
    const importData = req.body;
    const importedSettings = await siteSettingModel.importSettings(importData);

    res.json({
      success: true,
      data: importedSettings,
      message: "Настройки успешно импортированы",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      errorType: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Проверить валидность настроек
 */
export const validateSettings = async (req, res) => {
  try {
    const settingsData = req.body;
    const errors = [];

    // Валидация обязательных полей
    if (settingsData.siteName && settingsData.siteName.length < 1) {
      errors.push("Название сайта не может быть пустым");
    }

    if (
      settingsData.maxStepsPerProblem &&
      (settingsData.maxStepsPerProblem < 1 ||
        settingsData.maxStepsPerProblem > 100)
    ) {
      errors.push("Максимальное количество шагов должно быть от 1 до 100");
    }

    if (
      settingsData.maxMediaSize &&
      (settingsData.maxMediaSize < 1 || settingsData.maxMediaSize > 100)
    ) {
      errors.push("Максимальный размер медиа должен быть от 1 до 100 MB");
    }

    if (
      settingsData.sessionTimeout &&
      (settingsData.sessionTimeout < 5 || settingsData.sessionTimeout > 1440)
    ) {
      errors.push("Таймаут сессии должен быть от 5 до 1440 минут");
    }

    // Валидация цветов
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (
      settingsData.primaryColor &&
      !colorRegex.test(settingsData.primaryColor)
    ) {
      errors.push("Основной цвет должен быть в формате HEX");
    }

    if (
      settingsData.accentColor &&
      !colorRegex.test(settingsData.accentColor)
    ) {
      errors.push("Акцентный цвет должен быть в формате HEX");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Ошибки валидации настроек",
        errorType: "VALIDATION_ERROR",
        details: errors,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Настройки валидны",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

export default {
  getSettings,
  updateSettings,
  getSetting,
  updateSetting,
  resetToDefaults,
  exportSettings,
  importSettings,
  validateSettings,
};
