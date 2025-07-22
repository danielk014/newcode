// Environment variables with defaults
export const ENV = {
  NODE_ENV: import.meta.env.MODE || 'development',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
} as const;

// Admin configuration
export const ADMIN_CONFIG = {
  // Store admin code as environment variable for security
  // In production, this should be set via environment variables
  CODE: import.meta.env.VITE_ADMIN_CODE || 'SCRIPT_ADMIN_2024',
} as const;

// Script generation defaults
export const SCRIPT_DEFAULTS = {
  MIN_SCRIPTS: 2,
  MAX_SCRIPTS: 8,
  DEFAULT_TARGET_LENGTH: 1400,
  MIN_TARGET_LENGTH: 500,
  MAX_TARGET_LENGTH: 5000,
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 4000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
} as const;

// Session configuration
export const SESSION = {
  CHECK_INTERVAL: 30000, // 30 seconds
  STORAGE_KEYS: {
    TEMP_USER: 'temp_user',
    IS_ADMIN: 'is_admin',
    USER_PASSWORD: 'user_password',
    SESSION_TIMESTAMP: 'session_timestamp',
    USER_LOGOUT_EVENTS: 'user_logout_events',
  },
} as const;