// columns.tsx
import { ActionsCell } from "@/components/ActionsCell";
import StatusBadge from "@/components/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { CrawlResult, CrawlStatus } from "@/types/crawl";
import { ColumnDef } from "@tanstack/react-table";

export type CrawlerResult = CrawlResult;

interface ColumnsHandlers {
  reRunningId?: number | null;
  onStart?: (id: number) => void;
  onStop?: (id: number) => void;
}

export const columns = ({
  reRunningId,
  onStart,
  onStop,
}: ColumnsHandlers): ColumnDef<CrawlerResult>[] => [
  {
    id: "select",
    header: "Select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }: { row: any }) => (
      <div className="max-w-[300px] truncate" title={row.getValue("url")}>
        {row.getValue("url")}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }: { row: any }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("title")}>
        {row.getValue("title") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "html_version",
    header: "HTML",
    cell: ({ row }: { row: any }) => row.getValue("html_version") || "N/A",
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
    cell: ({ row }: { row: any }) =>
      row.getValue("has_login_form") ? "Yes" : "No",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: any }) => {
      const status = row.getValue("status") as CrawlStatus;
      const progress = row.original.progress;
      const id = row.original.id;

      if (status === "running" && typeof progress === "number") {
        if (reRunningId === id) {
          return <StatusBadge status="running" textOverride="Re-running" />;
        }

        return (
          <progress
            value={progress}
            max={100}
            className="ml-2 align-middle w-24"
          />
        );
      }

      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: { row: any }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        row={row}
        onStart={onStart || (() => {})}
        onStop={onStop || (() => {})}
      />
    ),
  },
];
