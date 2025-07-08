export type CrawlStatus = "queued" | "running" | "done" | "error";

export interface CrawlResult {
  id: number;
  url: string;
  title: string;
  html_version: string;
  status: CrawlStatus;
  heading_counts: Record<string, number>;
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
  progress?: number;
}
