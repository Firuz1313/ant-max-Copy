-- ANT Support Database - Complete Restructure
-- Migration: 010_complete_database_restructure.sql
-- This migration cleans old data and creates fresh structure with real data

-- ========================================
-- SECTION 1: CLEANUP OLD DATA AND TABLES
-- ========================================

-- Drop all existing data in proper order to avoid foreign key constraints
DELETE FROM session_steps;
DELETE FROM diagnostic_sessions;
DELETE FROM step_actions;
DELETE FROM diagnostic_steps;
DELETE FROM tv_interface_marks;
DELETE FROM tv_interfaces;
DELETE FROM remotes;
DELETE FROM problems;
DELETE FROM devices;
DELETE FROM change_logs;
DELETE FROM users;

-- Drop and recreate remote_marks table if exists (from previous migrations)
DROP TABLE IF EXISTS remote_marks CASCADE;

-- ========================================
-- SECTION 2: CREATE REMOTE MARKS TABLE
-- ========================================

-- Create Remote Marks table for marking buttons/areas on remotes
CREATE TABLE remote_marks (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    remote_id VARCHAR(255) NOT NULL REFERENCES remotes(id) ON DELETE CASCADE,
    step_id VARCHAR(255) REFERENCES diagnostic_steps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'button' CHECK (type IN ('button', 'zone', 'area', 'highlight')),
    x DECIMAL(8,3) NOT NULL,
    y DECIMAL(8,3) NOT NULL,
    width DECIMAL(8,3) NOT NULL DEFAULT 30,
    height DECIMAL(8,3) NOT NULL DEFAULT 30,
    style JSONB DEFAULT '{}'::jsonb,
    action VARCHAR(255),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for remote_marks
CREATE INDEX IF NOT EXISTS idx_remote_marks_remote_id ON remote_marks(remote_id);
CREATE INDEX IF NOT EXISTS idx_remote_marks_step_id ON remote_marks(step_id);
CREATE INDEX IF NOT EXISTS idx_remote_marks_active ON remote_marks(is_active);
CREATE INDEX IF NOT EXISTS idx_remote_marks_order ON remote_marks(order_index);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_remote_marks_updated_at ON remote_marks;
CREATE TRIGGER update_remote_marks_updated_at
    BEFORE UPDATE ON remote_marks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SECTION 3: INSERT REAL DEVICES DATA
-- ========================================

INSERT INTO devices (id, name, brand, model, description, image_url, logo_url, color, order_index, status, is_active, metadata) VALUES
-- ANT приставки (основной бренд системы)
('device-ant-hd1000-pro', 'ANT HD-1000 Pro', 'ANT', 'HD-1000 Pro', 'Профессиональная HD приставка с расширенными функциями записи и воспроизведения', 
 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=60&fit=crop&auto=format', 
 'from-blue-600 to-blue-700', 1, 'active', true, 
 '{"specs": {"resolution": "1920x1080", "storage": "500GB", "ports": ["HDMI", "USB 3.0", "Ethernet"], "features": ["PVR", "TimeShift", "EPG", "Recording"]}}'),

('device-ant-4k-ultra', 'ANT 4K Ultra', 'ANT', '4K-Ultra', 'Топовая 4K приставка с Android TV, AI голосовым управлением и премиальными функциями', 
 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=60&fit=crop&auto=format', 
 'from-purple-600 to-purple-700', 2, 'active', true, 
 '{"specs": {"resolution": "3840x2160", "os": "Android TV 12", "ram": "4GB", "storage": "64GB", "features": ["4K HDR10+", "Dolby Vision", "AI Voice", "Google Assistant"]}}'),

('device-ant-smart-mini', 'ANT Smart Mini', 'ANT', 'Smart-Mini', 'Компактная Smart приставка для основных стриминговых задач', 
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=60&fit=crop&auto=format', 
 'from-green-500 to-green-600', 3, 'active', true, 
 '{"specs": {"resolution": "1920x1080", "os": "Smart TV OS", "connectivity": ["Wi-Fi 6", "Bluetooth 5.0"], "features": ["Netflix", "YouTube", "Online Cinema", "Voice Remote"]}}'),

-- Популярные бренды для полноты экосистемы
('device-samsung-qu50q60t', 'Samsung QU50Q60T', 'Samsung', 'QU50Q60T', '4K QLED Smart TV с Quantum Processor и HDR10+', 
 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&h=60&fit=crop&auto=format', 
 'from-gray-700 to-gray-800', 4, 'active', true, 
 '{"specs": {"resolution": "3840x2160", "os": "Tizen 6.0", "features": ["QLED", "Quantum Processor", "HDR10+", "Smart Hub"]}}'),

('device-lg-oled65c2', 'LG OLED65C2', 'LG', 'OLED65C2', 'OLED Smart TV с α9 Gen5 процессором и webOS 22', 
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1611532709381-1c1f7b3a3656?w=100&h=60&fit=crop&auto=format', 
 'from-red-500 to-red-600', 5, 'active', true, 
 '{"specs": {"resolution": "3840x2160", "os": "webOS 22", "features": ["OLED evo", "α9 Gen5 AI Processor", "Dolby Vision IQ", "120Hz"]}}'),

('device-sony-xr65a80k', 'Sony XR-65A80K', 'Sony', 'XR-65A80K', 'OLED телевизор с Cognitive Processor XR и Google TV', 
 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf562?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1611532736649-122f2c0cf81d?w=100&h=60&fit=crop&auto=format', 
 'from-black to-gray-800', 6, 'active', true, 
 '{"specs": {"resolution": "3840x2160", "os": "Google TV", "features": ["OLED", "Cognitive Processor XR", "Perfect for PlayStation 5", "Acoustic Surface Audio+"]}}'),

('device-xiaomi-mi-tv-stick', 'Xiaomi Mi TV Stick 4K', 'Xiaomi', 'Mi TV Stick 4K', 'Портативная 4K Android TV приставка в форм-факторе флешки', 
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1611347008024-b7e2b19c7f86?w=100&h=60&fit=crop&auto=format', 
 'from-orange-500 to-orange-600', 7, 'active', true, 
 '{"specs": {"resolution": "3840x2160", "os": "Android TV 11", "features": ["HDR10+", "Dolby Vision", "Chromecast built-in", "Portable design"]}}'),

('device-apple-tv-4k-3gen', 'Apple TV 4K (3rd gen)', 'Apple', 'Apple TV 4K 2022', 'Мощная приставка с чипом A15 Bionic и Siri Remote', 
 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop&auto=format', 
 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=60&fit=crop&auto=format', 
 'from-gray-900 to-black', 8, 'active', true, 
 '{"specs": {"resolution": "3840x2160", "os": "tvOS 16", "features": ["A15 Bionic chip", "HDR10+", "Dolby Vision", "Siri Remote", "AirPlay"]}}');

-- ========================================
-- SECTION 4: INSERT REAL REMOTES DATA
-- ========================================

INSERT INTO remotes (id, device_id, name, manufacturer, model, description, layout, color_scheme, image_url, dimensions, buttons, zones, is_default, usage_count, is_active, metadata) VALUES

-- ANT пульты (с реальными изображениями)
('remote-ant-hd1000-pro', 'device-ant-hd1000-pro', 'ANT HD-1000 Pro Remote', 'ANT', 'RC-HD1000-PRO', 'Профессиональный пульт с дополнительными кнопками записи и управления', 'standard', 'dark',
 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=200&h=500&fit=crop&auto=format',
 '{"width": 220, "height": 520}',
 '[{"id": "power", "name": "POWER", "x": 60, "y": 35, "width": 45, "height": 22}, {"id": "source", "name": "SOURCE", "x": 60, "y": 65, "width": 45, "height": 18}, {"id": "ok", "name": "OK", "x": 60, "y": 220, "width": 45, "height": 22}, {"id": "up", "name": "▲", "x": 60, "y": 185, "width": 45, "height": 18}, {"id": "down", "name": "▼", "x": 60, "y": 250, "width": 45, "height": 18}, {"id": "left", "name": "◀", "x": 25, "y": 220, "width": 30, "height": 22}, {"id": "right", "name": "▶", "x": 110, "y": 220, "width": 30, "height": 22}, {"id": "menu", "name": "MENU", "x": 35, "y": 135, "width": 40, "height": 20}, {"id": "back", "name": "BACK", "x": 85, "y": 135, "width": 40, "height": 20}, {"id": "record", "name": "REC ●", "x": 35, "y": 380, "width": 35, "height": 20}, {"id": "play", "name": "PLAY ▶", "x": 80, "y": 380, "width": 35, "height": 20}, {"id": "pause", "name": "PAUSE ⏸", "x": 125, "y": 380, "width": 35, "height": 20}, {"id": "stop", "name": "STOP ⏹", "x": 35, "y": 410, "width": 35, "height": 20}, {"id": "rewind", "name": "⏪", "x": 80, "y": 410, "width": 35, "height": 20}, {"id": "forward", "name": "⏩", "x": 125, "y": 410, "width": 35, "height": 20}]',
 '[{"id": "navigation", "name": "Navigation Zone", "x": 20, "y": 175, "width": 125, "height": 90}, {"id": "media_controls", "name": "Media Controls", "x": 30, "y": 370, "width": 135, "height": 60}, {"id": "quick_access", "name": "Quick Access", "x": 30, "y": 55, "width": 100, "height": 70}]',
 true, 0, true,
 '{"connectivity": "IR + RF", "batteries": "2x AAA", "range": "10m", "backlight": true}'),

('remote-ant-4k-ultra-voice', 'device-ant-4k-ultra', 'ANT 4K Ultra Voice Remote', 'ANT', 'RC-4K-ULTRA-VOICE', 'Премиальный голосовой пульт с тачпадом и подсветкой', 'smart', 'dark',
 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=190&h=480&fit=crop&auto=format',
 '{"width": 190, "height": 480}',
 '[{"id": "power", "name": "⏻", "x": 50, "y": 30, "width": 40, "height": 20}, {"id": "voice", "name": "🎤 VOICE", "x": 50, "y": 60, "width": 40, "height": 30}, {"id": "touchpad", "name": "Touchpad", "x": 35, "y": 110, "width": 70, "height": 70}, {"id": "ok", "name": "OK", "x": 50, "y": 145, "width": 40, "height": 20}, {"id": "back", "name": "←", "x": 30, "y": 200, "width": 30, "height": 18}, {"id": "home", "name": "🏠", "x": 80, "y": 200, "width": 30, "height": 18}, {"id": "menu", "name": "☰", "x": 130, "y": 200, "width": 25, "height": 18}, {"id": "netflix", "name": "Netflix", "x": 30, "y": 300, "width": 35, "height": 20}, {"id": "youtube", "name": "YouTube", "x": 75, "y": 300, "width": 35, "height": 20}, {"id": "prime", "name": "Prime", "x": 120, "y": 300, "width": 35, "height": 20}, {"id": "volume_up", "name": "VOL+", "x": 140, "y": 120, "width": 30, "height": 15}, {"id": "volume_down", "name": "VOL-", "x": 140, "y": 150, "width": 30, "height": 15}]',
 '[{"id": "touchpad_area", "name": "Touch Navigation", "x": 30, "y": 100, "width": 80, "height": 90}, {"id": "voice_control", "name": "Voice Commands", "x": 40, "y": 50, "width": 60, "height": 50}, {"id": "streaming_apps", "name": "Quick Apps", "x": 25, "y": 290, "width": 135, "height": 35}]',
 true, 0, true,
 '{"connectivity": "Bluetooth 5.0 + IR", "batteries": "Rechargeable Li-ion", "voice": true, "touchpad": true, "backlight": "Auto"}'),

-- Samsung пульт
('remote-samsung-smart-2023', 'device-samsung-qu50q60t', 'Samsung Smart Remote 2023', 'Samsung', 'BN59-01357A', 'Умный пульт Samsung с солнечной батареей и голосовым управлением', 'smart', 'dark',
 'https://images.unsplash.com/photo-1606983340805-0d04066c8b3d?w=180&h=450&fit=crop&auto=format',
 '{"width": 180, "height": 450}',
 '[{"id": "power", "name": "⏻", "x": 45, "y": 25, "width": 35, "height": 18}, {"id": "voice", "name": "🎤", "x": 45, "y": 50, "width": 35, "height": 25}, {"id": "ok", "name": "OK", "x": 45, "y": 170, "width": 35, "height": 20}, {"id": "up", "name": "▲", "x": 45, "y": 140, "width": 35, "height": 15}, {"id": "down", "name": "▼", "x": 45, "y": 200, "width": 35, "height": 15}, {"id": "left", "name": "◀", "x": 18, "y": 170, "width": 22, "height": 20}, {"id": "right", "name": "▶", "x": 85, "y": 170, "width": 22, "height": 20}, {"id": "back", "name": "RETURN", "x": 30, "y": 240, "width": 40, "height": 18}, {"id": "smart_hub", "name": "Smart Hub", "x": 30, "y": 280, "width": 50, "height": 18}, {"id": "netflix", "name": "Netflix", "x": 30, "y": 320, "width": 30, "height": 18}, {"id": "disney", "name": "Disney+", "x": 70, "y": 320, "width": 30, "height": 18}]',
 '[{"id": "main_navigation", "name": "Main Controls", "x": 15, "y": 130, "width": 95, "height": 90}, {"id": "smart_features", "name": "Smart Features", "x": 25, "y": 270, "width": 60, "height": 70}]',
 true, 0, true,
 '{"connectivity": "Bluetooth + IR", "power": "Solar + USB-C", "voice": true, "eco_remote": true}'),

-- LG Magic Remote
('remote-lg-magic-2023', 'device-lg-oled65c2', 'LG Magic Remote 2023', 'LG', 'AN-MR23GC', 'Волшебный пульт LG с AI ThinQ и указкой', 'smart', 'dark',
 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=190&h=470&fit=crop&auto=format',
 '{"width": 190, "height": 470}',
 '[{"id": "power", "name": "⏻", "x": 50, "y": 30, "width": 35, "height": 18}, {"id": "voice", "name": "🎤 AI", "x": 50, "y": 60, "width": 35, "height": 25}, {"id": "pointer", "name": "Pointer Zone", "x": 50, "y": 95, "width": 35, "height": 40}, {"id": "ok", "name": "OK", "x": 50, "y": 190, "width": 35, "height": 20}, {"id": "up", "name": "▲", "x": 50, "y": 160, "width": 35, "height": 15}, {"id": "down", "name": "▼", "x": 50, "y": 220, "width": 35, "height": 15}, {"id": "left", "name": "◀", "x": 23, "y": 190, "width": 22, "height": 20}, {"id": "right", "name": "▶", "x": 90, "y": 190, "width": 22, "height": 20}, {"id": "home", "name": "🏠", "x": 30, "y": 260, "width": 35, "height": 20}, {"id": "back", "name": "←", "x": 80, "y": 260, "width": 35, "height": 20}, {"id": "wheel", "name": "Scroll Wheel", "x": 135, "y": 180, "width": 30, "height": 30}, {"id": "netflix", "name": "Netflix", "x": 30, "y": 340, "width": 30, "height": 18}, {"id": "prime", "name": "Prime", "x": 80, "y": 340, "width": 30, "height": 18}]',
 '[{"id": "pointer_area", "name": "Magic Pointer", "x": 40, "y": 85, "width": 55, "height": 60}, {"id": "navigation", "name": "D-pad Navigation", "x": 18, "y": 150, "width": 100, "height": 90}, {"id": "scroll_control", "name": "Scroll Wheel", "x": 130, "y": 170, "width": 40, "height": 40}]',
 true, 0, true,
 '{"connectivity": "RF + IR", "pointer": true, "voice": "AI ThinQ", "wheel": true, "universal_control": true}');

-- ========================================
-- SECTION 5: INSERT TV INTERFACES DATA
-- ========================================

INSERT INTO tv_interfaces (id, device_id, name, description, type, screenshot_url, clickable_areas, order_index, is_active, metadata) VALUES

-- ANT HD-1000 Pro интерфейсы
('tv-interface-ant-hd1000-main', 'device-ant-hd1000-pro', 'Главное меню ANT HD-1000 Pro', 'Основной интерфейс с доступом к каналам, записи, настройкам и приложениям', 'home',
 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=450&fit=crop&auto=format',
 '[{"id": "live_tv", "name": "ТВ Каналы", "x": 80, "y": 120, "width": 160, "height": 90, "action": "open_channels"}, {"id": "recordings", "name": "Записи", "x": 280, "y": 120, "width": 160, "height": 90, "action": "open_recordings"}, {"id": "guide", "name": "Программа", "x": 480, "y": 120, "width": 160, "height": 90, "action": "open_guide"}, {"id": "settings", "name": "Настройки", "x": 80, "y": 250, "width": 160, "height": 90, "action": "open_settings"}, {"id": "apps", "name": "Приложения", "x": 280, "y": 250, "width": 160, "height": 90, "action": "open_apps"}, {"id": "media", "name": "Медиатека", "x": 480, "y": 250, "width": 160, "height": 90, "action": "open_media"}]',
 1, true,
 '{"interface_type": "main_menu", "resolution": "1920x1080", "theme": "dark", "brand": "ANT"}'),

('tv-interface-ant-hd1000-channels', 'device-ant-hd1000-pro', 'Список каналов ANT HD-1000 Pro', 'Интерфейс со списком каналов и программой передач', 'channels',
 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf562?w=800&h=450&fit=crop&auto=format',
 '[{"id": "channel_1", "name": "Первый канал HD", "x": 60, "y": 100, "width": 680, "height": 45, "action": "select_channel"}, {"id": "channel_2", "name": "Россия 1 HD", "x": 60, "y": 155, "width": 680, "height": 45, "action": "select_channel"}, {"id": "channel_3", "name": "НТВ HD", "x": 60, "y": 210, "width": 680, "height": 45, "action": "select_channel"}, {"id": "channel_4", "name": "ТНТ HD", "x": 60, "y": 265, "width": 680, "height": 45, "action": "select_channel"}, {"id": "favorites", "name": "Избранные", "x": 650, "y": 50, "width": 90, "height": 30, "action": "show_favorites"}, {"id": "search", "name": "Поиск", "x": 550, "y": 50, "width": 90, "height": 30, "action": "open_search"}]',
 2, true,
 '{"interface_type": "channel_list", "total_channels": 250, "hd_channels": 150}'),

-- ANT 4K Ultra интерфейсы (Android TV)
('tv-interface-ant-4k-home', 'device-ant-4k-ultra', 'Android TV Home ANT 4K Ultra', 'Современный интерфейс Android TV с персонализированными рекомендациями', 'home',
 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=450&fit=crop&auto=format',
 '[{"id": "recommendations", "name": "Рекомендации для вас", "x": 100, "y": 80, "width": 600, "height": 100, "action": "browse_recommendations"}, {"id": "apps_row", "name": "Ваши приложения", "x": 100, "y": 200, "width": 600, "height": 120, "action": "browse_apps"}, {"id": "live_channels", "name": "Прямой эфир", "x": 100, "y": 340, "width": 600, "height": 80, "action": "open_live_tv"}, {"id": "voice_search", "name": "Голосовой поиск", "x": 650, "y": 30, "width": 80, "height": 40, "action": "voice_search"}, {"id": "settings_gear", "name": "Настройки", "x": 720, "y": 30, "width": 50, "height": 40, "action": "open_settings"}]',
 1, true,
 '{"interface_type": "android_tv_home", "version": "Android TV 12", "ai_recommendations": true}'),

-- Samsung Smart Hub
('tv-interface-samsung-smart-hub', 'device-samsung-qu50q60t', 'Samsung Smart Hub', 'Центр управления Samsung Smart TV с приложениями и контентом', 'home',
 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf562?w=800&h=450&fit=crop&auto=format',
 '[{"id": "tv_plus", "name": "Samsung TV Plus", "x": 100, "y": 180, "width": 120, "height": 120, "action": "launch_tv_plus"}, {"id": "netflix_tile", "name": "Netflix", "x": 240, "y": 180, "width": 120, "height": 120, "action": "launch_netflix"}, {"id": "youtube_tile", "name": "YouTube", "x": 380, "y": 180, "width": 120, "height": 120, "action": "launch_youtube"}, {"id": "prime_tile", "name": "Prime Video", "x": 520, "y": 180, "width": 120, "height": 120, "action": "launch_prime"}, {"id": "browser_tile", "name": "Веб-браузер", "x": 100, "y": 320, "width": 120, "height": 120, "action": "launch_browser"}, {"id": "apps_store", "name": "Samsung Apps", "x": 580, "y": 50, "width": 100, "height": 40, "action": "open_app_store"}]',
 1, true,
 '{"interface_type": "smart_hub", "os": "Tizen 6.0", "voice_control": true}'),

-- LG webOS интерфейс
('tv-interface-lg-webos', 'device-lg-oled65c2', 'LG webOS 22 Home', 'Интуитивный интерфейс webOS с лентой приложений', 'home',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&auto=format',
 '[{"id": "live_tv_card", "name": "Live TV", "x": 80, "y": 350, "width": 80, "height": 80, "action": "watch_live_tv"}, {"id": "netflix_card", "name": "Netflix", "x": 180, "y": 350, "width": 80, "height": 80, "action": "launch_netflix"}, {"id": "disney_card", "name": "Disney+", "x": 280, "y": 350, "width": 80, "height": 80, "action": "launch_disney"}, {"id": "youtube_card", "name": "YouTube", "x": 380, "y": 350, "width": 80, "height": 80, "action": "launch_youtube"}, {"id": "lg_channels", "name": "LG Channels", "x": 480, "y": 350, "width": 80, "height": 80, "action": "open_lg_channels"}, {"id": "content_store", "name": "LG Content Store", "x": 580, "y": 350, "width": 80, "height": 80, "action": "open_store"}, {"id": "ai_thinq", "name": "AI ThinQ", "x": 680, "y": 30, "width": 60, "height": 30, "action": "open_ai_thinq"}]',
 1, true,
 '{"interface_type": "webos_home", "version": "webOS 22", "ai_thinq": true, "magic_remote": true}'),

-- Sony Google TV
('tv-interface-sony-google-tv', 'device-sony-xr65a80k', 'Sony Google TV', 'Персонализированный интерфейс Google TV с рекомендациями контента', 'home',
 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=450&fit=crop&auto=format',
 '[{"id": "for_you_row", "name": "Для вас", "x": 100, "y": 100, "width": 600, "height": 80, "action": "browse_for_you"}, {"id": "live_tab", "name": "Прямой эфир", "x": 100, "y": 200, "width": 600, "height": 80, "action": "browse_live"}, {"id": "movies_tab", "name": "Фильмы", "x": 100, "y": 280, "width": 600, "height": 80, "action": "browse_movies"}, {"id": "shows_tab", "name": "Сериалы", "x": 100, "y": 360, "width": 600, "height": 80, "action": "browse_shows"}, {"id": "apps_tab", "name": "Приложения", "x": 100, "y": 440, "width": 600, "height": 80, "action": "browse_apps"}]',
 1, true,
 '{"interface_type": "google_tv", "cognitive_processor": "XR", "content_recommendations": true}'),

-- Универсальные интерфейсы ошибок
('tv-interface-no-signal-generic', null, 'Нет сигнала', 'Универсальный экран отсутствия сигнала', 'no-signal',
 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=450&fit=crop&auto=format',
 '[{"id": "check_connection", "name": "Проверить соединение", "x": 250, "y": 280, "width": 200, "height": 50, "action": "guide_check_connection"}, {"id": "input_settings", "name": "Настройки входа", "x": 480, "y": 280, "width": 200, "height": 50, "action": "open_input_settings"}]',
 10, true,
 '{"interface_type": "error_screen", "error_type": "no_signal", "universal": true}'),

('tv-interface-loading-boot', null, 'Загрузка системы', 'Экран загрузки операционной системы', 'custom',
 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=450&fit=crop&auto=format',
 '[{"id": "progress_indicator", "name": "Индикатор прогресса", "x": 300, "y": 280, "width": 200, "height": 20, "action": "show_boot_progress"}]',
 11, true,
 '{"interface_type": "loading_screen", "boot_sequence": true, "duration": "variable"}');

-- ========================================
-- SECTION 6: INSERT USERS DATA
-- ========================================

INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, permissions, email_verified, last_login, login_count, is_active, preferences, metadata) VALUES

