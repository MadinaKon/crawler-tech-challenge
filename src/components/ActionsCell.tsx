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

interface ActionsCellProps {
  row: CrawlRow;
  onStart: (id: number) => void;
  onStop: (id: number) => void;
}

export function ActionsCell({ row, onStart, onStop }: ActionsCellProps) {
  const navigate = useNavigate();
  const status = row.original.status;

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
        <DropdownMenuItem onClick={() => onStart(row.original.id)}>
          Start
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStop(row.original.id)}>
          Stop
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
