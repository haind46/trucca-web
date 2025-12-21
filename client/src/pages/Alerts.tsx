import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { AlertRow } from "@/components/AlertRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Alert, System } from "@shared/schema";
import { format } from "date-fns";

type AlertWithSystemName = Alert & { systemName: string };

export default function Alerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: [API_ENDPOINTS.ALERTS.LIST],
  });

  const { data: systems = [], isLoading: systemsLoading } = useQuery<System[]>({
    queryKey: [API_ENDPOINTS.SYSTEMS.LIST],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      return await apiRequest("POST", `/api/alerts/${id}/acknowledge`, {
        acknowledgedBy: "Admin User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ALERTS.LIST] });
    },
  });

  const handleAck = (id: string) => {
    acknowledgeMutation.mutate({ id: parseInt(id) });
  };

  const alertsWithSystemName: AlertWithSystemName[] = useMemo(() => {
    return alerts.map((alert) => {
      const system = systems.find((s) => s.id === alert.systemId);
      return {
        ...alert,
        systemName: system?.name || "Unknown System",
      };
    });
  }, [alerts, systems]);

  const filteredAlerts = useMemo(() => {
    return alertsWithSystemName.filter((alert) => {
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesSearch = 
        searchTerm === "" ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.systemName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [alertsWithSystemName, severityFilter, searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSeverityFilter("all");
  };

  const isLoading = alertsLoading || systemsLoading;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Quản lý Cảnh báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cảnh báo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-alerts"
              />
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-severity">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                data-testid="button-clear-filters"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm || severityFilter !== "all" 
                ? "Không tìm thấy cảnh báo phù hợp với bộ lọc"
                : "Không có cảnh báo"}
            </div>
          ) : (
            <div className="divide-y">
              {filteredAlerts.map((alert) => (
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
  );
}