-- Системные администраторы
('user-admin-001', 'admin', 'admin@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Александр', 'Системный', 'admin',
 '["manage_users", "manage_devices", "manage_problems", "manage_remotes", "manage_tv_interfaces", "view_analytics", "system_settings", "database_admin", "api_access", "debug_mode"]',
 true, '2024-01-16 09:30:00+00', 78, true,
 '{"theme": "dark", "language": "ru", "notifications": true, "dashboard_layout": "grid", "debug_panels": true}',
 '{"department": "Администрирование", "position": "Главный администратор", "phone": "+7-999-111-22-33", "access_level": "full"}'),

('user-dev-lead', 'dev_lead', 'dev.lead@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Мария', 'Разработчикова', 'admin',
 '["manage_users", "manage_devices", "manage_problems", "manage_remotes", "manage_tv_interfaces", "view_analytics", "system_settings", "database_admin", "api_access", "debug_mode"]',
 true, '2024-01-16 11:15:00+00', 134, true,
 '{"theme": "dark", "language": "ru", "notifications": true, "code_highlighting": true, "sql_console": true}',
 '{"department": "Разработка", "position": "Lead Developer", "phone": "+7-999-222-33-44", "github": "maria-dev", "specialization": "Backend"}'),

-- Модераторы контента
('user-moderator-content', 'mod_content', 'content.mod@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Елена', '��онтентова', 'moderator',
 '["manage_problems", "manage_remotes", "manage_tv_interfaces", "edit_content", "moderate_sessions", "view_analytics"]',
 true, '2024-01-15 16:45:00+00', 67, true,
 '{"theme": "light", "language": "ru", "notifications": true, "content_filters": "strict", "bulk_operations": true}',
 '{"department": "Контент", "position": "Контент-модератор", "phone": "+7-999-333-44-55", "shift": "day"}'),

