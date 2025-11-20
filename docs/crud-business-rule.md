Business Rule:
các màn hình CRUD đều phải có đầy đủ các tính năng:
- Thêm mới đối tượng
- Sửa đối tượng
- Xóa đối tượng
- List all danh sách đối tượng
- Filter (tìm kiếm gần đúng theo các trường hiển thị trên giao diện)
- Xóa nhiều đối tượng
- Sao chép từ dữ liệu cũ để tự động fill các trường thông tin giúp tạo mới đối tượng nhanh chóng
- Import danh sách từ file csv, txt, excel (Cho phép tải file mẫu)
- Export file ra excel

Port API Backend không phải 8080 mà mặc định 8002 nhé.
Lưu ý cần có authen sử dụng fetchWithAuth giống các màn hình khác nhé mới gọi được API backend
Phần call API phải tuân thủ theo quy định tại các file api-config.ts, api-endpoints.ts

**⚠️ QUAN TRỌNG - Cấu trúc Response:**
- Đọc kỹ file `docs/API_RESPONSE_STRUCTURE.md` trước khi code
- Backend sử dụng `data.data` (KHÔNG phải `data.content`)
- Backend sử dụng `total` (KHÔNG phải `totalElements`)
- Backend KHÔNG trả về `totalPages` - phải tự tính bằng `Math.ceil(total / limit)`

---

## Quy tắc định dạng UI chuẩn cho màn hình CRUD

### 1. Cấu trúc Layout
- **Wrapper**: `<div className="space-y-4">` - khoảng cách giữa các phần tử là 4 units
- **Single Card Layout**: Toàn bộ nội dung nằm trong 1 Card duy nhất, KHÔNG tách riêng header

### 2. Card Header
```tsx
<CardHeader>
  <CardTitle className="flex items-center gap-2">
    <IconComponent className="h-5 w-5" />
    Tên màn hình
  </CardTitle>
</CardHeader>
```
- Icon size: `h-5 w-5` (nhỏ hơn trước đây)
- KHÔNG có mô tả phụ bên dưới tiêu đề

### 3. Toolbar (Search + Actions)
Trong CardContent, toolbar được chia làm 2 phần:

**Phần trái - Search Box**:
```tsx
<div className="flex items-center gap-2 flex-1 max-w-md">
  <Input
    placeholder="Tìm kiếm theo [các trường cụ thể]..."
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
    className="flex-1"
  />
  <Button onClick={handleSearch} variant="outline" size="icon">
    <Search className="h-4 w-4" />
  </Button>
</div>
```
- Placeholder cụ thể theo từng màn hình (VD: "Tìm kiếm theo mã, tên, mô tả...")
- Sử dụng `onKeyDown` để xử lý Enter, KHÔNG dùng `onKeyPress`
- max-width: `max-w-md` để giới hạn độ rộng

**Phần phải - Action Buttons** (theo thứ tự từ trái qua phải):
1. **Xóa nhiều** (chỉ hiện khi có checkbox được chọn)
2. **File mẫu** (Download Template)
3. **Import**
4. **Export**
5. **Thêm mới**

```tsx
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
  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={handleImport} />
  <Button variant="outline" size="sm" onClick={handleExport}>
    <Download className="h-4 w-4 mr-2" />
    Export
  </Button>
  <Button onClick={handleCreateClick}>
    <Plus className="h-4 w-4 mr-2" />
    Thêm mới
  </Button>
</div>
```

### 4. Table Structure
**Table Container**:
```tsx
<div className="border rounded-lg">
  <Table>
    {/* TableHeader và TableBody */}
  </Table>
</div>
```
- Bọc Table trong `<div className="border rounded-lg">` để có viền bo tròn

**TableBody - States**:
```tsx
<TableBody>
  {isLoading ? (
    <TableRow>
      <TableCell colSpan={[số cột]} className="text-center">
        Đang tải...
      </TableCell>
    </TableRow>
  ) : items.length === 0 ? (
    <TableRow>
      <TableCell colSpan={[số cột]} className="text-center text-muted-foreground">
        {keyword
          ? "Không tìm thấy kết quả phù hợp"
          : 'Chưa có [tên đối tượng] nào. Nhấn "Thêm mới" để bắt đầu.'}
      </TableCell>
    </TableRow>
  ) : (
    items.map((item) => (
      {/* Render rows */}
    ))
  )}
</TableBody>
```

**Cell Styling**:
- Text descriptions/notes:
  ```tsx
  <TableCell className="max-w-xs">
    <div className="text-sm text-muted-foreground line-clamp-2">
      {item.description || "-"}
    </div>
  </TableCell>
  ```
- Date cells: `className="text-sm text-muted-foreground"`
- Checkbox cell: `className="w-12"`
- Action cell: `className="text-right"`

