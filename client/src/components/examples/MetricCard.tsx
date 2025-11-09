import { MetricCard } from "../MetricCard";
import { Server, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Hệ thống giám sát"
        value={24}
        icon={Server}
      />
      <MetricCard
        title="Cảnh báo đang hoạt động"
        value={7}
        icon={AlertTriangle}
        trend={{ value: 12, isPositive: false }}
      />
      <MetricCard
        title="Đã xử lý hôm nay"
        value={45}
        icon={CheckCircle}
        trend={{ value: 8, isPositive: true }}
      />
      <MetricCard
        title="Thời gian phản hồi TB"
        value="3.2m"
        icon={Clock}
        trend={{ value: 15, isPositive: true }}
      />
    </div>
  );
}
