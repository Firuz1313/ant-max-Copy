-- ANT Support Database Seed Data
-- Migration: 013_seed_full_database.sql

-- 1. Insert Users (9 with different roles)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, permissions, email_verified, is_active) VALUES
('usr-admin-001', 'admin', 'admin@antsupport.com', '$2b$10$dummy.hash.value.for.demo', 'Администратор', 'Системы', 'admin', '["all"]'::jsonb, true, true),
('usr-support-001', 'tech_support', 'support@antsupport.com', '$2b$10$dummy.hash.value.for.demo', 'Алексей', 'Техник', 'support', '["diagnostics", "users"]'::jsonb, true, true),
('usr-support-002', 'maria_support', 'maria@antsupport.com', '$2b$10$dummy.hash.value.for.demo', 'Мария', 'Соколова', 'support', '["diagnostics"]'::jsonb, true, true),
('usr-moderator-001', 'moderator', 'moderator@antsupport.com', '$2b$10$dummy.hash.value.for.demo', 'Дмитрий', 'Модератор', 'moderator', '["content", "users"]'::jsonb, true, true),
('usr-moderator-002', 'elena_mod', 'elena@antsupport.com', '$2b$10$dummy.hash.value.for.demo', 'Елена', 'Кузнецо��а', 'moderator', '["content"]'::jsonb, true, true),
('usr-user-001', 'client_ivan', 'ivan@example.com', '$2b$10$dummy.hash.value.for.demo', 'Иван', 'Петров', 'user', '[]'::jsonb, true, true),
('usr-user-002', 'client_anna', 'anna@example.com', '$2b$10$dummy.hash.value.for.demo', 'Анна', 'Сидорова', 'user', '[]'::jsonb, true, true),
('usr-user-003', 'client_sergey', 'sergey@example.com', '$2b$10$dummy.hash.value.for.demo', 'Сергей', 'Волков', 'user', '[]'::jsonb, false, true),
('usr-inactive-001', 'old_user', 'old@example.com', '$2b$10$dummy.hash.value.for.demo', 'Старый', 'Пользователь', 'user', '[]'::jsonb, false, false);

