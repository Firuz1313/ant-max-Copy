-- Migration 002: Add indexes for performance optimization
-- Creates indexes for foreign keys, filtering, and search optimization

BEGIN;

-- Basic foreign key indexes
CREATE INDEX IF NOT EXISTS idx_problems_device_id ON problems(device_id);
CREATE INDEX IF NOT EXISTS idx_remotes_device_id ON remotes(device_id);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_device_id ON tv_interfaces(device_id);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_interface_id ON tv_interface_marks(tv_interface_id);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_step_id ON tv_interface_marks(step_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_problem_id ON diagnostic_steps(problem_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_device_id ON diagnostic_steps(device_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_tv_interface_id ON diagnostic_steps(tv_interface_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_remote_id ON diagnostic_steps(remote_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_device_id ON diagnostic_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_problem_id ON diagnostic_sessions(problem_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user_id ON diagnostic_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_steps_session_id ON session_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_session_steps_step_id ON session_steps(step_id);
CREATE INDEX IF NOT EXISTS idx_step_actions_step_id ON step_actions(step_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_user_id ON change_logs(user_id);

-- Filtering and status indexes
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(is_active);
CREATE INDEX IF NOT EXISTS idx_devices_order ON devices(order_index);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_active ON problems(is_active);
CREATE INDEX IF NOT EXISTS idx_problems_priority ON problems(priority);
CREATE INDEX IF NOT EXISTS idx_remotes_active ON remotes(is_active);
CREATE INDEX IF NOT EXISTS idx_remotes_default ON remotes(is_default);
CREATE INDEX IF NOT EXISTS idx_remotes_layout ON remotes(layout);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_active ON tv_interfaces(is_active);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_type ON tv_interfaces(type);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_active ON tv_interface_marks(is_active);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_visible ON tv_interface_marks(is_visible);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_type ON tv_interface_marks(mark_type);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_priority ON tv_interface_marks(priority);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_order ON tv_interface_marks(display_order);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_active ON diagnostic_steps(is_active);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_step_number ON diagnostic_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_action_type ON diagnostic_steps(action_type);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_active ON diagnostic_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_success ON diagnostic_sessions(success);
CREATE INDEX IF NOT EXISTS idx_session_steps_completed ON session_steps(completed);
CREATE INDEX IF NOT EXISTS idx_session_steps_result ON session_steps(result);
CREATE INDEX IF NOT EXISTS idx_step_actions_active ON step_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_step_actions_type ON step_actions(type);
CREATE INDEX IF NOT EXISTS idx_change_logs_active ON change_logs(is_active);
CREATE INDEX IF NOT EXISTS idx_change_logs_entity_type ON change_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_change_logs_action ON change_logs(action);

-- Temporal indexes
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at);
CREATE INDEX IF NOT EXISTS idx_remotes_created_at ON remotes(created_at);
CREATE INDEX IF NOT EXISTS idx_remotes_last_used ON remotes(last_used);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_created_at ON tv_interfaces(created_at);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_created_at ON tv_interface_marks(created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_created_at ON diagnostic_steps(created_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_start_time ON diagnostic_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_end_time ON diagnostic_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_session_steps_started_at ON session_steps(started_at);
CREATE INDEX IF NOT EXISTS idx_session_steps_completed_at ON session_steps(completed_at);
CREATE INDEX IF NOT EXISTS idx_step_actions_created_at ON step_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_change_logs_created_at ON change_logs(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_problems_device_status ON problems(device_id, status);
CREATE INDEX IF NOT EXISTS idx_problems_device_active ON problems(device_id, is_active);
CREATE INDEX IF NOT EXISTS idx_remotes_device_default ON remotes(device_id, is_default);
CREATE INDEX IF NOT EXISTS idx_remotes_device_active ON remotes(device_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_device_active ON tv_interfaces(device_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_interface_active ON tv_interface_marks(tv_interface_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_step_active ON tv_interface_marks(step_id, is_active);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_problem_number ON diagnostic_steps(problem_id, step_number);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_problem_active ON diagnostic_steps(problem_id, is_active);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_device_time ON diagnostic_sessions(device_id, start_time);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_problem_time ON diagnostic_sessions(problem_id, start_time);
CREATE INDEX IF NOT EXISTS idx_session_steps_session_number ON session_steps(session_id, step_number);
CREATE INDEX IF NOT EXISTS idx_step_actions_step_active ON step_actions(step_id, is_active);
CREATE INDEX IF NOT EXISTS idx_change_logs_entity_time ON change_logs(entity_type, created_at);
CREATE INDEX IF NOT EXISTS idx_change_logs_entity_action ON change_logs(entity_type, action);

-- Full-text search indexes for Russian language
CREATE INDEX IF NOT EXISTS idx_devices_name_search ON devices USING gin(to_tsvector('russian', name));
CREATE INDEX IF NOT EXISTS idx_devices_description_search ON devices USING gin(to_tsvector('russian', description));
CREATE INDEX IF NOT EXISTS idx_problems_title_search ON problems USING gin(to_tsvector('russian', title));
CREATE INDEX IF NOT EXISTS idx_problems_description_search ON problems USING gin(to_tsvector('russian', description));
CREATE INDEX IF NOT EXISTS idx_remotes_name_search ON remotes USING gin(to_tsvector('russian', name));
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_name_search ON tv_interfaces USING gin(to_tsvector('russian', name));
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_name_search ON tv_interface_marks USING gin(to_tsvector('russian', name));
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_title_search ON diagnostic_steps USING gin(to_tsvector('russian', title));
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_instruction_search ON diagnostic_steps USING gin(to_tsvector('russian', instruction));

-- JSONB indexes for metadata and structured data
CREATE INDEX IF NOT EXISTS idx_devices_metadata ON devices USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_problems_metadata ON problems USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_problems_tags ON problems USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_remotes_metadata ON remotes USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_remotes_dimensions ON remotes USING gin(dimensions);
CREATE INDEX IF NOT EXISTS idx_remotes_buttons ON remotes USING gin(buttons);
CREATE INDEX IF NOT EXISTS idx_remotes_zones ON remotes USING gin(zones);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_metadata ON tv_interfaces USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_clickable_areas ON tv_interfaces USING gin(clickable_areas);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_highlight_areas ON tv_interfaces USING gin(highlight_areas);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_metadata ON tv_interface_marks USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_position ON tv_interface_marks USING gin(position);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_tags ON tv_interface_marks USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_metadata ON diagnostic_steps USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_validation_rules ON diagnostic_steps USING gin(validation_rules);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_media ON diagnostic_steps USING gin(media);
CREATE INDEX IF NOT EXISTS idx_users_metadata ON users USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING gin(permissions);
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING gin(preferences);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_metadata ON diagnostic_sessions USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_error_steps ON diagnostic_sessions USING gin(error_steps);
CREATE INDEX IF NOT EXISTS idx_session_steps_metadata ON session_steps USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_session_steps_errors ON session_steps USING gin(errors);
CREATE INDEX IF NOT EXISTS idx_step_actions_metadata ON step_actions USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_step_actions_coordinates ON step_actions USING gin(coordinates);
CREATE INDEX IF NOT EXISTS idx_change_logs_metadata ON change_logs USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_change_logs_changes ON change_logs USING gin(changes);

-- Unique indexes for performance on frequently used unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username) WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_problems_device_title_unique ON problems(device_id, title) WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_diagnostic_steps_problem_step_unique ON diagnostic_steps(problem_id, step_number) WHERE is_active = true;

-- Partial indexes for performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_devices_active_ordered ON devices(order_index) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_problems_published ON problems(created_at DESC) WHERE status = 'published' AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_remotes_default_active ON remotes(device_id) WHERE is_default = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_completed ON diagnostic_sessions(end_time DESC) WHERE success = true;
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_failed ON diagnostic_sessions(end_time DESC) WHERE success = false;
CREATE INDEX IF NOT EXISTS idx_users_admins ON users(created_at DESC) WHERE role = 'admin' AND is_active = true;

COMMIT;
