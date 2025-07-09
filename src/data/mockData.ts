import { CrawlResult } from "@/types/crawl";

export const mockCrawlResults: CrawlResult[] = [
  {
    id: 1,
    url: "https://example.com",
    title: "Example Domain",
    html_version: "HTML5",
    status: "done",
    heading_counts: { h1: 1, h2: 3, h3: 5 },
    internal_links: 10,
    external_links: 5,
    inaccessible_links: 2,
    has_login_form: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:35:00Z",
  },
  {
    id: 2,
    url: "https://test.com",
    title: "Test Website",
    html_version: "HTML5",
    status: "queued",
    heading_counts: { h1: 2, h2: 4, h3: 6 },
    internal_links: 15,
    external_links: 8,
    inaccessible_links: 1,
    has_login_form: true,
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
  },
];
