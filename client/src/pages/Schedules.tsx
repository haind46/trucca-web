import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Schedule, Contact, System } from "@shared/schema";
import { format } from "date-fns";

type ScheduleWithDetails = Schedule & {
  contactName?: string;
  contactRole?: string;
  systemName?: string;
};

export default function Schedules() {
  const today = format(new Date(), "dd/MM/yyyy");

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: [API_ENDPOINTS.SCHEDULES.LIST],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: [API_ENDPOINTS.CONTACTS.LIST],
  });

  const { data: systems = [] } = useQuery<System[]>({
    queryKey: [API_ENDPOINTS.SYSTEMS.LIST],
  });

  const schedulesWithDetails: ScheduleWithDetails[] = schedules.map((schedule) => {
    const contact = contacts.find((c) => c.id === schedule.contactId);
    const system = systems.find((s) => s.id === schedule.systemId);
    return {
      ...schedule,
      contactName: contact?.name,
      contactRole: contact?.role,
      systemName: system?.name,
    };
  });

  const todaySchedules = schedulesWithDetails.filter((s) => s.date === today);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Lịch trực ca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end mb-4">
            <Button data-testid="button-add-schedule">
              <Plus className="h-4 w-4 mr-2" />
              Thêm lịch trực
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Lịch trực hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedulesLoading ? (
              <div className="text-center text-muted-foreground py-8">
                Đang tải...
              </div>
            ) : todaySchedules.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Không có lịch trực hôm nay
              </div>
            ) : (
              todaySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 border rounded-md space-y-2 hover-elevate cursor-pointer"
                  data-testid={`schedule-${schedule.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{schedule.contactName || "Unknown"}</span>
                      {schedule.contactRole && (
                        <Badge variant="secondary">{schedule.contactRole}</Badge>
                      )}
                    </div>
                    <Badge variant="outline">{schedule.shift}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                    <div>Hệ thống: {schedule.systemName || "Unknown"}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thống kê ca trực</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <div className="text-2xl font-semibold">{schedules.length}</div>
                <div className="text-sm text-muted-foreground">Tổng lịch trực</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-2xl font-semibold">{todaySchedules.length}</div>
                <div className="text-sm text-muted-foreground">Ca hôm nay</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-2xl font-semibold">{contacts.length}</div>
                <div className="text-sm text-muted-foreground">Nhân sự</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-2xl font-semibold">{systems.length}</div>
                <div className="text-sm text-muted-foreground">Hệ thống</div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