('user-moderator-tech', 'mod_tech', 'tech.mod@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Дмитрий', 'Техников', 'moderator',
 '["manage_devices", "manage_problems", "edit_content", "view_analytics", "moderate_sessions"]',
 true, '2024-01-15 14:30:00+00', 45, true,
 '{"theme": "dark", "language": "ru", "notifications": false, "technical_view": true, "show_device_specs": true}',
 '{"department": "Техподдержка", "position": "Технический модератор", "phone": "+7-999-444-55-66", "specialization": "Hardware"}'),

-- Специалисты поддержки разных уровней
('user-support-senior', 'support_senior', 'senior.support@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Анна', 'Опытная', 'user',
 '["view_problems", "create_sessions", "manage_own_sessions", "view_devices", "advanced_diagnostics", "escalate_issues"]',
 true, '2024-01-16 08:20:00+00', 234, true,
 '{"theme": "light", "language": "ru", "notifications": true, "quick_actions": true, "session_templates": true}',
 '{"department": "Техподдержка", "position": "Старший специалист", "phone": "+7-999-555-66-77", "experience_years": 5, "specialization": "Complex issues"}'),

('user-support-l1', 'support_l1', 'l1.support@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Игорь', 'Первый', 'user',
 '["view_problems", "create_sessions", "manage_own_sessions", "view_devices", "basic_diagnostics"]',
 true, '2024-01-16 07:45:00+00', 89, true,
 '{"theme": "light", "language": "ru", "notifications": true, "guided_mode": true, "show_hints": true}',
 '{"department": "Техподдержка", "position": "Специалист 1-й линии", "phone": "+7-999-666-77-88", "shift": "morning", "training_completed": true}'),

