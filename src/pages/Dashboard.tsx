"use client";

import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import UrlInput from "@/components/UrlInput";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useEffect, useState } from "react";

interface CrawlResult {
  id: number;
  url: string;
  title: string;
  status: "pending" | "completed" | "failed";
  html_version: string;
  heading_counts: Record<string, number>;
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [data, setData] = useState<CrawlResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCrawls();

      // Handle both old and new API response formats
      if (Array.isArray(response)) {
        // Old format: just an array
        setData(response);
      } else if (response.data && Array.isArray(response.data)) {
        // New format: object with data, pagination, filters
        setData(response.data);
      } else {
        // Fallback: empty data
        setData([]);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      // Set empty data on error to prevent undefined errors
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUrl = async (url: string) => {
    setIsAddingUrl(true);
    try {
      await apiService.createCrawl(url);
      toast({
        title: "URL added successfully",
        description: "The URL has been added to the crawl queue.",
      });
      fetchData(); // Refresh the data
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
  };

  if (loading) {
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
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {data.length === 0 ? (
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
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
