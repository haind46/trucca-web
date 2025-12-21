import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Download,
  Filter,
  Calendar,
  Server,
  AlertTriangle,
  Eye,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { logEntryService } from "@/services/logEntryService";
import { sysSeverityService } from "@/services/sysSeverityService";
import { useToast } from "@/hooks/use-toast";
import type { LogEntry, LogEntryFilters } from "@/types/log-entry";
import type { SysSeverity } from "@/types/sys-severity";

// Format Date object to datetime-local input format: YYYY-MM-DDTHH:mm
const formatDateTimeForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Format ISO string or Date for display: DD/MM/YYYY HH:mm:ss
const formatDateTimeDisplay = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export default function LogEntriesManagement() {
  const { toast } = useToast();

  // Get today's date range (from 00:00 to now)
  const getTodayDateRange = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return {
      from: formatDateTimeForInput(startOfDay), // YYYY-MM-DDTHH:mm format
      to: formatDateTimeForInput(today),
    };
  };

  const todayRange = getTodayDateRange();

  // Filter states - default to today's date range
  const [filters, setFilters] = useState<LogEntryFilters>({
    page: 1,
    limit: 20,
    keyword: "",
    severity: "",
    occurredAtFrom: todayRange.from,
    occurredAtTo: todayRange.to,
    systemName: "",
    hostName: "",
    hostIp: "",
    resourceType: "",
    eventType: "",
    errorType: "",
    sort_dir: "desc",
    sort_key: "occurred_at",
  });

  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Export dialog states
  const todayDateTime = formatDateTimeForInput(new Date());
  const [exportStartDate, setExportStartDate] = useState(todayDateTime);
  const [exportEndDate, setExportEndDate] = useState(todayDateTime);
  const [exportSeverity, setExportSeverity] = useState("");
  const [exportSystemName, setExportSystemName] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch active severity list
  const { data: severityData } = useQuery({
    queryKey: ["severities-active"],
    queryFn: async () => {
      try {
        return await sysSeverityService.getActive();
      } catch (err) {
        console.error("Failed to fetch severities:", err);
        return null;
      }
    },
    retry: false, // Don't retry if fails
  });

  const activeSeverities: SysSeverity[] = severityData?.data || [];

  // Query to fetch log entries
  const { data, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ["log-entries", filters],
    queryFn: async () => {
      try {
        return await logEntryService.filter(filters);
      } catch (err: any) {
        // Don't retry on 403 errors
        if (err.message?.includes("403") || err.status === 403) {
          throw new Error("Bạn không có quyền truy cập tính năng này. Vui lòng liên hệ quản trị viên để được cấp quyền.");
        }
        throw err;
      }
    },
    refetchInterval: 30000, // Auto refresh every 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors
      if (error?.message?.includes("403") || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query for statistics (total + severity counts) - NEW API
  const { data: statisticsData } = useQuery({
    queryKey: ["log-entries-statistics", filters.occurredAtFrom, filters.occurredAtTo, filters.systemName, filters.hostName, filters.hostIp],
    queryFn: async () => {
      try {
        return await logEntryService.getStatistics(
          filters.occurredAtFrom || '',
          filters.occurredAtTo || '',
          filters.systemName,
          filters.hostName,
          filters.hostIp
        );
      } catch (err: any) {
        if (err.message?.includes("403")) throw err;
        return null;
      }
    },
    refetchInterval: 30000,
    retry: (failureCount, error: any) => error?.message?.includes("403") ? false : failureCount < 3,
  });

  // Parse response structure: { data: { data: [...], total, page, size } }
  const items = data?.data?.data || [];
  const totalItems = data?.data?.total || 0;
  const currentPage = data?.data?.page || 1;
  const itemsPerPage = data?.data?.size || 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pagination = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
  };

  // Calculate stats from the new statistics API
  const stats = statisticsData?.data || { total: 0, severityCounts: [] };
  const totalCount = stats.total || 0;

  // Map severity counts from API response to display format
  // severityCounts is already sorted by priority from backend
  const severityStats = stats.severityCounts.slice(0, 5).map((item: any) => {
    // Find the matching severity object from active severities
    const severity = activeSeverities.find(s => s.severityCode === item.severityCode) || {
      severityCode: item.severityCode,
      severityName: item.severityName,
      colorCode: item.colorCode,
      priorityLevel: item.priorityLevel,
    };

    return {
      severity,
      count: item.count || 0,
    };
  });

  const handleApplyFilters = () => {
    setFilters({ ...filters, page: 1 });
  };

  const handleResetFilters = () => {
    const todayRange = getTodayDateRange();
    setFilters({
      page: 1,
      limit: 20,
      keyword: "",
      severity: "",
      occurredAtFrom: todayRange.from,
      occurredAtTo: todayRange.to,
      systemName: "",
      hostName: "",
      hostIp: "",
      resourceType: "",
      eventType: "",
      errorType: "",
      sort_dir: "desc",
      sort_key: "occurred_at",
    });
  };

  const handleExport = async () => {
    if (!exportStartDate || !exportEndDate) {
      toast({ title: "Lỗi", description: "Vui lòng chọn khoảng thời gian", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      await logEntryService.export(exportStartDate, exportEndDate, exportSeverity, exportSystemName);
      toast({ title: "Thành công", description: "Đã xuất file Excel" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetail = (log: LogEntry) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const getSeverityBadge = (severityCode: string) => {
    // Find severity config from active severities (case-insensitive)
    const severityConfig = activeSeverities.find(
      (s) => s.severityCode.toUpperCase() === severityCode.toUpperCase()
    );

    if (severityConfig) {
      return (
        <Badge
          className="font-medium"
          style={{
            backgroundColor: severityConfig.colorCode || '#6B7280',
            color: '#FFFFFF',
          }}
        >
          {severityCode}
        </Badge>
      );
    }

    // Fallback if severity not found
    return (
      <Badge variant="secondary">
        {severityCode}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold">Không có quyền truy cập</h3>
            <p className="text-sm mt-1">
              {(error as Error).message || "Bạn không có quyền truy cập tính năng Tra cứu Log. Vui lòng liên hệ quản trị viên để được cấp quyền."}
            </p>
            <p className="text-sm mt-2 font-medium">
              Hướng dẫn: Xem chi tiết tại{" "}
              <a href="/docs/LOG_ENTRIES_PERMISSION_FIX.md" className="underline hover:text-red-900">
                docs/LOG_ENTRIES_PERMISSION_FIX.md
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards - Compact single row, max 5 severity types by priority */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Total Card */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Tổng Log</p>
                <p className="text-xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity Cards - Top 5 by priority */}
        {severityStats.map(({ severity, count }: { severity: SysSeverity; count: number }) => (
          <Card key={severity.severityCode}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 flex items-center justify-center flex-shrink-0"
                  style={{ color: severity.colorCode || '#6B7280' }}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{severity.severityCode}</p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: severity.colorCode || '#6B7280' }}
                  >
                    {count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filter Panel */}
        <Card className={`lg:col-span-1 ${isFilterOpen ? "" : "hidden"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Bộ lọc nâng cao
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4 pr-4">
                {/* Quick Search */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Tìm kiếm nhanh</Label>
                  <Input
                    placeholder="Từ khóa..."
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  />
                </div>

                <Separator />

                {/* Severity - Dynamic */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Mức độ nghiêm trọng</Label>
                  <Select value={filters.severity || undefined} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSeverities.map((sev) => (
                        <SelectItem key={sev.severityCode} value={sev.severityCode}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: sev.colorCode || '#6B7280' }}
                            />
                            <span className="font-medium">{sev.severityCode}</span>
                            <span className="text-muted-foreground">- {sev.severityName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Khoảng thời gian
                  </Label>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Từ ngày</Label>
                      <Input
                        type="datetime-local"
                        value={filters.occurredAtFrom}
                        onChange={(e) => setFilters({ ...filters, occurredAtFrom: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Đến ngày</Label>
                      <Input
                        type="datetime-local"
                        value={filters.occurredAtTo}
                        onChange={(e) => setFilters({ ...filters, occurredAtTo: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* System & Host */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    Hệ thống
                  </Label>
                  <Input
                    placeholder="Tên hệ thống"
                    value={filters.systemName}
                    onChange={(e) => setFilters({ ...filters, systemName: e.target.value })}
                  />
                  <Input
                    placeholder="Host name"
                    value={filters.hostName}
                    onChange={(e) => setFilters({ ...filters, hostName: e.target.value })}
                  />
                  <Input
                    placeholder="Host IP"
                    value={filters.hostIp}
                    onChange={(e) => setFilters({ ...filters, hostIp: e.target.value })}
                  />
                </div>

                <Separator />

                {/* Resource & Event */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Loại tài nguyên</Label>
                  <Input
                    placeholder="Resource Type"
                    value={filters.resourceType}
                    onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Loại sự kiện</Label>
                  <Input
                    placeholder="Event Type"
                    value={filters.eventType}
                    onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Loại lỗi</Label>
                  <Input
                    placeholder="Error Type"
                    value={filters.errorType}
                    onChange={(e) => setFilters({ ...filters, errorType: e.target.value })}
                  />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button className="w-full" onClick={handleApplyFilters}>
                    <Search className="h-4 w-4 mr-2" />
                    Áp dụng bộ lọc
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleResetFilters}>
                    Đặt lại
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className={isFilterOpen ? "lg:col-span-3" : "lg:col-span-4"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Log Hệ Thống
                {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {isFilterOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
                <Sheet>
                  <SheetContent side="bottom" className="h-[300px]">
                    <SheetHeader>
                      <SheetTitle>Xuất báo cáo Excel</SheetTitle>
                      <SheetDescription>Chọn khoảng thời gian và tiêu chí để xuất dữ liệu</SheetDescription>
                    </SheetHeader>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Từ ngày *</Label>
                        <Input
                          type="datetime-local"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Đến ngày *</Label>
                        <Input
                          type="datetime-local"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Severity (tùy chọn)</Label>
                        <Select value={exportSeverity || undefined} onValueChange={setExportSeverity}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tất cả mức độ" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeSeverities.map((sev) => (
                              <SelectItem key={sev.severityCode} value={sev.severityCode}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: sev.colorCode || '#6B7280' }}
                                  />
                                  <span className="font-medium">{sev.severityCode}</span>
                                  <span className="text-muted-foreground">- {sev.severityName}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tên hệ thống (tùy chọn)</Label>
                        <Input
                          placeholder="Production System"
                          value={exportSystemName}
                          onChange={(e) => setExportSystemName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleExport} disabled={isExporting} className="w-full">
                        {isExporting ? "Đang xuất..." : "Xuất Excel"}
                      </Button>
                    </div>
                  </SheetContent>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Xuất Excel
                  </Button>
                </Sheet>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead className="w-24">Severity</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Hệ thống</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Tài nguyên</TableHead>
                    <TableHead>Condition Log</TableHead>
                    <TableHead>Loại sự kiện</TableHead>
                    <TableHead className="text-right w-20">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Đang tải dữ liệu...</p>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Không có log nào trong khoảng thời gian này
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item: LogEntry) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDateTimeDisplay(item.occurredAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.systemName}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.hostName}</span>
                            <span className="text-xs text-muted-foreground">{item.hostIp}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.resourceName}</span>
                            <span className="text-xs text-muted-foreground">{item.resourceType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm font-mono text-muted-foreground" title={item.conditionLog || "-"}>
                            {item.conditionLog || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.eventType}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(item)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{" "}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} trong tổng số{" "}
                  {pagination.totalItems}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
                    disabled={pagination.currentPage === 1}
                  >
                    Trước
                  </Button>
                  <div className="text-sm">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5" />
                  Chi tiết Log #{selectedLog.id}
                </SheetTitle>
                <SheetDescription>
                  {getSeverityBadge(selectedLog.severity)} • {formatDateTimeDisplay(selectedLog.occurredAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Thông tin hệ thống
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Hệ thống:</span>
                      <p className="font-medium">{selectedLog.systemName || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Host:</span>
                      <p className="font-medium">{selectedLog.hostName || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP:</span>
                      <p className="font-medium font-mono">{selectedLog.hostIp || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ancestry:</span>
                      <p className="font-medium font-mono text-xs">{selectedLog.ancestry || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Resource Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Thông tin tài nguyên</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tên:</span>
                      <p className="font-medium">{selectedLog.resourceName || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Loại:</span>
                      <p className="font-medium">{selectedLog.resourceType || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <p className="font-medium">{selectedLog.target || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Event Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Thông tin sự kiện
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Alarm:</span>
                      <p className="font-medium">{selectedLog.alarmName || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Loại sự kiện:</span>
                      <p><Badge variant="outline">{selectedLog.eventType}</Badge></p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nguồn:</span>
                      <p className="font-medium">{selectedLog.eventSource || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Loại lỗi:</span>
                      <p className="font-medium">{selectedLog.errorType || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Chi tiết</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground text-sm">Condition Log:</span>
                      <p className="text-sm bg-muted p-3 rounded-md mt-1 font-mono">
                        {selectedLog.conditionLog || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Event Detail:</span>
                      <p className="text-sm bg-muted p-3 rounded-md mt-1">
                        {selectedLog.eventDetail || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Translated Detail:</span>
                      <p className="text-sm bg-muted p-3 rounded-md mt-1">
                        {selectedLog.translatedDetail || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Solution */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-green-600">Giải pháp đề xuất</h3>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                    <p className="text-sm">{selectedLog.solutionSuggest || "Chưa có giải pháp đề xuất"}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Phân tích bởi: <span className="font-medium">{selectedLog.analyzedBy || "N/A"}</span>
                  </div>
                </div>

                <Separator />

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span>Created:</span>
                    <p className="font-mono">{formatDateTimeDisplay(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <span>Updated:</span>
                    <p className="font-mono">{formatDateTimeDisplay(selectedLog.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
