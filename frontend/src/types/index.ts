// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Project types
export interface Project {
	id: string; // UUID
	name: string;
	description: string;
	full_description: string;
	images: string[];
	creators: string[];
	telegram_contact: string;
	website: string;
	upvotes: number;
	rating: number;
	launch_id: string; // UUID
	user_id: string; // UUID
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
	id: string; // UUID
	name: string;
	start_date: string;
	end_date: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

// User types
export interface User {
	id: string; // UUID
	username: string;
	email: string;
	avatar: string;
	auth_type: string;
	created_at: string;
	updated_at: string;
}

export type AuthType = 'email' | 'yandex';

// Vote types (только лайки)
export interface Vote {
	id: string; // UUID
	user_id: string; // UUID
	project_id: string; // UUID
	launch_id: string; // UUID
	created_at: string;
}

export interface VoteResponse {
	success: boolean;
	message?: string;
}

// Comment types
export interface Comment {
	id: string; // UUID
	project_id: string; // UUID
	user_id: string; // UUID
	content: string;
	created_at: string;
	updated_at: string;
}

export interface CommentsResponse {
	comments: Comment[];
}

// Auth types
export interface AuthResponse {
	success: boolean;
	message?: string;
	token?: string;
	user?: User;
}

export interface ProfileResponse {
	user: User;
}

export interface VotesResponse {
	votes: Vote[];
}

// Frontend specific types (for UI)
export interface ProjectWithUserVote extends Project {
	userVote?: boolean; // Changed from VoteType
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