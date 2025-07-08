"use client";

import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import UrlInput from "@/components/UrlInput";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { CrawlResult, CrawlStatus } from "@/types/crawl";
import { useCallback, useEffect, useState } from "react";

const allowedStatuses = ["queued", "running", "done", "error"] as const;
type AllowedStatus = (typeof allowedStatuses)[number];

function mapCrawlResult(raw: any): CrawlResult {
  return {
    ...raw,
    status: allowedStatuses.includes(raw.status as AllowedStatus)
      ? (raw.status as CrawlStatus)
      : "queued",
  };
}

function extractData<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  } else if (response && Array.isArray(response.data)) {
    return response.data;
  } else {
    return [];
  }
}

export default function Dashboard() {
  const [crawls, setCrawls] = useState<CrawlResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const fetchCrawls = useCallback(async () => {
    try {
      const response = await apiService.getCrawls();
      const newCrawls = extractData<CrawlResult>(response).map(mapCrawlResult);
      setCrawls(newCrawls);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);

      // Check if it's an authentication error
      if (err instanceof Error && err.message === "Authentication failed") {
        toast({
          title: "Session expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        logout(); // This will redirect to login
        return;
      }

      toast({
        title: "Failed to fetch data",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
      setCrawls([]);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    }
  }, [toast, logout]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchCrawls();
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchCrawls]);

  // Polling for updates (only when there are active crawls)
  useEffect(() => {
    const hasActiveCrawls = crawls.some(
      (crawl) => crawl.status === "queued" || crawl.status === "running"
    );

    if (!hasActiveCrawls) {
      return; // Don't poll if no active crawls
    }

    const interval = setInterval(fetchCrawls, 3000); // Increased to 3 seconds
    return () => clearInterval(interval);
  }, [fetchCrawls, crawls]);

  const handleAddUrl = useCallback(
    async (url: string) => {
      setIsAddingUrl(true);
      try {
        await apiService.createCrawl(url);
        toast({
          title: "URL added successfully",
          description: "The URL has been added to the crawl queue.",
        });
        await fetchCrawls(); // Refresh data after adding
      } catch (error) {
        toast({
          title: "Failed to add URL",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setIsAddingUrl(false);
      }
    },
    [fetchCrawls, toast]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Web Crawler Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your website crawls</p>
      </div>

      <div className="mb-8">
        <UrlInput onAddUrl={handleAddUrl} isLoading={isAddingUrl} />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 mb-2">{error}</p>
          {error === "Authentication failed" && (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Log In Again
            </button>
          )}
        </div>
      )}

      {crawls.length === 0 ? (
        <div className="text-center py-12">
          <h3
            className="text-lg font-medium text-gray-900 mb-2"
            data-testid="dashboard-empty-state"
          >
            No crawl results yet
          </h3>
          <p className="text-gray-600">
            Add a URL above to start crawling websites
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={crawls} />
      )}
    </div>
  );
}
