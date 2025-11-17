import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, Settings2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface SystemLevel {
  id: number;
  level: string;
  description: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

interface SystemLevelFormData {
  level: string;
  description: string;
  createdBy?: string;
  updatedBy?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: SystemLevel[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

export default function ConfigSystemLevel() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SystemLevel | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<SystemLevelFormData>({
    level: "",
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system levels
  const { data, isLoading } = useQuery({
    queryKey: ["system-levels", page, limit, keyword],
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

      const response = await fetchWithAuth(`http://localhost:8002/api/systemLevel/?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch system levels");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SystemLevelFormData) => {
      const response = await fetchWithAuth("http://localhost:8002/api/systemLevel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, createdBy: "admin" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create system level");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-levels"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Đã thêm cấp độ hệ thống" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SystemLevelFormData }) => {
      const response = await fetchWithAuth(`http://localhost:8002/api/systemLevel/edit?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, updatedBy: "admin" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update system level");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-levels"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Thành công", description: "Đã cập nhật cấp độ hệ thống" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(`http://localhost:8002/api/systemLevel/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete system level");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-levels"] });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      toast({ title: "Thành công", description: "Đã xóa cấp độ hệ thống" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/systemLevel/delete?ids=${ids.join(",")}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete system levels");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-levels"] });
      setIsBulkDeleteDialogOpen(false);
      setSelectedItems(new Set());
      toast({ title: "Thành công", description: "Đã xóa các cấp độ đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });


  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithAuth("http://localhost:8002/api/systemLevel/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import system levels");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["system-levels"] });
      toast({ title: "Thành công", description: data.message || "Đã import dữ liệu" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ level: "", description: "" });
  };

  const handleCreateClick = () => {
    resetForm();
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: SystemLevel) => {
    setEditingItem(item);
    setFormData({
      level: item.level,
      description: item.description || "",
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

  const handleCopy = (item: SystemLevel) => {
    setEditingItem(null); // Đảm bảo không ở chế độ edit
    setFormData({
      level: `${item.level} (Copy)`,
      description: item.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8002/api/systemLevel/export");

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `system_levels_${new Date().toISOString()}.xlsx`;
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
      const response = await fetchWithAuth("http://localhost:8002/api/systemLevel/template");

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "system_levels_template.xlsx";
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
            <Settings2 className="h-5 w-5" />
            Quản lý Cấp độ Hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo cấp độ, mô tả..."
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
                    <TableHead>Cấp độ</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {keyword
                          ? "Không tìm thấy kết quả phù hợp"
                          : 'Chưa có cấp độ hệ thống nào. Nhấn "Thêm mới" để bắt đầu.'}
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
                        <TableCell className="font-medium">{item.level}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {item.description || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.createdBy || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Cập nhật Cấp độ Hệ thống" : "Thêm Cấp độ Hệ thống"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Cập nhật thông tin cấp độ hệ thống"
                : "Nhập thông tin cấp độ hệ thống mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="level">
                  Cấp độ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Ví dụ: Critical, High, Medium, Low"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả..."
                  rows={3}
                />
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
              Bạn có chắc chắn muốn xóa cấp độ này? Hành động này không thể hoàn tác.
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
              Bạn có chắc chắn muốn xóa {selectedItems.size} cấp độ đã chọn? Hành động này không
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
