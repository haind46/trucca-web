import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Department {
  id: string;
  name: string;
  deptCode: string;
  desc: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  department: Department | null;
  mobilePhone: string;
  status: number;
  userNote: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  username: string;
  password: string;
  fullname: string;
  email: string;
  department: string;
  mobilePhone: string;
  status: number;
  userNote: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: User[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyWord, setKeyWord] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [copyFromUser, setCopyFromUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    fullname: "",
    email: "",
    department: "",
    mobilePhone: "",
    status: 1,
    userNote: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ["users", page, limit, keyWord],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_dir: "desc",
        sort_key: "createdAt",
      });
      if (keyWord) {
        params.append("keyWord", keyWord);
      }

      const response = await fetchWithAuth(`/api/users?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await fetchWithAuth("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Thành công",
        description: "Đã tạo người dùng mới",
      });
      setIsDialogOpen(false);
      // resetForm will be called when dialog closes via onOpenChange
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo người dùng",
        variant: "destructive",
      });
    },
  });

  // Edit user mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: UserFormData }) => {
      const response = await fetchWithAuth(`/api/users/edit?id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật người dùng",
      });
      setIsDialogOpen(false);
      // resetForm will be called when dialog closes via onOpenChange
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật người dùng",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithAuth(`/api/users/delete?ids=${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng",
      });
      setIsDeleteDialogOpen(false);
      setDeletingUserId(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullname: "",
      email: "",
      department: "",
      mobilePhone: "",
      status: 1,
      userNote: "",
    });
    setEditingUser(null);
    setCopyFromUser(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      fullname: user.fullname,
      email: user.email,
      department: user.department?.deptCode || "",
      mobilePhone: user.mobilePhone,
      status: user.status,
      userNote: user.userNote,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      editMutation.mutate({ id: editingUser.id, userData: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingUserId) {
      deleteMutation.mutate(deletingUserId);
    }
  };

  const handleSearch = () => {
    setKeyWord(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetchWithAuth(`/api/users/delete?ids=${ids.join(",")}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to delete users");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Thành công",
        description: `Đã xóa ${selectedUsers.size} người dùng`,
      });
      setIsBulkDeleteDialogOpen(false);
      setSelectedUsers(new Set());
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive",
      });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth("/api/users/export", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to export users");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã export danh sách người dùng",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể export dữ liệu",
        variant: "destructive",
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithAuth("/api/users/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to import users");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Thành công",
        description: "Đã import danh sách người dùng",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể import dữ liệu",
        variant: "destructive",
      });
    },
  });

  // Selection handlers
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === data?.data.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(data?.data.map((u) => u.id) || []));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng chọn ít nhất một người dùng",
        variant: "destructive",
      });
      return;
    }
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedUsers));
  };

  // Copy user mutation using API endpoint
  const copyUserMutation = useMutation({
    mutationFn: async ({ sourceUserId, newUsername }: { sourceUserId: string; newUsername: string }) => {
      const response = await fetchWithAuth(`/api/users/copy?sourceUserId=${sourceUserId}&newUsername=${newUsername}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to copy user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Thành công",
        description: "Đã sao chép người dùng",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép người dùng",
        variant: "destructive",
      });
    },
  });

  const handleCopyFrom = (user: User) => {
    // Set copy source and form data first
    setCopyFromUser(user);
    const copiedData = {
      username: "",
      password: "",
      fullname: user.fullname,
      email: "",
      department: user.department?.deptCode || "",
      mobilePhone: user.mobilePhone,
      status: user.status,
      userNote: user.userNote,
    };
    setFormData(copiedData);

    // Open dialog after state is set
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 0);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetchWithAuth("/api/users/import-template");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Thành công",
        description: "Đã tải file mẫu",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải file mẫu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên đăng nhập, họ tên, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {selectedUsers.size > 0 && (
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa nhiều ({selectedUsers.size})
                </Button>
              )}
              <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                File mẫu
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                onChange={handleImport}
                style={{ display: "none" }}
              />
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleOpenCreate}>
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
                      checked={data?.data && selectedUsers.size === data.data.length && data.data.length > 0}
                      onCheckedChange={toggleAllUsers}
                    />
                  </TableHead>
                  <TableHead>Mã user</TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Bộ phận</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Ngày tạo</TableHead>
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
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullname}</TableCell>
                      <TableCell>{user.department?.name || ""}</TableCell>
                      <TableCell>{user.mobilePhone}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleString("vi-VN")
                          : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyFrom(user)}
                            title="Sao chép"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(user)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(user.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {((page - 1) * limit) + 1} -{" "}
                {Math.min(page * limit, data.total)} trong tổng số{" "}
                {data.total} bản ghi
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
                    Trang {page} / {Math.ceil(data.total / limit)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(data.total / limit)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Only reset when dialog is closing
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Chỉnh sửa người dùng" : copyFromUser ? "Thêm người dùng mới (Sao chép)" : "Thêm người dùng mới"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Cập nhật thông tin người dùng"
                : copyFromUser
                ? `Tạo người dùng mới từ dữ liệu của ${copyFromUser.fullname}`
                : "Nhập thông tin người dùng mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Tên đăng nhập <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mật khẩu {!editingUser && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    placeholder={editingUser ? "Để trống nếu không đổi" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">
                    Họ và tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullname"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Bộ phận</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Số điện thoại</Label>
                  <Input
                    id="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={(e) =>
                      setFormData({ ...formData, mobilePhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hoạt động</SelectItem>
                    <SelectItem value="0">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userNote">Ghi chú</Label>
                <Input
                  id="userNote"
                  value={formData.userNote}
                  onChange={(e) =>
                    setFormData({ ...formData, userNote: e.target.value })
                  }
                />
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
                disabled={createMutation.isPending || editMutation.isPending}
              >
                {createMutation.isPending || editMutation.isPending
                  ? "Đang xử lý..."
                  : editingUser
                  ? "Cập nhật"
                  : "Tạo mới"}
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
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
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
              Bạn có chắc chắn muốn xóa {selectedUsers.size} người dùng đã chọn? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
