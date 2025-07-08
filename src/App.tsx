import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster, ToastProvider } from "@/hooks/use-toast";
import Dashboard from "@/pages/Dashboard";
import Detail from "@/pages/Detail";
import { apiService } from "@/services/api";
import { useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

function AppContent() {
  const { isAuthenticated, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  const handleLoginSuccess = (token: string, user: any) => {
    const userWithRole = { ...user, role: user.role || "user" };
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      login(token, refreshToken, userWithRole);
    }
  };

  const handleRegisterSuccess = (token: string, user: any) => {
    const userWithRole = { ...user, role: user.role || "user" };
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      login(token, refreshToken, userWithRole);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await apiService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      logout();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
        <div className="w-full max-w-md">
          {showLogin ? (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setShowLogin(false)}
            />
          ) : (
            <RegisterForm
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setShowLogin(true)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background bg-blue-100 text-foreground">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-foreground">
                  Web Crawler Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome,{" "}
                  {JSON.parse(localStorage.getItem("user") || "{}").name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-destructive hover:text-destructive-foreground"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
