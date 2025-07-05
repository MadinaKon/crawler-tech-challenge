import { CrawlerResult } from "@/components/columns";

export const mockData: CrawlerResult[] = [
  {
    id: 1,
    url: "https://example.com",
    title: "Example Page",
    html_version: "HTML5",
    internal_links: 10,
    external_links: 5,
    inaccessible_links: 2,
    has_login_form: false,
    status: "completed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    url: "https://example.org",
    title: "Another Page",
    html_version: "HTML4.01",
    internal_links: 8,
    external_links: 3,
    inaccessible_links: 1,
    has_login_form: true,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
