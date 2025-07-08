interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface CrawlResult {
  id: number;
  url: string;
  title: string;
  status: string;
  html_version: string;
  heading_counts: Record<string, number>;
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

interface BrokenLink {
  id: number;
  crawl_id: number;
  url: string;
  status_code: number;
  error_message: string;
  created_at: string;
}

class ApiService {
  private baseURL = "http://localhost:8090/api";

  private async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add auth header if required
    if (requireAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        (headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && requireAuth) {
        const refreshSuccess = await this._refreshTokenInternal();
        if (refreshSuccess) {
          // Retry the request with new token
          const newToken = localStorage.getItem("access_token");
          if (newToken) {
            (
              headers as Record<string, string>
            ).Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...config, headers });
            return this.handleResponse<T>(retryResponse);
          }
        }
        // If refresh failed, throw error
        throw new Error("Authentication failed");
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private async handleResponse<T = unknown>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.text() as T;
  }

  private async _refreshTokenInternal(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    );
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      },
      false
    );
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await this.makeRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  }

  // Crawl endpoints
  async getCrawls(params?: Record<string, string>): Promise<CrawlResult[]> {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    const endpoint = queryString ? `/crawls?${queryString}` : "/crawls";
    const response = await this.makeRequest<{ data: CrawlResult[] }>(endpoint);
    return response.data || [];
  }

  async createCrawl(url: string): Promise<CrawlResult> {
    return this.makeRequest<CrawlResult>("/crawls", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async getCrawlById(id: string): Promise<CrawlResult> {
    return this.makeRequest<CrawlResult>(`/crawls/${id}`);
  }

  async getBrokenLinks(crawlId: string): Promise<BrokenLink[]> {
    return this.makeRequest<BrokenLink[]>(`/crawls/${crawlId}/broken-links`);
  }

  async processCrawl(crawlId: string): Promise<CrawlResult> {
    return this.makeRequest<CrawlResult>(`/crawls/${crawlId}/process`, {
      method: "POST",
    });
  }

  async processAllCrawls(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>("/crawls/process-all", {
      method: "POST",
    });
  }

  async getStats(): Promise<{
    total_crawls: number;
    completed_crawls: number;
    failed_crawls: number;
  }> {
    return this.makeRequest<{
      total_crawls: number;
      completed_crawls: number;
      failed_crawls: number;
    }>("/stats");
  }

  // Profile endpoints
  async getProfile(): Promise<{ id: number; name: string; email: string }> {
    return this.makeRequest<{ id: number; name: string; email: string }>(
      "/profile"
    );
  }

  async updateProfile(
    name: string
  ): Promise<{ id: number; name: string; email: string }> {
    return this.makeRequest<{ id: number; name: string; email: string }>(
      "/profile",
      {
        method: "PUT",
        body: JSON.stringify({ name }),
      }
    );
  }
}

export const apiService = new ApiService();
