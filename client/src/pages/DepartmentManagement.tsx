import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Copy,
  Upload,
  Download,
  FileDown,
  Building2,
} from "lucide-react";
import { departmentService } from "@/services/departmentService";
import type { Department, DepartmentRequest } from "@/types/department";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface DepartmentFormData {
  name: string;
  deptCode: string;
  description: string;
}

export default function DepartmentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    deptCode: "",
    description: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch departments
  const { data, isLoading, error } = useQuery({
    queryKey: ["departments", page, limit, searchTerm],
    queryFn: async () => {
      const response = await departmentService.getAll({
        page,
        limit,
        keyword: searchTerm || undefined,
        sort_key: "id",
        sort_dir: "desc",
      });
      console.log("📦 Department response:", response);
      return response;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: DepartmentRequest) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Thành công",
        description: "Tạo đơn vị mới thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo đơn vị",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DepartmentRequest> }) =>
      departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
      resetForm();
      toast({
        title: "Thành công",
        description: "Cập nhật đơn vị thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật đơn vị",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => departmentService.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsDeleteDialogOpen(false);
      setSelectedDepartments([]);
      toast({
        title: "Thành công",
        description: "Xóa đơn vị thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa đơn vị",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      deptCode: "",
      description: "",
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      deptCode: department.deptCode,
      description: department.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCopy = (department: Department) => {
    setFormData({
      name: department.name + " (Copy)",
      deptCode: department.deptCode + "_COPY",
      description: department.description || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartments([department.id]);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedDepartments.length === 0) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng chọn ít nhất một đơn vị để xóa",
        variant: "destructive",
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      deptCode: formData.deptCode,
      description: formData.description || undefined,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    updateMutation.mutate({
      id: selectedDepartment.id,
      data: {
        name: formData.name,
        deptCode: formData.deptCode,
        description: formData.description || undefined,
      },
    });
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(selectedDepartments);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.data?.content) {
      setSelectedDepartments(data.data.content.map((d) => d.id));
    } else {
      setSelectedDepartments([]);
    }
  };

  const handleSelectDepartment = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedDepartments([...selectedDepartments, id]);
    } else {
      setSelectedDepartments(selectedDepartments.filter((deptId) => deptId !== id));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await departmentService.exportToExcel({
        keyword: searchTerm || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `departments_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Thành công",
        description: "Xuất file Excel thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất file Excel",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await departmentService.importFromExcel(file);
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({
        title: "Thành công",
        description: "Import dữ liệu thành công",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể import dữ liệu",
        variant: "destructive",
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await departmentService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "department_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Thành công",
        description: "Tải file mẫu thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải file mẫu",
        variant: "destructive",
      });
    }
  };

  // Backend returns data.data.data instead of data.data.content
  const departments = (data?.data as any)?.data || [];
  const totalElements = (data?.data as any)?.total || 0;
  const totalPages = totalElements > 0 ? Math.ceil(totalElements / limit) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Quản lý Đơn vị
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên, mã đơn vị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={() => setPage(1)}
                variant="outline"
                size="icon"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {selectedDepartments.length > 0 && (
                <Button
                  onClick={handleDeleteMultiple}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa nhiều ({selectedDepartments.length})
                </Button>
              )}
              <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                File mẫu
              </Button>
              <Button onClick={handleImport} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Có lỗi xảy ra: {error.message}
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            departments.length > 0 &&
                            selectedDepartments.length === departments.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Tên đơn vị</TableHead>
                      <TableHead>Mã đơn vị</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      departments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDepartments.includes(department.id)}
                              onCheckedChange={(checked) =>
                                handleSelectDepartment(department.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>{department.id}</TableCell>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{department.deptCode}</Badge>
                          </TableCell>
                          <TableCell>{department.description || "-"}</TableCell>
                          <TableCell>
                            {new Date(department.createdAt).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(department)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(department)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(department)}
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

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Tổng số: {totalElements} đơn vị
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  <div className="text-sm">
                    Trang {page} / {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm đơn vị mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin đơn vị mới. Các trường có dấu (*) là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên đơn vị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên đơn vị"
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deptCode">
                  Mã đơn vị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deptCode"
                  value={formData.deptCode}
                  onChange={(e) => setFormData({ ...formData, deptCode: e.target.value })}
                  placeholder="Nhập mã đơn vị"
                  required
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả (tùy chọn)"
                  maxLength={255}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Đang tạo..." : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật đơn vị</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin đơn vị. Các trường có dấu (*) là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Tên đơn vị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên đơn vị"
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deptCode">
                  Mã đơn vị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-deptCode"
                  value={formData.deptCode}
                  onChange={(e) => setFormData({ ...formData, deptCode: e.target.value })}
                  placeholder="Nhập mã đơn vị"
                  required
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả (tùy chọn)"
                  maxLength={255}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
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
              Bạn có chắc chắn muốn xóa {selectedDepartments.length} đơn vị đã chọn? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt,.xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
