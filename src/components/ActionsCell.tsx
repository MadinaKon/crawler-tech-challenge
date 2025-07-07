import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CrawlRow {
  original: {
    id: number;
    url: string;
    status: string;
  };
}

export function ActionsCell({ row }: { row: CrawlRow }) {
  const navigate = useNavigate();
  return (
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
          onClick={() => navigate(`/detail/${row.original.id}`)}
          data-testid="actions-view-details"
        >
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => console.log("re-run", row.original.id)}
          data-testid="actions-re-run"
        >
          Re-run Analysis
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => console.log("delete", row.original.id)}
          data-testid="actions-delete"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
