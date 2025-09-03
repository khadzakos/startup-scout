import { 
  User, 
  Project, 
  VoteResponse, 
  Comment, 
  Launch, 
  ProfileResponse, 
  VotesResponse,
  CommentsResponse,
  ProjectCreateRequest,
  ProjectsResponse,
  AuthResponse
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
        const errorData = await response.json().catch(() => ({}));
        console.error('API: Error response:', errorData);
        
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          // Emit a custom event for authentication failure
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw new Error('Authentication expired. Please log in again.');
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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

  async authYandex(code: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(`${API_ENDPOINTS.AUTH_YANDEX}?code=${code}`);
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
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL); 