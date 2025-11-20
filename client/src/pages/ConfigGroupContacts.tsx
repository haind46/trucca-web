import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, FolderOpen, Users, UserPlus, UserMinus } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS, getApiUrl } from "@/lib/api-endpoints";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contact {
  id: number;
  fullName: string;
  departmentId: number | null;
  department: { id: number; name: string } | null;
  email: string;
  phone: string;
  isActive: boolean;
}

interface GroupContact {
  id: number;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GroupContactFormData {
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: GroupContact[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

interface ContactsApiResponse {
  success: boolean;
  data: {
    data: Contact[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

export default function ConfigGroupContacts() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupContact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupContact | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [selectedContactsToAdd, setSelectedContactsToAdd] = useState<Set<number>>(new Set());
  const [addMemberFilter, setAddMemberFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<GroupContactFormData>({
    name: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch group contacts
  const { data, isLoading } = useQuery({
    queryKey: ["group-contacts", page, limit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortDir: "asc",
        sortKey: "displayOrder",
      });
      if (keyword) {
        params.append("keyword", keyword);
      }

      const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.GROUP_CONTACTS.LIST, Object.fromEntries(params)));

      if (!response.ok) {
        throw new Error("Failed to fetch group contacts");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
  });

  // Fetch all contacts for adding to group
  const { data: allContactsData } = useQuery({
    queryKey: ["all-contacts"],
    queryFn: async () => {
      const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.CONTACTS.LIST, { page: 1, limit: 1000 }));
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      const result: ContactsApiResponse = await response.json();
      return result.data.data;
    },
    enabled: isAddMembersDialogOpen,
  });

  // Fetch members of selected group
  const { data: groupMembers, refetch: refetchMembers } = useQuery({
    queryKey: ["group-members", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const response = await fetchWithAuth(API_ENDPOINTS.GROUP_CONTACTS.CONTACTS(selectedGroup.id));
      if (!response.ok) {
        throw new Error("Failed to fetch group members");
      }
      const result = await response.json();
      return result.data as Contact[];
    },
    enabled: !!selectedGroup && isMembersDialogOpen,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: GroupContactFormData) => {
      const response = await fetchWithAuth(API_ENDPOINTS.GROUP_CONTACTS.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create group contact");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-contacts"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Đã thêm nhóm liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GroupContactFormData }) => {
      const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.GROUP_CONTACTS.UPDATE, { id }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update group contact");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-contacts"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Thành công", description: "Đã cập nhật nhóm liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.GROUP_CONTACTS.DELETE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete group contact");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-contacts"] });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      toast({ title: "Thành công", description: "Đã xóa nhóm liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(
        getApiUrl(API_ENDPOINTS.GROUP_CONTACTS.DELETE, { ids: ids.join(",") }),
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete group contacts");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-contacts"] });
      setIsBulkDeleteDialogOpen(false);
      setSelectedItems(new Set());
      toast({ title: "Thành công", description: "Đã xóa các nhóm liên hệ đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Add contacts to group mutation
  const addContactsMutation = useMutation({
    mutationFn: async ({ groupId, contactIds }: { groupId: number; contactIds: number[] }) => {
      const response = await fetchWithAuth(
        getApiUrl(API_ENDPOINTS.GROUP_CONTACTS.ADD_CONTACTS(groupId), { contactIds: contactIds.join(",") }),
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add contacts to group");
      }

      return response.json();
    },
    onSuccess: () => {
      refetchMembers();
      setIsAddMembersDialogOpen(false);
      setSelectedContactsToAdd(new Set());
      setAddMemberFilter("");
      toast({ title: "Thành công", description: "Đã thêm contacts vào nhóm" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Remove contacts from group mutation
  const removeContactsMutation = useMutation({
    mutationFn: async ({ groupId, contactIds }: { groupId: number; contactIds: number[] }) => {
      const response = await fetchWithAuth(
        getApiUrl(API_ENDPOINTS.GROUP_CONTACTS.REMOVE_CONTACTS(groupId), { contactIds: contactIds.join(",") }),
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove contacts from group");
      }

      return response.json();
    },
    onSuccess: () => {
      refetchMembers();
      setSelectedMembers(new Set());
      toast({ title: "Thành công", description: "Đã xóa contacts khỏi nhóm" });
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

      const response = await fetchWithAuth(API_ENDPOINTS.GROUP_CONTACTS.IMPORT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import group contacts");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["group-contacts"] });
      toast({ title: "Thành công", description: data.message || "Đã import dữ liệu" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      displayOrder: 0,
      isActive: true,
    });
  };

  const handleCreateClick = () => {
    resetForm();
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: GroupContact) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleManageMembers = (item: GroupContact) => {
    setSelectedGroup(item);
    setSelectedMembers(new Set());
    setIsMembersDialogOpen(true);
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

  const handleCopy = async (item: GroupContact) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.GROUP_CONTACTS.COPY(item.id), {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to copy group contact");
      }

      queryClient.invalidateQueries({ queryKey: ["group-contacts"] });
      toast({ title: "Thành công", description: "Đã sao chép nhóm liên hệ" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.GROUP_CONTACTS.EXPORT);

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `group_contacts_export_${new Date().toISOString()}.xlsx`;
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
      const response = await fetchWithAuth(API_ENDPOINTS.GROUP_CONTACTS.TEMPLATE);

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "group_contacts_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Thành công", description: "Đã tải template" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const handleAddMembers = () => {
    if (selectedGroup && selectedContactsToAdd.size > 0) {
      addContactsMutation.mutate({
        groupId: selectedGroup.id,
        contactIds: Array.from(selectedContactsToAdd),
      });
    }
  };

  const handleRemoveSelectedMembers = () => {
    if (selectedGroup && selectedMembers.size > 0) {
      removeContactsMutation.mutate({
        groupId: selectedGroup.id,
        contactIds: Array.from(selectedMembers),
      });
    }
  };

  const items = data?.data || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Filter contacts not already in group and apply search filter
  const availableContacts = (allContactsData || []).filter(
    (contact) => !groupMembers?.some((member) => member.id === contact.id)
  ).filter((contact) => {
    if (!addMemberFilter) return true;
    const searchLower = addMemberFilter.toLowerCase();
    return (
      contact.fullName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.phone.includes(addMemberFilter) ||
      contact.department?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Quản lý Nhóm Liên hệ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên nhóm, mô tả..."
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
                  <TableHead>Tên nhóm</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
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
                        : 'Chưa có nhóm liên hệ nào. Nhấn "Thêm mới" để bắt đầu.'}
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
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {item.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.displayOrder}</Badge>
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
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageMembers(item)}
                            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Thành viên
                          </Button>
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
              {editingItem ? "Cập nhật Nhóm Liên hệ" : "Thêm Nhóm Liên hệ"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Cập nhật thông tin nhóm liên hệ"
                : "Nhập thông tin nhóm liên hệ mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên nhóm <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhóm Khẩn cấp"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">
                    Thứ tự hiển thị <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
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
                  placeholder="Nhập mô tả..."
                  rows={3}
                />
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

      {/* Manage Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quản lý thành viên - {selectedGroup?.name}
            </DialogTitle>
            <DialogDescription>
              Thêm hoặc xóa contacts khỏi nhóm liên hệ
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {groupMembers?.length || 0} thành viên trong nhóm
              </div>
              <div className="flex items-center gap-2">
                {selectedMembers.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveSelectedMembers}
                    disabled={removeContactsMutation.isPending}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Xóa ({selectedMembers.size})
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setIsAddMembersDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedMembers.size === (groupMembers?.length || 0) && (groupMembers?.length || 0) > 0}
                        onCheckedChange={(checked) => {
                          if (checked && groupMembers) {
                            setSelectedMembers(new Set(groupMembers.map(m => m.id)));
                          } else {
                            setSelectedMembers(new Set());
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!groupMembers || groupMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Chưa có thành viên nào trong nhóm
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMembers.has(member.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedMembers);
                              if (checked) {
                                newSelected.add(member.id);
                              } else {
                                newSelected.delete(member.id);
                              }
                              setSelectedMembers(newSelected);
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{member.fullName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.department?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm">{member.email}</TableCell>
                        <TableCell className="text-sm">{member.phone}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMembersDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersDialogOpen} onOpenChange={setIsAddMembersDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Thêm thành viên vào nhóm - {selectedGroup?.name}
            </DialogTitle>
            <DialogDescription>
              Chọn contacts để thêm vào nhóm
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, điện thoại, đơn vị..."
                value={addMemberFilter}
                onChange={(e) => setAddMemberFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[350px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedContactsToAdd.size === availableContacts.length && availableContacts.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedContactsToAdd(new Set(availableContacts.map(c => c.id)));
                          } else {
                            setSelectedContactsToAdd(new Set());
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Tất cả contacts đã có trong nhóm
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContactsToAdd.has(contact.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedContactsToAdd);
                              if (checked) {
                                newSelected.add(contact.id);
                              } else {
                                newSelected.delete(contact.id);
                              }
                              setSelectedContactsToAdd(newSelected);
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{contact.fullName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {contact.department?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm">{contact.email}</TableCell>
                        <TableCell className="text-sm">{contact.phone}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddMembersDialogOpen(false);
              setAddMemberFilter("");
            }}>
              Hủy
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedContactsToAdd.size === 0 || addContactsMutation.isPending}
            >
              Thêm ({selectedContactsToAdd.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhóm liên hệ này? Hành động này không thể hoàn tác.
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
              Bạn có chắc chắn muốn xóa {selectedItems.size} nhóm liên hệ đã chọn? Hành động này không
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