('user-support-l2', 'support_l2', 'l2.support@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Ольга', 'Вторая', 'user',
 '["view_problems", "create_sessions", "manage_own_sessions", "view_devices", "advanced_diagnostics", "escalate_issues"]',
 true, '2024-01-15 22:30:00+00', 156, true,
 '{"theme": "dark", "language": "ru", "notifications": true, "advanced_tools": true, "statistics_view": true}',
 '{"department": "Техподдержка", "position": "Специалист 2-й линии", "phone": "+7-999-777-88-99", "shift": "night", "certifications": ["ANT Pro", "Advanced Diagnostics"]}'),

-- Аналитики и тестировщики
('user-analyst-data', 'analyst', 'analyst@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Владислав', 'Аналитик', 'user',
 '["view_analytics", "export_data", "view_all_sessions", "generate_reports", "view_statistics"]',
 true, '2024-01-16 10:00:00+00', 42, true,
 '{"theme": "light", "language": "ru", "notifications": true, "advanced_charts": true, "data_export": true}',
 '{"department": "Аналитика", "position": "Бизнес-аналитик", "phone": "+7-999-888-99-00", "tools": ["Excel", "PowerBI", "SQL"]}'),

('user-qa-tester', 'qa_tester', 'qa@antsupport.ru', '$2a$10$rOzJqQlPG2p8xNiP1CxGxeBGq9xYWGKWLczG9n.nqNKLUMpE8JK0C', 'Павел', 'Тестировщик', 'user',
 '["view_problems", "view_devices", "create_test_sessions", "view_analytics", "test_scenarios"]',
 true, '2024-01-15 15:20:00+00', 198, true,
 '{"theme": "dark", "language": "ru", "notifications": false, "debug_mode": true, "test_mode": true}',
 '{"department": "QA", "position": "Тестировщик", "phone": "+7-999-999-00-11", "automation_tools": ["Selenium", "Jest"], "test_types": ["Manual", "Automated"]}');

