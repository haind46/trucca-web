import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, AlertTriangle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

interface SeverityConfig {
  id: string;
  severityLevel: string;
  description: string | null;
  notifyToLevel: number | null;
  autoCall: boolean;
  ttsTemplate: string | null;
  createdAt: string;
}

interface SeverityFormData {
  severityLevel: string;
  description: string;
  notifyToLevel: number | null;
  autoCall: boolean;
  ttsTemplate: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: SeverityConfig[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

export default function ConfigSeverity() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeverityConfig | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<SeverityFormData>({
    severityLevel: "",
    description: "",
    notifyToLevel: null,
    autoCall: false,
    ttsTemplate: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch severity configs
  const { data, isLoading } = useQuery({
    queryKey: ["severity-config", page, limit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortDir: "desc",
        sortKey: "createdAt",
      });

      if (keyword) {
        params.append("keyword", keyword);
      }

      const response = await fetchWithAuth(
        `http://localhost:8002/api/severity-config?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch severity configs");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SeverityFormData) => {
      const response = await fetchWithAuth("http://localhost:8002/api/severity-config/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create severity config");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["severity-config"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Đã thêm mới cấu hình mức độ cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SeverityFormData> }) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/severity-config/edit?id=${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update severity config");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["severity-config"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Thành công", description: "Đã cập nhật cấu hình mức độ cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const idsParam = ids.map((id) => `ids=${id}`).join("&");
      const response = await fetchWithAuth(
        `http://localhost:8002/api/severity-config/delete?${idsParam}`,
        { method: "POST" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete severity config(s)");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["severity-config"] });
      setIsDeleteDialogOpen(false);
      setIsBulkDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedItems(new Set());
      toast({ title: "Thành công", description: "Đã xóa cấu hình mức độ cảnh báo" });
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

      const response = await fetchWithAuth("http://localhost:8002/api/severity-config/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to import");
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["severity-config"] });
      toast({
        title: "Thành công",
        description: result.message || "Đã import dữ liệu"
      });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      severityLevel: "",
      description: "",
      notifyToLevel: null,
      autoCall: false,
      ttsTemplate: "",
    });
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: SeverityConfig) => {
    setEditingItem(item);
    setFormData({
      severityLevel: item.severityLevel,
      description: item.description || "",
      notifyToLevel: item.notifyToLevel,
      autoCall: item.autoCall,
      ttsTemplate: item.ttsTemplate || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate([deletingId]);
    }
  };

  const confirmBulkDelete = () => {
    deleteMutation.mutate(Array.from(selectedItems));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.severityLevel.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mức độ cảnh báo",
        variant: "destructive",
      });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCopy = (item: SeverityConfig) => {
    setEditingItem(null);
    setFormData({
      severityLevel: `${item.severityLevel}_copy`,
      description: item.description || "",
      notifyToLevel: item.notifyToLevel,
      autoCall: item.autoCall,
      ttsTemplate: item.ttsTemplate || "",
    });
    setIsDialogOpen(true);
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

  const handleExport = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8002/api/severity-config/export");

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `severity_config_${new Date().toISOString()}.xlsx`;
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
      const response = await fetchWithAuth("http://localhost:8002/api/severity-config/template");

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "severity_config_template.xlsx";
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
            <AlertTriangle className="h-5 w-5" />
            Quản lý Mức độ Cảnh báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo mức độ, mô tả..."
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
                  <TableHead>Mức độ cảnh báo</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Thông báo đến cấp</TableHead>
                  <TableHead>Tự động gọi</TableHead>
                  <TableHead>Mẫu TTS</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {keyword
                        ? "Không tìm thấy kết quả phù hợp"
                        : 'Chưa có cấu hình nào. Nhấn "Thêm mới" để bắt đầu.'}
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
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {item.severityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {item.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.notifyToLevel !== null ? (
                          <Badge variant="secondary">{item.notifyToLevel}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.autoCall ? (
                          <Badge variant="default">Có</Badge>
                        ) : (
                          <Badge variant="secondary">Không</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.ttsTemplate || "-"}
                        </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Cập nhật Mức độ Cảnh báo" : "Thêm Mức độ Cảnh báo"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Cập nhật thông tin cấu hình mức độ cảnh báo"
                : "Nhập thông tin cấu hình mức độ cảnh báo mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severityLevel">
                    Mức độ cảnh báo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="severityLevel"
                    value={formData.severityLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, severityLevel: e.target.value })
                    }
                    placeholder="VD: HIGH, MEDIUM, LOW"
                    maxLength={20}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notifyToLevel">Thông báo đến cấp</Label>
                  <Input
                    id="notifyToLevel"
                    type="number"
                    value={formData.notifyToLevel ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notifyToLevel: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="VD: 1, 2, 3..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết về mức độ cảnh báo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ttsTemplate">Mẫu TTS (Text-to-Speech)</Label>
                <Textarea
                  id="ttsTemplate"
                  value={formData.ttsTemplate}
                  onChange={(e) =>
                    setFormData({ ...formData, ttsTemplate: e.target.value })
                  }
                  placeholder="VD: Cảnh báo {severity_level}: {description}"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoCall"
                  checked={formData.autoCall}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoCall: checked })
                  }
                />
                <Label htmlFor="autoCall">Tự động gọi điện</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
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

      {/* Delete Confirmation Dialog */}
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
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhiều</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedItems.size} cấu hình đã chọn? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