-- 2. Insert Devices (8 models of TV set-top boxes)
INSERT INTO devices (id, name, brand, model, description, image_url, logo_url, color, order_index, specifications, supported_formats, is_active) VALUES
('dev-android-001', 'Android TV Box Premium', 'ANT', 'ATB-P100', 'Премиальная Android TV приставка с 4K поддержкой и голосовым управлением', 'https://images.pexels.com/photos/5202918/pexels-photo-5202918.jpeg', NULL, 'from-blue-500 to-blue-700', 1, '{"cpu": "Amlogic S922X", "ram": "4GB", "storage": "64GB", "wifi": "802.11ac", "bluetooth": "5.0", "resolution": "4K@60fps"}'::jsonb, '["H.264", "H.265", "VP9", "AV1", "Dolby Vision", "HDR10+"]'::jsonb, true),
('dev-android-002', 'Android TV Box Standard', 'ANT', 'ATB-S200', 'Стандартная Android TV приставка для базовых потребностей', 'https://images.pexels.com/photos/11031497/pexels-photo-11031497.jpeg', NULL, 'from-green-500 to-green-700', 2, '{"cpu": "Amlogic S905W2", "ram": "2GB", "storage": "16GB", "wifi": "802.11n", "bluetooth": "4.2", "resolution": "4K@30fps"}'::jsonb, '["H.264", "H.265", "VP9", "HDR10"]'::jsonb, true),
('dev-iptv-001', 'IPTV приставка Pro', 'ANT', 'IPTV-P300', 'Профессиональная IPTV приставка с записью программ', NULL, NULL, 'from-purple-500 to-purple-700', 3, '{"cpu": "BCM7252S", "ram": "1GB", "storage": "8GB", "ethernet": "Gigabit", "wifi": "802.11ac", "dvr": "2TB HDD support"}'::jsonb, '["MPEG-2", "MPEG-4", "H.264", "H.265"]'::jsonb, true),
('dev-iptv-002', 'IPTV приставка Basic', 'ANT', 'IPTV-B150', 'Базовая IPTV приставка для просмотра цифрового ТВ', NULL, NULL, 'from-orange-500 to-orange-700', 4, '{"cpu": "BCM7231", "ram": "512MB", "storage": "4GB", "ethernet": "Fast Ethernet", "wifi": "802.11n"}'::jsonb, '["MPEG-2", "MPEG-4", "H.264"]'::jsonb, true),
('dev-satellite-001', 'Satellite Receiver HD', 'ANT', 'SAT-HD400', 'HD спутниковый ресивер с поддержкой CI/CAM модулей', NULL, NULL, 'from-red-500 to-red-700', 5, '{"cpu": "STi7162", "ram": "512MB", "storage": "4GB", "tuner": "DVB-S2", "slots": "2x CI/CAM", "usb": "2x USB 2.0"}'::jsonb, '["MPEG-2", "MPEG-4", "H.264"]'::jsonb, true),
('dev-satellite-002', 'Satellite Receiver 4K', 'ANT', 'SAT-4K500', '4K спутниковый ресивер с записью и мультирумом', NULL, NULL, 'from-indigo-500 to-indigo-700', 6, '{"cpu": "BCM7444S", "ram": "2GB", "storage": "16GB", "tuner": "DVB-S2X", "hdd": "SATA", "ethernet": "Gigabit"}'::jsonb, '["MPEG-2", "MPEG-4", "H.264", "H.265", "HDR10"]'::jsonb, true),
('dev-cable-001', 'Cable Receiver Digital', 'ANT', 'CBL-D600', 'Цифровой кабельный ресивер с интерактивными сервисами', NULL, NULL, 'from-teal-500 to-teal-700', 7, '{"cpu": "BCM3383", "ram": "1GB", "storage": "8GB", "tuner": "DVB-C", "docsis": "3.0", "wifi": "802.11n"}'::jsonb, '["MPEG-2", "MPEG-4", "H.264", "H.265"]'::jsonb, true),
('dev-hybrid-001', 'Hybrid Smart Box', 'ANT', 'HYB-S800', 'Гибридная приставка: спутник + IPTV + OTT', NULL, NULL, 'from-pink-500 to-pink-700', 8, '{"cpu": "HiSilicon Hi3798MV200", "ram": "3GB", "storage": "32GB", "tuner": "DVB-S2 + DVB-C", "wifi": "802.11ac dual-band"}'::jsonb, '["All formats", "HDR10", "Dolby Vision", "Dolby Atmos"]'::jsonb, true);

-- 3. Insert TV Interfaces (12 screens for different device types)
INSERT INTO tv_interfaces (id, device_id, name, description, type, screenshot_url, dimensions, order_index, is_active) VALUES
('tvi-android-home', 'dev-android-001', 'Android TV Главный экран', 'Главное меню Android TV с рекомендациями и приложениями', 'home', 'https://images.pexels.com/photos/3807747/pexels-photo-3807747.jpeg', '{"width": 1920, "height": 1080}'::jsonb, 1, true),
('tvi-android-apps', 'dev-android-001', 'Android TV Приложения', 'Экран всех установленных приложений', 'apps', 'https://images.pexels.com/photos/5077068/pexels-photo-5077068.jpeg', '{"width": 1920, "height": 1080}'::jsonb, 2, true),
('tvi-android-settings', 'dev-android-001', 'Android TV Настройки', 'Меню настроек системы Android TV', 'settings', 'https://images.pexels.com/photos/33242735/pexels-photo-33242735.jpeg', '{"width": 1920, "height": 1080}'::jsonb, 3, true),
('tvi-iptv-channels', 'dev-iptv-001', 'IPTV Список каналов', 'Электронная программа передач IPTV', 'channels', NULL, '{"width": 1920, "height": 1080}'::jsonb, 4, true),
('tvi-iptv-guide', 'dev-iptv-001', 'IPTV Телегид', 'Программа передач с возможностью записи', 'guide', NULL, '{"width": 1920, "height": 1080}'::jsonb, 5, true),
('tvi-iptv-settings', 'dev-iptv-001', 'IPTV Настройки', 'Настройки IPTV ресивера', 'settings', NULL, '{"width": 1920, "height": 1080}'::jsonb, 6, true),
('tvi-sat-channels', 'dev-satellite-001', 'Satellite Каналы', 'Список спутниковых каналов', 'channels', NULL, '{"width": 1920, "height": 1080}'::jsonb, 7, true),
('tvi-sat-search', 'dev-satellite-001', 'Satellite Поиск', 'Автоматический поиск каналов', 'custom', NULL, '{"width": 1920, "height": 1080}'::jsonb, 8, true),
('tvi-cable-home', 'dev-cable-001', 'Cable Главная', 'Главный экран кабельного ресивера', 'home', NULL, '{"width": 1920, "height": 1080}'::jsonb, 9, true),
('tvi-cable-vod', 'dev-cable-001', 'Cable Ви��ео по запросу', 'Библиотека фильмов и сериалов', 'custom', NULL, '{"width": 1920, "height": 1080}'::jsonb, 10, true),
('tvi-error-screen', NULL, 'Экран ошибки', 'Универсальный экран ошибки подключения', 'error', NULL, '{"width": 1920, "height": 1080}'::jsonb, 11, true),
('tvi-no-signal', NULL, 'Нет сигнала', 'Экран отсутствия сигнала', 'no-signal', NULL, '{"width": 1920, "height": 1080}'::jsonb, 12, true);

