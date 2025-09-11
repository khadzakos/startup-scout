// API Configuration
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Always use relative API path for nginx proxy
  return '/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
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
  AUTH_LOGOUT: '/auth/logout',
  AUTH_YANDEX: '/auth/yandex',
  AUTH_TELEGRAM_LINK: '/auth/telegram/link',
  
  // User
  PROFILE: '/profile',
  VOTES: '/votes',
  
  // Images
  IMAGE_UPLOAD: '/images/upload',
  IMAGE: (filename: string) => `/images/${filename}`,
} as const; 