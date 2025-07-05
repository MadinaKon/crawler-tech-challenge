"use client";

import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/crawls");
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

    fetchData();
  }, []);

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
      <h1 className="text-3xl font-bold mb-6">Web Crawler Dashboard</h1>
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
