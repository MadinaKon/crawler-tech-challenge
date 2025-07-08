import { apiService } from "@/services/api";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    const storedRefreshToken = localStorage.getItem("refresh_token");

    if (storedToken && storedUser && storedRefreshToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        logout();
      }
    }
  }, []);

  const login = (newToken: string, newRefreshToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("refresh_token", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  };

  const refreshToken = async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (!storedRefreshToken) {
      logout();
      return false;
    }

    try {
      const data = await apiService.refreshToken(storedRefreshToken);

      // Update tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setToken(data.access_token);

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
