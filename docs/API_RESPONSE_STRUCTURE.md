# Cấu trúc Response chuẩn của Backend API

## Tổng quan

Document này mô tả cấu trúc response chuẩn của tất cả API backend để đảm bảo tính nhất quán khi phát triển frontend.

---

## 1. Response cơ bản

Tất cả API đều trả về response theo format:

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "statusCode": 200
}
```

### Các trường:
- `success` (boolean): Trạng thái thành công/thất bại
- `data` (any): Dữ liệu trả về (có thể là object, array, hoặc null)
- `message` (string): Thông báo mô tả
- `statusCode` (number): HTTP status code

---

## 2. Response cho API List có Phân trang

**⚠️ LƯU Ý QUAN TRỌNG:**

Backend **KHÔNG** sử dụng cấu trúc Spring Boot pagination tiêu chuẩn.

### Cấu trúc thực tế:

```json
{
  "success": true,
  "data": {
    "data": [...],        // Mảng dữ liệu
    "total": 100,         // Tổng số items
    "page": 0,            // Số trang hiện tại (0-indexed)
    "size": 10            // Số items mỗi trang
  },
  "message": "success",
  "statusCode": 200
}
```

### ❌ KHÔNG sử dụng (Spring Boot style):
```json
{
  "data": {
    "content": [...],           // ❌ Backend dùng "data" thay vì "content"
    "totalElements": 100,       // ❌ Backend dùng "total" thay vì "totalElements"
    "totalPages": 10,           // ❌ Backend KHÔNG trả về totalPages
    "pageable": {               // ❌ Backend KHÔNG có object pageable
      "pageNumber": 0,
      "pageSize": 10
    }
  }
}
```

---

## 3. Mapping cho Frontend

Khi viết code TypeScript cho frontend, sử dụng interface:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: {
    data: T[];          // ✅ Dùng "data", KHÔNG phải "content"
    total: number;      // ✅ Dùng "total", KHÔNG phải "totalElements"
    page: number;       // Số trang (0-indexed)
    size: number;       // Items per page
  };
  message: string;
  statusCode: number;
}
```

### Cách sử dụng:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["items", page, limit],
  queryFn: async () => {
    const response = await fetchWithAuth(url);
    const result: ApiResponse<Item> = await response.json();
    return result.data;  // Trả về { data, total, page, size }
  },
});

// Lấy dữ liệu
const items = data?.data || [];           // ✅ data.data
const totalItems = data?.total || 0;      // ✅ data.total
const totalPages = Math.ceil(totalItems / limit); // ✅ Tự tính totalPages
```

---

## 4. Checklist khi viết code mới

Khi tạo màn hình CRUD mới, đảm bảo:

- [ ] Interface `ApiResponse` sử dụng `data.data` (KHÔNG phải `data.content`)
- [ ] Lấy tổng số items từ `data.total` (KHÔNG phải `data.totalElements`)
- [ ] Tính `totalPages` bằng `Math.ceil(total / limit)` (backend KHÔNG trả về)
- [ ] `handleSelectAll` sử dụng `data.data.map()` (KHÔNG phải `data.content.map()`)
- [ ] Gán items từ `data?.data || []` (KHÔNG phải `data?.content || []`)

---

## 5. Ví dụ Response thực tế

### GET /api/contacts?page=1&limit=10

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "unit": "Phòng Kỹ thuật",
        "email": "nguyenvana@company.com",
        "phone": "0901234567",
        "isActive": true,
        "notes": null,
        "createdAt": "2025-11-19T12:29:56.414758Z",
        "updatedAt": "2025-11-19T12:29:56.414758Z"
      }
    ],
    "total": 12,
    "page": 0,
    "size": 10
  },
  "message": "success",
  "statusCode": 200
}
```

### POST /api/contacts/create

```json
{
  "success": true,
  "data": {
    "id": 13,
    "fullName": "Trần Thị B",
    "unit": "Phòng Vận hành",
    "email": "tranthib@company.com",
    "phone": "0901234568",
    "isActive": true,
    "notes": "Test note",
    "createdAt": "2025-11-19T13:00:00.000Z",
    "updatedAt": "2025-11-19T13:00:00.000Z"
  },
  "message": "Contact created successfully",
  "statusCode": 200
}
```

### DELETE /api/contacts/delete/1

```json
{
  "success": true,
  "data": null,
  "message": "Contact deleted successfully",
  "statusCode": 200
}
```

---

## 6. Error Response

Khi có lỗi:

```json
{
  "success": false,
  "data": null,
  "message": "Email already exists",
  "statusCode": 400
}
```

### Common status codes:
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## 7. Lưu ý khi phát triển

1. **Luôn kiểm tra response structure** trước khi viết code
2. **Tham khảo file này** khi tạo màn hình CRUD mới
3. **Cập nhật document** khi có thay đổi từ backend
4. **Test với data thật** từ API trước khi commit

---

**Ngày cập nhật:** 2025-11-19
**Version:** 1.0
