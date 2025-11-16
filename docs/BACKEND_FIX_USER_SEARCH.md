# 🔧 FIX: User Management Search Error

## 🐛 Vấn đề

Chức năng tìm kiếm người dùng đang bị lỗi khi sử dụng tham số `keyWord`.

**URL lỗi:**
```
GET http://localhost:8002/api/users?page=1&limit=10&sort_dir=desc&sort_key=createdAt&keyword=linhlv
```

**Error Response:**
```json
{
    "success": false,
    "data": null,
    "message": "An error occurred: could not extract ResultSet; SQL [n/a]; nested exception is org.hibernate.exception.SQLGrammarException: could not extract ResultSet",
    "statusCode": 500
}
```

## 🔍 Nguyên nhân

Lỗi `SQLGrammarException` xảy ra khi:
1. ❌ Tên cột trong SQL query không chính xác hoặc không tồn tại
2. ❌ Câu truy vấn SQL có lỗi cú pháp (thiếu dấu ngoặc, sai LIKE clause, v.v.)
3. ❌ Không xử lý đúng tham số `keyword` trong query
4. ❌ Join table không đúng khi search qua quan hệ (ví dụ: search qua department name)

## ✅ Giải pháp

### Bước 1: Kiểm tra Repository/DAO Layer

Tìm file `UserRepository.java` hoặc tương tự và kiểm tra method xử lý tìm kiếm.

**VẤN ĐỀ PHỔ BIẾN:**

#### Vấn đề 1: Tên cột sai
```java
// ❌ SAI - Nếu bạn dùng tên cột không đúng
@Query("SELECT u FROM User u WHERE u.userName LIKE %:keyword%")  // userName sai, phải là username

// ✅ ĐÚNG - Kiểm tra chính xác tên field trong Entity
@Query("SELECT u FROM User u WHERE u.username LIKE %:keyword%")
```

#### Vấn đề 2: LIKE clause sai cú pháp
```java
// ❌ SAI - Cú pháp LIKE sai
@Query("SELECT u FROM User u WHERE u.username LIKE %:keyword%")

// ✅ ĐÚNG - Sử dụng CONCAT hoặc format đúng
@Query("SELECT u FROM User u WHERE u.username LIKE CONCAT('%', :keyword, '%')")
// Hoặc
@Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
```

#### Vấn đề 3: Không xử lý các trường hợp search
```java
// ❌ SAI - Chỉ search 1 field
@Query("SELECT u FROM User u WHERE u.username LIKE CONCAT('%', :keyword, '%')")

// ✅ ĐÚNG - Search nhiều fields (username, fullname, email, phone)
@Query("""
    SELECT u FROM User u
    WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.fullname) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.mobilePhone) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
List<User> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
```

#### Vấn đề 4: Search cả Department name (Join sai)
```java
// ❌ SAI - Join không đúng cách
@Query("""
    SELECT u FROM User u
    LEFT JOIN u.department d
    WHERE u.username LIKE %:keyword% OR d.name LIKE %:keyword%
    """)

// ✅ ĐÚNG - Join và LIKE clause đúng
@Query("""
    SELECT DISTINCT u FROM User u
    LEFT JOIN u.department d
    WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.fullname) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(u.mobilePhone) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
```

### Bước 2: Kiểm tra Service Layer

File `UserService.java` hoặc tương tự:

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Page<User> getUsers(int page, int limit, String sortKey, String sortDir, String keyWord) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(direction, convertSortKey(sortKey)));

        // ✅ QUAN TRỌNG: Kiểm tra keyWord null hoặc empty
        if (keyWord != null && !keyWord.trim().isEmpty()) {
            return userRepository.searchUsers(keyWord.trim(), pageable);
        } else {
            return userRepository.findAll(pageable);
        }
    }

    // Chuyển đổi từ camelCase (frontend) sang snake_case (database) nếu cần
    private String convertSortKey(String sortKey) {
        if ("createdAt".equals(sortKey)) return "created_at";
        if ("updatedAt".equals(sortKey)) return "updated_at";
        if ("fullname".equals(sortKey)) return "fullname";
        if ("username".equals(sortKey)) return "username";
        return "created_at"; // default
    }
}
```

### Bước 3: Kiểm tra Entity

File `User.java`:

```java
@Entity
@Table(name = "sys_user")
public class User {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;  // ✅ Đảm bảo tên field khớp với query

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "email")
    private String email;

    @Column(name = "mobile_phone")
    private String mobilePhone;  // ✅ Mapping đúng với DB column

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;  // ✅ Relation để có thể search department name

    @Column(name = "status")
    private Integer status;

    @Column(name = "user_note")
    private String userNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
}
```

### Bước 4: Kiểm tra Controller

File `UserController.java`:

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "desc") String sort_dir,
            @RequestParam(defaultValue = "createdAt") String sort_key,
            @RequestParam(required = false) String keyword  // ✅ Optional parameter
    ) {
        try {
            // ✅ Log để debug
            log.info("Get users - page: {}, limit: {}, sortDir: {}, sortKey: {}, keyword: {}",
                page, limit, sort_dir, sort_key, keyword);

            Page<User> usersPage = userService.getUsers(page, limit, sort_key, sort_dir, keyword);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("data", usersPage.getContent());
            responseData.put("total", usersPage.getTotalElements());
            responseData.put("page", page);
            responseData.put("size", limit);

            return ResponseEntity.ok(new ApiResponse(true, responseData, "Success", 200));

        } catch (Exception e) {
            log.error("Error fetching users", e);  // ✅ Log chi tiết lỗi
            return ResponseEntity.status(500)
                .body(new ApiResponse(false, null, "An error occurred: " + e.getMessage(), 500));
        }
    }
}
```

