-- Migration 003: Insert initial data
-- Creates default site settings and admin user

BEGIN;

-- Insert default site settings
INSERT INTO site_settings (
    id, 
    site_name, 
    site_description, 
    default_language, 
    supported_languages,
    theme,
    primary_color,
    accent_color,
    enable_analytics,
    enable_feedback,
    enable_offline_mode,
    enable_notifications,
    max_steps_per_problem,
    max_media_size,
    session_timeout,
    api_settings,
    email_settings,
    storage_settings,
    is_active,
    metadata
) VALUES (
    'settings',
    'ANT Support',
    'Профессиональная платформа для диагностики цифровых ТВ-приставок',
    'ru',
    '["ru", "tj", "uz"]'::jsonb,
    'professional',
    '#3b82f6',
    '#10b981',
    true,
    true,
    false,
    true,
    20,
    10,
    30,
    '{
        "rate_limit": {
            "window_ms": 900000,
            "max_requests": 100
        },
        "cors_origins": ["*"],
        "enable_swagger": true
    }'::jsonb,
    '{
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_secure": false,
        "smtp_user": "",
        "smtp_password": "",
        "from_email": "noreply@antsupport.local",
        "from_name": "ANT Support"
    }'::jsonb,
    '{
        "max_file_size": 10485760,
        "allowed_extensions": ["jpg", "jpeg", "png", "gif", "svg", "pdf"],
        "storage_path": "/uploads"
    }'::jsonb,
    true,
    '{
        "version": "1.0.0",
        "initialized_at": "2024-01-01T00:00:00.000Z"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert default admin user (password should be hashed in production)
-- Default password: admin123 (should be changed immediately)
INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    permissions,
    email_verified,
    is_active,
    preferences,
    metadata
) VALUES (
    'admin-001',
    'admin',
    'admin@antsupport.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR.jFYTZVHNGUC6', -- password: admin123
    'System',
    'Administrator',
    'admin',
    '[
        "users.create", "users.read", "users.update", "users.delete",
        "devices.create", "devices.read", "devices.update", "devices.delete",
        "problems.create", "problems.read", "problems.update", "problems.delete",
        "steps.create", "steps.read", "steps.update", "steps.delete",
        "remotes.create", "remotes.read", "remotes.update", "remotes.delete",
        "tv_interfaces.create", "tv_interfaces.read", "tv_interfaces.update", "tv_interfaces.delete",
        "settings.read", "settings.update",
        "analytics.read"
    ]'::jsonb,
    true,
    true,
    '{
        "language": "ru",
        "theme": "dark",
        "notifications": true,
        "dashboard": {
            "show_stats": true,
            "default_page": "devices"
        }
    }'::jsonb,
    '{
        "created_by": "system",
        "initial_admin": true
    }'::jsonb
) ON CONFLICT (username) DO NOTHING;

-- Create initial change log entry
INSERT INTO change_logs (
    id,
    entity_type,
    entity_id,
    action,
    changes,
    user_id,
    user_role,
    reason,
    metadata
) VALUES (
    'log-001',
    'system',
    'init',
    'create',
    '{
        "message": "Система инициализирована",
        "version": "1.0.0",
        "tables_created": 12,
        "initial_data": true
    }'::jsonb,
    'admin-001',
    'admin',
    'Начальная инициализация системы',
    '{
        "migration": "003_initial_data",
        "automated": true
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

COMMIT;
