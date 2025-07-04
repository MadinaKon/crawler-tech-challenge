import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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
      // Only use supported badge variants
      const colors: Record<
        CrawlerResult["status"],
        "secondary" | "default" | "destructive" | "outline"
      > = {
        queued: "secondary",
        running: "default",
        done: "secondary", // fallback to a supported variant
        error: "destructive",
      };
      return <Badge variant={colors[status] || "outline"}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => console.log("view", row.original.id)}
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => console.log("re-run", row.original.id)}
          >
            Re-run Analysis
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => console.log("delete", row.original.id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
