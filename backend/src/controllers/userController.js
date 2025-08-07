import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

const userModel = new User();

/**
 * Получить список всех пользователей
 * @route GET /api/v1/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      email_verified,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {
      role,
      email_verified: email_verified !== undefined ? email_verified === 'true' : undefined,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const users = await userModel.getAllUsers(filters);

    res.json({
      success: true,
      data: users,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: users.length
      },
      message: users.length > 0 ? `Найдено ${users.length} пользователей` : 'Пользователи не найдены',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении пользователей',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить пользователя по ID
 * @route GET /api/v1/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Пользователь с ID ${id} не найден`,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при получении пользователя',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Создать нового пользователя
 * @route POST /api/v1/users
 */
export const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Валидация обязательных полей
    if (!userData.username || !userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля: username, email, password',
        errorType: 'VALIDATION_ERROR',
        details: ['username', 'email', 'password'],
        timestamp: new Date().toISOString()
      });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный формат email адреса',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Валидация username
    if (userData.username.length < 3 || userData.username.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Логин должен содержать от 3 до 50 символов',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Валидация пароля
    if (userData.password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Пароль должен содержать минимум 6 символов',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Добавляем ID если не указан
    const userDataWithId = {
      ...userData,
      id: userData.id || uuidv4()
    };

    const newUser = await userModel.createUser(userDataWithId);

    res.status(201).json({
      success: true,
      data: newUser,
      message: `Пользователь "${newUser.username}" успешно создан`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);

    // Обработка ошибок уникальности
    if (error.message.includes('уже существует')) {
      return res.status(409).json({
        success: false,
        error: error.message,
        errorType: 'DUPLICATE_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при создании пользователя',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Обновить пользователя
 * @route PUT /api/v1/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Валидация email если предоставлен
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Некорректный формат email адреса',
          errorType: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Валидация username если предоставлен
    if (updateData.username && (updateData.username.length < 3 || updateData.username.length > 50)) {
      return res.status(400).json({
        success: false,
        error: 'Логин должен содержать от 3 до 50 символов',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Валидация пароля если предоставлен
    if (updateData.password && updateData.password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Пароль должен содержать минимум 6 символов',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const updatedUser = await userModel.updateUser(id, updateData);

    res.json({
      success: true,
      data: updatedUser,
      message: `Пользователь "${updatedUser.username}" успешно обновлен`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);

    // Обработка ошибки "не найден"
    if (error.message.includes('не найден')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Обработка ошибок уникальности
    if (error.message.includes('уже существует')) {
      return res.status(409).json({
        success: false,
        error: error.message,
        errorType: 'DUPLICATE_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при обновлении пользователя',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Удалить пользователя
 * @route DELETE /api/v1/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userModel.deleteUser(id);

    res.json({
      success: true,
      data: result,
      message: `Пользователь успешно удален`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);

    // Обработка ошибки "не найден"
    if (error.message.includes('не найден')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        errorType: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Обработка ошибки удаления последнего админа
    if (error.message.includes('последнего администратора')) {
      return res.status(403).json({
        success: false,
        error: error.message,
        errorType: 'OPERATION_FORBIDDEN',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при удалении пользователя',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Получить статистику пользователей
 * @route GET /api/v1/users/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const stats = await userModel.getUserStats();

    res.json({
      success: true,
      data: stats,
      message: 'Статистика пользователей получена',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при получе��ии статистики пользователей:', error);
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
 * Поиск пользователей
 * @route GET /api/v1/users/search
 */
export const searchUsers = async (req, res) => {
  try {
    const { q: query, role, limit = 20 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Поисковый запрос должен содержать минимум 2 символа',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const filters = {
      search: query,
      role,
      limit: parseInt(limit)
    };

    const users = await userModel.getAllUsers(filters);

    res.json({
      success: true,
      data: users,
      pagination: {
        limit: filters.limit,
        total: users.length
      },
      message: users.length > 0 ? `По запросу "${query}" найдено ${users.length} пользователей` : `По запросу "${query}" ничего не найдено`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при поиске пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при поиске пользователей',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Проверить доступность username
 * @route GET /api/v1/users/check-username/:username
 */
export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Логин должен содержать минимум 3 символа',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const existingUser = await userModel.getUserByUsername(username);
    const available = !existingUser;

    res.json({
      success: true,
      data: {
        username,
        available
      },
      message: available ? 'Логин доступен' : 'Логин уже занят',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при проверке доступности логина:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при проверке логина',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Проверить доступность email
 * @route GET /api/v1/users/check-email/:email
 */
export const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.params;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный формат email адреса',
        errorType: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const existingUser = await userModel.getUserByEmail(email);
    const available = !existingUser;

    res.json({
      success: true,
      data: {
        email,
        available
      },
      message: available ? 'Email доступен' : 'Email уже занят',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при проверке доступности email:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при проверке email',
      errorType: 'DATABASE_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
