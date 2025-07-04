import { ActionsCell } from "@/components/ActionsCell";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

export type CrawlerResult = {
  id: string;
  url: string;
  title: string;
  htmlVersion: string;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  hasLoginForm: boolean;
  status: "queued" | "running" | "done" | "error";
};

export const columns: ColumnDef<CrawlerResult>[] = [
  {
    accessorKey: "url",
    header: "URL",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "htmlVersion",
    header: "HTML",
  },
  {
    accessorKey: "internalLinks",
    header: "Internal",
  },
  {
    accessorKey: "externalLinks",
    header: "External",
  },
  {
    accessorKey: "brokenLinks",
    header: "Broken",
  },
  {
    accessorKey: "hasLoginForm",
    header: "Login?",
    // cell: ({ row }) => (!!row.getValue("hasLoginForm") ? "Yes" : "No"),
    cell: ({ row }) => (row.getValue("hasLoginForm") ? "Yes" : "No"),
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
        queued: "secondary",
        running: "default",
        done: "secondary",
        error: "destructive",
      };
      return <Badge variant={colors[status] || "outline"}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
