import { CrawlerResult } from "@/components/columns";

export const mockData: CrawlerResult[] = [
  {
    id: "1",
    url: "https://example.com",
    title: "Example Website",
    htmlVersion: "HTML5",
    internalLinks: 15,
    externalLinks: 8,
    brokenLinks: 2,
    hasLoginForm: true,
    status: "done",
  },
  {
    id: "2",
    url: "https://test.com",
    title: "Test Site",
    htmlVersion: "HTML5",
    internalLinks: 10,
    externalLinks: 5,
    brokenLinks: 0,
    hasLoginForm: false,
    status: "running",
  },
];
