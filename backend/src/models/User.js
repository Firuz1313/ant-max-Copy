import BaseModel from './BaseModel.js';
import { query } from '../utils/database.js';
import bcrypt from 'bcryptjs';

class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Получить всех пользователей
   */
  async getAllUsers(filters = {}) {
    let queryText = `
      SELECT 
        id, username, email, first_name, last_name, role, 
        email_verified, last_login, login_count, is_active,
        preferences, created_at, updated_at
      FROM users 
      WHERE is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    // Фильтрация по роли
    if (filters.role) {
      queryText += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    // Фильтрация по статусу email
    if (filters.email_verified !== undefined) {
      queryText += ` AND email_verified = $${paramIndex}`;
      params.push(filters.email_verified);
      paramIndex++;
    }

    // Поиск по имени или email
    if (filters.search) {
      queryText += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    queryText += ' ORDER BY created_at DESC';

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
    return result.rows.map(this.formatUser);
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(id) {
    const queryText = `
      SELECT 
        id, username, email, first_name, last_name, role, 
        email_verified, last_login, login_count, is_active,
        preferences, created_at, updated_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await query(queryText, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.formatUser(result.rows[0]);
  }

  /**
   * Получить пользователя по username
   */
  async getUserByUsername(username) {
    const queryText = `
      SELECT 
        id, username, email, first_name, last_name, role, 
        password_hash, email_verified, last_login, login_count, 
        is_active, preferences, created_at, updated_at
      FROM users 
      WHERE username = $1 AND is_active = true
    `;
    
    const result = await query(queryText, [username]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.formatUser(result.rows[0]);
  }

  /**
   * Получить пользователя по email
   */
  async getUserByEmail(email) {
    const queryText = `
      SELECT 
        id, username, email, first_name, last_name, role, 
        password_hash, email_verified, last_login, login_count, 
        is_active, preferences, created_at, updated_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await query(queryText, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.formatUser(result.rows[0]);
  }

  /**
   * Создать нового пользователя
   */
  async createUser(userData) {
    const {
      id,
      username,
      email,
      password,
      first_name,
      last_name,
      role = 'user',
      permissions = [],
      email_verified = false,
      is_active = true,
      preferences = {},
      metadata = {}
    } = userData;

    // Проверка уникальности username и email
    const existingUser = await this.getUserByUsername(username);
    if (existingUser) {
      throw new Error(`Пользователь с логином "${username}" уже существует`);
    }

    const existingEmail = await this.getUserByEmail(email);
    if (existingEmail) {
      throw new Error(`Пользователь с email "${email}" уже существует`);
    }

    // Хеширование пароля
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const queryText = `
      INSERT INTO users (
        id, username, email, password_hash, first_name, last_name,
        role, permissions, email_verified, is_active, preferences, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING 
        id, username, email, first_name, last_name, role, 
        email_verified, last_login, login_count, is_active,
        preferences, created_at, updated_at
    `;

    const values = [
      id,
      username,
      email,
      password_hash,
      first_name,
      last_name,
      role,
      JSON.stringify(permissions),
      email_verified,
      is_active,
      JSON.stringify(preferences),
      JSON.stringify(metadata)
    ];

    const result = await query(queryText, values);
    return this.formatUser(result.rows[0]);
  }

  /**
   * Обновить пользователя
   */
  async updateUser(id, updateData) {
    const currentUser = await this.getUserById(id);
    if (!currentUser) {
      throw new Error(`Пользователь с ID ${id} не найден`);
    }

    const allowedFields = [
      'username', 'email', 'first_name', 'last_name', 'role',
      'permissions', 'email_verified', 'is_active', 'preferences', 'metadata'
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Проверка уникальности при обновлении username
    if (updateData.username && updateData.username !== currentUser.username) {
      const existingUser = await this.getUserByUsername(updateData.username);
      if (existingUser) {
        throw new Error(`Пользователь с логином "${updateData.username}" уже существует`);
      }
    }

    // Проверка уникальности при обновлении email
    if (updateData.email && updateData.email !== currentUser.email) {
      const existingEmail = await this.getUserByEmail(updateData.email);
      if (existingEmail) {
        throw new Error(`Пользователь с email "${updateData.email}" уже существует`);
      }
    }

    // Хеширование нового пароля если указан
    if (updateData.password) {
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(updateData.password, saltRounds);
      updateFields.push(`password_hash = $${paramIndex}`);
      values.push(password_hash);
      paramIndex++;
    }

    // Обработка остальных полей
    Object.keys(updateData).forEach(field => {
      if (allowedFields.includes(field)) {
        let value = updateData[field];
        
        // JSON поля
        if (['permissions', 'preferences', 'metadata'].includes(field)) {
          value = JSON.stringify(value);
        }

        updateFields.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return currentUser;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const queryText = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} 
      RETURNING 
        id, username, email, first_name, last_name, role, 
        email_verified, last_login, login_count, is_active,
        preferences, created_at, updated_at
    `;

    const result = await query(queryText, values);
    return this.formatUser(result.rows[0]);
  }

  /**
   * Удалить пользователя (мягкое удаление)
   */
  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`Пользователь с ID ${id} не найден`);
    }

    // Проверка - нельзя удалить последнего админа
    if (user.role === 'admin') {
      const adminCount = await this.countAdmins();
      if (adminCount <= 1) {
        throw new Error('Нельзя удалить последнего администратора');
      }
    }

    const queryText = `
      UPDATE users 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `;

    await query(queryText, [id]);
    return { id, deleted: true };
  }

  /**
   * Проверить пароль пользователя
   */
  async verifyPassword(username, password) {
    const user = await this.getUserByUsername(username);
    if (!user || !user.password_hash) {
      return false;
    }

    return await bcrypt.compare(password, user.password_hash);
  }

  /**
   * Обновить время последнего входа
   */
  async updateLastLogin(id) {
    const queryText = `
      UPDATE users 
      SET last_login = NOW(), login_count = login_count + 1, updated_at = NOW()
      WHERE id = $1
    `;

    await query(queryText, [id]);
  }

  /**
   * Получить количество администраторов
   */
  async countAdmins() {
    const queryText = `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'admin' AND is_active = true
    `;

    const result = await query(queryText);
    return parseInt(result.rows[0].count);
  }

  /**
   * Получить статистику пользователей
   */
  async getUserStats() {
    const queryText = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderator_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_count,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_count
      FROM users 
      WHERE is_active = true
    `;

    const result = await query(queryText);
    const stats = result.rows[0] || {};

    return {
      totalUsers: parseInt(stats.total_users || 0),
      adminCount: parseInt(stats.admin_count || 0),
      moderatorCount: parseInt(stats.moderator_count || 0),
      userCount: parseInt(stats.user_count || 0),
      verifiedCount: parseInt(stats.verified_count || 0),
      activeCount: parseInt(stats.active_count || 0)
    };
  }

  /**
   * Форматирование пользователя для ответа
   */
  formatUser(user) {
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      permissions: this.parseJSON(user.permissions, []),
      emailVerified: user.email_verified,
      lastLogin: user.last_login,
      loginCount: user.login_count || 0,
      isActive: user.is_active,
      preferences: this.parseJSON(user.preferences, {}),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      // Не возвращаем password_hash в API ответе
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

export default User;