-- 4. Insert Remotes (6 detailed remote controls)
INSERT INTO remotes (id, device_id, name, manufacturer, model, description, layout, image_url, dimensions, is_default, is_active) VALUES
('rem-android-001', 'dev-android-001', 'Android TV Remote Premium', 'ANT', 'REM-ATB-P100', 'Голосовой пульт для Android TV с гироскопом', 'smart', 'https://images.pexels.com/photos/5202918/pexels-photo-5202918.jpeg', '{"width": 180, "height": 220}'::jsonb, true, true),
('rem-android-002', 'dev-android-002', 'Android TV Remote Standard', 'ANT', 'REM-ATB-S200', 'Стандартный пульт для Android TV', 'standard', 'https://images.pexels.com/photos/11031497/pexels-photo-11031497.jpeg', '{"width": 160, "height": 200}'::jsonb, true, true),
('rem-iptv-001', 'dev-iptv-001', 'IPTV Remote Pro', 'ANT', 'REM-IPTV-P300', 'Профессиональный пульт для IPTV с ЖК дисплеем', 'standard', NULL, '{"width": 170, "height": 240}'::jsonb, true, true),
('rem-satellite-001', 'dev-satellite-001', 'Satellite Remote HD', 'ANT', 'REM-SAT-HD400', 'Пульт для спутникового ресивера', 'standard', NULL, '{"width": 160, "height": 220}'::jsonb, true, true),
('rem-cable-001', 'dev-cable-001', 'Cable Remote Digital', 'ANT', 'REM-CBL-D600', 'Пульт для кабельного ресивера', 'compact', NULL, '{"width": 150, "height": 190}'::jsonb, true, true),
('rem-universal-001', NULL, 'Universal Remote', 'ANT', 'REM-UNI-900', 'Универсальный пульт для всех устройств', 'smart', NULL, '{"width": 180, "height": 250}'::jsonb, false, true);

