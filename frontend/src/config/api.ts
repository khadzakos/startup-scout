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
  PROJECT: (id: string) => `/projects/${id}`,
  PROJECT_VOTE: (id: string) => `/projects/${id}/vote`,
  
  // Comments
  PROJECT_COMMENTS: (id: string) => `/projects/${id}/comments`,
  COMMENT: (id: string) => `/comments/${id}`,
  
  // Auth
  AUTH_EMAIL_REGISTER: '/auth/email/register',
  AUTH_EMAIL_LOGIN: '/auth/email/login',
  AUTH_YANDEX: '/auth/yandex',
  AUTH_TELEGRAM_LINK: '/auth/telegram/link',
  
  // User
  PROFILE: '/profile',
  VOTES: '/votes',
} as const; 