import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, Bell } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface AlertFrequency {
  id: number;
  alertStatusId: number;
  repeatCount: number | null;
  intervalMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlertFrequencyFormData {
  alertStatusId: number;
  repeatCount: number | null;
  intervalMinutes: number;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: AlertFrequency[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

export default function ConfigAlertFrequency() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlertFrequency | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<AlertFrequencyFormData>({
    alertStatusId: 1,
    repeatCount: null,
    intervalMinutes: 10,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch alert frequencies
  const { data, isLoading } = useQuery({
    queryKey: ["alert-frequencies", page, limit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortDir: "asc",
        sortKey: "id",
      });
      if (keyword) {
        params.append("keyword", keyword);
      }

      const response = await fetchWithAuth(`http://localhost:8002/api/alert_frequency/?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch alert frequencies");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: AlertFrequencyFormData) => {
      const response = await fetchWithAuth("http://localhost:8002/api/alert_frequency/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create alert frequency");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-frequencies"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Đã thêm cấu hình tần suất cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AlertFrequencyFormData }) => {
      const response = await fetchWithAuth(`http://localhost:8002/api/alert_frequency/edit?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update alert frequency");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-frequencies"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Thành công", description: "Đã cập nhật cấu hình tần suất cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(`http://localhost:8002/api/alert_frequency/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete alert frequency");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-frequencies"] });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      toast({ title: "Thành công", description: "Đã xóa cấu hình tần suất cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/alert_frequency/delete?ids=${ids.join(",")}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete alert frequencies");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-frequencies"] });
      setIsBulkDeleteDialogOpen(false);
      setSelectedItems(new Set());
      toast({ title: "Thành công", description: "Đã xóa các cấu hình đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const handleCopy = (item: AlertFrequency) => {
    setEditingItem(null);
    setFormData({
      alertStatusId: item.alertStatusId,
      repeatCount: item.repeatCount,
      intervalMinutes: item.intervalMinutes,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithAuth("http://localhost:8002/api/alert_frequency/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import alert frequencies");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["alert-frequencies"] });
      toast({ title: "Thành công", description: data.message || "Đã import dữ liệu" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ alertStatusId: 1, repeatCount: null, intervalMinutes: 10, isActive: true });
  };

  const handleCreateClick = () => {
    // Tìm alertStatusId chưa được sử dụng
    const usedIds = new Set(items.map(item => item.alertStatusId));
    let newAlertStatusId = 1;
    while (usedIds.has(newAlertStatusId)) {
      newAlertStatusId++;
    }

    setFormData({
      alertStatusId: newAlertStatusId,
      repeatCount: null,
      intervalMinutes: 10,
      isActive: true
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: AlertFrequency) => {
    setEditingItem(item);
    setFormData({
      alertStatusId: item.alertStatusId,
      repeatCount: item.repeatCount,
      intervalMinutes: item.intervalMinutes,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedItems(new Set(data.data.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
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

  const handleExport = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8002/api/alert_frequency/export");

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alert_frequencies_${new Date().toISOString()}.xlsx`;
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
      const response = await fetchWithAuth("http://localhost:8002/api/alert_frequency/template");

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "alert_frequencies_template.xlsx";
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Hoạt động</Badge>
    ) : (
      <Badge variant="secondary">Không hoạt động</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Quản lý Tần suất Cảnh báo
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý cấu hình tần suất cảnh báo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <FileDown className="h-4 w-4 mr-2" />
            Tải template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Nhập Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            className="hidden"
            onChange={handleImport}
          />
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Cấu hình Tần suất Cảnh báo</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm kiếm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-64"
              />
              <Button size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedItems.size > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary">Đã chọn {selectedItems.size}</Badge>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đã chọn
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {keyword ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.size === items.length && items.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Alert Status ID</TableHead>
                    <TableHead>Số lần lặp</TableHead>
                    <TableHead>Khoảng thời gian (phút)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(item.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.alertStatusId}</TableCell>
                      <TableCell>
                        {item.repeatCount === null ? (
                          <Badge variant="outline">Vô hạn</Badge>
                        ) : (
                          item.repeatCount
                        )}
                      </TableCell>
                      <TableCell>{item.intervalMinutes}</TableCell>
                      <TableCell>{getStatusBadge(item.isActive)}</TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
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
                            title="Sửa"
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
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)} trong
                    tổng số {totalItems}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">
                        Trang {page} / {totalPages}
                      </span>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Cập nhật Cấu hình Tần suất Cảnh báo" : "Thêm Cấu hình Tần suất Cảnh báo"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Cập nhật thông tin cấu hình tần suất cảnh báo"
                : "Nhập thông tin cấu hình tần suất cảnh báo mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alertStatusId">
                  Alert Status ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="alertStatusId"
                  type="number"
                  value={formData.alertStatusId}
                  onChange={(e) =>
                    setFormData({ ...formData, alertStatusId: parseInt(e.target.value) || 1 })
                  }
                  placeholder="Nhập Alert Status ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeatCount">Số lần lặp</Label>
                <Input
                  id="repeatCount"
                  type="number"
                  value={formData.repeatCount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      repeatCount: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Để trống = lặp vô hạn"
                />
                <p className="text-xs text-muted-foreground">
                  Để trống hoặc NULL để lặp vô hạn
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="intervalMinutes">
                  Khoảng thời gian (phút) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="intervalMinutes"
                  type="number"
                  value={formData.intervalMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, intervalMinutes: parseInt(e.target.value) || 10 })
                  }
                  placeholder="Nhập khoảng thời gian"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">
                  Trạng thái <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.isActive ? "true" : "false"}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
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
              Bạn có chắc chắn muốn xóa cấu hình này? Hành động này không thể hoàn tác.
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
              Bạn có chắc chắn muốn xóa {selectedItems.size} cấu hình đã chọn? Hành động này không
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
