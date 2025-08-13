// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Projects
  PROJECTS: '/projects',
  PROJECT: (id: number) => `/projects/${id}`,
  PROJECT_VOTE: (id: number) => `/projects/${id}/vote`,
  
  // Auth
  AUTH_TELEGRAM: '/auth/telegram',
  AUTH_YANDEX: '/auth/yandex',
  
  // User
  PROFILE: '/profile',
  VOTES: '/votes',
} as const; 