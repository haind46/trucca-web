import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SeverityLevel = "down" | "critical" | "major" | "minor" | "clear";

interface AlertRowProps {
  id: string;
  timestamp: string;
  system: string;
  severity: SeverityLevel;
  message: string;
  details?: string;
  acknowledged?: boolean;
  onAcknowledge?: (id: string) => void;
}

export function AlertRow({
  id,
  timestamp,
  system,
  severity,
  message,
  details,
  acknowledged,
  onAcknowledge,
}: AlertRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "border-b last:border-b-0",
        acknowledged && "opacity-60"
      )}
    >
      <div
        className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid={`row-alert-${id}`}
      >
        <span className="text-xs text-muted-foreground font-mono w-32 shrink-0">
          {timestamp}
        </span>
        <span className="text-sm font-medium min-w-0 w-40 truncate">
          {system}
        </span>
        <div className="flex-shrink-0">
          <StatusBadge severity={severity} />
        </div>
        <span className="text-sm flex-1 min-w-0 truncate">{message}</span>
        <div className="flex items-center gap-2 shrink-0">
          {!acknowledged && onAcknowledge && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge(id);
              }}
              data-testid={`button-ack-${id}`}
            >
              <Check className="h-4 w-4 mr-1" />
              ACK
            </Button>
          )}
          {details && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              data-testid={`button-expand-${id}`}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      {expanded && details && (
        <div className="px-4 pb-4 pt-0">
          <div className="bg-muted/50 rounded-md p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap">{details}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
