import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, Bell, Users, UserCircle, UsersRound, X } from "lucide-react";
import { alertRuleService } from "@/services/alertRuleService";
import { useToast } from "@/hooks/use-toast";
import type { AlertRule, AlertRuleFormData, AlertRuleRole, AlertRuleContact, AlertRuleGroupContact } from "@/types/alert-rule";
import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export default function AlertRuleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlertRule | null>(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Relationship management dialog
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);
  const [selectedAlertRule, setSelectedAlertRule] = useState<AlertRule | null>(null);

  // Assignment states
  const [selectedRolesToAssign, setSelectedRolesToAssign] = useState<Set<number>>(new Set());
  const [selectedContactsToAssign, setSelectedContactsToAssign] = useState<Set<number>>(new Set());
  const [selectedGroupContactsToAssign, setSelectedGroupContactsToAssign] = useState<Set<number>>(new Set());

  // Search states for each tab
  const [roleSearchKeyword, setRoleSearchKeyword] = useState("");
  const [contactSearchKeyword, setContactSearchKeyword] = useState("");
  const [groupContactSearchKeyword, setGroupContactSearchKeyword] = useState("");

  // Form state
  const [formData, setFormData] = useState<AlertRuleFormData>({
    name: "",
    description: "",
    alertChannels: "SMS,CALL,ECHAT",
    status: 1,
  });

  // Fetch alert rules
  const { data, isLoading } = useQuery({
    queryKey: ["alert-rules", page, limit, keyword],
    queryFn: () => alertRuleService.getAll(page, limit, keyword),
  });

  const items = data?.data?.data || [];
  const totalItems = data?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Fetch relationships when dialog is open
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["alert-rule-roles", selectedAlertRule?.id],
    queryFn: () => alertRuleService.getRoles(selectedAlertRule!.id),
    enabled: relationshipDialogOpen && !!selectedAlertRule,
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["alert-rule-contacts", selectedAlertRule?.id],
    queryFn: () => alertRuleService.getContacts(selectedAlertRule!.id),
    enabled: relationshipDialogOpen && !!selectedAlertRule,
  });

  const { data: groupContactsData, isLoading: groupContactsLoading } = useQuery({
    queryKey: ["alert-rule-group-contacts", selectedAlertRule?.id],
    queryFn: () => alertRuleService.getGroupContacts(selectedAlertRule!.id),
    enabled: relationshipDialogOpen && !!selectedAlertRule,
  });

  // Fetch all available items for assignment
  const { data: allRolesData } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.ROLES.LIST);
      if (!response.ok) throw new Error("Failed to fetch roles");
      return response.json();
    },
    enabled: relationshipDialogOpen,
  });

  const { data: allContactsData } = useQuery({
    queryKey: ["all-contacts"],
    queryFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.CONTACTS.LIST);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: relationshipDialogOpen,
  });

  const { data: allGroupContactsData } = useQuery({
    queryKey: ["all-group-contacts"],
    queryFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.GROUP_CONTACTS.LIST);
      if (!response.ok) throw new Error("Failed to fetch group contacts");
      return response.json();
    },
    enabled: relationshipDialogOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: AlertRuleFormData) => alertRuleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast({ title: "Thành công", description: "Đã thêm quy tắc cảnh báo" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AlertRuleFormData> }) =>
      alertRuleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast({ title: "Thành công", description: "Đã cập nhật quy tắc cảnh báo" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => alertRuleService.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast({ title: "Thành công", description: "Đã xóa quy tắc cảnh báo" });
      setDeleteId(null);
      setSelectedItems(new Set());
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const copyMutation = useMutation({
    mutationFn: (id: number) => alertRuleService.copy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast({ title: "Thành công", description: "Đã sao chép quy tắc cảnh báo" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => alertRuleService.import(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast({
        title: "Thành công",
        description: `Đã import ${result.data?.length || 0} quy tắc cảnh báo`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Relationship mutations
  const assignRoleMutation = useMutation({
    mutationFn: ({ alertRuleId, roleIds, createdBy }: { alertRuleId: number; roleIds: number[]; createdBy: string }) =>
      alertRuleService.assignRoles(alertRuleId, roleIds, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rule-roles"] });
      toast({ title: "Thành công", description: "Đã gán vai trò" });
      setSelectedRolesToAssign(new Set());
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const unassignRoleMutation = useMutation({
    mutationFn: ({ alertRuleId, roleIds }: { alertRuleId: number; roleIds: number[] }) =>
      alertRuleService.unassignRoles(alertRuleId, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rule-roles"] });
      toast({ title: "Thành công", description: "Đã bỏ gán vai trò" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const assignContactMutation = useMutation({
    mutationFn: ({ alertRuleId, contactIds, createdBy }: { alertRuleId: number; contactIds: number[]; createdBy: string }) =>
      alertRuleService.assignContacts(alertRuleId, contactIds, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rule-contacts"] });
      toast({ title: "Thành công", description: "Đã gán liên hệ" });
      setSelectedContactsToAssign(new Set());
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const unassignContactMutation = useMutation({
    mutationFn: ({ alertRuleId, contactIds }: { alertRuleId: number; contactIds: number[] }) =>
      alertRuleService.unassignContacts(alertRuleId, contactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rule-contacts"] });
      toast({ title: "Thành công", description: "Đã bỏ gán liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const assignGroupContactMutation = useMutation({
    mutationFn: ({ alertRuleId, groupContactIds, createdBy }: { alertRuleId: number; groupContactIds: number[]; createdBy: string }) =>
      alertRuleService.assignGroupContacts(alertRuleId, groupContactIds, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rule-group-contacts"] });
      toast({ title: "Thành công", description: "Đã gán nhóm liên hệ" });
      setSelectedGroupContactsToAssign(new Set());
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const unassignGroupContactMutation = useMutation({
    mutationFn: ({ alertRuleId, groupContactIds }: { alertRuleId: number; groupContactIds: number[] }) =>
      alertRuleService.unassignGroupContacts(alertRuleId, groupContactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rule-group-contacts"] });
      toast({ title: "Thành công", description: "Đã bỏ gán nhóm liên hệ" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Event handlers
  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: AlertRule) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      systemLevelId: item.systemLevel?.id,
      severityId: item.severity?.id,
      alertChannels: item.alertChannels || "SMS,CALL,ECHAT",
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleCopy = (item: AlertRule) => {
    setEditingItem(null);
    setFormData({
      name: `${item.name} (Copy)`,
      description: item.description || "",
      systemLevelId: item.systemLevel?.id,
      severityId: item.severity?.id,
      alertChannels: item.alertChannels || "SMS,CALL,ECHAT",
      status: 0, // Inactive by default for copies
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    deleteMutation.mutate(Array.from(selectedItems));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({ title: "Lỗi", description: "Vui lòng nhập tên quy tắc", variant: "destructive" });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importMutation.mutate(file);
    e.target.value = "";
  };

  const handleExport = async () => {
    try {
      await alertRuleService.export();
      toast({ title: "Thành công", description: "Đã xuất file Excel" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await alertRuleService.downloadTemplate();
      toast({ title: "Thành công", description: "Đã tải file mẫu" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      alertChannels: "SMS,CALL,ECHAT",
      status: 1,
    });
    setEditingItem(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map((item: AlertRule) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    const newSet = new Set(selectedItems);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedItems(newSet);
  };

  const parseChannels = (channels: string) => {
    return channels?.split(',').filter(Boolean) || [];
  };

  const toggleChannel = (channel: string) => {
    const currentChannels = parseChannels(formData.alertChannels || "");
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];
    setFormData({ ...formData, alertChannels: newChannels.join(',') });
  };

  const handleOpenRelationshipDialog = (item: AlertRule) => {
    setSelectedAlertRule(item);
    setSelectedRolesToAssign(new Set());
    setSelectedContactsToAssign(new Set());
    setSelectedGroupContactsToAssign(new Set());
    setRoleSearchKeyword("");
    setContactSearchKeyword("");
    setGroupContactSearchKeyword("");
    setRelationshipDialogOpen(true);
  };

  const handleAssignRoles = () => {
    if (!selectedAlertRule || selectedRolesToAssign.size === 0) return;
    assignRoleMutation.mutate({
      alertRuleId: selectedAlertRule.id,
      roleIds: Array.from(selectedRolesToAssign),
      createdBy: "admin", // TODO: Get from auth context
    });
  };

  const handleUnassignRole = (roleId: number) => {
    if (!selectedAlertRule) return;
    unassignRoleMutation.mutate({ alertRuleId: selectedAlertRule.id, roleIds: [roleId] });
  };

  const handleAssignContacts = () => {
    if (!selectedAlertRule || selectedContactsToAssign.size === 0) return;
    assignContactMutation.mutate({
      alertRuleId: selectedAlertRule.id,
      contactIds: Array.from(selectedContactsToAssign),
      createdBy: "admin", // TODO: Get from auth context
    });
  };

  const handleUnassignContact = (contactId: number) => {
    if (!selectedAlertRule) return;
    unassignContactMutation.mutate({ alertRuleId: selectedAlertRule.id, contactIds: [contactId] });
  };

  const handleAssignGroupContacts = () => {
    if (!selectedAlertRule || selectedGroupContactsToAssign.size === 0) return;
    assignGroupContactMutation.mutate({
      alertRuleId: selectedAlertRule.id,
      groupContactIds: Array.from(selectedGroupContactsToAssign),
      createdBy: "admin", // TODO: Get from auth context
    });
  };

  const handleUnassignGroupContact = (groupContactId: number) => {
    if (!selectedAlertRule) return;
    unassignGroupContactMutation.mutate({ alertRuleId: selectedAlertRule.id, groupContactIds: [groupContactId] });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quản lý Quy tắc Cảnh báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
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

            {/* Actions */}
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa nhiều ({selectedItems.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <FileDown className="h-4 w-4 mr-2" />
                File mẫu
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
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

          {/* Table */}
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
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên quy tắc</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Kênh cảnh báo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Quan hệ</TableHead>
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
                        : 'Chưa có quy tắc cảnh báo nào. Nhấn "Thêm mới" để bắt đầu.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item: AlertRule) => (
                    <TableRow key={item.id}>
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {item.systemLevel ? (
                          <Badge variant="outline">Cấp {item.systemLevel.level}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.severity ? (
                          <Badge
                            style={{
                              backgroundColor: item.severity.colorCode || "#6B7280",
                              color: "#FFFFFF",
                            }}
                          >
                            {item.severity.severityCode}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {parseChannels(item.alertChannels).map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 1 ? "default" : "secondary"}>
                          {item.status === 1 ? "Hoạt động" : "Tạm ngừng"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRelationshipDialog(item)}
                          title="Quản lý quan hệ"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Quan hệ
                        </Button>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)} trong tổng số{" "}
                {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
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
            <DialogTitle>{editingItem ? "Chỉnh sửa Quy tắc Cảnh báo" : "Thêm Quy tắc Cảnh báo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Tên quy tắc <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên quy tắc"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mã quy tắc</Label>
                  <Input
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Tự động nếu bỏ trống"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cấp độ hệ thống</Label>
                  <Select
                    value={formData.systemLevelId?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, systemLevelId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Cấp 1</SelectItem>
                      <SelectItem value="2">Cấp 2</SelectItem>
                      <SelectItem value="3">Cấp 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mức độ cảnh báo</Label>
                  <Select
                    value={formData.severityId}
                    onValueChange={(value) => setFormData({ ...formData, severityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOWN">DOWN</SelectItem>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      <SelectItem value="MAJOR">MAJOR</SelectItem>
                      <SelectItem value="MINOR">MINOR</SelectItem>
                      <SelectItem value="WARNING">WARNING</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kênh cảnh báo</Label>
                <div className="flex gap-4">
                  {["SMS", "CALL", "ECHAT"].map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={parseChannels(formData.alertChannels || "").includes(channel)}
                        onCheckedChange={() => toggleChannel(channel)}
                      />
                      <Label htmlFor={`channel-${channel}`} className="cursor-pointer">
                        {channel}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === 1}
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 1 : 0 })}
                />
                <Label htmlFor="status">Kích hoạt</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa quy tắc cảnh báo này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate([deleteId]);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Relationship Management Dialog */}
      <Dialog open={relationshipDialogOpen} onOpenChange={setRelationshipDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quản lý Quan hệ - {selectedAlertRule?.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="roles" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roles">
                Vai trò ({rolesData?.data?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="contacts">
                Liên hệ ({contactsData?.data?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="group-contacts">
                Nhóm liên hệ ({groupContactsData?.data?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Roles Tab */}
            <TabsContent value="roles" className="flex-1 overflow-auto space-y-4 mt-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên vai trò..."
                  value={roleSearchKeyword}
                  onChange={(e) => setRoleSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>

              {(() => {
                const assignedRoles = rolesData?.data || [];
                const assignedRoleIds = new Set(assignedRoles.map((r: AlertRuleRole) => r.role.id));
                const availableRoles = (allRolesData?.data?.data || []).filter(
                  (role: any) => !assignedRoleIds.has(role.id) && role.isActive
                );

                const filteredAssignedRoles = assignedRoles.filter((ar: AlertRuleRole) => {
                  if (!roleSearchKeyword) return true;
                  const keyword = roleSearchKeyword.toLowerCase();
                  return ar.role.name.toLowerCase().includes(keyword) ||
                    (ar.role.description && ar.role.description.toLowerCase().includes(keyword));
                });

                const filteredAvailableRoles = availableRoles.filter((role: any) => {
                  if (!roleSearchKeyword) return true;
                  const keyword = roleSearchKeyword.toLowerCase();
                  return role.name.toLowerCase().includes(keyword) ||
                    (role.description && role.description.toLowerCase().includes(keyword));
                });

                return (
                  <>
                    {/* Assigned Roles */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Đã gán ({filteredAssignedRoles.length}/{assignedRoles.length})</h3>
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên vai trò</TableHead>
                              <TableHead>Mô tả</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rolesLoading ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  Đang tải...
                                </TableCell>
                              </TableRow>
                            ) : filteredAssignedRoles.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  {assignedRoles.length === 0 ? "Chưa có vai trò nào được gán" : "Không tìm thấy kết quả"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAssignedRoles.map((ar: AlertRuleRole) => (
                                <TableRow key={ar.id}>
                                  <TableCell className="font-medium">{ar.role.name}</TableCell>
                                  <TableCell>{ar.role.description || "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant={ar.role.isActive ? "default" : "secondary"}>
                                      {ar.role.isActive ? "Hoạt động" : "Tạm ngừng"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleUnassignRole(ar.role.id)}
                                      disabled={unassignRoleMutation.isPending}
                                      title="Bỏ gán"
                                    >
                                      <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Available Roles */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Có thể gán ({filteredAvailableRoles.length}/{availableRoles.length})</h3>
                      {selectedRolesToAssign.size > 0 && (
                        <Button size="sm" onClick={handleAssignRoles} disabled={assignRoleMutation.isPending}>
                          <Plus className="h-4 w-4 mr-2" />
                          Gán đã chọn ({selectedRolesToAssign.size})
                        </Button>
                      )}
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedRolesToAssign.size === filteredAvailableRoles.length && filteredAvailableRoles.length > 0}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedRolesToAssign(new Set(filteredAvailableRoles.map((r: any) => r.id)));
                                    } else {
                                      setSelectedRolesToAssign(new Set());
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead>Tên vai trò</TableHead>
                              <TableHead>Mô tả</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAvailableRoles.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  {availableRoles.length === 0 ? "Không có vai trò nào khả dụng" : "Không tìm thấy kết quả"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAvailableRoles.map((role: any) => (
                                <TableRow key={role.id} className="cursor-pointer" onClick={() => {
                                  const newSet = new Set(selectedRolesToAssign);
                                  if (newSet.has(role.id)) {
                                    newSet.delete(role.id);
                                  } else {
                                    newSet.add(role.id);
                                  }
                                  setSelectedRolesToAssign(newSet);
                                }}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedRolesToAssign.has(role.id)}
                                      onCheckedChange={(checked) => {
                                        const newSet = new Set(selectedRolesToAssign);
                                        if (checked) {
                                          newSet.add(role.id);
                                        } else {
                                          newSet.delete(role.id);
                                        }
                                        setSelectedRolesToAssign(newSet);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{role.name}</TableCell>
                                  <TableCell>{role.description || "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant="default">Hoạt động</Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="flex-1 overflow-auto space-y-4 mt-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={contactSearchKeyword}
                  onChange={(e) => setContactSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>

              {(() => {
                const assignedContacts = contactsData?.data || [];
                const assignedContactIds = new Set(assignedContacts.map((c: AlertRuleContact) => c.contact.id));
                const availableContacts = (allContactsData?.data?.data || []).filter(
                  (contact: any) => !assignedContactIds.has(contact.id) && contact.isActive
                );

                const filteredAssignedContacts = assignedContacts.filter((ac: AlertRuleContact) => {
                  if (!contactSearchKeyword) return true;
                  const keyword = contactSearchKeyword.toLowerCase();
                  return ac.contact.fullName.toLowerCase().includes(keyword) ||
                    (ac.contact.email && ac.contact.email.toLowerCase().includes(keyword)) ||
                    (ac.contact.phone && ac.contact.phone.includes(keyword));
                });

                const filteredAvailableContacts = availableContacts.filter((contact: any) => {
                  if (!contactSearchKeyword) return true;
                  const keyword = contactSearchKeyword.toLowerCase();
                  return contact.fullName.toLowerCase().includes(keyword) ||
                    (contact.email && contact.email.toLowerCase().includes(keyword)) ||
                    (contact.phone && contact.phone.includes(keyword));
                });

                return (
                  <>
                    {/* Assigned Contacts */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Đã gán ({filteredAssignedContacts.length}/{assignedContacts.length})</h3>
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Họ tên</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Điện thoại</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contactsLoading ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                  Đang tải...
                                </TableCell>
                              </TableRow>
                            ) : filteredAssignedContacts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                  {assignedContacts.length === 0 ? "Chưa có liên hệ nào được gán" : "Không tìm thấy kết quả"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAssignedContacts.map((ac: AlertRuleContact) => (
                                <TableRow key={ac.id}>
                                  <TableCell className="font-medium">{ac.contact.fullName}</TableCell>
                                  <TableCell>{ac.contact.email || "-"}</TableCell>
                                  <TableCell>{ac.contact.phone || "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant={ac.contact.isActive ? "default" : "secondary"}>
                                      {ac.contact.isActive ? "Hoạt động" : "Tạm ngừng"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleUnassignContact(ac.contact.id)}
                                      disabled={unassignContactMutation.isPending}
                                      title="Bỏ gán"
                                    >
                                      <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Available Contacts */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Có thể gán ({filteredAvailableContacts.length}/{availableContacts.length})</h3>
                      {selectedContactsToAssign.size > 0 && (
                        <Button size="sm" onClick={handleAssignContacts} disabled={assignContactMutation.isPending}>
                          <Plus className="h-4 w-4 mr-2" />
                          Gán đã chọn ({selectedContactsToAssign.size})
                        </Button>
                      )}
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedContactsToAssign.size === filteredAvailableContacts.length && filteredAvailableContacts.length > 0}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedContactsToAssign(new Set(filteredAvailableContacts.map((c: any) => c.id)));
                                    } else {
                                      setSelectedContactsToAssign(new Set());
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead>Họ tên</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Điện thoại</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAvailableContacts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                  {availableContacts.length === 0 ? "Không có liên hệ nào khả dụng" : "Không tìm thấy kết quả"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAvailableContacts.map((contact: any) => (
                                <TableRow key={contact.id} className="cursor-pointer" onClick={() => {
                                  const newSet = new Set(selectedContactsToAssign);
                                  if (newSet.has(contact.id)) {
                                    newSet.delete(contact.id);
                                  } else {
                                    newSet.add(contact.id);
                                  }
                                  setSelectedContactsToAssign(newSet);
                                }}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedContactsToAssign.has(contact.id)}
                                      onCheckedChange={(checked) => {
                                        const newSet = new Set(selectedContactsToAssign);
                                        if (checked) {
                                          newSet.add(contact.id);
                                        } else {
                                          newSet.delete(contact.id);
                                        }
                                        setSelectedContactsToAssign(newSet);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{contact.fullName}</TableCell>
                                  <TableCell>{contact.email || "-"}</TableCell>
                                  <TableCell>{contact.phone || "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant="default">Hoạt động</Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </TabsContent>

            {/* Group Contacts Tab */}
            <TabsContent value="group-contacts" className="flex-1 overflow-auto space-y-4 mt-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên nhóm..."
                  value={groupContactSearchKeyword}
                  onChange={(e) => setGroupContactSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>

              {(() => {
                const assignedGroupContacts = groupContactsData?.data || [];
                const assignedGroupContactIds = new Set(assignedGroupContacts.map((gc: AlertRuleGroupContact) => gc.groupContact.id));
                const availableGroupContacts = (allGroupContactsData?.data?.data || []).filter(
                  (groupContact: any) => !assignedGroupContactIds.has(groupContact.id) && groupContact.isActive
                );

                const filteredAssignedGroupContacts = assignedGroupContacts.filter((agc: AlertRuleGroupContact) => {
                  if (!groupContactSearchKeyword) return true;
                  const keyword = groupContactSearchKeyword.toLowerCase();
                  return agc.groupContact.name.toLowerCase().includes(keyword) ||
                    (agc.groupContact.description && agc.groupContact.description.toLowerCase().includes(keyword));
                });

                const filteredAvailableGroupContacts = availableGroupContacts.filter((groupContact: any) => {
                  if (!groupContactSearchKeyword) return true;
                  const keyword = groupContactSearchKeyword.toLowerCase();
                  return groupContact.name.toLowerCase().includes(keyword) ||
                    (groupContact.description && groupContact.description.toLowerCase().includes(keyword));
                });

                return (
                  <>
                    {/* Assigned Group Contacts */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Đã gán ({filteredAssignedGroupContacts.length}/{assignedGroupContacts.length})</h3>
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên nhóm</TableHead>
                              <TableHead>Mô tả</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groupContactsLoading ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  Đang tải...
                                </TableCell>
                              </TableRow>
                            ) : filteredAssignedGroupContacts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  {assignedGroupContacts.length === 0 ? "Chưa có nhóm liên hệ nào được gán" : "Không tìm thấy kết quả"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAssignedGroupContacts.map((agc: AlertRuleGroupContact) => (
                                <TableRow key={agc.id}>
                                  <TableCell className="font-medium">{agc.groupContact.name}</TableCell>
                                  <TableCell>{agc.groupContact.description || "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant={agc.groupContact.isActive ? "default" : "secondary"}>
                                      {agc.groupContact.isActive ? "Hoạt động" : "Tạm ngừng"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleUnassignGroupContact(agc.groupContact.id)}
                                      disabled={unassignGroupContactMutation.isPending}
                                      title="Bỏ gán"
                                    >
                                      <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Available Group Contacts */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Có thể gán ({filteredAvailableGroupContacts.length}/{availableGroupContacts.length})</h3>
                      {selectedGroupContactsToAssign.size > 0 && (
                        <Button size="sm" onClick={handleAssignGroupContacts} disabled={assignGroupContactMutation.isPending}>
                          <Plus className="h-4 w-4 mr-2" />
                          Gán đã chọn ({selectedGroupContactsToAssign.size})
                        </Button>
                      )}
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedGroupContactsToAssign.size === filteredAvailableGroupContacts.length && filteredAvailableGroupContacts.length > 0}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedGroupContactsToAssign(new Set(filteredAvailableGroupContacts.map((gc: any) => gc.id)));
                                    } else {
                                      setSelectedGroupContactsToAssign(new Set());
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead>Tên nhóm</TableHead>
                              <TableHead>Mô tả</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAvailableGroupContacts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  {availableGroupContacts.length === 0 ? "Không có nhóm liên hệ nào khả dụng" : "Không tìm thấy kết quả"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAvailableGroupContacts.map((groupContact: any) => (
                                <TableRow key={groupContact.id} className="cursor-pointer" onClick={() => {
                                  const newSet = new Set(selectedGroupContactsToAssign);
                                  if (newSet.has(groupContact.id)) {
                                    newSet.delete(groupContact.id);
                                  } else {
                                    newSet.add(groupContact.id);
                                  }
                                  setSelectedGroupContactsToAssign(newSet);
                                }}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedGroupContactsToAssign.has(groupContact.id)}
                                      onCheckedChange={(checked) => {
                                        const newSet = new Set(selectedGroupContactsToAssign);
                                        if (checked) {
                                          newSet.add(groupContact.id);
                                        } else {
                                          newSet.delete(groupContact.id);
                                        }
                                        setSelectedGroupContactsToAssign(newSet);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{groupContact.name}</TableCell>
                                  <TableCell>{groupContact.description || "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant="default">Hoạt động</Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
