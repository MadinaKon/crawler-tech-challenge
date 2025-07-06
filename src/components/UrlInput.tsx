import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import React, { useState } from "react";

interface UrlInputProps {
  onAddUrl: (url: string) => void;
  isLoading?: boolean;
}

const UrlInput = ({ onAddUrl, isLoading = false }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

    if (!validateUrl(formattedUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    onAddUrl(formattedUrl);
    setUrl("");
    toast({
      title: "URL Added",
      description: "URL has been queued for analysis.",
    });
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
            type="text"
            placeholder="Enter website URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
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