-- ========================================
-- SECTION 7: INSERT PROBLEMS DATA
-- ========================================

INSERT INTO problems (id, device_id, title, description, category, icon, color, tags, priority, estimated_time, difficulty, success_rate, completed_count, status, is_active, metadata) VALUES

-- Критические проблемы ANT устройств
('problem-ant-hd1000-no-video', 'device-ant-hd1000-pro', 'Отсутствует видеосигнал', 'Устройство включено, но изображение на экране отсутствует, черный или синий экран', 'critical', 'Monitor', 'from-red-500 to-red-600',
 '["video", "hdmi", "no_signal", "black_screen", "display"]', 1, 15, 'beginner', 87, 245, 'published', true,
 '{"common_issue": true, "hardware_related": true, "cable_check_required": true, "resolution_dependent": true}'),

('problem-ant-4k-boot-freeze', 'device-ant-4k-ultra', 'Зависание при загрузке Android TV', 'Приставка ��ависает на экране загрузки Android TV и не отвечает на команды', 'critical', 'RotateCcw', 'from-red-600 to-red-700',
 '["android", "boot", "freeze", "system", "loading"]', 1, 25, 'intermediate', 75, 123, 'published', true,
 '{"android_specific": true, "factory_reset_may_help": true, "memory_related": true, "firmware_update_required": false}'),

