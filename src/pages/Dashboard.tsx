"use client";

import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { CrawlResult, CrawlStatus } from "@/types/crawl";
import { useEffect, useState } from "react";

function getStatusLabel(status: CrawlStatus) {
  switch (status) {
    case "queued":
      return "Queued";
    case "running":
      return "Running";
    case "done":
      return "Done";
    case "error":
      return "Error";
    default:
      return status;
  }
}

export default function Dashboard() {
  const [crawls, setCrawls] = useState<CrawlResult[]>([]);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCrawls();
  }, []);

  async function fetchCrawls() {
    try {
      setIsLoading(true);
      const response = await apiService.getCrawls();

      if (Array.isArray(response)) {
        setCrawls(response);
      } else if (response && Array.isArray(response.data)) {
        setCrawls(response.data);
      } else {
        setCrawls([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast({
        title: "Failed to fetch data",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
      setCrawls([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddUrl() {
    setIsLoading(true);
    try {
      const newCrawl = await apiService.createCrawl(url);
      setCrawls((prev) => [...prev, newCrawl]);
      setUrl("");
      toast({
        title: "URL added successfully",
        description: "The URL has been added to the crawl queue.",
      });
    } catch (error) {
      toast({
        title: "Failed to add URL",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStart(id: number) {
    // Call backend to start crawl
    await apiService.startCrawl(id);
    fetchCrawls();
  }

  async function handleStop(id: number) {
    // Call backend to stop crawl
    await apiService.stopCrawl(id);
    fetchCrawls();
  }

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

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Enter a URL to crawl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          data-testid="dashboard-url-input"
        />
        <Button
          onClick={handleAddUrl}
          disabled={isLoading || !url}
          data-testid="dashboard-add-url"
        >
          {isLoading ? "Adding..." : "Add URL"}
        </Button>
      </div>

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
