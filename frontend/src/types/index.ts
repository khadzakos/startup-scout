// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description: string;
  full_description: string;
  images: string[];
  creators: string[];
  telegram_contact: string;
  website: string;
  upvotes: number;
  downvotes: number;
  rating: number;
  launch_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
  full_description: string;
  images: string[];
  creators: string[];
  telegram_contact: string;
  website: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

// Launch types
export interface Launch {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  auth_type: AuthType;
  auth_id: string;
  created_at: string;
  updated_at: string;
}

export type AuthType = 'telegram' | 'yandex';

// Vote types
export interface Vote {
  id: number;
  user_id: number;
  project_id: number;
  launch_id: number;
  vote_type: VoteType;
  created_at: string;
}

export type VoteType = 'up' | 'down';

export interface VoteRequest {
  vote_type: VoteType;
}

export interface VoteResponse {
  status: string;
}

// Comment types
export interface Comment {
  id: number;
  user_id: number;
  project_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProfileResponse {
  user_id: number;
  message: string;
}

export interface VotesResponse {
  votes: Vote[];
}

// Frontend specific types (for UI)
export interface ProjectWithUserVote extends Project {
  userVote?: VoteType;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface ProjectContacts {
  telegram?: string;
  email?: string;
}