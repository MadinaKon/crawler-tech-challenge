class ApiService {
  private baseURL = "http://localhost:8090/api";

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = true
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth header if required
    if (requireAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
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
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          // Retry the request with new token
          const newToken = localStorage.getItem("access_token");
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...config, headers });
            return this.handleResponse(retryResponse);
          }
        }
        // If refresh failed, throw error
        throw new Error("Authentication failed");
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private async handleResponse(response: Response): Promise<any> {
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

    return response.text();
  }

  private async refreshToken(): Promise<boolean> {
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
  async login(email: string, password: string) {
    return this.makeRequest(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    );
  }

  async register(name: string, email: string, password: string) {
    return this.makeRequest(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      },
      false
    );
  }

  async logout() {
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
  async getCrawls(params?: Record<string, string>) {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    const endpoint = queryString ? `/crawls?${queryString}` : "/crawls";
    return this.makeRequest(endpoint);
  }

  async createCrawl(url: string) {
    return this.makeRequest("/crawls", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async getCrawlById(id: string) {
    return this.makeRequest(`/crawls/${id}`);
  }

  async getBrokenLinks(crawlId: string) {
    return this.makeRequest(`/crawls/${crawlId}/broken-links`);
  }

  async processCrawl(crawlId: string) {
    return this.makeRequest(`/crawls/${crawlId}/process`, {
      method: "POST",
    });
  }

  async processAllCrawls() {
    return this.makeRequest("/crawls/process-all", {
      method: "POST",
    });
  }

  async getStats() {
    return this.makeRequest("/stats");
  }

  // Profile endpoints
  async getProfile() {
    return this.makeRequest("/profile");
  }

  async updateProfile(name: string) {
    return this.makeRequest("/profile", {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }
}

export const apiService = new ApiService();