-- 5. Insert Problems (11 categorized problems)
INSERT INTO problems (id, device_id, title, description, category, subcategory, icon, color, tags, priority, estimated_time, difficulty, success_rate, status, is_active) VALUES
('prob-001', 'dev-android-001', 'Не включается приставка', 'Приставка не реагирует на нажатие кнопки питания на пульте или корпусе', 'critical', 'Питан��е', 'Power', 'from-red-500 to-red-700', '["power", "startup", "critical"]'::jsonb, 5, 10, 'beginner', 95, 'published', true),
('prob-002', 'dev-android-001', 'Нет изображения на экране', 'Приставка включается, но на телевизоре нет изображения', 'critical', 'Видео', 'Monitor', 'from-red-500 to-red-600', '["video", "display", "hdmi"]'::jsonb, 5, 15, 'intermediate', 90, 'published', true),
('prob-003', 'dev-android-001', 'Нет звука', 'Есть изображение, но отсутствует звук', 'moderate', 'Аудио', 'Volume2', 'from-yellow-500 to-yellow-600', '["audio", "sound"]'::jsonb, 3, 8, 'beginner', 98, 'published', true),
('prob-004', 'dev-iptv-001', 'Медленная загрузка каналов', 'IPTV каналы долго загружаются или буферизуются', 'moderate', 'Сеть', 'Wifi', 'from-orange-500 to-orange-600', '["iptv", "buffering", "network"]'::jsonb, 3, 12, 'intermediate', 85, 'published', true),
('prob-005', 'dev-iptv-001', 'Каналы не загружаются', 'Полное отсутствие IPTV каналов в списке', 'critical', 'Сеть', 'WifiOff', 'from-red-600 to-red-700', '["iptv", "channels", "network"]'::jsonb, 4, 20, 'advanced', 80, 'published', true),
('prob-006', 'dev-satellite-001', 'Слабый сигнал спутника', 'Низкое качество сигнала, помехи в изображении', 'moderate', 'Антенна', 'Satellite', 'from-yellow-600 to-orange-500', '["satellite", "signal", "antenna"]'::jsonb, 3, 25, 'advanced', 75, 'published', true),
('prob-007', 'dev-android-001', 'Пульт не работает', 'Пульт дистанционного управления не реагирует на нажатия', 'moderate', 'Пульт', 'Gamepad2', 'from-blue-500 to-blue-600', '["remote", "control"]'::jsonb, 2, 5, 'beginner', 99, 'published', true),
('prob-008', 'dev-android-002', 'Зависание системы', 'Приставка периодически зависает и требует перезагрузки', 'moderate', 'Система', 'RotateCcw', 'from-purple-500 to-purple-600', '["freeze", "system", "reboot"]'::jsonb, 3, 15, 'intermediate', 88, 'published', true),
('prob-009', 'dev-android-001', 'Приложения не запускаются', 'Установленные приложения не открываются или вылетают', 'moderate', 'Приложения', 'Smartphone', 'from-indigo-500 to-indigo-600', '["apps", "crash", "android"]'::jsonb, 2, 10, 'intermediate', 92, 'published', true),
('prob-010', 'dev-iptv-002', 'Медленная работа интерфейса', 'Меню и интерфейс работают медленно, долгий отклик', 'minor', 'Производительность', 'Gauge', 'from-gray-500 to-gray-600', '["performance", "slow", "ui"]'::jsonb, 1, 12, 'intermediate', 90, 'published', true),
('prob-011', 'dev-android-001', 'Проблемы с Wi-Fi подключением', 'Нестабильное или отсутствующее Wi-Fi соединение', 'moderate', 'Сеть', 'Wifi', 'from-teal-500 to-teal-600', '["wifi", "network", "connection"]'::jsonb, 3, 18, 'intermediate', 87, 'published', true);

-- 6. Insert Diagnostic Steps (15 steps with instructions for various problems)
INSERT INTO diagnostic_steps (id, problem_id, title, description, instruction, step_number, type, estimated_time, expected_result, tips, is_active) VALUES
-- Steps for "Не включается приставка"
('step-001-01', 'prob-001', 'Проверка питания', 'Проверяем подключение кабеля питания', 'Убедитесь, что кабель питания надежно подключен к приставке и электрической розетке', 1, 'check', 30, 'Кабель питания подключен правильно', 'Проверьте, что розетка работает, подключив другое устройство', true),
('step-001-02', 'prob-001', 'Проверка индикатора питания', 'Смотрим на светодиодный индикатор', 'Посмотрите на переднюю панель приставки - должен гореть или мигать светодиод', 2, 'check', 15, 'Индикатор горит или мигает', 'Если индикатор не горит, проблема в блоке питания', true),
('step-001-03', 'prob-001', 'Нажатие кнопки питания на пульте', 'Включаем приставку пультом', 'Направьте пульт на приставку и нажмите кнопку питания', 3, 'remote', 10, 'Приставка включается', 'Убедитесь, что батарейки в пульте не разряжены', true),

-- Steps for "Нет изображения на экране"
('step-002-01', 'prob-002', 'Проверка HDMI кабеля', 'Проверяем подключение HDMI', 'Убедитесь, что HDMI кабель надежно подключен к приставке и телевизору', 1, 'check', 30, 'HDMI кабель подключен к обоим устройствам', 'Попробуйте отключить и снов�� подключить кабель', true),
('step-002-02', 'prob-002', 'Выбор правильного входа на телевизоре', 'Переключаем вход на ТВ', 'На пульте телевизора нажмите кнопку INPUT/SOURCE и выберите правильный HDMI вход', 2, 'interface', 20, 'На экране появляется интерфейс приставки', 'Обычно приставки подключают к HDMI1 или HDMI2', true),
('step-002-03', 'prob-002', 'Проверка разрешения выхода', 'Настраиваем разрешение', 'В настройках приставки выберите подходящее разрешение для вашего телевизора', 3, 'interface', 60, 'Изображение появляется в правильном разрешении', 'Начните с разрешения 1080p, затем попробуйте другие', true),

