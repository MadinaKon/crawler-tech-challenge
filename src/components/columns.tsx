// columns.tsx
import { ActionsCell } from "@/components/ActionsCell";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

export type CrawlerResult = {
  id: number;
  url: string;
  title: string;
  html_version: string;
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
};

export const columns: ColumnDef<CrawlerResult>[] = [
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.getValue("url")}>
        {row.getValue("url")}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("title")}>
        {row.getValue("title") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "html_version",
    header: "HTML",
    cell: ({ row }) => row.getValue("html_version") || "N/A",
  },
  {
    accessorKey: "internal_links",
    header: "Internal",
  },
  {
    accessorKey: "external_links",
    header: "External",
  },
  {
    accessorKey: "inaccessible_links",
    header: "Inaccessible",
  },
  {
    accessorKey: "has_login_form",
    header: "Login?",
    cell: ({ row }) => (row.getValue("has_login_form") ? "Yes" : "No"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as CrawlerResult["status"];

      const colors: Record<
        CrawlerResult["status"],
        "secondary" | "default" | "destructive" | "outline"
      > = {
        pending: "secondary",
        completed: "default",
        failed: "destructive",
      };
      return <Badge variant={colors[status] || "outline"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
