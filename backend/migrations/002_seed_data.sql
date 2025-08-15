-- ANT Support Database Sample Data
-- Migration: 002_seed_data.sql

-- Insert default site settings
INSERT INTO site_settings (id, site_name, site_description) VALUES (
    'settings',
    'ANT Support',
    'Профессиональная платформа для диагностики цифровых ТВ-приставок'
) ON CONFLICT (id) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, role, email_verified) VALUES (
    'admin-001',
    'admin',
    'admin@antsupport.local',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    true
) ON CONFLICT (username) DO NOTHING;

-- Create additional test users
INSERT INTO users (id, username, email, password_hash, role, email_verified) VALUES
    ('user-001', 'testuser', 'user@antsupport.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true),
    ('mod-001', 'moderator', 'mod@antsupport.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'moderator', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample devices
INSERT INTO devices (id, name, brand, model, description, image_url, color, order_index, status, is_active) VALUES 
    ('ant-classic', 'ANT Classic', 'ANT', 'AC-100', 'Классическая модель ANT приставки', '/images/devices/ant-classic.jpg', 'from-blue-500 to-blue-600', 1, 'active', true),
    ('ant-pro', 'ANT Pro', 'ANT', 'AP-200', 'Профессиональная модель с расширенным функционалом', '/images/devices/ant-pro.jpg', 'from-purple-500 to-purple-600', 2, 'active', true),
    ('ant-smart', 'ANT Smart', 'ANT', 'AS-300', 'Умная приставка с поддержкой современных стандартов', '/images/devices/ant-smart.jpg', 'from-green-500 to-green-600', 3, 'active', true),
    ('ant-mini', 'ANT Mini', 'ANT', 'AM-50', 'Компактная модель для базового использования', '/images/devices/ant-mini.jpg', 'from-orange-500 to-orange-600', 4, 'active', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample problems for ANT Classic
INSERT INTO problems (id, device_id, title, description, category, icon, color, priority, estimated_time, difficulty, status, is_active) VALUES 
    ('classic-no-signal', 'ant-classic', 'Нет сигнала', 'Телевизор показывает "Нет сигнала" или черный экран', 'critical', 'AlertTriangle', 'from-red-500 to-red-600', 1, 10, 'beginner', 'published', true),
    ('classic-bad-quality', 'ant-classic', 'Плохое качество изображения', 'Изображение нечеткое, с помехами или артефактами', 'moderate', 'Monitor', 'from-yellow-500 to-yellow-600', 2, 15, 'beginner', 'published', true),
    ('classic-no-sound', 'ant-classic', 'Нет звука', 'Изображение есть, но звук отсутствует', 'moderate', 'VolumeX', 'from-orange-500 to-orange-600', 3, 8, 'beginner', 'published', true),
    ('classic-remote-not-working', 'ant-classic', 'Пульт не работает', 'Приставка не реагирует на команды пульта ДУ', 'minor', 'Gamepad2', 'from-blue-500 to-blue-600', 4, 5, 'beginner', 'published', true),
    ('classic-freezing', 'ant-classic', 'Зависания и перезагрузки', 'Приставка периодически зависает или перезагружается', 'critical', 'RotateCcw', 'from-red-600 to-red-700', 1, 20, 'intermediate', 'published', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample problems for ANT Pro
INSERT INTO problems (id, device_id, title, description, category, icon, color, priority, estimated_time, difficulty, status, is_active) VALUES 
    ('pro-no-signal', 'ant-pro', 'Нет сигнала', 'Телевизор показывает "Нет сигнала" или черный экран', 'critical', 'AlertTriangle', 'from-red-500 to-red-600', 1, 10, 'beginner', 'published', true),
    ('pro-internet-issues', 'ant-pro', 'Проблемы с интернетом', 'Нет доступа к онлайн-сервисам и приложениям', 'moderate', 'Wifi', 'from-blue-500 to-blue-600', 2, 12, 'intermediate', 'published', true),
    ('pro-app-crashes', 'ant-pro', 'Приложения не запускаются', 'Встроенные приложения вылетают или не открываются', 'moderate', 'Smartphone', 'from-purple-500 to-purple-600', 3, 15, 'intermediate', 'published', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample problems for ANT Smart
INSERT INTO problems (id, device_id, title, description, category, icon, color, priority, estimated_time, difficulty, status, is_active) VALUES 
    ('smart-voice-not-working', 'ant-smart', 'Голосовое управление не работает', 'Приставка не реагирует на голосовые команды', 'minor', 'Mic', 'from-green-500 to-green-600', 4, 8, 'beginner', 'published', true),
    ('smart-slow-interface', 'ant-smart', 'Медленный интерфейс', 'Меню и приложения работают медленно', 'moderate', 'Zap', 'from-yellow-500 to-yellow-600', 3, 18, 'intermediate', 'published', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample problems for ANT Mini
INSERT INTO problems (id, device_id, title, description, category, icon, color, priority, estimated_time, difficulty, status, is_active) VALUES 
    ('mini-overheating', 'ant-mini', 'Перегрев устройства', 'Приставка сильно нагревается во время работы', 'critical', 'Thermometer', 'from-red-500 to-red-600', 1, 25, 'advanced', 'published', true),
    ('mini-channels-missing', 'ant-mini', 'Пропали каналы', 'Часть или все каналы исчезли из списка', 'moderate', 'Tv', 'from-blue-500 to-blue-600', 2, 12, 'beginner', 'published', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample remotes
INSERT INTO remotes (id, device_id, name, manufacturer, model, description, layout, dimensions, is_default, is_active) VALUES 
    ('ant-classic-remote', 'ant-classic', 'ANT Classic Remote', 'ANT', 'RC-100', 'Стандартный пульт для ANT Classic', 'standard', '{"width": 200, "height": 500}', true, true),
    ('ant-pro-remote', 'ant-pro', 'ANT Pro Remote', 'ANT', 'RC-200', 'Расширенный пульт для ANT Pro', 'smart', '{"width": 220, "height": 520}', true, true),
    ('ant-smart-remote', 'ant-smart', 'ANT Smart Remote', 'ANT', 'RC-300', 'Умный пульт с голосовым управлением', 'smart', '{"width": 210, "height": 510}', true, true),
    ('ant-mini-remote', 'ant-mini', 'ANT Mini Remote', 'ANT', 'RC-50', 'Компактный пульт для ANT Mini', 'compact', '{"width": 180, "height": 450}', true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample TV interfaces
INSERT INTO tv_interfaces (id, device_id, name, description, type, is_active) VALUES 
    ('ant-classic-home', 'ant-classic', 'Главный экран ANT Classic', 'Основной интерфейс приставки ANT Classic', 'home', true),
    ('ant-classic-settings', 'ant-classic', 'Настройки ANT Classic', 'Меню настроек приставки ANT Classic', 'settings', true),
    ('ant-pro-home', 'ant-pro', 'Главный экран ANT Pro', 'Основной интерфейс приставки ANT Pro', 'home', true),
    ('ant-smart-home', 'ant-smart', 'Главный экран ANT Smart', 'Основной интерфейс приставки ANT Smart', 'home', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample diagnostic steps for "No Signal" problem (Classic)
INSERT INTO diagnostic_steps (id, problem_id, device_id, step_number, title, instruction, estimated_time, action_type, is_active) VALUES 
    ('classic-no-signal-step1', 'classic-no-signal', 'ant-classic', 1, 'Проверка подключения кабелей', 'Убедитесь, что все кабели подключены правильно и плотно', 60, 'check', true),
    ('classic-no-signal-step2', 'classic-no-signal', 'ant-classic', 2, 'Проверка питания', 'Проверьте, что приставка включена и светится индикатор питания', 30, 'check', true),
    ('classic-no-signal-step3', 'classic-no-signal', 'ant-classic', 3, 'Перезагрузка приставки', 'Отключите питание на 10 ��екунд, затем включите снова', 90, 'button_press', true),
    ('classic-no-signal-step4', 'classic-no-signal', 'ant-classic', 4, 'Проверка телевизора', 'Убедитесь, что на телевизоре выбран правильный источник сигнала', 45, 'check', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample diagnostic steps for "Poor Quality" problem (Classic)
INSERT INTO diagnostic_steps (id, problem_id, device_id, step_number, title, instruction, estimated_time, action_type, is_active) VALUES 
    ('classic-quality-step1', 'classic-bad-quality', 'ant-classic', 1, 'Проверка антенно��о кабеля', 'Осмотрите антенный кабель на предмет повреждений', 60, 'check', true),
    ('classic-quality-step2', 'classic-bad-quality', 'ant-classic', 2, 'Настройка качества сигнала', 'Войдите в меню настроек и проверьте уровень сигнала', 120, 'navigation', true),
    ('classic-quality-step3', 'classic-bad-quality', 'ant-classic', 3, 'Поиск каналов', 'Выполните автоматический поиск каналов', 180, 'button_press', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample diagnostic steps for "No Sound" problem (Classic)
INSERT INTO diagnostic_steps (id, problem_id, device_id, step_number, title, instruction, estimated_time, action_type, is_active) VALUES 
    ('classic-sound-step1', 'classic-no-sound', 'ant-classic', 1, 'Проверка громкости', 'Увеличьте громкость на пульте приставки и телевизора', 30, 'button_press', true),
    ('classic-sound-step2', 'classic-no-sound', 'ant-classic', 2, 'Проверка аудио кабелей', 'Убедитесь, что аудио кабели подключены правильно', 45, 'check', true),
    ('classic-sound-step3', 'classic-no-sound', 'ant-classic', 3, 'Настройки звука', 'Проверьте настройки звука в меню приставки', 90, 'navigation', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample step actions
INSERT INTO step_actions (id, step_id, type, name, description, color, target_element, is_active) VALUES 
    ('action-power-button', 'classic-no-signal-step3', 'button_press', 'Кнопка питания', 'Нажмите кнопку питания на пульте', '#ff0000', 'power_button', true),
    ('action-menu-button', 'classic-quality-step2', 'button_press', 'Кнопка меню', 'Нажмите кнопку меню на пульте', '#0000ff', 'menu_button', true),
    ('action-volume-up', 'classic-sound-step1', 'button_press', 'Увеличить громкость', 'Нажмите кнопку увеличения громкости', '#00ff00', 'volume_up', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample session data
INSERT INTO diagnostic_sessions (id, device_id, problem_id, session_id, completed_steps, total_steps, success, duration, is_active) VALUES 
    ('session-001', 'ant-classic', 'classic-no-signal', 'sess-001', 4, 4, true, 300, true),
    ('session-002', 'ant-classic', 'classic-bad-quality', 'sess-002', 2, 3, false, 180, true),
    ('session-003', 'ant-pro', 'pro-no-signal', 'sess-003', 3, 4, true, 240, true)
ON CONFLICT (id) DO NOTHING;