**Action Buttons** (theo thứ tự từ trái qua phải):
1. Copy (Sao chép)
2. Pencil (Chỉnh sửa)
3. Trash2 (Xóa)

```tsx
<TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <Button variant="ghost" size="icon" onClick={() => handleCopy(item)} title="Sao chép">
      <Copy className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} title="Chỉnh sửa">
      <Pencil className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id)} title="Xóa">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
</TableCell>
```

### 5. Pagination
```tsx
{totalPages > 1 && (
  <div className="flex items-center justify-between mt-4">
    <div className="text-sm text-muted-foreground">
      Hiển thị {(page - 1) * limit + 1} -{" "}
      {Math.min(page * limit, totalItems)} trong tổng số {totalItems}
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
```
- Chỉ hiện khi `totalPages > 1`
- KHÔNG có dropdown chọn sort
- Đơn giản với 2 nút Trước/Sau và hiển thị số trang

### 6. Imports cần thiết
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Copy, Upload, Download, FileDown } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
```

### 7. Error Handling trong Mutations
Khi gọi API create/update/delete, PHẢI kiểm tra cả `response.ok` và `result.success`:

```tsx
const createMutation = useMutation({
  mutationFn: async (data: FormData) => {
    const response = await fetchWithAuth(API_ENDPOINTS.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // QUAN TRỌNG: Kiểm tra cả response.ok và result.success
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to create");
    }

    return result;
  },
  onSuccess: () => {
    // Handle success
  },
  onError: (error: Error) => {
    toast({ title: "Lỗi", description: error.message, variant: "destructive" });
  },
});
```

**Lý do**: Backend có thể trả về status 400 với `success: false` và message lỗi. Nếu chỉ check `response.ok`, sẽ bỏ qua các lỗi business logic.

### 8. Form Layout trong Dialog
Form trong dialog sử dụng grid layout 2 cột cho các trường ngắn:

```tsx
<DialogContent className="max-w-2xl">
  <form onSubmit={handleSubmit}>
    <div className="space-y-4 py-4">
      {/* Grid 2 cột cho các trường ngắn */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trường 1 <span className="text-destructive">*</span></Label>
          <Input ... />
        </div>
        <div className="space-y-2">
          <Label>Trường 2</Label>
          <Input ... />
        </div>
      </div>

      {/* Full width cho textarea hoặc trường dài */}
      <div className="space-y-2">
        <Label>Ghi chú</Label>
        <Textarea rows={3} />
      </div>

      {/* Switch cho boolean */}
      <div className="flex items-center space-x-2">
        <Switch id="isActive" checked={...} onCheckedChange={...} />
        <Label htmlFor="isActive">Kích hoạt</Label>
      </div>
    </div>
    <DialogFooter>
      <Button type="button" variant="outline" onClick={closeDialog}>Hủy</Button>
      <Button type="submit" disabled={mutation.isPending}>
        {editingItem ? "Cập nhật" : "Thêm mới"}
      </Button>
    </DialogFooter>
  </form>
</DialogContent>
```

**Lưu ý**:
- DialogContent: `className="max-w-2xl"` để dialog rộng hơn
- Sử dụng Switch thay Select cho trường boolean (isActive)
- Trường bắt buộc có `<span className="text-destructive">*</span>`

### 9. Lưu ý quan trọng khác
- ✅ PHẢI sử dụng `fetchWithAuth` cho tất cả API calls
- ✅ handleSelectAll phải dùng `data.data.map()` KHÔNG phải `data.items.map()`
- ✅ Xóa hàm `handleKeyPress`, dùng inline `onKeyDown` trong Input
- ✅ Copy functionality mở dialog với data pre-filled, KHÔNG call API trực tiếp
- ✅ Tất cả button titles: "Sao chép", "Chỉnh sửa", "Xóa" (KHÔNG dùng "Sửa")
- ✅ Pagination nằm BÊN NGOÀI `<div className="border rounded-lg">`, cùng cấp với nó
- ✅ Icon size nhất quán: `h-4 w-4` cho icons trong buttons, `h-5 w-5` cho icon trong CardTitle
- ✅ KHÔNG tách header/actions ra ngoài Card - tất cả phải nằm trong 1 Card duy nhất
- ✅ Wrapper là `space-y-4` (KHÔNG dùng `space-y-6`)

### 10. Tham khảo
Xem các file mẫu:
- `client/src/pages/ConfigContacts.tsx` - Chuẩn UI layout mới nhất
- `client/src/pages/ConfigOperationTypes.tsx` - Chuẩn UI layout
- `client/src/pages/ConfigRoles.tsx` - Chuẩn UI layout
- `client/src/pages/ConfigSystemLevel.tsx` - Chuẩn UI layout