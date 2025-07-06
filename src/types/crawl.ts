export interface CrawlerResult {
  id: number;
  url: string;
  title: string;
  html_version: string;
  status: "pending" | "completed" | "failed";
  heading_counts: Record<string, number>;
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  error_message: string;
  created_at: string;
  updated_at: string;
}
