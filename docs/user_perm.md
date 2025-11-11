● Hoàn thành! Tôi đã bổ sung và liên kết tính năng quản lý người dùng với quản lý nhóm người dùng. Đây là những gì đã được thực hiện:

  📋 Những thay đổi chính:

  1. UserDTO.java - Bổ sung trường groups

  - Thêm field groups kiểu List<GroupBasicInfo> để trả về thông tin nhóm của user
  - Thêm inner class GroupBasicInfo chứa thông tin cơ bản về nhóm (id, name, code, status)

  2. UserService.java - Thêm business logic

  - Inject UserGroupService, UserGroupRepository, SysGroupRepository                                                                                                                                                                                                                                                
  - Method mới getUserGroups(String userId):
    - Lấy danh sách nhóm mà user đang thuộc
    - Trả về List<GroupBasicInfo>                                                                                                                                                                                                                                                                                   
  - Method mới updateUserGroups(String userId, List<Integer> groupIds):
    - Cập nhật toàn bộ danh sách nhóm của user
    - Xóa tất cả mapping cũ và tạo mới
    - Khác với assignUserToGroups (chỉ thêm vào)

  3. UserController.java - 2 API endpoints mới

  GET /api/users/{id}/groups

  Lấy danh sách nhóm của một user cụ thể

  Example Request:
  GET /api/users/611f33fd-b5a1-4a6e-a38c-c30ae20900b0/groups

  Example Response:
  {
    "success": true,
    "data": [
      {"id": 1, "name": "Quản trị viên", "code": "ADMIN", "status": "active"},
      {"id": 3, "name": "Nhóm biên tập", "code": "EDITOR", "status": "active"}
    ]
  }

  PUT /api/users/{id}/groups

  Thay thế toàn bộ danh sách nhóm của user

  Example Request:
  PUT /api/users/611f33fd-b5a1-4a6e-a38c-c30ae20900b0/groups
  Content-Type: application/json

  {
    "groupIds": [1, 3, 5]
  }

  Use case:
  - Form "Chỉnh sửa user" với multi-select groups
  - Admin muốn set lại toàn bộ nhóm của user một lần
  - Truyền [] để xóa user khỏi tất cả nhóm

  4. PERMISSION_API_GUIDE.md - Cập nhật tài liệu

  - Thêm section "5. User Management API (Liên quan đến Groups)"
  - Document đầy đủ 2 API mới với examples và business rules
  - Thêm bảng so sánh giữa 3 cách quản lý user-group:
    - POST /api/user-groups/assign - Chỉ thêm
    - DELETE /api/user-groups/remove - Chỉ xóa
    - PUT /api/users/{id}/groups - Thay thế toàn bộ

  🔄 So sánh các API quản lý User-Group:

  | API Endpoint                       | Controller          | Mục đích           | Hành động                 |
  |------------------------------------|---------------------|--------------------|---------------------------|
  | POST /api/user-groups/assign       | UserGroupController | Gán user vào nhóm  | Chỉ thêm mapping mới      |
  | DELETE /api/user-groups/remove     | UserGroupController | Xóa user khỏi nhóm | Chỉ xóa mapping chỉ định  |
  | GET /api/user-groups/user/{userId} | UserGroupController | Xem nhóm của user  | Trả về chi tiết mapping   |
  | GET /api/users/{id}/groups         | UserController      | Xem nhóm của user  | Trả về info nhóm đơn giản |
  | PUT /api/users/{id}/groups         | UserController      | Cập nhật nhóm      | Xóa tất cả + Tạo mới      |

  ✅ Lợi ích:

  1. Tích hợp chặt chẽ: Giờ quản lý user và group đã liên kết với nhau
  2. Linh hoạt hơn: 2 cách để quản lý user-group:
    - Incremental (thêm/xóa từng nhóm) qua /api/user-groups/*                                                                                                                                                                                                                                                       
    - Bulk update (set lại toàn bộ) qua /api/users/{id}/groups                                                                                                                                                                                                                                                      
  3. UX tốt hơn: Frontend có thể dùng API /api/users/{id}/groups cho form edit user với multi-select dropdown
  4. Tài liệu đầy đủ: PERMISSION_API_GUIDE.md đã được cập nhật

  Bạn có thể test các API mới này ngay. Có cần tôi làm thêm điều gì không?