-- Steps for "Нет звука"
('step-003-01', 'prob-003', 'Проверка громкости на телевизоре', 'Увеличиваем громкость ТВ', 'С помощью пульта телевизора увеличьте громкость и убедитесь, что звук не отключен', 1, 'check', 15, 'Громкость телевизора увеличена', 'Проверьте, что телевизор не в режиме "Без звука"', true),
('step-003-02', 'prob-003', 'Проверка аудио настроек приставки', 'Настраиваем звук в приставке', 'Зайдите в настройки звука приставки и проверьте выбранный аудио выход', 2, 'interface', 45, 'Звук настроен правильно', 'Попробуйте разные режимы: Стерео, Dolby Digital', true),

-- Steps for "Медленная загрузка каналов IPTV"
('step-004-01', 'prob-004', 'Проверка скорости интернета', 'Тестируем соединение', 'Проверьте скорость интернет-соединения в настройках сети приставки', 1, 'interface', 60, 'Скорость соединения достаточная (>10 Мбит/с)', 'Для HD каналов нужно минимум 8-10 Мбит/с', true),
('step-004-02', 'prob-004', 'Очистка кэша IPTV', 'Очищаем временные файлы', 'В настройках IPTV приложения найдите опцию очистки кэша и выполните её', 2, 'interface', 30, 'Кэш очищен успешно', 'После очистки кэша перезагрузите приставку', true),

-- Steps for "Каналы не загружаются IPTV"
('step-005-01', 'prob-005', 'Проверка интернет-подключения', 'Проверяем сеть', 'Убедитесь, что приставка подключена к интернету', 1, 'check', 30, 'Соединение с интернетом установлено', 'Попробуйте открыть браузер или другое сетевое приложение', true),
('step-005-02', 'prob-005', 'Проверка IPTV плейлиста', 'Обновляем список каналов', 'Проверьте актуальность URL плейлиста в настройках IPTV', 2, 'interface', 90, 'Плейлист загружается без ошибок', 'Свяжитесь с провайдером для получения актуального плейлиста', true),

-- Steps for "Слабый сигнал спутника"
('step-006-01', 'prob-006', 'Проверка направления антенны', 'Настраиваем антенну', 'Проверьте направление спутниковой антенны и при необходимости скорректируйте', 1, 'check', 300, 'Уровень сигнала увеличился', 'Для точной настройки лучше обратиться к специалисту', true),

-- Steps for "Пульт не работает"
('step-007-01', 'prob-007', 'Проверка батареек в пульте', 'Меняем батарейки', 'Замените батарейки в пульте дистанционного управления на новые', 1, 'remote', 60, 'Пульт начинает работать', 'Используйте качественные щелочные батарейки', true);

-- 7. Insert Remote Marks (button mappings for remotes)
INSERT INTO remote_marks (id, remote_id, name, description, type, shape, coordinates, color, button_code, function_name, is_active) VALUES
-- Android TV Remote Premium buttons
('rmk-and-001-power', 'rem-android-001', 'Кнопка питания', 'Включение/выключение приставки', 'button', 'circle', '{"x": 90, "y": 30, "radius": 12}'::jsonb, '#ff4444', 'POWER', 'power', true),
('rmk-and-001-home', 'rem-android-001', 'Домой', 'Переход на главный экран', 'button', 'circle', '{"x": 90, "y": 80, "radius": 10}'::jsonb, '#4444ff', 'HOME', 'home', true),
('rmk-and-001-voice', 'rem-android-001', 'Голосовой поиск', 'Активация голосового управления', 'button', 'rectangle', '{"x": 70, "y": 120, "width": 40, "height": 15}'::jsonb, '#44ff44', 'VOICE', 'voice_search', true),
('rmk-and-001-dpad', 'rem-android-001', 'D-Pad', 'Навигационные кнопки', 'dpad', 'circle', '{"x": 90, "y": 150, "radius": 25}'::jsonb, '#ffaa44', 'DPAD', 'navigation', true),
('rmk-and-001-ok', 'rem-android-001', 'ОК', 'Подтверждение выбора', 'button', 'circle', '{"x": 90, "y": 150, "radius": 8}'::jsonb, '#aa44ff', 'OK', 'select', true),

