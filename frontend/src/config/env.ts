// Environment Configuration
export const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080',
  YANDEX_CLIENT_ID: import.meta.env.VITE_YANDEX_CLIENT_ID || '',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
} as const; 