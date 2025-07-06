"use client";

import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import UrlInput from "@/components/UrlInput";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface CrawlResult {
  id: number;
  url: string;
  title: string;
  html_version: string;
  status: "pending" | "completed" | "failed";
  heading_counts: any;
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  error_message: string;
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
      const response = await fetch("http://localhost:8081/api/crawls");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
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
      // Here you would typically make a POST request to your backend
      // to add the URL to the crawl queue
      const response = await fetch("http://localhost:8081/api/crawls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add URL: ${response.status}`);
      }

      // Refresh the data to show the new crawl result
      await fetchData();
      toast({
        title: "URL Added",
        description: "URL has been queued for analysis.",
      });
    } catch (err) {
      console.error("Failed to add URL:", err);
      setError(err instanceof Error ? err.message : "Failed to add URL");
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleUrlError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading crawl results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-lg font-semibold mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Website Analysis Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Analyze website structure, links, and performance metrics
        </p>
      </div>

      <div className="mb-8">
        <UrlInput
          onAddUrl={handleAddUrl}
          onError={handleUrlError}
          isLoading={isAddingUrl}
        />
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No crawl results found.</p>
          <p className="text-gray-400">
            Start crawling some URLs to see results here.
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
