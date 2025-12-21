import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown, BookOpen } from "lucide-react";
import { errorDictionaryService } from "@/services/errorDictionaryService";
import { useToast } from "@/hooks/use-toast";
import type { ErrorDictionary, ErrorDictionaryFormData } from "@/types/error-dictionary";

export default function ErrorDictionaryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ErrorDictionary | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState<ErrorDictionaryFormData>({
    errorCode: "",
    errorInfo: "",
    errorDetail: "",
    severity: "",
    ancestry: "",
    resource: "",
    resourceId: "",
    resourceDescription: "",
    type: "",
    alarm: "",
    alarmDate: "",
    conditionLog: "",
    patternConditionLog: "",
    patternResource: "",
    status: 1,
    solutionSuggest: "",
  });

  // Query to fetch error dictionaries
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["error-dictionaries", page, limit, keyword],
    queryFn: () => errorDictionaryService.getAll(page, limit, keyword),
  });

  const items = data?.data?.data || [];
  const totalItems = data?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ErrorDictionaryFormData) => errorDictionaryService.create(data),
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error(response.message || "Failed to create error dictionary");
      }
      await queryClient.invalidateQueries({ queryKey: ["error-dictionaries"] });
      toast({ title: "Thành công", description: "Đã tạo từ điển mã lỗi mới" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ErrorDictionaryFormData }) =>
      errorDictionaryService.update(id, data),
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error(response.message || "Failed to update error dictionary");
      }
      await queryClient.invalidateQueries({ queryKey: ["error-dictionaries"] });
      toast({ title: "Thành công", description: "Đã cập nhật từ điển mã lỗi" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => errorDictionaryService.delete(id),
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error(response.message || "Failed to delete error dictionary");
      }
      await queryClient.invalidateQueries({ queryKey: ["error-dictionaries"] });
      toast({ title: "Thành công", description: "Đã xóa từ điển mã lỗi" });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Delete many mutation
  const deleteManyMutation = useMutation({
    mutationFn: (ids: number[]) => errorDictionaryService.deleteMany(ids),
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error(response.message || "Failed to delete error dictionaries");
      }
      await queryClient.invalidateQueries({ queryKey: ["error-dictionaries"] });
      toast({ title: "Thành công", description: `Đã xóa ${selectedItems.size} mục` });
      setSelectedItems(new Set());
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Copy mutation
  const copyMutation = useMutation({
    mutationFn: (id: number) => errorDictionaryService.copy(id),
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error(response.message || "Failed to copy error dictionary");
      }
      await queryClient.invalidateQueries({ queryKey: ["error-dictionaries"] });
      toast({ title: "Thành công", description: "Đã sao chép từ điển mã lỗi" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (file: File) => errorDictionaryService.import(file),
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error(response.message || "Import failed");
      }
      await queryClient.invalidateQueries({ queryKey: ["error-dictionaries"] });
      toast({ title: "Thành công", description: response.message || "Import thành công" });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    },
  });

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    setFormData({
      errorCode: "",
      errorInfo: "",
      errorDetail: "",
      severity: "",
      ancestry: "",
      resource: "",
      resourceId: "",
      resourceDescription: "",
      type: "",
      alarm: "",
      alarmDate: "",
      conditionLog: "",
      patternConditionLog: "",
      patternResource: "",
      status: 1,
      solutionSuggest: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: ErrorDictionary) => {
    setEditingItem(item);
    setFormData({
      errorCode: item.errorCode || "",
      errorInfo: item.errorInfo || "",
      errorDetail: item.errorDetail || "",
      severity: item.severity || "",
      ancestry: item.ancestry || "",
      resource: item.resource || "",
      resourceId: item.resourceId || "",
      resourceDescription: item.resourceDescription || "",
      type: item.type || "",
      alarm: item.alarm || "",
      alarmDate: item.alarmDate || "",
      conditionLog: item.conditionLog || "",
      patternConditionLog: item.patternConditionLog || "",
      patternResource: item.patternResource || "",
      status: item.status,
      solutionSuggest: item.solutionSuggest || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCopy = (item: ErrorDictionary) => {
    copyMutation.mutate(item.id);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    deleteManyMutation.mutate(Array.from(selectedItems));
  };

  const handleExport = async () => {
    try {
      await errorDictionaryService.export();
      toast({ title: "Thành công", description: "Đã xuất file Excel" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importMutation.mutate(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await errorDictionaryService.downloadTemplate();
      toast({ title: "Thành công", description: "Đã tải file mẫu" });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map((item: ErrorDictionary) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: "destructive" | "default" | "secondary" | "outline"; label: string }> = {
      CRITICAL: { variant: "destructive", label: "Nghiêm trọng" },
      HIGH: { variant: "destructive", label: "Cao" },
      MEDIUM: { variant: "default", label: "Trung bình" },
      LOW: { variant: "secondary", label: "Thấp" },
    };
    const config = variants[severity] || { variant: "outline" as const, label: severity };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quản lý Từ điển mã lỗi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo mã lỗi, thông tin lỗi, tài nguyên..."
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
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={deleteManyMutation.isPending}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa nhiều ({selectedItems.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <FileDown className="h-4 w-4 mr-2" />
                File mẫu
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importMutation.isPending}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
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
                  <TableHead>Mã lỗi</TableHead>
                  <TableHead>Thông tin lỗi</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Tài nguyên</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
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
                      {keyword ? "Không tìm thấy kết quả phù hợp" : 'Chưa có từ điển mã lỗi nào. Nhấn "Thêm mới" để bắt đầu.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item: ErrorDictionary) => (
                    <TableRow key={item.id}>
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.errorCode}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="line-clamp-2">{item.errorInfo}</div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.resource || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.type || "-"}</TableCell>
                      <TableCell>
                        {item.status === 1 ? (
                          <Badge>Hoạt động</Badge>
                        ) : (
                          <Badge variant="secondary">Không hoạt động</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(item)}
                            title="Sao chép"
                            disabled={copyMutation.isPending}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} title="Chỉnh sửa">
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
                Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)} trong tổng số {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Trước
                </Button>
                <div className="text-sm">
                  Trang {page} / {totalPages}
                </div>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Chỉnh sửa từ điển mã lỗi" : "Thêm mới từ điển mã lỗi"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã lỗi</Label>
                  <Input
                    value={formData.errorCode}
                    onChange={(e) => setFormData({ ...formData, errorCode: e.target.value })}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mức độ nghiêm trọng</Label>
                  <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Thấp</SelectItem>
                      <SelectItem value="MEDIUM">Trung bình</SelectItem>
                      <SelectItem value="HIGH">Cao</SelectItem>
                      <SelectItem value="CRITICAL">Nghiêm trọng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="space-y-2">
                <Label>Thông tin lỗi</Label>
                <Input
                  value={formData.errorInfo}
                  onChange={(e) => setFormData({ ...formData, errorInfo: e.target.value })}
                />
              </div>

              {/* Row 3 */}
              <div className="space-y-2">
                <Label>Chi tiết lỗi</Label>
                <Textarea
                  value={formData.errorDetail}
                  onChange={(e) => setFormData({ ...formData, errorDetail: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tài nguyên</Label>
                  <Input
                    value={formData.resource}
                    onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resource ID</Label>
                  <Input
                    value={formData.resourceId}
                    onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="space-y-2">
                <Label>Mô tả tài nguyên</Label>
                <Textarea
                  value={formData.resourceDescription}
                  onChange={(e) => setFormData({ ...formData, resourceDescription: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Row 6 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại lỗi</Label>
                  <Input
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ancestry</Label>
                  <Input
                    value={formData.ancestry}
                    onChange={(e) => setFormData({ ...formData, ancestry: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 7 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alarm</Label>
                  <Input
                    value={formData.alarm}
                    onChange={(e) => setFormData({ ...formData, alarm: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày alarm</Label>
                  <Input
                    type="datetime-local"
                    value={formData.alarmDate}
                    onChange={(e) => setFormData({ ...formData, alarmDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 8 */}
              <div className="space-y-2">
                <Label>Condition Log</Label>
                <Textarea
                  value={formData.conditionLog}
                  onChange={(e) => setFormData({ ...formData, conditionLog: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Row 9 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pattern Condition Log</Label>
                  <Input
                    value={formData.patternConditionLog}
                    onChange={(e) => setFormData({ ...formData, patternConditionLog: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pattern Resource</Label>
                  <Input
                    value={formData.patternResource}
                    onChange={(e) => setFormData({ ...formData, patternResource: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 10 */}
              <div className="space-y-2">
                <Label>Giải pháp đề xuất</Label>
                <Textarea
                  value={formData.solutionSuggest}
                  onChange={(e) => setFormData({ ...formData, solutionSuggest: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Row 11 */}
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={String(formData.status)}
                  onValueChange={(value) => setFormData({ ...formData, status: Number(value) })}
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
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
              Bạn có chắc chắn muốn xóa từ điển mã lỗi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
