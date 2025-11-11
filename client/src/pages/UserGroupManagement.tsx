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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupUsersTab } from "@/components/GroupUsersTab";

// Interface định nghĩa theo API response từ backend
interface Group {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: string; // "active" hoặc "inactive"
  isSystem: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface GroupFormData {
  name: string;
  code: string;
  description: string;
  status: string;
  isSystem: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: Group[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

interface SingleApiResponse {
  success: boolean;
  data: Group;
  message: string;
  statusCode: number;
}

interface BulkDeleteResponse {
  success: boolean;
  message: string;
  data: null;
  statusCode: number;
}

export default function UserGroupManagement() {
  const [activeTab, setActiveTab] = useState("groups");
  const [selectedGroupForUsers, setSelectedGroupForUsers] = useState<Group | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyWord, setKeyWord] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortKey, setSortKey] = useState("createdAt");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());
  const [copyFromGroup, setCopyFromGroup] = useState<Group | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    code: "",
    description: "",
    status: "active",
    isSystem: false,
  });

  // Copy form state
  const [copyFormData, setCopyFormData] = useState({
    newName: "",
    newCode: "",
  });

  // Fetch danh sách nhóm với pagination và filter
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["user-groups", page, limit, keyWord, sortDir, sortKey],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_dir: sortDir,
        sort_key: sortKey,
      });

      if (keyWord) {
        params.append("keyWord", keyWord);
      }

      const response = await fetchWithAuth(
        `http://localhost:8002/api/sys-groups?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const result = await response.json();
      console.log("API Response:", result);
      return result;
    },
  });

  // Reset form về trạng thái ban đầu
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "active",
      isSystem: false,
    });
    setEditingGroup(null);
  };

  // Xử lý mở dialog thêm mới
  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Xử lý mở dialog chỉnh sửa
  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      code: group.code,
      description: group.description || "",
      status: group.status,
      isSystem: group.isSystem,
    });
    setIsDialogOpen(true);
  };

  // Xử lý mở dialog xóa
  const handleDeleteClick = (id: number) => {
    setDeletingGroupId(id);
    setIsDeleteDialogOpen(true);
  };

  // Xử lý mở dialog sao chép
  const handleCopyClick = (group: Group) => {
    setCopyFromGroup(group);
    setCopyFormData({
      newName: `${group.name} (Copy)`,
      newCode: `${group.code}_COPY`,
    });
    setIsCopyDialogOpen(true);
  };

  // Mutation tạo mới nhóm
  const createMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const response = await fetchWithAuth(
        "http://localhost:8002/api/sys-groups/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create group");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Thành công",
        description: "Đã tạo nhóm người dùng mới",
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

  // Mutation cập nhật nhóm
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GroupFormData }) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/sys-groups/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update group");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Thành công",
        description: "Đã cập nhật nhóm người dùng",
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

  // Mutation xóa nhóm
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/sys-groups/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete group");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      setIsDeleteDialogOpen(false);
      setDeletingGroupId(null);
      toast({
        title: "Thành công",
        description: "Đã xóa nhóm người dùng",
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

  // Mutation xóa nhiều nhóm
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/sys-groups/delete?ids=${ids.join(",")}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete groups");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      setIsBulkDeleteDialogOpen(false);
      setSelectedGroups(new Set());
      toast({
        title: "Thành công",
        description: "Đã xóa các nhóm đã chọn",
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

  // Mutation sao chép nhóm
  const copyMutation = useMutation({
    mutationFn: async ({
      sourceId,
      newCode,
      newName,
    }: {
      sourceId: number;
      newCode: string;
      newName: string;
    }) => {
      const params = new URLSearchParams({
        sourceId: sourceId.toString(),
        newCode: newCode,
        newName: newName,
      });

      const response = await fetchWithAuth(
        `http://localhost:8002/api/sys-groups/copy?${params.toString()}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to copy group");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      setIsCopyDialogOpen(false);
      setCopyFromGroup(null);
      toast({
        title: "Thành công",
        description: "Đã sao chép nhóm người dùng",
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

  // Mutation import từ file
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithAuth(
        "http://localhost:8002/api/sys-groups/import",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import groups");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      toast({
        title: "Thành công",
        description: data.message || "Đã import dữ liệu thành công",
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

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Xử lý confirm xóa
  const handleConfirmDelete = () => {
    if (deletingGroupId) {
      deleteMutation.mutate(deletingGroupId);
    }
  };

  // Xử lý confirm xóa nhiều
  const handleConfirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedGroups));
  };

  // Xử lý submit sao chép
  const handleCopySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (copyFromGroup) {
      copyMutation.mutate({
        sourceId: copyFromGroup.id,
        newCode: copyFormData.newCode,
        newName: copyFormData.newName,
      });
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setKeyWord(searchInput);
    setPage(1);
  };

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.data.content) {
      const allIds = data.data.content
        .filter((group) => !group.isSystem)
        .map((group) => group.id);
      setSelectedGroups(new Set(allIds));
    } else {
      setSelectedGroups(new Set());
    }
  };

  // Xử lý chọn/bỏ chọn một nhóm
  const handleSelectGroup = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedGroups);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedGroups(newSelected);
  };

  // Xử lý upload file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  // Xử lý export
  const handleExport = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8002/api/sys-groups/export"
      );

      if (!response.ok) {
        throw new Error("Failed to export groups");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "groups_export.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Thành công",
        description: "Đã export dữ liệu",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể export dữ liệu",
        variant: "destructive",
      });
    }
  };

  // Xử lý tải template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8002/api/sys-groups/import-template"
      );

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "groups_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Thành công",
        description: "Đã tải template",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải template",
        variant: "destructive",
      });
    }
  };

  const groups = data?.data.data || [];
  const totalElements = data?.data.total || 0;
  const totalPages = Math.ceil(totalElements / limit);
  const selectableGroups = groups.filter((g) => !g.isSystem);
  const allSelectableSelected =
    selectableGroups.length > 0 &&
    selectableGroups.every((g) => selectedGroups.has(g.id));

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quản lý nhóm người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="groups">Quản lý nhóm</TabsTrigger>
              <TabsTrigger value="users">Xem người dùng trong nhóm</TabsTrigger>
            </TabsList>

            <TabsContent value="groups" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Tìm kiếm theo tên, mã nhóm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="max-w-sm"
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>

              {selectedGroups.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa ({selectedGroups.size})
                </Button>
              )}

              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>

              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" onClick={handleDownloadTemplate}>
                <FileDown className="h-4 w-4 mr-2" />
                Template
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label>Sắp xếp theo:</Label>
              <Select value={sortKey} onValueChange={setSortKey}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="code">Mã</SelectItem>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Hướng:</Label>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Có lỗi xảy ra khi tải dữ liệu
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={allSelectableSelected}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên nhóm</TableHead>
                      <TableHead>Mã nhóm</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Nhóm hệ thống</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      groups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell>
                            {!group.isSystem && (
                              <Checkbox
                                checked={selectedGroups.has(group.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectGroup(group.id, checked as boolean)
                                }
                              />
                            )}
                          </TableCell>
                          <TableCell>{group.id}</TableCell>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {group.code}
                            </code>
                          </TableCell>
                          <TableCell>{group.description || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                group.status === "active" ? "default" : "secondary"
                              }
                            >
                              {group.status === "active" ? "Hoạt động" : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {group.isSystem ? (
                              <Badge variant="outline">Hệ thống</Badge>
                            ) : (
                              <Badge variant="secondary">Người dùng</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(group.createdAt).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyClick(group)}
                                title="Sao chép"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(group)}
                                disabled={group.isSystem}
                                title="Chỉnh sửa"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(group.id)}
                                disabled={group.isSystem}
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
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
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Tổng số: {totalElements} nhóm
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
                  <span className="text-sm">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {!selectedGroupForUsers ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Vui lòng chọn một nhóm để xem danh sách người dùng</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {groups.map((group) => (
                      <Button
                        key={group.id}
                        variant="outline"
                        onClick={() => setSelectedGroupForUsers(group)}
                      >
                        {group.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGroupForUsers(null)}
                    >
                      ← Chọn nhóm khác
                    </Button>
                  </div>
                  <GroupUsersTab
                    groupId={selectedGroupForUsers.id}
                    groupName={selectedGroupForUsers.name}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Chỉnh sửa nhóm" : "Thêm nhóm mới"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Cập nhật thông tin nhóm người dùng"
                : "Tạo nhóm người dùng mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên nhóm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên nhóm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã nhóm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="VD: ADMIN_GROUP"
                  required
                />
                <p className="text-xs text-gray-500">
                  Chỉ chứa chữ HOA, số và dấu gạch dưới
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
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
                {createMutation.isPending || updateMutation.isPending
                  ? "Đang xử lý..."
                  : editingGroup
                  ? "Cập nhật"
                  : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xóa */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Xóa nhiều */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhiều</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedGroups.size} nhóm đã chọn? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Sao chép */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sao chép nhóm</DialogTitle>
            <DialogDescription>
              Tạo nhóm mới từ nhóm: <strong>{copyFromGroup?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCopySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newName">
                  Tên nhóm mới <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newName"
                  value={copyFormData.newName}
                  onChange={(e) =>
                    setCopyFormData({ ...copyFormData, newName: e.target.value })
                  }
                  placeholder="Nhập tên nhóm mới"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newCode">
                  Mã nhóm mới <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newCode"
                  value={copyFormData.newCode}
                  onChange={(e) =>
                    setCopyFormData({
                      ...copyFormData,
                      newCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="VD: ADMIN_GROUP_COPY"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCopyDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={copyMutation.isPending}>
                {copyMutation.isPending ? "Đang sao chép..." : "Sao chép"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
