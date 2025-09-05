import { 
  Project, 
  VoteResponse, 
  Comment, 
  ProfileResponse, 
  VotesResponse,
  CommentsResponse,
  ProjectCreateRequest,
  ProjectsResponse,
  AuthResponse,
  StatsResponse
} from '../types';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('API: Making request to:', url, options);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('API: Response status:', response.status, response.statusText);

      if (!response.ok) {
        // Try to get error message from response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          // If we can't read the response body, use the default message
          console.warn('Could not read error response body:', e);
        }
        
        console.error('API: Error response:', { status: response.status, message: errorMessage });
        
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          // Only emit auth:expired for authenticated endpoints, not for login/register
          const isAuthEndpoint = endpoint.includes('/auth/email/login') || endpoint.includes('/auth/email/register');
          if (!isAuthEndpoint) {
            // Emit a custom event for authentication failure
            window.dispatchEvent(new CustomEvent('auth:expired'));
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API: Response data:', data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API: Request error:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Projects
  async getProjects(): Promise<ProjectsResponse> {
    const response = await this.request<ProjectsResponse>(API_ENDPOINTS.PROJECTS);
    return response;
  }

  async getUserProjects(userId: string): Promise<ProjectsResponse> {
    const response = await this.request<ProjectsResponse>(`/users/${userId}/projects`);
    return response;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.request<Project>(API_ENDPOINTS.PROJECT(id));
    return response;
  }

  async createProject(projectData: ProjectCreateRequest): Promise<Project> {
    return this.request<Project>(API_ENDPOINTS.PROJECTS, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Votes
  async vote(projectId: string): Promise<VoteResponse> {
    console.log('API: Sending vote request:', { projectId });
    await this.request<VoteResponse>(API_ENDPOINTS.PROJECT_VOTE(projectId), {
      method: 'POST',
      body: JSON.stringify({}),
    });
    console.log('API: Vote successful');
    return { success: true, message: 'Vote added successfully' };
  }

  async removeVote(projectId: string): Promise<VoteResponse> {
    console.log('API: Sending remove vote request:', { projectId });
    await this.request<VoteResponse>(API_ENDPOINTS.PROJECT_VOTE(projectId), {
      method: 'DELETE',
    });
    console.log('API: Remove vote successful');
    return { success: true, message: 'Vote removed successfully' };
  }

  async getUserVotes(): Promise<VotesResponse> {
    return this.request<VotesResponse>(API_ENDPOINTS.VOTES);
  }

  // Auth
  async registerEmail(email: string, username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH_EMAIL_REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  async loginEmail(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH_EMAIL_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }


  async linkTelegram(params: Record<string, string>): Promise<{ status: string }> {
    return this.request<{ status: string }>(API_ENDPOINTS.AUTH_TELEGRAM_LINK, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Profile
  async getProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>(API_ENDPOINTS.PROFILE);
  }

  async updateProfile(profileData: { first_name?: string; last_name?: string; username?: string }): Promise<{ success: boolean; message: string; user: any }> {
    return this.request<{ success: boolean; message: string; user: any }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateAvatar(avatarUrl: string): Promise<{ success: boolean; message: string; avatar: string }> {
    return this.request<{ success: boolean; message: string; avatar: string }>('/profile/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar: avatarUrl }),
    });
  }

  // Comments
  async getProjectComments(projectId: string): Promise<CommentsResponse> {
    const response = await this.request<CommentsResponse>(API_ENDPOINTS.PROJECT_COMMENTS(projectId));
    return response;
  }

  async createComment(projectId: string, content: string): Promise<Comment> {
    const response = await this.request<Comment>(API_ENDPOINTS.PROJECT_COMMENTS(projectId), {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response;
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await this.request<Comment>(API_ENDPOINTS.COMMENT(commentId), {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return response;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.request(API_ENDPOINTS.COMMENT(commentId), {
      method: 'DELETE',
    });
  }

  // Images
  async uploadImage(file: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const url = `${this.baseURL}${API_ENDPOINTS.IMAGE_UPLOAD}`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      } catch (e) {
        console.warn('Could not read error response body:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Stats
  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats');
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL); 