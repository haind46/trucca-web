import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OperationTypeForm, type OperationTypeFormValues } from "@/components/OperationTypeForm";
import {
  Plus,
  Settings,
  Trash2,
  Search,
  Download,
  Upload,
  Copy,
  FileDown,
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

interface PaginationResponse {
  content: OperationType[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
}

// API Functions
const BASE_URL = "http://localhost:8002/api/operation-type";

const getAllOperationTypes = async (
  page: number,
  limit: number,
  keyWord?: string,
  sortDir: "asc" | "desc" = "desc",
  sortKey: string = "createdAt"
): Promise<PaginationResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_dir: sortDir,
    sort_key: sortKey,
  });

  if (keyWord) {
    params.append("keyWord", keyWord);
  }

  const response = await fetch(`${BASE_URL}?${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch operation types");
  }

  const result = await response.json();
  return result.data;
};

const createOperationType = async (data: OperationTypeFormValues): Promise<OperationType> => {
  const response = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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
  const response = await fetch(`${BASE_URL}/edit?id=${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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

  const response = await fetch(`${BASE_URL}/delete?${params}`, {
    method: "POST",
    credentials: "include",
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
  const response = await fetch(`${BASE_URL}/copy?id=${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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
  const response = await fetch(`${BASE_URL}/export`, {
    credentials: "include",
  });

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
  const response = await fetch(`${BASE_URL}/template`, {
    credentials: "include",
  });

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

  const response = await fetch(`${BASE_URL}/import`, {
    method: "POST",
    credentials: "include",
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

  const { data, isLoading } = useQuery<PaginationResponse>({
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
      setSelectedIds(data.content.map((item) => item.id));
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

  const operationTypes = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Loại vận hành</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các loại vận hành của hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => templateMutation.mutate()}
            disabled={templateMutation.isPending}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Tải template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("import-file")?.click()}
            disabled={importMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Nhập Excel
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleImport}
          />
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách loại vận hành</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-64"
                />
                <Button size="sm" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select value={sortKey} onValueChange={setSortKey}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                  <SelectItem value="operationTypeCode">Mã</SelectItem>
                  <SelectItem value="operationTypeName">Tên</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedIds.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary">Đã chọn {selectedIds.length}</Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeletingIds(selectedIds)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đã chọn
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
          ) : operationTypes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {keyword
                ? "Không tìm thấy kết quả phù hợp"
                : 'Chưa có loại vận hành nào. Nhấn "Thêm mới" để bắt đầu.'}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 border-b font-medium text-sm">
                <Checkbox
                  checked={
                    selectedIds.length === operationTypes.length && operationTypes.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <div className="flex-1 grid grid-cols-12 gap-4">
                  <div className="col-span-2">Mã</div>
                  <div className="col-span-3">Tên</div>
                  <div className="col-span-4">Mô tả</div>
                  <div className="col-span-2">Ngày tạo</div>
                  <div className="col-span-1 text-right">Thao tác</div>
                </div>
              </div>

              {operationTypes.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 p-4 border rounded-md hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(item.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.operationTypeCode}
                      </Badge>
                    </div>
                    <div className="col-span-3">
                      <div className="font-medium">{item.operationTypeName}</div>
                      {item.note && (
                        <div className="text-xs text-muted-foreground mt-1">{item.note}</div>
                      )}
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {item.description || "-"}
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      {item.createdBy && (
                        <div className="text-xs">bởi {item.createdBy}</div>
                      )}
                    </div>
                    <div className="col-span-1 flex gap-1 justify-end">
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
                        <Settings className="h-4 w-4" />
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, totalElements)} trong tổng số {totalElements}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={limit.toString()}
                  onValueChange={(v) => {
                    setLimit(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                    <SelectItem value="100">100 / trang</SelectItem>
                  </SelectContent>
                </Select>
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
