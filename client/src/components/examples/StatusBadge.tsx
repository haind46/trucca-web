import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatusBadge severity="down" />
        <StatusBadge severity="critical" />
        <StatusBadge severity="major" />
        <StatusBadge severity="minor" />
        <StatusBadge severity="clear" />
      </div>
    </div>
  );
}
