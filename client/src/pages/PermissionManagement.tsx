import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, Shield } from "lucide-react";
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

// Interfaces
interface Resource {
  id: number;
  name: string;
  code: string;
  type: string; // "menu", "api", "button"
  path: string | null;
  method: string | null; // "GET", "POST", "PUT", "DELETE", "PATCH"
  parentId: number | null;
  sortOrder: number;
  icon: string | null;
  description: string | null;
  status: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResourceFormData {
  name: string;
  code: string;
  type: string;
  path: string;
  method: string;
  parentId: number | null;
  sortOrder: number;
  icon: string;
  description: string;
  status: string;
  isSystem: boolean;
}

interface Group {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: string;
  isSystem: boolean;
}

interface Permission {
  id: number;
  groupId: number;
  resourceId: number;
  resource: Resource;
  canAccess: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: {
    data: T[];
    total: number;
    page: number;
    size: number;
  };
  message: string;
  statusCode: number;
}

interface SimpleApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

interface GroupedResources {
  menu: Resource[];
  api: Resource[];
  button: Resource[];
}

export default function PermissionManagement() {
  const [activeTab, setActiveTab] = useState("resources");
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

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<number | null>(null);
  const [selectedResources, setSelectedResources] = useState<Set<number>>(new Set());
  const [copyFromResource, setCopyFromResource] = useState<Resource | null>(null);

  // Permission Matrix states
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedResourceIds, setSelectedResourceIds] = useState<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<ResourceFormData>({
    name: "",
    code: "",
    type: "menu",
    path: "",
    method: "",
    parentId: null,
    sortOrder: 0,
    icon: "",
    description: "",
    status: "active",
    isSystem: false,
  });

  // Copy form state
  const [copyFormData, setCopyFormData] = useState({
    newName: "",
    newCode: "",
  });

  // Fetch danh sách resources
  const { data: resourcesData, isLoading: isLoadingResources } = useQuery<ApiResponse<Resource>>({
    queryKey: ["resources", page, limit, keyWord, sortDir, sortKey],
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
        `http://localhost:8002/api/resources?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      return response.json();
    },
  });

  // Fetch danh sách groups cho permission matrix
  const { data: groupsData } = useQuery<ApiResponse<Group>>({
    queryKey: ["groups-for-permissions"],
    queryFn: async () => {
      const response = await fetchWithAuth(
        "http://localhost:8002/api/sys-groups?page=1&limit=100"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      return response.json();
    },
    enabled: activeTab === "permissions",
  });

  // Fetch grouped resources cho permission matrix
  const { data: groupedResourcesData } = useQuery<SimpleApiResponse<GroupedResources>>({
    queryKey: ["grouped-resources"],
    queryFn: async () => {
      const response = await fetchWithAuth(
        "http://localhost:8002/api/permissions/resources"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch grouped resources");
      }

      return response.json();
    },
    enabled: activeTab === "permissions",
  });

  // Fetch permissions của group đã chọn
  const { data: groupPermissionsData } = useQuery<SimpleApiResponse<Permission[]>>({
    queryKey: ["group-permissions", selectedGroupId],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/permissions/groups/${selectedGroupId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group permissions");
      }

      return response.json();
    },
    enabled: !!selectedGroupId,
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "menu",
      path: "",
      method: "",
      parentId: null,
      sortOrder: 0,
      icon: "",
      description: "",
      status: "active",
      isSystem: false,
    });
    setEditingResource(null);
  };

  // Handlers
  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      code: resource.code,
      type: resource.type,
      path: resource.path || "",
      method: resource.method || "",
      parentId: resource.parentId,
      sortOrder: resource.sortOrder,
      icon: resource.icon || "",
      description: resource.description || "",
      status: resource.status,
      isSystem: resource.isSystem,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingResourceId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCopyClick = (resource: Resource) => {
    setCopyFromResource(resource);
    setCopyFormData({
      newName: `${resource.name} (Copy)`,
      newCode: `${resource.code}_COPY`,
    });
    setIsCopyDialogOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      const response = await fetchWithAuth(
        "http://localhost:8002/api/resources/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create resource");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-resources"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Đã tạo tài nguyên mới" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ResourceFormData }) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/resources/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update resource");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-resources"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Thành công", description: "Đã cập nhật tài nguyên" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/resources/delete/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete resource");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-resources"] });
      setIsDeleteDialogOpen(false);
      setDeletingResourceId(null);
      toast({ title: "Thành công", description: "Đã xóa tài nguyên" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetchWithAuth(
        `http://localhost:8002/api/resources/delete?ids=${ids.join(",")}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete resources");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-resources"] });
      setIsBulkDeleteDialogOpen(false);
      setSelectedResources(new Set());
      toast({ title: "Thành công", description: "Đã xóa các tài nguyên đã chọn" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const copyMutation = useMutation({
    mutationFn: async ({ sourceId, newCode, newName }: { sourceId: number; newCode: string; newName: string }) => {
      const params = new URLSearchParams({
        sourceId: sourceId.toString(),
        newCode,
        newName,
      });

      const response = await fetchWithAuth(
        `http://localhost:8002/api/resources/copy?${params.toString()}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to copy resource");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-resources"] });
      setIsCopyDialogOpen(false);
      setCopyFromResource(null);
      toast({ title: "Thành công", description: "Đã sao chép tài nguyên" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithAuth(
        "http://localhost:8002/api/resources/import",
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import resources");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-resources"] });
      toast({ title: "Thành công", description: data.message || "Đã import dữ liệu thành công" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Update group permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ groupId, resourceIds }: { groupId: number; resourceIds: number[] }) => {
      console.log("Updating permissions for group:", groupId, "with resources:", resourceIds);

      const response = await fetchWithAuth(
        `http://localhost:8002/api/permissions/groups/${groupId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceIds,
            canAccess: true,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Permission update failed:", errorText);
        let errorMessage = "Failed to update permissions";
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-permissions"] });
      toast({ title: "Thành công", description: "Đã cập nhật quyền thành công" });
    },
    onError: (error: Error) => {
      console.error("Permission update error:", error);
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingResourceId) {
      deleteMutation.mutate(deletingResourceId);
    }
  };

  const handleConfirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedResources));
  };

  const handleCopySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (copyFromResource) {
      copyMutation.mutate({
        sourceId: copyFromResource.id,
        newCode: copyFormData.newCode,
        newName: copyFormData.newName,
      });
    }
  };

  const handleSearch = () => {
    setKeyWord(searchInput);
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && resourcesData?.data.data) {
      const allIds = resourcesData.data.data
        .filter((r) => !r.isSystem)
        .map((r) => r.id);
      setSelectedResources(new Set(allIds));
    } else {
      setSelectedResources(new Set());
    }
  };

  const handleSelectResource = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedResources);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedResources(newSelected);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8002/api/resources/export");

