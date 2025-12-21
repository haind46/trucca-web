import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, AlertCircle, AlertTriangle, AlertOctagon, Info, Zap, Bell, LucideIcon } from "lucide-react";
import { sysSeverityService } from "@/services/sysSeverityService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SysSeverity, SysSeverityFormData } from "@/types/sys-severity";

const iconOptions = [
  'alert-circle',
  'alert-triangle',
  'alert-octagon',
  'info',
  'zap',
  'bell',
  'alert',
];

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'alert-octagon': AlertOctagon,
  'info': Info,
  'zap': Zap,
  'bell': Bell,
  'alert': AlertTriangle, // Fallback to AlertTriangle
};

// Helper function to render icon
const renderIcon = (iconName?: string) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName] || AlertCircle;
  return <IconComponent className="h-4 w-4" />;
};

export default function ConfigSeverity() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SysSeverity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<SysSeverityFormData>({
    severityCode: "",
    severityName: "",
    description: "",
    colorCode: "#EF4444",
    iconName: "alert-circle",
    priorityLevel: 3,
    clearTimeoutMinutes: 10,
    clearNotificationEnabled: true,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch severities
  const { data, isLoading } = useQuery({
    queryKey: ["sys-severities", page, limit, keyword],
    queryFn: async () => {
      const result = await sysSeverityService.getAll({
        page,
        limit,
        keyword: keyword || undefined,
        sort_dir: 'desc',
        sort_key: 'priorityLevel',
      });
      return result.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SysSeverityFormData) => {
      return sysSeverityService.create({
        severityCode: data.severityCode,
        severityName: data.severityName,
        description: data.description || undefined,
        colorCode: data.colorCode || undefined,
        iconName: data.iconName || undefined,
        priorityLevel: data.priorityLevel,
        clearTimeoutMinutes: data.clearTimeoutMinutes || undefined,
        clearNotificationEnabled: data.clearNotificationEnabled,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-severities"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Đã thêm mức độ cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SysSeverityFormData }) => {
      return sysSeverityService.update(id, {
        severityName: data.severityName,
        description: data.description || undefined,
        colorCode: data.colorCode || undefined,
        iconName: data.iconName || undefined,
        priorityLevel: data.priorityLevel,
        clearTimeoutMinutes: data.clearTimeoutMinutes || undefined,
        clearNotificationEnabled: data.clearNotificationEnabled,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-severities"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Thành công", description: "Đã cập nhật mức độ cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return sysSeverityService.delete([id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-severities"] });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      toast({ title: "Thành công", description: "Đã xóa mức độ cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return sysSeverityService.delete(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-severities"] });
      setIsBulkDeleteDialogOpen(false);
      setSelectedItems(new Set());
      toast({ title: "Thành công", description: "Đã xóa các mức độ cảnh báo đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Copy mutation
  const copyMutation = useMutation({
    mutationFn: async (id: string) => {
      return sysSeverityService.copy(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys-severities"] });
      toast({ title: "Thành công", description: "Đã sao chép mức độ cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      return sysSeverityService.importFromExcel(file);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sys-severities"] });
      toast({ title: "Thành công", description: data.message || "Đã import dữ liệu" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      severityCode: "",
      severityName: "",
      description: "",
      colorCode: "#EF4444",
      iconName: "alert-circle",
      priorityLevel: 3,
      clearTimeoutMinutes: 10,
      clearNotificationEnabled: true,
      isActive: true,
    });
  };

  const handleCreateClick = () => {
    resetForm();
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: SysSeverity) => {
    setEditingItem(item);
    setFormData({
      severityCode: item.severityCode,
      severityName: item.severityName,
      description: item.description || "",
      colorCode: item.colorCode || "#EF4444",
      iconName: item.iconName || "alert-circle",
      priorityLevel: item.priorityLevel,
      clearTimeoutMinutes: item.clearTimeoutMinutes || 10,
      clearNotificationEnabled: item.clearNotificationEnabled,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedItems(new Set(data.data.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size > 0) {
      setIsBulkDeleteDialogOpen(true);
    }
  };

  const handleConfirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedItems));
  };

  const handleCopy = async (item: SysSeverity) => {
    copyMutation.mutate(item.id);
  };

  const handleExport = async () => {
    try {
      const blob = await sysSeverityService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sys_severity_export_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Thành công", description: "Đã xuất dữ liệu" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      event.target.value = "";
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await sysSeverityService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sys_severity_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Thành công", description: "Đã tải template" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const items = data?.data || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Quản lý Mức độ Cảnh báo (Severity)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo mã, tên, mô tả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa nhiều ({selectedItems.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <FileDown className="h-4 w-4 mr-2" />
                File mẫu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={importMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                className="hidden"
                onChange={handleImport}
              />
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === items.length && items.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Mã Severity</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mức ưu tiên</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Timeout Clear</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      {keyword
                        ? "Không tìm thấy kết quả phù hợp"
                        : 'Chưa có mức độ cảnh báo nào. Nhấn "Thêm mới" để bắt đầu.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(item.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.severityCode}</TableCell>
                      <TableCell>{item.severityName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.priorityLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: item.colorCode || '#cccccc' }}
                          />
                          <span className="text-sm text-muted-foreground">{item.colorCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderIcon(item.iconName)}
                          <span className="text-sm text-muted-foreground">{item.iconName || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {item.clearTimeoutMinutes ? `${item.clearTimeoutMinutes} phút` : '-'}
                      </TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Không hoạt động</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(item)}
                            title="Sao chép"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, totalItems)} trong tổng số {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <div className="text-sm">
                  Trang {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Cập nhật Mức độ Cảnh báo" : "Thêm Mức độ Cảnh báo"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Cập nhật thông tin mức độ cảnh báo"
                : "Nhập thông tin mức độ cảnh báo mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severityCode">
                    Mã Severity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="severityCode"
                    value={formData.severityCode}
                    onChange={(e) => setFormData({ ...formData, severityCode: e.target.value.toUpperCase() })}
                    placeholder="CRITICAL"
                    required
                    disabled={!!editingItem}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severityName">
                    Tên Severity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="severityName"
                    value={formData.severityName}
                    onChange={(e) => setFormData({ ...formData, severityName: e.target.value })}
                    placeholder="Nghiêm trọng"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết..."
                  rows={2}
                />
              </div>

              {/* UI Display */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colorCode">Màu sắc</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorCode"
                      type="color"
                      value={formData.colorCode}
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.colorCode}
                      onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                      placeholder="#EF4444"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iconName">Icon</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 border rounded">
                      {renderIcon(formData.iconName)}
                    </div>
                    <Select
                      value={formData.iconName}
                      onValueChange={(value) => setFormData({ ...formData, iconName: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center gap-2">
                              {renderIcon(icon)}
                              <span>{icon}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priorityLevel">
                    Mức ưu tiên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="priorityLevel"
                    type="number"
                    min={1}
                    max={5}
                    value={formData.priorityLevel}
                    onChange={(e) => setFormData({ ...formData, priorityLevel: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Clear Config */}
              <div className="space-y-2">
                <Label htmlFor="clearTimeoutMinutes">Timeout Clear (phút)</Label>
                <Input
                  id="clearTimeoutMinutes"
                  type="number"
                  min={1}
                  value={formData.clearTimeoutMinutes}
                  onChange={(e) => setFormData({ ...formData, clearTimeoutMinutes: parseInt(e.target.value) })}
                />
              </div>

              {/* Switches */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="clearNotificationEnabled"
                    checked={formData.clearNotificationEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, clearNotificationEnabled: checked })}
                  />
                  <Label htmlFor="clearNotificationEnabled">Bật thông báo khi Clear</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Kích hoạt</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingItem ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mức độ cảnh báo này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhiều</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedItems.size} mức độ cảnh báo đã chọn? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
