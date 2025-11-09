import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { Server, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SeverityLevel = "down" | "critical" | "major" | "minor" | "clear";

interface SystemCardProps {
  id: string;
  name: string;
  ip: string;
  level: 1 | 2 | 3;
  status: SeverityLevel;
  alertCount: number;
  className?: string;
}

const levelColors = {
  1: "border-l-severity-down",
  2: "border-l-severity-major",
  3: "border-l-severity-minor",
};

export function SystemCard({
  id,
  name,
  ip,
  level,
  status,
  alertCount,
  className,
}: SystemCardProps) {
  return (
    <Card
      className={cn(
        "border-l-4 hover-elevate cursor-pointer transition-all",
        levelColors[level],
        className
      )}
      data-testid={`card-system-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Server className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate" data-testid={`text-system-name-${id}`}>
                {name}
              </span>
              <span className="text-xs text-muted-foreground font-mono" data-testid={`text-system-ip-${id}`}>
                {ip}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            L{level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <StatusBadge severity={status} />
          {alertCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span data-testid={`text-alert-count-${id}`}>{alertCount} cảnh báo</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
