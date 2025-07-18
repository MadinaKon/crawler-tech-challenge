import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import React, { useState } from "react";

interface User {
  name: string;
  email: string;
  id: number;
}

interface LoginFormProps {
  onLoginSuccess: (token: string, user: User) => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({
  onLoginSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiService.login(email, password);

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login successful",
        // description: `Welcome back, ${data.user.name}!`,
        description: `Welcome back, ${data.user?.name || "user"}!`,
      });

      onLoginSuccess(data.access_token, data.user);
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="login-card">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the web crawler
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-testid="login-form"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="login-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="login-submit"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-sm text-blue-600 hover:text-blue-800"
            data-testid="login-switch-register"
          >
            Don't have an account? Register
          </button>
        </div>
        {/* <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Demo accounts:</p>
          <p className="text-xs text-gray-500">
            Admin: admin@webcrawler.com / admin123
          </p>
          <p className="text-xs text-gray-500">
            User: user@webcrawler.com / user123
          </p>
        </div> */}

        {import.meta.env.VITE_SHOW_DEMO === "true" && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Demo accounts:</p>
            <p className="text-xs text-gray-500">
              Admin: admin@webcrawler.com / admin123
            </p>
            <p className="text-xs text-gray-500">
              User: user@webcrawler.com / user123
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