## 🎯 GIẢI PHÁP ĐỀ XUẤT HOÀN CHỈNH

### UserRepository.java
```java
package com.example.repository;

import com.example.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Tìm kiếm users theo keyword
     * Search trong các fields: username, fullname, email, mobilePhone, department.name
     */
    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.department d
        WHERE (:keyword IS NULL OR :keyword = '' OR
               LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.fullname) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.mobilePhone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}
```

### UserService.java
```java
package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Page<User> getUsers(int page, int limit, String sortKey, String sortDir, String keyword) {
        // Convert sort direction
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;

        // Convert sort key from camelCase to snake_case if needed
        String dbSortKey = convertSortKey(sortKey);

        // Create pageable
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(direction, dbSortKey));

        // Search with or without keyword
        return userRepository.searchUsers(keyword, pageable);
    }

    private String convertSortKey(String sortKey) {
        return switch (sortKey) {
            case "createdAt" -> "created_at";
            case "updatedAt" -> "updated_at";
            case "fullname" -> "fullname";
            case "username" -> "username";
            case "email" -> "email";
            case "status" -> "status";
            default -> "created_at";
        };
    }
}
```

## 🧪 Cách Test

### 1. Test không có keyword (phải hoạt động)
```bash
curl "http://localhost:8002/api/users?page=1&limit=10&sort_dir=desc&sort_key=createdAt"
```

### 2. Test với keyword (cần fix)
```bash
curl "http://localhost:8002/api/users?page=1&limit=10&sort_dir=desc&sort_key=createdAt&keyword=linhlv"
```

### 3. Test search với keyword khác
```bash
# Search by username
curl "http://localhost:8002/api/users?page=1&limit=10&keyword=admin"

# Search by email
curl "http://localhost:8002/api/users?page=1&limit=10&keyword=@example.com"

# Search by phone
curl "http://localhost:8002/api/users?page=1&limit=10&keyword=0123"

# Search by department name
curl "http://localhost:8002/api/users?page=1&limit=10&keyword=IT"
```

## 📋 Checklist

- [ ] Kiểm tra tên các field trong Entity `User.java` có khớp với query không
- [ ] Kiểm tra tên column trong database có đúng không
- [ ] Sửa `@Query` trong `UserRepository` theo đúng cú pháp
- [ ] Xử lý `keyword = null` hoặc empty trong Service
- [ ] Test API với và không có `keyword` parameter
- [ ] Kiểm tra log để xem SQL query thực tế được generate
- [ ] Verify rằng JOIN với Department table hoạt động đúng

## 🔍 Debug Steps

### 1. Bật SQL logging trong application.properties
```properties
# Show SQL
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Show bind parameters
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
logging.level.org.hibernate.SQL=DEBUG
```

### 2. Check log khi gọi API với keyword
Xem log để biết SQL query thực tế:
```
Hibernate:
    SELECT DISTINCT u FROM User u
    LEFT JOIN u.department d
    WHERE ...
```

### 3. Copy SQL query vào Database Tool (DBeaver, pgAdmin)
Chạy trực tiếp query để kiểm tra lỗi cụ thể

## 📞 Nếu vẫn lỗi

Kiểm tra:
1. **Database column names**: Có thể DB dùng `user_name` nhưng Entity mapping là `username`
2. **Reserved keywords**: Nếu dùng từ khóa SQL như `user`, `group`, cần escape bằng backticks
3. **Join fetch**: Có thể cần `@EntityGraph` hoặc `JOIN FETCH` để avoid N+1 query
4. **Pagination**: Verify `page - 1` trong `PageRequest.of()` (Spring Data JPA pages are 0-based)

## 🎯 Expected Result

Sau khi fix xong, API response sẽ như sau:

```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": "uuid-xxx",
                "username": "linhlv",
                "fullname": "Lê Văn Linh",
                "email": "linhlv@example.com",
                "department": {
                    "id": 1,
                    "name": "IT Department",
                    "deptCode": "IT001",
                    "description": null,
                    "createdAt": "2025-01-01T00:00:00"
                },
                "mobilePhone": "0123456789",
                "status": 1,
                "userNote": "Active user",
                "groups": [
                    {
                        "id": 1,
                        "name": "Administrators",
                        "code": "ADMIN",
                        "status": "active"
                    }
                ],
                "createdAt": "2025-01-01T00:00:00",
                "updatedAt": "2025-01-15T10:30:00"
            }
        ],
        "total": 1,
        "page": 1,
        "size": 10
    },
    "message": "Success",
    "statusCode": 200
}
```

---

**Tài liệu tham khảo:**
- [Spring Data JPA Query Methods](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods)
- [JPQL String Functions](https://docs.oracle.com/javaee/7/tutorial/persistence-querylanguage004.htm)
- [Hibernate Native SQL](https://docs.jboss.org/hibernate/orm/5.6/userguide/html_single/Hibernate_User_Guide.html#sql)
