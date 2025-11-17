import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/api";
import { OperationTypeForm, type OperationTypeFormValues } from "@/components/OperationTypeForm";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Upload,
  Copy,
  FileDown,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types based on API documentation
interface OperationType {
  id: number;
  operationTypeCode: string;
  operationTypeName: string;
  description?: string;
  note?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: OperationType[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

// API Functions
const BASE_URL = "http://localhost:8002/api/operation-type";

const getAllOperationTypes = async (
  page: number,
  limit: number,
  keyword?: string,
  sortDir: "asc" | "desc" = "desc",
  sortKey: string = "createdAt"
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_dir: sortDir,
    sort_key: sortKey,
  });

  if (keyword) {
    params.append("keyword", keyword);
  }

  const response = await fetchWithAuth(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch operation types");
  }

  const result: ApiResponse = await response.json();
  return result.data;
};

const createOperationType = async (data: OperationTypeFormValues): Promise<OperationType> => {
  const response = await fetchWithAuth(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      createdBy: "admin", // TODO: Get from auth context
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create operation type");
  }

  const result = await response.json();
  return result.data;
};

const updateOperationType = async (
  id: number,
  data: OperationTypeFormValues
): Promise<OperationType> => {
  const response = await fetchWithAuth(`${BASE_URL}/edit?id=${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      updatedBy: "admin", // TODO: Get from auth context
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update operation type");
  }

  const result = await response.json();
  return result.data;
};

const deleteOperationTypes = async (ids: number[]): Promise<void> => {
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", id.toString()));

  const response = await fetchWithAuth(`${BASE_URL}/delete?${params}`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete operation type");
  }
};

const copyOperationType = async (
  id: number,
  data: OperationTypeFormValues
): Promise<OperationType> => {
  const response = await fetchWithAuth(`${BASE_URL}/copy?id=${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      createdBy: "admin", // TODO: Get from auth context
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to copy operation type");
  }

  const result = await response.json();
  return result.data;
};

const exportToExcel = async () => {
  const response = await fetchWithAuth(`${BASE_URL}/export`);

  if (!response.ok) {
    throw new Error("Failed to export data");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `operation_types_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const downloadTemplate = async () => {
  const response = await fetchWithAuth(`${BASE_URL}/template`);

  if (!response.ok) {
    throw new Error("Failed to download template");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "operation_types_template.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const importFromExcel = async (file: File): Promise<OperationType[]> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithAuth(`${BASE_URL}/import`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to import data");
  }

  const result = await response.json();
  return result.data;
};

export default function ConfigOperationTypes() {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OperationType | null>(null);
  const [copyingItem, setCopyingItem] = useState<OperationType | null>(null);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();

  // Pagination and filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/operation-type", page, limit, keyword, sortKey, sortDir],
    queryFn: () => getAllOperationTypes(page, limit, keyword, sortDir, sortKey),
  });

  const createMutation = useMutation({
    mutationFn: createOperationType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operation-type"] });
      toast({
        title: "Thành công",
        description: "Loại vận hành đã được thêm mới",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: OperationTypeFormValues }) =>
      updateOperationType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operation-type"] });
      toast({
        title: "Thành công",
        description: "Loại vận hành đã được cập nhật",
      });
      setEditingItem(null);
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOperationTypes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operation-type"] });
      toast({
        title: "Thành công",
        description: "Đã xóa loại vận hành thành công",
      });
      setDeletingIds([]);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
      setDeletingIds([]);
    },
  });

  const copyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: OperationTypeFormValues }) =>
      copyOperationType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operation-type"] });
      toast({
        title: "Thành công",
        description: "Đã sao chép loại vận hành thành công",
      });
      setCopyingItem(null);
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportToExcel,
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xuất dữ liệu ra Excel",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const templateMutation = useMutation({
    mutationFn: downloadTemplate,
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã tải template Excel",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: importFromExcel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/operation-type"] });
      toast({
        title: "Thành công",
        description: `Đã import ${data.length} loại vận hành`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleCreate = (data: OperationTypeFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: OperationTypeFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    }
  };

  const handleCopy = (data: OperationTypeFormValues) => {
    if (copyingItem) {
      copyMutation.mutate({ id: copyingItem.id, data });
    }
  };

  const handleDelete = () => {
    if (deletingIds.length > 0) {
      deleteMutation.mutate(deletingIds);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.data.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      event.target.value = ""; // Reset input
    }
  };

  const operationTypes = data?.data || [];
  const totalElements = data?.total || 0;
  const totalPages = Math.ceil(totalElements / limit);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Quản lý Loại vận hành
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
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeletingIds(selectedIds)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa nhiều ({selectedIds.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => templateMutation.mutate()}
                disabled={templateMutation.isPending}
              >
                <FileDown className="h-4 w-4 mr-2" />
                File mẫu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("import-file")?.click()}
                disabled={importMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                className="hidden"
                onChange={handleImport}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Thêm loại vận hành mới</DialogTitle>
                  </DialogHeader>
                  <OperationTypeForm
                    onSubmit={handleCreate}
                    isPending={createMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIds.length === operationTypes.length && operationTypes.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên loại vận hành</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : operationTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {keyword
                        ? "Không tìm thấy kết quả phù hợp"
                        : 'Chưa có loại vận hành nào. Nhấn "Thêm mới" để bắt đầu.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  operationTypes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(item.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.operationTypeCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.operationTypeName}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {item.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.note || "-"}
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
                            onClick={() => setCopyingItem(item)}
                            title="Sao chép"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(item)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingIds([item.id])}
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
                {Math.min(page * limit, totalElements)} trong tổng số {totalElements}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật loại vận hành</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <OperationTypeForm
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              defaultValues={{
                operationTypeCode: editingItem.operationTypeCode,
                operationTypeName: editingItem.operationTypeName,
                description: editingItem.description || "",
                note: editingItem.note || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Copy Dialog */}
      <Dialog open={!!copyingItem} onOpenChange={(open) => !open && setCopyingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sao chép loại vận hành</DialogTitle>
          </DialogHeader>
          {copyingItem && (
            <OperationTypeForm
              onSubmit={handleCopy}
              isPending={copyMutation.isPending}
              defaultValues={{
                operationTypeCode: `${copyingItem.operationTypeCode}_COPY`,
                operationTypeName: `${copyingItem.operationTypeName} (Copy)`,
                description: copyingItem.description || "",
                note: copyingItem.note || "",
              }}
              submitText="Sao chép"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingIds.length > 0}
        onOpenChange={(open) => !open && setDeletingIds([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {deletingIds.length} loại vận hành đã chọn? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
