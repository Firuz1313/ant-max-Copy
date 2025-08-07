import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  searchUsers,
  checkUsernameAvailability,
  checkEmailAvailability
} from "../controllers/userController.js";
import { userValidation } from "../middleware/validateRequest.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями системы
 */

/**
 * Получить список всех пользователей
 * @route GET /users
 * @desc Получение списка пользователей с поддержкой фильтрации и пагинации
 * @query {string} [role] - Фильтр по роли (admin, moderator, user)
 * @query {boolean} [email_verified] - Фильтр по статусу подтверждения email
 * @query {string} [search] - Поиск по имени пользователя, email, имени или фамилии
 * @query {number} [limit=50] - Количество записей на странице
 * @query {number} [offset=0] - Смещение для пагинации
 * @access Private/Admin
 * @example
 * GET /api/v1/users?role=admin&limit=10&offset=0
 * GET /api/v1/users?search=ivan&email_verified=true
 */
router.get("/", getAllUsers);

/**
 * Получить статистику пользователей
 * @route GET /users/stats
 * @desc Получение общей статистики по пользователям
 * @access Private/Admin
 */
router.get("/stats", getUserStats);

/**
 * Поиск пользователей
 * @route GET /users/search
 * @desc Поиск пользователей по различным критериям
 * @query {string} q - Поисковый запрос (минимум 2 символа)
 * @query {string} [role] - Фильтр по роли
 * @query {number} [limit=20] - Количество результатов
 * @access Private/Admin
 * @example
 * GET /api/v1/users/search?q=admin&role=admin
 * GET /api/v1/users/search?q=ivan@example.com
 */
router.get("/search", searchUsers);

/**
 * Проверить доступность username
 * @route GET /users/check-username/:username
 * @desc Проверка доступности логина для регистрации
 * @param {string} username - Логин для проверки
 * @access Public
 * @example
 * GET /api/v1/users/check-username/newuser123
 */
router.get("/check-username/:username", checkUsernameAvailability);

/**
 * Проверить доступность email
 * @route GET /users/check-email/:email
 * @desc Проверка доступности email для регистрации
 * @param {string} email - Email для проверки
 * @access Public
 * @example
 * GET /api/v1/users/check-email/user@example.com
 */
router.get("/check-email/:email", checkEmailAvailability);

/**
 * Получить пользователя по ID
 * @route GET /users/:id
 * @desc Получение детальной информации о пользователе
 * @param {string} id - Уникальный идентификатор пользователя
 * @access Private/Admin
 * @example
 * GET /api/v1/users/user-123
 */
router.get("/:id", getUserById);

/**
 * Создать нового пользователя
 * @route POST /users
 * @desc Создание нового пользователя в системе
 * @body {object} user - Данные пользователя
 * @body {string} user.username - Логин пользователя (обязательно)
 * @body {string} user.email - Email пользователя (обязательно)
 * @body {string} user.password - Пароль пользователя (обязательно)
 * @body {string} [user.first_name] - Имя пользователя
 * @body {string} [user.last_name] - Фамилия пользователя
 * @body {string} [user.role=user] - Роль пользователя (admin, moderator, user)
 * @body {array} [user.permissions] - Массив разрешений
 * @body {boolean} [user.email_verified=false] - Статус подтверждения email
 * @body {boolean} [user.is_active=true] - Активность пользователя
 * @body {object} [user.preferences] - Пользовательские настройки
 * @body {object} [user.metadata] - Дополнительные метаданные
 * @access Private/Admin
 * @example
 * POST /api/v1/users
 * {
 *   "username": "newuser",
 *   "email": "newuser@example.com",
 *   "password": "securepassword123",
 *   "first_name": "Иван",
 *   "last_name": "Петров",
 *   "role": "user"
 * }
 */
router.post("/", userValidation?.create || ((req, res, next) => next()), createUser);

/**
 * Обновить пользователя
 * @route PUT /users/:id
 * @desc Обновление данных пользователя
 * @param {string} id - Уникальный идентификатор пользователя
 * @body {object} user - Данные для обновления
 * @body {string} [user.username] - Новый логин пользователя
 * @body {string} [user.email] - Новый email пользователя
 * @body {string} [user.password] - Новый пароль пользователя
 * @body {string} [user.first_name] - Новое имя пользователя
 * @body {string} [user.last_name] - Новая фамилия пользователя
 * @body {string} [user.role] - Новая роль пользователя
 * @body {array} [user.permissions] - Новые разрешения
 * @body {boolean} [user.email_verified] - Статус подтверждения email
 * @body {boolean} [user.is_active] - Активность пользователя
 * @body {object} [user.preferences] - Пользовательские настройки
 * @body {object} [user.metadata] - Дополнительные метаданные
 * @access Private/Admin
 * @example
 * PUT /api/v1/users/user-123
 * {
 *   "first_name": "Александр",
 *   "role": "moderator",
 *   "email_verified": true
 * }
 */
router.put("/:id", userValidation?.update || ((req, res, next) => next()), updateUser);

/**
 * Удалить пользователя
 * @route DELETE /users/:id
 * @desc Удаление пользователя (мягкое удаление - пользователь помечается как неактивный)
 * @param {string} id - Уникальный идентификатор пользователя
 * @access Private/Admin
 * @example
 * DELETE /api/v1/users/user-123
 */
router.delete("/:id", deleteUser);

export default router;
