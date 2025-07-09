import { Badge } from "@/components/ui/badge";
import { CrawlStatus } from "@/types/crawl";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: CrawlStatus;
  textOverride?: string;
  iconOverride?: React.ElementType;
}

const statusConfig = {
  queued: {
    variant: "secondary" as const,
    icon: Clock,
    text: "Queued",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  running: {
    variant: "secondary" as const,
    icon: Loader2,
    text: "Running",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  done: {
    variant: "secondary" as const,
    icon: CheckCircle,
    text: "Done",
    className: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  error: {
    variant: "destructive" as const,
    icon: XCircle,
    text: "Error",
    className: "bg-red-100 text-red-700 hover:bg-red-200",
  },
};

const StatusBadge = ({
  status,
  textOverride,
  iconOverride,
}: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = iconOverride || config.icon;
  const text = textOverride || config.text;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon
        className={`h-3 w-3 mr-1 ${status === "running" ? "animate-spin" : ""}`}
      />
      {text}
    </Badge>
  );
};

export default StatusBadge;
