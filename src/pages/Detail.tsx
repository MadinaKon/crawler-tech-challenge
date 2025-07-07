import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { CrawlResult, CrawlStatus } from "@/types/crawl";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface BrokenLink {
  id: number;
  url: string;
  status_code: number;
  error_message?: string;
}

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

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [crawlData, brokenLinksData] = await Promise.all([
          apiService.getCrawlById(id),
          apiService.getBrokenLinks(id),
        ]);

        setCrawlResult(mapCrawlResult(crawlData));
        setBrokenLinks(brokenLinksData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch crawl details:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        toast({
          title: "Error",
          description: "Failed to load crawl details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  if (!id) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">Invalid or missing ID parameter</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !crawlResult) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">{error || "Crawl result not found"}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crawl Result Details</h1>
            <p className="text-gray-600">ID: {crawlResult.id}</p>
          </div>
          <Badge variant={getStatusColor(crawlResult.status)}>
            {crawlResult.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <label className="font-medium text-gray-700">URL:</label>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={crawlResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {crawlResult.url}
                  </a>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Title:</label>
                <p className="mt-1">{crawlResult.title || "N/A"}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">
                  HTML Version:
                </label>
                <p className="mt-1">{crawlResult.html_version || "N/A"}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Login Form:</label>
                <p className="mt-1">
                  {crawlResult.has_login_form ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Link Statistics</h2>
            <div className="space-y-3">
              <div>
                <label className="font-medium text-gray-700">
                  Internal Links:
                </label>
                <p className="mt-1">{crawlResult.internal_links}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">
                  External Links:
                </label>
                <p className="mt-1">{crawlResult.external_links}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">
                  Inaccessible Links:
                </label>
                <p className="mt-1">{crawlResult.inaccessible_links}</p>
              </div>
            </div>
          </div>
        </div>

        {crawlResult.heading_counts &&
          Object.keys(crawlResult.heading_counts).length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Heading Counts</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {Object.entries(crawlResult.heading_counts).map(
                  ([tag, count]) => (
                    <div
                      key={tag}
                      className="text-center p-3 bg-gray-50 rounded"
                    >
                      <div className="font-semibold text-lg">{count}</div>
                      <div className="text-sm text-gray-600">
                        {tag.toUpperCase()}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {crawlResult.error_message && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Error Message</h3>
            </div>
            <p className="text-red-700">{crawlResult.error_message}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Created: {new Date(crawlResult.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(crawlResult.updated_at).toLocaleString()}</p>
        </div>
      </div>

      {brokenLinks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Broken Links ({brokenLinks.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brokenLinks.map((link) => (
                  <tr key={link.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Badge
                        variant={
                          link.status_code >= 400 ? "destructive" : "secondary"
                        }
                      >
                        {link.status_code}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {link.error_message || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
