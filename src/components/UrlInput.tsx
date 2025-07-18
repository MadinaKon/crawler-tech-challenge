import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import React, { useState } from "react";

interface UrlInputProps {
  onAddUrl: (url: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

const UrlInput = ({ onAddUrl, onError, isLoading = false }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;
      // Require at least one dot in the hostname and at least 2 chars after the last dot
      if (
        !hostname ||
        hostname.length < 4 ||
        !hostname.includes(".") ||
        hostname.startsWith(".") ||
        hostname.endsWith(".") ||
        hostname.split(".").some((part) => part.length === 0) ||
        hostname.split(".").pop()!.length < 2
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      const errorMsg = "Please enter a valid URL to analyze.";
      toast({
        title: "URL Required",
        description: errorMsg,
        variant: "destructive",
      });
      onError?.(errorMsg);
      return;
    }

    // Clean the URL first - remove any leading/trailing whitespace
    const cleanUrl = url.trim();

    // Check if URL already has a protocol (http://, https://, etc.)
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(cleanUrl);

    const formattedUrl = hasProtocol ? cleanUrl : `https://${cleanUrl}`;

    if (!validateUrl(formattedUrl)) {
      const errorMsg = "Please enter a valid URL (e.g., https://example.com)";
      toast({
        title: "Invalid URL",
        description: errorMsg,
        variant: "destructive",
      });
      onError?.(errorMsg);
      return;
    }

    onAddUrl(formattedUrl);
    setUrl("");
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-900">
          Add Website for Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            id="url-input"
            type="text"
            placeholder="Enter website URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={isLoading}
            data-testid="dashboard-url-input"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="dashboard-add-url"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add URL
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UrlInput;
