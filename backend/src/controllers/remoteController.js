import Remote from '../models/Remote.js';
import { v4 as uuidv4 } from 'uuid';

const remoteModel = new Remote();

/**
 * Получить список всех пультов
 * @route GET /api/v1/remotes
 */
export const getAllRemotes = async (req, res) => {
  try {
    const {
      device_id,
      manufacturer,
      layout,
      is_default,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {
      device_id,
      manufacturer,
      layout,
      is_default: is_default !== undefined ? is_default === 'true' : undefined,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const remotes = await remoteModel.getAllRemotes(filters);

    res.json({
      success: true,
      data: remotes,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: remotes.length
      },
      message: remotes.length > 0 ? `Найдено ${remotes.length} пультов` : 'Пульты не найдены',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении пультов:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении пультов',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить пульт по ID
 * @route GET /api/v1/remotes/:id
 */
export const getRemoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const remote = await remoteModel.getRemoteById(id);

    if (!remote) {
      return res.status(404).json({
        success: false,
        error: `Пульт с ID ${id} не найден`,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: remote,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении пульта:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении пульта',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить пульты по устройству
 * @route GET /api/v1/remotes/device/:deviceId
 */
export const getRemotesByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const remotes = await remoteModel.getRemotesByDevice(deviceId);

    res.json({
      success: true,
      data: remotes,
      message: remotes.length > 0 ? `Найдено ${remotes.length} пультов для устройства` : 'Пульты для устройства не найдены',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении пультов по устройству:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении пультов по устройству',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить пульт по умолчанию д��я устройства
 * @route GET /api/v1/remotes/device/:deviceId/default
 */
export const getDefaultRemoteForDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const remote = await remoteModel.getDefaultRemoteForDevice(deviceId);

    if (!remote) {
      return res.status(404).json({
        success: false,
        error: `Пульт по умолчанию для устройства ${deviceId} не найден`,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: remote,
      message: 'Пульт по умолчанию найден',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении пульта по умолчанию:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении пульта по умолчанию',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Создать новый пульт
 * @route POST /api/v1/remotes
 */
export const createRemote = async (req, res) => {
  try {
    const remoteData = req.body;

    // Валидация обязательных полей
    if (!remoteData.name || !remoteData.manufacturer || !remoteData.model) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля: name, manufacturer, model',
        errorType: 'VALIDATION_ERROR',
        details: ['name', 'manufacturer', 'model'],
        timestamp: new Date().toISOString()
      });
    }

    // Валидация layout
    const validLayouts = ['standard', 'compact', 'smart', 'custom'];
    if (remoteData.layout && !validLayouts.includes(remoteData.layout)) {
      return res.status(400).json({
        success: false,
        error: `Неверный layout. Допустимые значения: ${validLayouts.join(', ')}`,
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Валидация dimensions
    if (remoteData.dimensions) {
      if (!remoteData.dimensions.width || !remoteData.dimensions.height) {
        return res.status(400).json({
          success: false,
          error: 'Dimensions должны содержать width и height',
          errorType: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Добавляем ID если не указан
    const remoteDataWithId = {
      ...remoteData,
      id: remoteData.id || uuidv4()
    };

    const newRemote = await remoteModel.createRemote(remoteDataWithId);

    res.status(201).json({
      success: true,
      data: newRemote,
      message: `Пульт "${newRemote.name}" успешно создан`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при создании пульта:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при создании пульта',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Обновить пульт
 * @route PUT /api/v1/remotes/:id
 */
export const updateRemote = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Валидация layout если предоставлен
    const validLayouts = ['standard', 'compact', 'smart', 'custom'];
    if (updateData.layout && !validLayouts.includes(updateData.layout)) {
      return res.status(400).json({
        success: false,
        error: `Неверны�� layout. Допустимые значения: ${validLayouts.join(', ')}`,
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Валидация dimensions если предоставлены
    if (updateData.dimensions) {
      if (!updateData.dimensions.width || !updateData.dimensions.height) {
        return res.status(400).json({
          success: false,
          error: 'Dimensions должны содержать width и height',
          errorType: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }
    }

    const updatedRemote = await remoteModel.updateRemote(id, updateData);

    res.json({
      success: true,
      data: updatedRemote,
      message: `Пульт "${updatedRemote.name}" успешно обновлен`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при обновлении пульта:', error);

    // Обработка ошибки "не найден"
    if (error.message.includes('не найден')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при обновлении пульта',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Удалить пульт
 * @route DELETE /api/v1/remotes/:id
 */
export const deleteRemote = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await remoteModel.deleteRemote(id);

    res.json({
      success: true,
      data: result,
      message: `Пульт успешно удален`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при удалении пульта:', error);

    // Обработка ошибки "не найден"
    if (error.message.includes('не найден')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Обработка ошибки использования в шагах
    if (error.message.includes('используется в')) {
      return res.status(409).json({
        success: false,
        error: error.message,
        errorType: 'RESOURCE_IN_USE',
        suggestion: 'Обновите или удалите связанные диагностические шаги перед удалением пульта',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при удалении пульта',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Дублировать пульт
 * @route POST /api/v1/remotes/:id/duplicate
 */
export const duplicateRemote = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const duplicatedRemote = await remoteModel.duplicateRemote(id, name);

    res.status(201).json({
      success: true,
      data: duplicatedRemote,
      message: `Пульт "${duplicatedRemote.name}" успешно дублирован`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при дублировании пульта:', error);

    // Обработка ошибки "не найден"
    if (error.message.includes('не найден')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при дублировании пульта',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить статистику пультов
 * @route GET /api/v1/remotes/stats
 */
export const getRemoteStats = async (req, res) => {
  try {
    const stats = await remoteModel.getRemoteStats();

    res.json({
      success: true,
      data: stats,
      message: 'Статистика пультов получена',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении статистики пультов:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении статистики',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить популярные пульты
 * @route GET /api/v1/remotes/popular
 */
export const getPopularRemotes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const remotes = await remoteModel.getPopularRemotes(parseInt(limit));

    res.json({
      success: true,
      data: remotes,
      message: remotes.length > 0 ? `Найдено ${remotes.length} популярных пультов` : 'Популярные пульты не найдены',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении популярных пультов:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении популярных пультов',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Поиск пультов
 * @route GET /api/v1/remotes/search
 */
export const searchRemotes = async (req, res) => {
  try {
    const { q: query, device_id, manufacturer, layout, limit = 20 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Поисковый запрос должен содержать минимум 2 с��мвола',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const filters = {
      search: query,
      device_id,
      manufacturer,
      layout,
      limit: parseInt(limit)
    };

    const remotes = await remoteModel.getAllRemotes(filters);

    res.json({
      success: true,
      data: remotes,
      pagination: {
        limit: filters.limit,
        total: remotes.length
      },
      message: remotes.length > 0 ? `По запросу "${query}" найдено ${remotes.length} пультов` : `По запросу "${query}" ничего не найдено`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при поиске пультов:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при поиске пультов',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Обновить статистику использования пульта
 * @route POST /api/v1/remotes/:id/usage
 */
export const updateRemoteUsage = async (req, res) => {
  try {
    const { id } = req.params;

    await remoteModel.updateUsageStats(id);

    res.json({
      success: true,
      message: 'Статистика использования пульта обновлена',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при обновлении статистики использования:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при обновлении статистики',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
