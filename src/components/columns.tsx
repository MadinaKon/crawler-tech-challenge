// columns.tsx
import { ActionsCell } from "@/components/ActionsCell";
import StatusBadge from "@/components/StatusBadge";
import { CrawlResult, CrawlStatus } from "@/types/crawl";
import { ColumnDef } from "@tanstack/react-table";

export type CrawlerResult = CrawlResult;

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
    // cell: ({ row }) => {
    //   const status = row.getValue("status") as CrawlStatus;
    //   return <StatusBadge status={status} />;
    // },
    cell: ({ row }) => {
      const status = row.getValue("status") as CrawlStatus;
      const progress = row.getValue("progress");
      return (
        <div>
          <StatusBadge status={status} />
          {status === "running" && typeof progress === "number" && (
            <progress
              value={progress}
              max={100}
              className="ml-2 align-middle"
            />
          )}
        </div>
      );
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