      if (!response.ok) {
        throw new Error("Failed to export resources");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resources_export.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Thành công", description: "Đã export dữ liệu" });
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể export dữ liệu", variant: "destructive" });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8002/api/resources/import-template");

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resources_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Thành công", description: "Đã tải template" });
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải template", variant: "destructive" });
    }
  };

  // Permission Matrix handlers
  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
    // Load permissions for this group
    const permissions = groupPermissionsData?.data || [];
    const resourceIds = new Set(permissions.map((p) => p.resourceId));
    setSelectedResourceIds(resourceIds);
  };

  const handleResourceToggle = (resourceId: number, checked: boolean) => {
    const newSelected = new Set(selectedResourceIds);
    if (checked) {
      newSelected.add(resourceId);
    } else {
      newSelected.delete(resourceId);
    }
    setSelectedResourceIds(newSelected);
  };

  const handleSavePermissions = () => {
    if (selectedGroupId) {
      updatePermissionsMutation.mutate({
        groupId: selectedGroupId,
        resourceIds: Array.from(selectedResourceIds),
      });
    }
  };

  const handleSelectAllResources = () => {
    const allResourceIds = new Set<number>();
    groupedResources?.menu?.forEach((r) => allResourceIds.add(r.id));
    groupedResources?.api?.forEach((r) => allResourceIds.add(r.id));
    groupedResources?.button?.forEach((r) => allResourceIds.add(r.id));
    setSelectedResourceIds(allResourceIds);
  };

  const handleDeselectAllResources = () => {
    setSelectedResourceIds(new Set());
  };

  const resources = resourcesData?.data.data || [];
  const totalElements = resourcesData?.data.total || 0;
  const totalPages = Math.ceil(totalElements / limit);
  const selectableResources = resources.filter((r) => !r.isSystem);
  const allSelectableSelected =
    selectableResources.length > 0 &&
    selectableResources.every((r) => selectedResources.has(r.id));

  const groups = groupsData?.data.data || [];
  const groupedResources = groupedResourcesData?.data;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Quản lý phân quyền
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resources">Quản lý Resources</TabsTrigger>
              <TabsTrigger value="permissions">Phân quyền cho Groups</TabsTrigger>
            </TabsList>

            {/* Tab 1: Resources Management */}
            <TabsContent value="resources" className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    placeholder="Tìm kiếm resource..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

                  {selectedResources.size > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => setIsBulkDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa ({selectedResources.size})
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Sắp xếp:</Label>
                  <Select value={sortKey} onValueChange={setSortKey}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">ID</SelectItem>
                      <SelectItem value="name">Tên</SelectItem>
                      <SelectItem value="code">Mã</SelectItem>
                      <SelectItem value="type">Loại</SelectItem>
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
              {isLoadingResources ? (
                <div className="text-center py-8">Đang tải...</div>
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
                          <TableHead>Tên</TableHead>
                          <TableHead>Mã</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Path/Method</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Hệ thống</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resources.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        ) : (
                          resources.map((resource) => (
                            <TableRow key={resource.id}>
                              <TableCell>
                                {!resource.isSystem && (
                                  <Checkbox
                                    checked={selectedResources.has(resource.id)}
                                    onCheckedChange={(checked) =>
                                      handleSelectResource(resource.id, checked as boolean)
                                    }
                                  />
                                )}
                              </TableCell>
                              <TableCell>{resource.id}</TableCell>
                              <TableCell className="font-medium">{resource.name}</TableCell>
                              <TableCell>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {resource.code}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    resource.type === "menu"
                                      ? "default"
                                      : resource.type === "api"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {resource.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {resource.path && <div>{resource.path}</div>}
                                  {resource.method && (
                                    <Badge variant="outline" className="mt-1">
                                      {resource.method}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    resource.status === "active" ? "default" : "secondary"
                                  }
                                >
                                  {resource.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {resource.isSystem ? (
                                  <Badge variant="outline">Hệ thống</Badge>
                                ) : (
                                  <Badge variant="secondary">Người dùng</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopyClick(resource)}
                                    title="Sao chép"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(resource)}
                                    disabled={resource.isSystem}
                                    title="Chỉnh sửa"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(resource.id)}
                                    disabled={resource.isSystem}
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
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Tổng số: {totalElements} resources
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

            {/* Tab 2: Permission Matrix */}
            <TabsContent value="permissions" className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Left: Groups List */}
                <div className="col-span-3 space-y-2">
                  <Label className="text-lg font-semibold">Chọn nhóm</Label>
                  <div className="border rounded-lg p-2 space-y-1 max-h-[600px] overflow-y-auto">
                    {groups.map((group) => (
                      <Button
                        key={group.id}
                        variant={selectedGroupId === group.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleGroupSelect(group.id)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {group.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Right: Resources Checklist */}
                <div className="col-span-9 space-y-4">
                  {!selectedGroupId ? (
                    <div className="text-center py-20 text-gray-500">
                      Vui lòng chọn một nhóm để phân quyền
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">
                          Phân quyền cho: {groups.find((g) => g.id === selectedGroupId)?.name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAllResources}
                          >
                            Chọn tất cả
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeselectAllResources}
                          >
                            Bỏ chọn tất cả
                          </Button>
                          <Button onClick={handleSavePermissions}>
                            <Shield className="h-4 w-4 mr-2" />
                            Lưu phân quyền
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Menu Resources */}
                        <div>
                          <h3 className="text-md font-semibold mb-2 text-blue-600">
                            Menu Resources
                          </h3>
                          <div className="border rounded-lg p-4 space-y-2">
                            {groupedResources?.menu?.map((resource) => (
                              <div
                                key={resource.id}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <Checkbox
                                  id={`menu-${resource.id}`}
                                  checked={selectedResourceIds.has(resource.id)}
                                  onCheckedChange={(checked) =>
                                    handleResourceToggle(resource.id, checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor={`menu-${resource.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">{resource.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {resource.code} - {resource.path}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* API Resources */}
                        <div>
                          <h3 className="text-md font-semibold mb-2 text-green-600">
                            API Resources
                          </h3>
                          <div className="border rounded-lg p-4 space-y-2">
                            {groupedResources?.api?.map((resource) => (
                              <div
                                key={resource.id}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <Checkbox
                                  id={`api-${resource.id}`}
                                  checked={selectedResourceIds.has(resource.id)}
                                  onCheckedChange={(checked) =>
                                    handleResourceToggle(resource.id, checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor={`api-${resource.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">{resource.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {resource.code} - {resource.method} {resource.path}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Button Resources */}
                        <div>
                          <h3 className="text-md font-semibold mb-2 text-purple-600">
                            Button Resources
                          </h3>
                          <div className="border rounded-lg p-4 space-y-2">
                            {groupedResources?.button?.map((resource) => (
                              <div
                                key={resource.id}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                              >
                                <Checkbox
                                  id={`button-${resource.id}`}
                                  checked={selectedResourceIds.has(resource.id)}
                                  onCheckedChange={(checked) =>
                                    handleResourceToggle(resource.id, checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor={`button-${resource.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">{resource.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {resource.code}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog Thêm/Sửa Resource */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Chỉnh sửa Resource" : "Thêm Resource mới"}
            </DialogTitle>
            <DialogDescription>
              {editingResource ? "Cập nhật thông tin resource" : "Tạo resource mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Loại</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menu">Menu</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
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

              <div className="space-y-2">
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/api/example"
                />
              </div>

              {formData.type === "api" && (
                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => setFormData({ ...formData, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="LayoutDashboard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Thứ tự</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {createMutation.isPending || updateMutation.isPending
                  ? "Đang xử lý..."
                  : editingResource
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
              Bạn có chắc chắn muốn xóa resource này? Hành động này không thể hoàn tác.
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
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhiều</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedResources.size} resources đã chọn?
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
            <DialogTitle>Sao chép Resource</DialogTitle>
            <DialogDescription>
              Tạo resource mới từ: <strong>{copyFromResource?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCopySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newName">
                  Tên mới <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newName"
                  value={copyFormData.newName}
                  onChange={(e) => setCopyFormData({ ...copyFormData, newName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newCode">
                  Mã mới <span className="text-red-500">*</span>
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
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
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