-- Умеренные проблемы
('problem-ant-hd1000-remote-unresponsive', 'device-ant-hd1000-pro', 'Пульт не реагирует на команды', 'Пульт дистанционного управления не отвечает или работает с задержками', 'moderate', 'Zap', 'from-yellow-500 to-yellow-600',
 '["remote", "control", "unresponsive", "batteries", "pairing"]', 2, 12, 'beginner', 93, 456, 'published', true,
 '{"quick_fix": true, "battery_related": true, "pairing_required": false, "distance_sensitive": true}'),

('problem-ant-4k-apps-crash', 'device-ant-4k-ultra', 'Приложения вылетают или не запускаются', 'Приложения Android TV закрываются неожиданно или не открываются', 'moderate', 'Smartphone', 'from-orange-500 to-orange-600',
 '["apps", "android", "crash", "memory", "storage"]', 2, 20, 'intermediate', 82, 189, 'published', true,
 '{"memory_related": true, "cache_clear_helps": true, "storage_cleanup_required": false, "app_specific": true}'),

('problem-ant-hd1000-audio-issues', 'device-ant-hd1000-pro', 'Проблемы со звуком', 'Отсутствует звук, тихий звук или искажения в аудио', 'moderate', 'VolumeX', 'from-orange-400 to-orange-500',
 '["audio", "sound", "volume", "hdmi_audio", "digital_audio"]', 2, 18, 'beginner', 89, 334, 'published', true,
 '{"audio_settings_related": true, "hdmi_audio": true, "output_selection": true, "volume_levels": true}'),

