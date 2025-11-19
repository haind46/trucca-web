import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Incident } from "@shared/schema";

export default function Reports() {
  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: [API_ENDPOINTS.INCIDENTS.LIST],
  });

  const today = new Date().toDateString();
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  const todayIncidents = incidents.filter(
    (i) => new Date(i.createdAt).toDateString() === today
  );

  const weekIncidents = incidents.filter(
    (i) => new Date(i.createdAt) >= thisWeekStart
  );

  const resolvedIncidents = incidents.filter((i) => i.status === "resolved");
  const resolvedThisWeek = weekIncidents.filter((i) => i.status === "resolved");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Báo cáo</h1>
          <p className="text-sm text-muted-foreground">
            Tổng hợp và xuất báo cáo vận hành
          </p>
        </div>
        <Button data-testid="button-generate-report">
          <FileText className="h-4 w-4 mr-2" />
          Tạo báo cáo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng sự cố tuần</p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "..." : weekIncidents.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã xử lý</p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "..." : resolvedThisWeek.length}
                </p>
              </div>
              {weekIncidents.length > 0 && (
                <div className="text-sm text-severity-clear">
                  {Math.round((resolvedThisWeek.length / weekIncidents.length) * 100)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sự cố hôm nay</p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "..." : todayIncidents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Báo cáo gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Đang tải...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Chưa có sự cố nào được ghi nhận
            </div>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Tính năng xuất báo cáo đang được phát triển.</p>
              <p>Hiện có {incidents.length} sự cố, {resolvedIncidents.length} đã xử lý.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
