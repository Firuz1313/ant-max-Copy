-- Migration 001: Initial table creation
-- Creates all primary tables for ANT Support system

BEGIN;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    logo_url VARCHAR(500),
    color VARCHAR(100) NOT NULL DEFAULT 'from-gray-500 to-gray-600',
    order_index INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Create problems table
CREATE TABLE IF NOT EXISTS problems (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (category IN ('critical', 'moderate', 'minor', 'other')),
    icon VARCHAR(100) NOT NULL DEFAULT 'HelpCircle',
    color VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    tags JSONB DEFAULT '[]'::jsonb,
    priority INTEGER NOT NULL DEFAULT 1,
    estimated_time INTEGER NOT NULL DEFAULT 5, -- в минутах
    difficulty VARCHAR(50) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    success_rate INTEGER NOT NULL DEFAULT 100 CHECK (success_rate >= 0 AND success_rate <= 100),
    completed_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Create remotes table
CREATE TABLE IF NOT EXISTS remotes (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL, -- NULL = универсальный пульт
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    description TEXT,
    layout VARCHAR(50) NOT NULL DEFAULT 'standard' CHECK (layout IN ('standard', 'compact', 'smart', 'custom')),
    color_scheme VARCHAR(50) NOT NULL DEFAULT 'dark',
    image_url VARCHAR(500),
    image_data TEXT, -- base64 encoded image
    svg_data TEXT,
    dimensions JSONB NOT NULL DEFAULT '{"width": 200, "height": 500}'::jsonb,
    buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
    zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Create tv_interfaces table
CREATE TABLE IF NOT EXISTS tv_interfaces (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (type IN ('home', 'settings', 'channels', 'apps', 'guide', 'no-signal', 'error', 'custom')),
    screenshot_url VARCHAR(500),
    screenshot_data TEXT, -- base64 encoded image
    svg_overlay TEXT,
    clickable_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
    highlight_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
    responsive BOOLEAN NOT NULL DEFAULT false,
    breakpoints JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Create tv_interface_marks table
CREATE TABLE IF NOT EXISTS tv_interface_marks (
    id VARCHAR(255) PRIMARY KEY,
    tv_interface_id VARCHAR(255) NOT NULL REFERENCES tv_interfaces(id) ON DELETE CASCADE,
    step_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mark_type VARCHAR(50) NOT NULL DEFAULT 'point' CHECK (mark_type IN ('point', 'zone', 'area')),
    shape VARCHAR(50) NOT NULL DEFAULT 'circle' CHECK (shape IN ('circle', 'rectangle', 'polygon', 'ellipse')),
    position JSONB NOT NULL,
    size JSONB DEFAULT '{"width": 20, "height": 20}'::jsonb,
    coordinates JSONB,
    color VARCHAR(50) DEFAULT '#3b82f6',
    background_color VARCHAR(50),
    border_color VARCHAR(50) DEFAULT '#3b82f6',
    border_width INTEGER DEFAULT 2,
    opacity DECIMAL(3,2) DEFAULT 0.8,
    is_clickable BOOLEAN DEFAULT true,
    is_highlightable BOOLEAN DEFAULT true,
    click_action VARCHAR(255),
    hover_action VARCHAR(255),
    action_value VARCHAR(255),
    action_description TEXT,
    expected_result TEXT,
    hint_text TEXT,
    tooltip_text TEXT,
    warning_text TEXT,
    animation VARCHAR(50) DEFAULT 'none' CHECK (animation IN ('pulse', 'glow', 'bounce', 'shake', 'fade', 'blink', 'none')),
    animation_duration INTEGER DEFAULT 1000,
    animation_delay INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Create diagnostic_steps table
CREATE TABLE IF NOT EXISTS diagnostic_steps (
    id VARCHAR(255) PRIMARY KEY,
    problem_id VARCHAR(255) NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instruction TEXT NOT NULL,
    estimated_time INTEGER NOT NULL DEFAULT 30, -- в секундах

    -- Визуальные элементы
    highlight_remote_button VARCHAR(255),
    highlight_tv_area VARCHAR(255),
    tv_interface_id VARCHAR(255) REFERENCES tv_interfaces(id) ON DELETE SET NULL,

    -- Интерактивные элементы
    remote_id VARCHAR(255) REFERENCES remotes(id) ON DELETE SET NULL,
    action_type VARCHAR(50) CHECK (action_type IN ('button_press', 'navigation', 'wait', 'check', 'input', 'selection', 'confirmation', 'custom')),
    button_position JSONB, -- {"x": number, "y": number}
    svg_path TEXT,
    zone_id VARCHAR(255),

    -- Логика и валидация
    required_action VARCHAR(500),
    validation_rules JSONB DEFAULT '[]'::jsonb,
    success_condition VARCHAR(500),
    failure_actions JSONB DEFAULT '[]'::jsonb,

    -- Контен��
    hint TEXT,
    warning_text TEXT,
    success_text TEXT,
    media JSONB DEFAULT '[]'::jsonb,

    -- Логика ветвления
    next_step_conditions JSONB DEFAULT '[]'::jsonb,

    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(problem_id, step_number)
);

-- 7. Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
    permissions JSONB DEFAULT '[]'::jsonb,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    preferences JSONB DEFAULT '{}'::jsonb,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. Create diagnostic_sessions table
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL REFERENCES devices(id),
    problem_id VARCHAR(255) NOT NULL REFERENCES problems(id),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL, -- для группировки связанных сессий
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    completed_steps INTEGER NOT NULL DEFAULT 0,
    total_steps INTEGER NOT NULL DEFAULT 0,
    success BOOLEAN,
    duration INTEGER, -- в секундах
    error_steps JSONB DEFAULT '[]'::jsonb,
    feedback JSONB, -- рейтинг, комментарии
    user_agent TEXT,
    ip_address INET,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. Create session_steps table
CREATE TABLE IF NOT EXISTS session_steps (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    step_id VARCHAR(255) NOT NULL REFERENCES diagnostic_steps(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN NOT NULL DEFAULT false,
    result VARCHAR(50) CHECK (result IN ('success', 'failure', 'skipped', 'timeout')),
    time_spent INTEGER, -- в секундах
    errors JSONB DEFAULT '[]'::jsonb,
    user_input JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. Create step_actions table
CREATE TABLE IF NOT EXISTS step_actions (
    id VARCHAR(255) PRIMARY KEY,
    step_id VARCHAR(255) NOT NULL REFERENCES diagnostic_steps(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('button_press', 'navigation', 'wait', 'check', 'input', 'selection', 'confirmation', 'custom')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    svg_path TEXT,
    icon_url VARCHAR(500),
    color VARCHAR(100) NOT NULL DEFAULT '#000000',
    animation VARCHAR(50) CHECK (animation IN ('pulse', 'glow', 'bounce', 'shake', 'fade', 'highlight', 'none')),
    target_element VARCHAR(255),
    coordinates JSONB, -- {"x": number, "y": number}
    gesture VARCHAR(50) CHECK (gesture IN ('click', 'double_click', 'long_press', 'swipe_left', 'swipe_right', 'swipe_up', 'swipe_down')),
    expected_result TEXT,
    timeout INTEGER,
    retry_count INTEGER DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 11. Create change_logs table
CREATE TABLE IF NOT EXISTS change_logs (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('device', 'problem', 'step', 'remote', 'tv_interface', 'tv_interface_mark', 'user', 'session')),
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish', 'archive')),
    changes JSONB NOT NULL,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(50),
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 12. Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'settings',
    site_name VARCHAR(255) NOT NULL DEFAULT 'ANT Support',
    site_description TEXT,
    default_language VARCHAR(10) NOT NULL DEFAULT 'ru',
    supported_languages JSONB DEFAULT '["ru", "tj", "uz"]'::jsonb,
    theme VARCHAR(50) NOT NULL DEFAULT 'professional',
    primary_color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
    accent_color VARCHAR(50) NOT NULL DEFAULT '#10b981',
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),

    -- Возможности
    enable_analytics BOOLEAN NOT NULL DEFAULT true,
    enable_feedback BOOLEAN NOT NULL DEFAULT true,
    enable_offline_mode BOOLEAN NOT NULL DEFAULT false,
    enable_notifications BOOLEAN NOT NULL DEFAULT true,

    -- Лимиты и квоты
    max_steps_per_problem INTEGER NOT NULL DEFAULT 20,
    max_media_size INTEGER NOT NULL DEFAULT 10, -- MB
    session_timeout INTEGER NOT NULL DEFAULT 30, -- минуты

    -- Расширенные настройки
    api_settings JSONB DEFAULT '{}'::jsonb,
    email_settings JSONB DEFAULT '{}'::jsonb,
    storage_settings JSONB DEFAULT '{}'::jsonb,

    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint for step_id in tv_interface_marks
ALTER TABLE tv_interface_marks 
ADD CONSTRAINT fk_tv_interface_marks_step_id 
FOREIGN KEY (step_id) REFERENCES diagnostic_steps(id) ON DELETE SET NULL;

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_remotes_updated_at BEFORE UPDATE ON remotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tv_interfaces_updated_at BEFORE UPDATE ON tv_interfaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tv_interface_marks_updated_at BEFORE UPDATE ON tv_interface_marks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnostic_steps_updated_at BEFORE UPDATE ON diagnostic_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnostic_sessions_updated_at BEFORE UPDATE ON diagnostic_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_steps_updated_at BEFORE UPDATE ON session_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_step_actions_updated_at BEFORE UPDATE ON step_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_change_logs_updated_at BEFORE UPDATE ON change_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