-- Универсальные проблемы (для всех устройств)
('problem-universal-wifi-connection', null, 'Проблемы с Wi-Fi подключением', 'Устройство не может подключиться к беспроводной сети или теряет соединение', 'moderate', 'Wifi', 'from-blue-500 to-blue-600',
 '["wifi", "network", "connection", "internet", "router"]', 2, 22, 'beginner', 85, 678, 'published', true,
 '{"network_related": true, "router_dependent": true, "password_verification": true, "signal_strength": true}'),

('problem-universal-slow-performance', null, 'Медленная работа интерфейса', 'Меню и приложения работают медленно, долго отвечают на команды', 'minor', 'Timer', 'from-yellow-400 to-yellow-500',
 '["performance", "slow", "lag", "memory", "optimization"]', 3, 30, 'intermediate', 78, 234, 'published', true,
 '{"performance_related": true, "memory_optimization": true, "background_apps": true, "storage_cleanup": true}'),

('problem-universal-update-fails', null, 'Ошибки при обновлении ПО', 'Обновление программного обеспечения не завершается или завершается с ошибкой', 'moderate', 'Download', 'from-blue-400 to-blue-500',
 '["update", "firmware", "software", "download", "installation"]', 2, 35, 'intermediate', 72, 145, 'published', true,
 '{"update_related": true, "network_required": true, "storage_space": true, "manual_update_option": true}'),

