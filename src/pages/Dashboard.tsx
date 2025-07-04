import { columns, CrawlerResult } from "@/components/columns";
import { DataTable } from "@/components/data-table";

const mockData: CrawlerResult[] = [
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

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Web Crawler Dashboard</h1>
      <DataTable columns={columns} data={mockData} />
    </div>
  );
}