-- IPTV Remote buttons
('rmk-iptv-001-power', 'rem-iptv-001', 'Питание', 'Включение/выключение', 'button', 'rectangle', '{"x": 70, "y": 20, "width": 40, "height": 15}'::jsonb, '#ff4444', 'POWER', 'power', true),
('rmk-iptv-001-menu', 'rem-iptv-001', 'Меню', 'Главное меню', 'button', 'rectangle', '{"x": 70, "y": 50, "width": 40, "height": 15}'::jsonb, '#4444ff', 'MENU', 'menu', true),
('rmk-iptv-001-guide', 'rem-iptv-001', 'Телегид', 'Программа передач', 'button', 'rectangle', '{"x": 70, "y": 80, "width": 40, "height": 15}'::jsonb, '#44ff44', 'GUIDE', 'epg', true),
('rmk-iptv-001-chup', 'rem-iptv-001', 'Канал +', 'Следующий канал', 'button', 'rectangle', '{"x": 130, "y": 100, "width": 25, "height": 15}'::jsonb, '#ffaa44', 'CH_UP', 'channel_up', true),
('rmk-iptv-001-chdown', 'rem-iptv-001', 'Канал -', 'Предыдущий канал', 'button', 'rectangle', '{"x": 130, "y": 130, "width": 25, "height": 15}'::jsonb, '#ffaa44', 'CH_DOWN', 'channel_down', true);

-- 8. Insert TV Interface Marks (clickable areas on TV screens)
INSERT INTO tv_interface_marks (id, tv_interface_id, name, description, type, shape, coordinates, color, action_type, action_target, is_active) VALUES
-- Android TV Home Screen marks
('tim-and-home-001', 'tvi-android-home', 'Рекомендации', 'Блок рекомендованного контента', 'clickable', 'rectangle', '{"x": 100, "y": 200, "width": 800, "height": 300}'::jsonb, '#3b82f6', 'click', 'recommendations', true),
('tim-and-home-002', 'tvi-android-home', 'Приложения', 'Строка с приложениями', 'clickable', 'rectangle', '{"x": 100, "y": 550, "width": 1720, "height": 150}'::jsonb, '#10b981', 'click', 'apps_row', true),
('tim-and-home-003', 'tvi-android-home', 'Настройки', 'Иконка настроек в правом в��рхнем углу', 'clickable', 'circle', '{"x": 1800, "y": 100, "radius": 30}'::jsonb, '#6366f1', 'click', 'settings', true),
('tim-and-home-004', 'tvi-android-home', 'Поиск', 'Кнопка поиска', 'clickable', 'rectangle', '{"x": 100, "y": 100, "width": 200, "height": 60}'::jsonb, '#f59e0b', 'click', 'search', true),

-- Android TV Apps Screen marks
('tim-and-apps-001', 'tvi-android-apps', 'YouTube', 'Приложение YouTube', 'clickable', 'rectangle', '{"x": 200, "y": 200, "width": 150, "height": 150}'::jsonb, '#ef4444', 'click', 'youtube', true),
('tim-and-apps-002', 'tvi-android-apps', 'Netflix', 'Приложение Netflix', 'clickable', 'rectangle', '{"x": 400, "y": 200, "width": 150, "height": 150}'::jsonb, '#dc2626', 'click', 'netflix', true),
('tim-and-apps-003', 'tvi-android-apps', 'Kodi', 'Медиа плеер Kodi', 'clickable', 'rectangle', '{"x": 600, "y": 200, "width": 150, "height": 150}'::jsonb, '#059669', 'click', 'kodi', true),

-- Android TV Settings marks
('tim-and-set-001', 'tvi-android-settings', 'Сеть и интернет', 'Настройки сетевого подключения', 'clickable', 'rectangle', '{"x": 100, "y": 200, "width": 400, "height": 80}'::jsonb, '#3b82f6', 'click', 'network_settings', true),
('tim-and-set-002', 'tvi-android-settings', 'Дисплей и звук', 'Настройки видео и аудио', 'clickable', 'rectangle', '{"x": 100, "y": 300, "width": 400, "height": 80}'::jsonb, '#8b5cf6', 'click', 'display_sound', true),
('tim-and-set-003', 'tvi-android-settings', 'Приложения', 'Управление приложениями', 'clickable', 'rectangle', '{"x": 100, "y": 400, "width": 400, "height": 80}'::jsonb, '#10b981', 'click', 'apps_settings', true),