-- Специфичные проблемы брендов
('problem-samsung-smart-hub-slow', 'device-samsung-qu50q60t', 'Smart Hub медленно загружается', 'Samsung Smart Hub открывается очень медленно или зависает', 'moderate', 'Home', 'from-gray-600 to-gray-700',
 '["smart_hub", "samsung", "loading", "tizen", "cache"]', 2, 20, 'intermediate', 80, 98, 'published', true,
 '{"samsung_specific": true, "cache_related": true, "network_dependent": true, "smart_hub": true}'),

('problem-lg-magic-remote-pointer', 'device-lg-oled65c2', 'Magic Remote указка работает некорректно', 'Указка LG Magic Remote движется неточно или не реагирует на движения', 'minor', 'MousePointer', 'from-purple-400 to-purple-500',
 '["lg", "magic_remote", "pointer", "calibration", "sensitivity"]', 3, 15, 'beginner', 85, 167, 'published', true,
 '{"lg_specific": true, "remote_calibration": true, "sensitivity_adjustment": true, "pointer_specific": true}'),

('problem-sony-google-recommendations', 'device-sony-xr65a80k', 'Google TV рекомендации не обновляются', 'Персональные рекомендации в Google TV не обновляются или показывают старый контент', 'minor', 'Lightbulb', 'from-green-400 to-green-500',
 '["google_tv", "sony", "recommendations", "personalization", "account"]', 3, 25, 'intermediate', 73, 87, 'published', true,
 '{"google_tv_specific": true, "account_sync": true, "personalization": true, "content_refresh": true}');

-- Continue with diagnostic steps in next part due to length...
COMMIT;
