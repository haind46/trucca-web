import { MetricCard } from "@/components/MetricCard";
import { SystemCard } from "@/components/SystemCard";
import { AlertRow } from "@/components/AlertRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { System, Alert } from "@shared/schema";
import { format } from "date-fns";

type SystemWithAlertCount = System & { alertCount: number };
type AlertWithSystemName = Alert & { systemName: string };

interface Stats {
  totalSystems: number;
  activeAlerts: number;
  resolvedToday: number;
  averageResponseTime: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: systems = [], isLoading: systemsLoading } = useQuery<SystemWithAlertCount[]>({
    queryKey: ["/api/systems"],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts/active"],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      return await apiRequest("POST", `/api/alerts/${id}/acknowledge`, {
        acknowledgedBy: "Admin User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const handleAck = (id: string) => {
    acknowledgeMutation.mutate({ id: parseInt(id) });
  };

  const alertsWithSystemName: AlertWithSystemName[] = alerts.map((alert) => {
    const system = systems.find((s) => s.id === alert.systemId);
    return {
      ...alert,
      systemName: system?.name || "Unknown System",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Giám sát</h1>
          <p className="text-sm text-muted-foreground">
            Tổng quan trạng thái hệ thống và cảnh báo
          </p>
        </div>
        <Button variant="outline" size="sm" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Hệ thống giám sát"
          value={statsLoading ? "..." : stats?.totalSystems || 0}
          icon={Server}
        />
        <MetricCard
          title="Cảnh báo hoạt động"
          value={statsLoading ? "..." : stats?.activeAlerts || 0}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Đã xử lý hôm nay"
          value={statsLoading ? "..." : stats?.resolvedToday || 0}
          icon={CheckCircle}
        />
        <MetricCard
          title="Thời gian phản hồi TB"
          value={stats?.averageResponseTime || "N/A"}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cảnh báo đang hoạt động</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {alertsLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Đang tải...
                </div>
              ) : alertsWithSystemName.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Không có cảnh báo đang hoạt động
                </div>
              ) : (
                <div className="divide-y">
                  {alertsWithSystemName.slice(0, 5).map((alert) => (
                    <AlertRow
                      key={alert.id}
                      id={alert.id.toString()}
                      timestamp={format(new Date(alert.createdAt), "dd/MM HH:mm")}
                      system={alert.systemName}
                      severity={alert.severity as any}
                      message={alert.message}
                      details={alert.details || undefined}
                      acknowledged={alert.acknowledged}
                      onAcknowledge={handleAck}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {systemsLoading ? (
                <div className="text-center text-muted-foreground py-4">
                  Đang tải...
                </div>
              ) : systems.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Chưa có hệ thống nào
                </div>
              ) : (
                systems.slice(0, 6).map((system) => (
                  <SystemCard
                    key={system.id}
                    id={system.id.toString()}
                    name={system.name}
                    ip={system.ip}
                    level={system.level as 1 | 2 | 3}
                    status={system.status as any}
                    alertCount={0}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