-- IPTV Channels marks
('tim-iptv-ch-001', 'tvi-iptv-channels', 'Список каналов', 'Основной список IPTV каналов', 'clickable', 'rectangle', '{"x": 50, "y": 150, "width": 400, "height": 800}'::jsonb, '#3b82f6', 'click', 'channel_list', true),
('tim-iptv-ch-002', 'tvi-iptv-channels', 'Программа передач', 'EPG для выбранного канала', 'clickable', 'rectangle', '{"x": 500, "y": 150, "width": 1370, "height": 800}'::jsonb, '#10b981', 'click', 'epg_info', true),

-- IPTV Guide marks
('tim-iptv-g-001', 'tvi-iptv-guide', 'Текущая программа', 'Информация о текущей передаче', 'highlight', 'rectangle', '{"x": 200, "y": 400, "width": 1520, "height": 60}'::jsonb, '#ef4444', 'hover', 'current_program', true),
('tim-iptv-g-002', 'tvi-iptv-guide', 'Следующая программа', 'Информация о следующей передаче', 'clickable', 'rectangle', '{"x": 200, "y": 480, "width": 1520, "height": 60}'::jsonb, '#f59e0b', 'click', 'next_program', true),

-- Error Screen marks
('tim-error-001', 'tvi-error-screen', 'Повторить попытку', 'Кнопка повторного подключения', 'clickable', 'rectangle', '{"x": 760, "y": 600, "width": 400, "height": 80}'::jsonb, '#ef4444', 'click', 'retry_connection', true),
('tim-error-002', 'tvi-error-screen', 'Настройки сети', 'Переход к сетевым настройкам', 'clickable', 'rectangle', '{"x": 760, "y": 720, "width": 400, "height": 80}'::jsonb, '#3b82f6', 'click', 'network_settings', true),

-- No Signal Screen marks
('tim-nosig-001', 'tvi-no-signal', 'Проверить подключение', 'Кнопка диагностики соединения', 'clickable', 'rectangle', '{"x": 760, "y": 550, "width": 400, "height": 80}'::jsonb, '#f59e0b', 'click', 'check_connection', true);

-- 9. Insert Site Settings
INSERT INTO site_settings (id, key, value, description, category, is_public) VALUES
('set-001', 'site_name', '"ANT Support"'::jsonb, 'Название сайта', 'general', true),
('set-002', 'site_description', '"Система диагностики ТВ приставок ANT"'::jsonb, 'Описание сайта', 'general', true),
('set-003', 'version', '"1.0.0"'::jsonb, 'Версия систе��ы', 'general', true),
('set-004', 'maintenance_mode', 'false'::jsonb, 'Режим обслуживания', 'system', false),
('set-005', 'debug_mode', 'false'::jsonb, 'Режим отладки', 'system', false),
('set-006', 'max_session_duration', '3600'::jsonb, 'Максимальная длительность сессии (сек)', 'diagnostics', false),
('set-007', 'default_step_timeout', '300'::jsonb, 'Таймаут шага по умолчанию (сек)', 'diagnostics', false),
('set-008', 'support_email', '"support@antsupport.com"'::jsonb, 'Email поддержки', 'contacts', true),
('set-009', 'company_name', '"ANT Technology"'::jsonb, 'Название компании', 'general', true),
('set-010', 'logo_url', '"/logo.png"'::jsonb, 'URL логотипа', 'branding', true);

-- Update sequences and statistics
SELECT setval(pg_get_serial_sequence('migrations', 'id'), 13);

-- Insert initial migration records
INSERT INTO migrations (filename) VALUES 
('012_reset_and_create_full_database.sql'),
('013_seed_full_database.sql');

-- Update usage statistics for some items
UPDATE remotes SET usage_count = floor(random() * 100 + 10), last_used = NOW() - interval '1 day' * floor(random() * 30) WHERE id IN ('rem-android-001', 'rem-iptv-001', 'rem-satellite-001');
UPDATE problems SET completed_count = floor(random() * 50 + 5) WHERE id IN ('prob-001', 'prob-002', 'prob-003', 'prob-007');
UPDATE users SET login_count = floor(random() * 20 + 1), last_login = NOW() - interval '1 hour' * floor(random() * 24) WHERE role IN ('admin', 'support', 'moderator');
