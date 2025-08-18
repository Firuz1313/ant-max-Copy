-- ANT Support Database Full Reset and Structure
-- Migration: 012_reset_and_create_full_database.sql

-- Drop existing tables and create clean structure
DROP TABLE IF EXISTS 
  tv_interface_marks,
  remote_marks,
  session_steps,
  step_actions,
  diagnostic_sessions,
  diagnostic_steps,
  problems,
  tv_interfaces,
  device_remotes,
  remotes,
  devices,
  users,
  change_logs,
  site_settings,
  migrations
CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'support', 'user')),
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

-- 2. Devices table (TV set-top boxes)
CREATE TABLE devices (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    logo_url VARCHAR(500),
    color VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    order_index INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    specifications JSONB DEFAULT '{}'::jsonb,
    supported_formats JSONB DEFAULT '[]'::jsonb,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. TV Interfaces table
CREATE TABLE tv_interfaces (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (type IN ('home', 'settings', 'channels', 'apps', 'guide', 'no-signal', 'error', 'custom')),
    screenshot_url VARCHAR(500),
    screenshot_data TEXT,
    svg_overlay TEXT,
    dimensions JSONB NOT NULL DEFAULT '{"width": 1920, "height": 1080}'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. TV Interface Marks table (clickable areas on TV interfaces)
CREATE TABLE tv_interface_marks (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    tv_interface_id VARCHAR(255) NOT NULL REFERENCES tv_interfaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'clickable' CHECK (type IN ('clickable', 'highlight', 'info', 'warning')),
    shape VARCHAR(50) NOT NULL DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'polygon')),
    coordinates JSONB NOT NULL, -- {x, y, width, height} or {x, y, radius} or {points: []}
    color VARCHAR(100) DEFAULT '#3b82f6',
    action_type VARCHAR(50) DEFAULT 'click' CHECK (action_type IN ('click', 'hover', 'focus')),
    action_target VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Remotes table (Remote controls)
CREATE TABLE remotes (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    description TEXT,
    layout VARCHAR(50) NOT NULL DEFAULT 'standard' CHECK (layout IN ('standard', 'compact', 'smart', 'voice', 'custom')),
    color_scheme VARCHAR(50) NOT NULL DEFAULT 'dark',
    image_url VARCHAR(500),
    image_data TEXT,
    svg_data TEXT,
    dimensions JSONB NOT NULL DEFAULT '{"width": 200, "height": 500}'::jsonb,
    buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Remote Marks table (clickable buttons on remotes)
CREATE TABLE remote_marks (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    remote_id VARCHAR(255) NOT NULL REFERENCES remotes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'button' CHECK (type IN ('button', 'dpad', 'joystick', 'slider')),
    shape VARCHAR(50) NOT NULL DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'polygon')),
    coordinates JSONB NOT NULL, -- {x, y, width, height} or {x, y, radius} or {points: []}
    color VARCHAR(100) DEFAULT '#ef4444',
    button_code VARCHAR(50), -- IR code or button identifier
    function_name VARCHAR(100), -- power, volume_up, channel_up, etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Problems table
CREATE TABLE problems (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    device_id VARCHAR(255) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (category IN ('critical', 'moderate', 'minor', 'other')),
    subcategory VARCHAR(100),
    icon VARCHAR(100) NOT NULL DEFAULT 'HelpCircle',
    color VARCHAR(100) NOT NULL DEFAULT 'from-blue-500 to-blue-600',
    tags JSONB DEFAULT '[]'::jsonb,
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    estimated_time INTEGER NOT NULL DEFAULT 5, -- в минутах
    difficulty VARCHAR(50) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    success_rate INTEGER NOT NULL DEFAULT 100 CHECK (success_rate >= 0 AND success_rate <= 100),
    completed_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. Diagnostic Steps table
CREATE TABLE diagnostic_steps (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    problem_id VARCHAR(255) NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instruction TEXT NOT NULL,
    step_number INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'action' CHECK (type IN ('action', 'check', 'info', 'remote', 'interface')),
    
    -- Remote interaction
    remote_id VARCHAR(255) REFERENCES remotes(id) ON DELETE SET NULL,
    remote_mark_ids JSONB DEFAULT '[]'::jsonb, -- array of remote_mark IDs to highlight
    
    -- TV Interface interaction
    tv_interface_id VARCHAR(255) REFERENCES tv_interfaces(id) ON DELETE SET NULL,
    tv_interface_mark_ids JSONB DEFAULT '[]'::jsonb, -- array of tv_interface_mark IDs to highlight
    
    expected_result TEXT,
    tips TEXT,
    warning_message TEXT,
    estimated_time INTEGER DEFAULT 30, -- секунды
    is_optional BOOLEAN NOT NULL DEFAULT false,
    success_rate INTEGER DEFAULT 95 CHECK (success_rate >= 0 AND success_rate <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(problem_id, step_number)
);

-- 9. Diagnostic Sessions table
CREATE TABLE diagnostic_sessions (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    device_id VARCHAR(255) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    problem_id VARCHAR(255) NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'failed')),
    current_step_id VARCHAR(255) REFERENCES diagnostic_steps(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    total_steps INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,
    success BOOLEAN,
    feedback TEXT,
    session_data JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. Session Steps table (track progress through diagnostic steps)
CREATE TABLE session_steps (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    session_id VARCHAR(255) NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    step_id VARCHAR(255) NOT NULL REFERENCES diagnostic_steps(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'skipped', 'failed')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    success BOOLEAN,
    user_input TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(session_id, step_id)
);

-- 11. Change Logs table
CREATE TABLE change_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    entity_type VARCHAR(100) NOT NULL, -- devices, problems, steps, etc.
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore')),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    changes JSONB, -- old and new values
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 12. Site Settings table
CREATE TABLE site_settings (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create triggers for updated_at
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_tv_interfaces_updated_at BEFORE UPDATE ON tv_interfaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_tv_interface_marks_updated_at BEFORE UPDATE ON tv_interface_marks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_remotes_updated_at BEFORE UPDATE ON remotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_remote_marks_updated_at BEFORE UPDATE ON remote_marks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_diagnostic_steps_updated_at BEFORE UPDATE ON diagnostic_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_diagnostic_sessions_updated_at BEFORE UPDATE ON diagnostic_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_session_steps_updated_at BEFORE UPDATE ON session_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_devices_brand_model ON devices(brand, model);
CREATE INDEX idx_devices_is_active ON devices(is_active);
CREATE INDEX idx_tv_interfaces_device_id ON tv_interfaces(device_id);
CREATE INDEX idx_tv_interfaces_type ON tv_interfaces(type);
CREATE INDEX idx_tv_interface_marks_interface_id ON tv_interface_marks(tv_interface_id);
CREATE INDEX idx_remotes_device_id ON remotes(device_id);
CREATE INDEX idx_remotes_is_default ON remotes(is_default);
CREATE INDEX idx_remote_marks_remote_id ON remote_marks(remote_id);
CREATE INDEX idx_problems_device_id ON problems(device_id);
CREATE INDEX idx_problems_category ON problems(category);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_diagnostic_steps_problem_id ON diagnostic_steps(problem_id);
CREATE INDEX idx_diagnostic_steps_step_number ON diagnostic_steps(problem_id, step_number);
CREATE INDEX idx_diagnostic_sessions_device_problem ON diagnostic_sessions(device_id, problem_id);
CREATE INDEX idx_diagnostic_sessions_status ON diagnostic_sessions(status);
CREATE INDEX idx_session_steps_session_id ON session_steps(session_id);
CREATE INDEX idx_change_logs_entity ON change_logs(entity_type, entity_id);
CREATE INDEX idx_change_logs_created_at ON change_logs(created_at);
CREATE INDEX idx_site_settings_key ON site_settings(key);

-- Recreate migrations table
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
