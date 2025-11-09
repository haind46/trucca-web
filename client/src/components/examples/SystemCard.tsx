import { SystemCard } from "../SystemCard";

export default function SystemCardExample() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SystemCard
        id="1"
        name="Core Database Server"
        ip="192.168.1.10"
        level={1}
        status="critical"
        alertCount={3}
      />
      <SystemCard
        id="2"
        name="Web Application Server"
        ip="192.168.1.20"
        level={2}
        status="major"
        alertCount={1}
      />
      <SystemCard
        id="3"
        name="Development Server"
        ip="192.168.1.30"
        level={3}
        status="clear"
        alertCount={0}
      />
    </div>
  );
}
