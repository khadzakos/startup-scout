import { 
  Project, 
  ProjectCreateRequest, 
  ProjectsResponse, 
  VoteRequest, 
  VoteResponse, 
  AuthResponse, 
  ProfileResponse, 
  VotesResponse
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
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
    return this.request<ProjectsResponse>(API_ENDPOINTS.PROJECTS);
  }

  async getProject(id: number): Promise<Project> {
    return this.request<Project>(API_ENDPOINTS.PROJECT(id));
  }

  async createProject(projectData: ProjectCreateRequest): Promise<Project> {
    return this.request<Project>(API_ENDPOINTS.PROJECTS, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Votes
  async vote(projectId: number, voteData: VoteRequest): Promise<VoteResponse> {
    return this.request<VoteResponse>(API_ENDPOINTS.PROJECT_VOTE(projectId), {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
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
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL); 