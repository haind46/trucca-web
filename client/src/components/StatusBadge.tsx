import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SeverityLevel = "down" | "critical" | "major" | "minor" | "clear";

interface StatusBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

const severityConfig = {
  down: {
    label: "Down",
    className: "bg-severity-down/10 text-severity-down border-severity-down/20",
  },
  critical: {
    label: "Critical",
    className: "bg-severity-critical/10 text-severity-critical border-severity-critical/20",
  },
  major: {
    label: "Major",
    className: "bg-severity-major/10 text-severity-major border-severity-major/20",
  },
  minor: {
    label: "Minor",
    className: "bg-severity-minor/10 text-severity-minor border-severity-minor/20",
  },
  clear: {
    label: "Clear",
    className: "bg-severity-clear/10 text-severity-clear border-severity-clear/20",
  },
};

export function StatusBadge({ severity, className }: StatusBadgeProps) {
  const config = severityConfig[severity];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      data-testid={`badge-severity-${severity}`}
    >
      {config.label}
    </Badge>
  );
}
