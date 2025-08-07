# Database Migrations

This directory contains SQL migration files for the ANT Support database schema.

## Migration Files

### 001_init_tables.sql

Creates all primary tables for the ANT Support system:

- `devices` - TV set-top box devices
- `problems` - Diagnostic problems for devices
- `remotes` - Remote control models
- `tv_interfaces` - TV interface screenshots and layouts
- `tv_interface_marks` - Interactive marks/zones on TV interfaces
- `diagnostic_steps` - Step-by-step diagnostic instructions
- `users` - System users and administrators
- `diagnostic_sessions` - User diagnostic sessions tracking
- `session_steps` - Individual steps within sessions
- `step_actions` - Detailed actions for each step
- `change_logs` - Audit trail for all changes
- `site_settings` - Global system settings

### 002_add_indexes.sql

Creates performance indexes for:

- Foreign key relationships
- Filtering and search operations
- Full-text search (Russian language support)
- JSONB field indexing
- Composite indexes for common query patterns

## Running Migrations

### Using npm scripts (recommended):

```bash
# Run all pending migrations
npm run db:migrate:up

# Check migration status
npm run db:migrate:status

# Rollback last migration (development only)
npm run db:migrate:rollback
```

### Using Node.js directly:

```bash
# Run migrations
node src/utils/runMigrations.js up

# Check status
node src/utils/runMigrations.js status

# Rollback
node src/utils/runMigrations.js rollback
```

## Migration Process

1. **Migration Tracking**: The system automatically creates a `migrations` table to track which migrations have been applied.

2. **Idempotent Operations**: All CREATE statements use `IF NOT EXISTS` to ensure migrations can be safely re-run.

3. **Transaction Safety**: Each migration runs in a transaction to ensure atomicity.

4. **Error Handling**: If a migration fails, the process stops and reports the error.

## Creating New Migrations

1. Create a new `.sql` file in this directory with the format: `XXX_description.sql`
2. Use sequential numbering (003, 004, etc.)
3. Include both `CREATE` statements and any necessary `ALTER` statements
4. Test the migration on a development database first

## Database Schema Features

- **Audit Trail**: All tables have `created_at` and `updated_at` timestamps
- **Soft Deletes**: Most tables use `is_active` for soft deletion
- **JSONB Support**: Metadata and configuration stored as JSONB for flexibility
- **Referential Integrity**: Proper foreign key constraints with cascade options
- **Full-text Search**: Russian language support for search operations
- **Performance**: Comprehensive indexing strategy for optimal query performance

## Data Types

- **IDs**: VARCHAR(255) for flexibility with custom ID formats
- **Timestamps**: TIMESTAMP WITH TIME ZONE for proper timezone handling
- **JSON Data**: JSONB for structured metadata and configuration
- **Text Content**: TEXT for long-form content, VARCHAR for shorter fields
- **Enums**: CHECK constraints for controlled vocabularies

## Backup Before Migrations

Always backup your database before running migrations in production:

```bash
pg_dump -h localhost -U your_user -d ant_support > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Rollback Strategy

- Development: Use the rollback command
- Production: Restore from backup and replay specific migrations
- Test all migrations thoroughly in staging environment first
