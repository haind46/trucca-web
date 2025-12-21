# Hướng Dẫn Cấu Hình Hệ Thống Cảnh Báo Log

## Mục đích

Tài liệu này hướng dẫn các bước cấu hình cần thiết trên hệ thống để tính năng gửi cảnh báo tự động hoạt động khi có log mới.

---

## Tổng quan quy trình cấu hình

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    QUY TRÌNH CẤU HÌNH HỆ THỐNG                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  BƯỚC 1 ──► Cấu hình Mức độ cảnh báo (Severity)                        │
│                         │                                               │
│                         ▼                                               │
│  BƯỚC 2 ──► Cấu hình Cấp độ hệ thống (System Level)                    │
│                         │                                               │
│                         ▼                                               │
│  BƯỚC 3 ──► Cấu hình Danh mục hệ thống (System Catalog)                │
│                         │                                               │
│                         ▼                                               │
│  BƯỚC 4 ──► Cấu hình Nhóm liên hệ (Group Contact)                      │
│                         │                                               │
│                         ▼                                               │
│  BƯỚC 5 ──► Cấu hình Quy tắc cảnh báo (Alert Rule)                     │
│                         │                                               │
│                         ▼                                               │
│  BƯỚC 6 ──► Gán Nhóm liên hệ vào Quy tắc cảnh báo                      │
│                         │                                               │
│                         ▼                                               │
│            ✅ HOÀN THÀNH - Hệ thống sẵn sàng gửi cảnh báo              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Chi tiết từng bước

---

### BƯỚC 1: Cấu hình Mức độ cảnh báo (Severity)

**Menu:** `Cấu hình` → `Mức độ cảnh báo (Severity)`

**Mục đích:** Định nghĩa các mức độ nghiêm trọng của log/sự kiện trong hệ thống.

#### Thông tin cần nhập:

| Trường | Bắt buộc | Mô tả | Ví dụ |
|--------|----------|-------|-------|
| Mã mức độ (Code) | ✅ | Mã định danh duy nhất | `CRITICAL`, `MAJOR`, `MINOR` |
| Tên mức độ | ✅ | Tên hiển thị | `Nghiêm trọng`, `Cao`, `Trung bình` |
| Mô tả | | Chi tiết về mức độ | `Sự cố nghiêm trọng cần xử lý ngay` |
| Màu sắc | | Mã màu hiển thị | `#FF0000` (đỏ) |
| Mức ưu tiên | ✅ | Số từ 1-5 (5 cao nhất) | `5` |
| Trạng thái | ✅ | Bật/Tắt | `Hoạt động` |

#### Danh sách Severity khuyến nghị:

| Mã | Tên | Mức ưu tiên | Màu |
|----|-----|-------------|-----|
| `DOWN` | Ngừng hoạt động | 5 | 🔴 #FF0000 |
| `CRITICAL` | Nghiêm trọng | 4 | 🟠 #FF6600 |
| `MAJOR` | Cao | 3 | 🟡 #FFCC00 |
| `MINOR` | Trung bình | 2 | 🔵 #0066FF |
| `WARNING` | Cảnh báo | 1 | ⚪ #999999 |

#### Lưu ý:
- Mã Severity phải khớp với giá trị `severity` trong bảng `log_entries`
- Mỗi mức độ nên có màu sắc riêng để dễ phân biệt

---

### BƯỚC 2: Cấu hình Cấp độ hệ thống (System Level)

**Menu:** `Cấu hình` → `Cấp độ hệ thống (System Level)`

**Mục đích:** Phân loại các hệ thống theo mức độ quan trọng/ưu tiên.

#### Thông tin cần nhập:

| Trường | Bắt buộc | Mô tả | Ví dụ |
|--------|----------|-------|-------|
| Cấp độ (Level) | ✅ | Tên cấp độ | `Level 1`, `Level 2`, `Level 3` |
| Mô tả | | Chi tiết về cấp độ | `Hệ thống Core - Ưu tiên cao nhất` |

#### Danh sách System Level khuyến nghị:

| Cấp độ | Mô tả | Ý nghĩa |
|--------|-------|---------|
| `Level 1` | Hệ thống Core | Hệ thống quan trọng nhất, ảnh hưởng trực tiếp đến nghiệp vụ |
| `Level 2` | Hệ thống chính | Hệ thống quan trọng, cần xử lý nhanh |
| `Level 3` | Hệ thống phụ trợ | Hệ thống hỗ trợ, có thể delay xử lý |
| `Level 4` | Hệ thống thử nghiệm | Môi trường dev/test |

#### Lưu ý:
- System Level dùng để kết hợp với Severity xác định kênh cảnh báo
- Ví dụ: `Level 1` + `CRITICAL` → Gửi cảnh báo qua tất cả kênh (Echat + SMS + Call)

---

### BƯỚC 3: Cấu hình Danh mục hệ thống (System Catalog)

**Menu:** `Cấu hình` → `Danh mục hệ thống (System Catalog)`

**Mục đích:** Đăng ký các hệ thống cần giám sát và gán cấp độ cho chúng.

#### Thông tin cần nhập:

| Trường | Bắt buộc | Mô tả | Ví dụ |
|--------|----------|-------|-------|
| Mã hệ thống (Code) | ✅ | Mã định danh duy nhất | `HN-CORE-01` |
| Tên hệ thống | ✅ | Tên hiển thị | `Core Banking Hà Nội` |
| Cấp độ hệ thống | ✅ | Chọn từ danh sách System Level | `Level 1` |
| Địa chỉ IP | | IP của hệ thống | `192.168.1.100` |
| Echat ID | | ID nhóm Echat (nếu có) | `123456` |
| Mã Polestar | | Mã trên hệ thống Polestar | `PS-HN-001` |
| Mô tả | | Chi tiết về hệ thống | `Hệ thống Core Banking chính` |
| Trạng thái | ✅ | Bật/Tắt | `Hoạt động` |

#### Ví dụ cấu hình:

```
┌─────────────────────────────────────────────────────────────┐
│  DANH MỤC HỆ THỐNG                                          │
├──────────────┬────────────────────┬─────────────────────────┤
│ Mã           │ Tên                │ Cấp độ                  │
├──────────────┼────────────────────┼─────────────────────────┤
│ HN-CORE-01   │ Core Banking HN    │ Level 1 (Core)          │
│ HN-CORE-02   │ Core Banking HN 2  │ Level 1 (Core)          │
│ SG-CORE-01   │ Core Banking SG    │ Level 1 (Core)          │
│ HN-WEB-01    │ Web Portal HN      │ Level 2 (Chính)         │
│ HN-API-01    │ API Gateway HN     │ Level 2 (Chính)         │
│ HN-LOG-01    │ Log Server HN      │ Level 3 (Phụ trợ)       │
│ DEV-TEST-01  │ Dev Environment    │ Level 4 (Test)          │
└──────────────┴────────────────────┴─────────────────────────┘
```

#### Lưu ý quan trọng:
- **Tên hệ thống (Name)** phải khớp chính xác với giá trị `system_name` trong bảng `log_entries`
- Nếu tên không khớp, hệ thống sẽ không tìm được cấu hình và không gửi cảnh báo

---

### BƯỚC 4: Cấu hình Nhóm liên hệ (Group Contact)

**Menu:** `Cấu hình` → `Nhóm liên hệ (Group Contact)`

**Mục đích:** Tạo các nhóm người nhận cảnh báo, đặc biệt là nhóm Echatwork.

#### Thông tin cần nhập:

| Trường | Bắt buộc | Mô tả | Ví dụ |
|--------|----------|-------|-------|
| Tên nhóm | ✅ | Tên hiển thị | `Nhóm vận hành Core` |
| Echat ID | ✅* | ID nhóm trên Echatwork | `987654321` |
| Mô tả | | Chi tiết về nhóm | `Nhóm trực xử lý sự cố Core Banking` |
| Trạng thái | ✅ | Bật/Tắt | `Hoạt động` |

*\* Bắt buộc nếu muốn gửi cảnh báo qua Echatwork*

#### Cách lấy Echat ID:

1. Mở Echatwork trên trình duyệt
2. Vào nhóm chat cần cấu hình
3. Xem URL trên thanh địa chỉ: `https://echatwork.com/rooms/[ECHAT_ID]`
4. Copy số `[ECHAT_ID]` và nhập vào trường "Echat ID"

#### Ví dụ cấu hình:

```
┌─────────────────────────────────────────────────────────────┐
│  NHÓM LIÊN HỆ                                               │
├──────────────────────────┬──────────────┬───────────────────┤
│ Tên nhóm                 │ Echat ID     │ Mô tả             │
├──────────────────────────┼──────────────┼───────────────────┤
│ Nhóm vận hành Core       │ 123456789    │ Xử lý sự cố Core  │
│ Nhóm vận hành Network    │ 234567890    │ Xử lý sự cố mạng  │
│ Nhóm quản lý IT          │ 345678901    │ Báo cáo lãnh đạo  │
│ Nhóm NOC 24/7            │ 456789012    │ Trực 24/7         │
└──────────────────────────┴──────────────┴───────────────────┘
```

---

### BƯỚC 5: Cấu hình Quy tắc cảnh báo (Alert Rule)

**Menu:** `Cấu hình` → `Quy tắc cảnh báo (Alert Rule)`

**Mục đích:** Định nghĩa quy tắc gửi cảnh báo dựa trên Severity + System Level.

#### Thông tin cần nhập:

| Trường | Bắt buộc | Mô tả | Ví dụ |
|--------|----------|-------|-------|
| Mã quy tắc (Code) | ✅ | Mã định danh duy nhất | `RULE-L1-CRITICAL` |
| Tên quy tắc | ✅ | Tên hiển thị | `Cảnh báo Critical cho Level 1` |
| Mức độ (Severity) | ✅ | Chọn từ danh sách Severity | `CRITICAL` |
| Cấp độ hệ thống | ✅ | Chọn từ danh sách System Level | `Level 1` |
| Kênh cảnh báo | ✅ | Chọn một hoặc nhiều kênh | `ECHAT`, `SMS`, `CALL` |
| Mô tả | | Chi tiết về quy tắc | `Gửi cảnh báo khẩn cấp...` |
| Trạng thái | ✅ | Bật/Tắt | `Hoạt động` |

#### Ma trận cấu hình khuyến nghị:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MA TRẬN KÊNH CẢNH BÁO (Severity × System Level)                        │
├───────────────┬───────────────┬───────────────┬───────────────┬─────────┤
│               │   Level 1     │   Level 2     │   Level 3     │ Level 4 │
│               │   (Core)      │   (Chính)     │   (Phụ trợ)   │ (Test)  │
├───────────────┼───────────────┼───────────────┼───────────────┼─────────┤
│ DOWN          │ ECHAT+SMS+CALL│ ECHAT+SMS     │ ECHAT         │ -       │
├───────────────┼───────────────┼───────────────┼───────────────┼─────────┤
│ CRITICAL      │ ECHAT+SMS+CALL│ ECHAT+SMS     │ ECHAT         │ -       │
├───────────────┼───────────────┼───────────────┼───────────────┼─────────┤
│ MAJOR         │ ECHAT+SMS     │ ECHAT         │ ECHAT         │ -       │
├───────────────┼───────────────┼───────────────┼───────────────┼─────────┤
│ MINOR         │ ECHAT         │ ECHAT         │ -             │ -       │
├───────────────┼───────────────┼───────────────┼───────────────┼─────────┤
│ WARNING       │ ECHAT         │ -             │ -             │ -       │
└───────────────┴───────────────┴───────────────┴───────────────┴─────────┘

Chú thích:
- ECHAT: Gửi tin nhắn Echatwork
- SMS: Gửi tin nhắn SMS (pending)
- CALL: Gọi điện thoại (pending)
- (-): Không cần cấu hình quy tắc
```

#### Danh sách Alert Rule cần tạo (theo ma trận trên):

| # | Mã | Severity | System Level | Kênh cảnh báo |
|---|-----|----------|--------------|---------------|
| 1 | RULE-L1-DOWN | DOWN | Level 1 | ECHAT,SMS,CALL |
| 2 | RULE-L1-CRITICAL | CRITICAL | Level 1 | ECHAT,SMS,CALL |
| 3 | RULE-L1-MAJOR | MAJOR | Level 1 | ECHAT,SMS |
| 4 | RULE-L1-MINOR | MINOR | Level 1 | ECHAT |
| 5 | RULE-L1-WARNING | WARNING | Level 1 | ECHAT |
| 6 | RULE-L2-DOWN | DOWN | Level 2 | ECHAT,SMS |
| 7 | RULE-L2-CRITICAL | CRITICAL | Level 2 | ECHAT,SMS |
| 8 | RULE-L2-MAJOR | MAJOR | Level 2 | ECHAT |
| 9 | RULE-L2-MINOR | MINOR | Level 2 | ECHAT |
| 10 | RULE-L3-DOWN | DOWN | Level 3 | ECHAT |
| 11 | RULE-L3-CRITICAL | CRITICAL | Level 3 | ECHAT |
| 12 | RULE-L3-MAJOR | MAJOR | Level 3 | ECHAT |

---

### BƯỚC 6: Gán Nhóm liên hệ vào Quy tắc cảnh báo

**Menu:** `Cấu hình` → `Quy tắc cảnh báo` → Chọn quy tắc → `Gán nhóm liên hệ`

**Mục đích:** Xác định nhóm Echatwork nào sẽ nhận cảnh báo khi quy tắc được kích hoạt.

#### Các bước thực hiện:

1. Vào danh sách **Quy tắc cảnh báo (Alert Rule)**
2. Chọn quy tắc cần gán (ví dụ: `RULE-L1-CRITICAL`)
3. Click nút **"Gán nhóm liên hệ"** hoặc **"Cấu hình"**
4. Chọn các nhóm liên hệ phù hợp từ danh sách
5. Lưu cấu hình

#### Ví dụ gán nhóm:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GÁN NHÓM LIÊN HỆ CHO QUY TẮC                                           │
├──────────────────────┬──────────────────────────────────────────────────┤
│ Quy tắc              │ Nhóm liên hệ được gán                            │
├──────────────────────┼──────────────────────────────────────────────────┤
│ RULE-L1-DOWN         │ ✅ Nhóm vận hành Core                            │
│                      │ ✅ Nhóm quản lý IT                               │
│                      │ ✅ Nhóm NOC 24/7                                 │
├──────────────────────┼──────────────────────────────────────────────────┤
│ RULE-L1-CRITICAL     │ ✅ Nhóm vận hành Core                            │
│                      │ ✅ Nhóm NOC 24/7                                 │
├──────────────────────┼──────────────────────────────────────────────────┤
│ RULE-L1-MAJOR        │ ✅ Nhóm vận hành Core                            │
├──────────────────────┼──────────────────────────────────────────────────┤
│ RULE-L2-CRITICAL     │ ✅ Nhóm vận hành Network                         │
│                      │ ✅ Nhóm NOC 24/7                                 │
├──────────────────────┼──────────────────────────────────────────────────┤
│ RULE-L3-CRITICAL     │ ✅ Nhóm NOC 24/7                                 │
└──────────────────────┴──────────────────────────────────────────────────┘
```

---

## Checklist kiểm tra cấu hình

Sau khi hoàn thành các bước trên, sử dụng checklist sau để đảm bảo cấu hình đầy đủ:

### ✅ Checklist tổng quan

- [ ] **Severity:** Đã tạo đủ các mức độ cảnh báo cần thiết
- [ ] **System Level:** Đã tạo đủ các cấp độ hệ thống
- [ ] **System Catalog:** Đã đăng ký tất cả hệ thống cần giám sát
- [ ] **Group Contact:** Đã tạo các nhóm Echatwork với Echat ID đúng
- [ ] **Alert Rule:** Đã tạo đủ quy tắc theo ma trận Severity × System Level
- [ ] **Gán nhóm:** Mỗi Alert Rule đã được gán ít nhất 1 nhóm liên hệ

### ✅ Checklist chi tiết

#### Severity
- [ ] Mã Severity khớp với giá trị trong log_entries
- [ ] Tất cả Severity đều ở trạng thái "Hoạt động"

#### System Catalog
- [ ] Tên hệ thống khớp CHÍNH XÁC với system_name trong log
- [ ] Mỗi hệ thống đã được gán System Level
- [ ] Tất cả hệ thống đều ở trạng thái "Hoạt động"

#### Group Contact
- [ ] Echat ID đã được nhập đúng cho mỗi nhóm
- [ ] Đã test gửi tin nhắn thử đến Echat ID
- [ ] Tất cả nhóm đều ở trạng thái "Hoạt động"

#### Alert Rule
- [ ] Mỗi quy tắc có đúng Severity + System Level
- [ ] Kênh cảnh báo đã được chọn (ít nhất ECHAT)
- [ ] Tất cả quy tắc đều ở trạng thái "Hoạt động"
- [ ] Đã gán nhóm liên hệ cho mỗi quy tắc

---

## Ví dụ luồng hoạt động

### Tình huống: Hệ thống Core Banking Hà Nội gặp sự cố CRITICAL

```
1. LOG MỚI ĐƯỢC GHI NHẬN:
   ┌────────────────────────────────────────┐
   │ severity: "CRITICAL"                   │
   │ system_name: "Core Banking HN"         │
   │ alarm_name: "DB Connection Lost"       │
   │ event_detail: "Cannot connect to DB"   │
   └────────────────────────────────────────┘
                    │
                    ▼
2. TÌM SYSTEM CATALOG:
   ┌────────────────────────────────────────┐
   │ Tìm: name = "Core Banking HN"          │
   │ Kết quả: system_level = "Level 1"      │
   └────────────────────────────────────────┘
                    │
                    ▼
3. TÌM ALERT RULE:
   ┌────────────────────────────────────────┐
   │ Điều kiện:                             │
   │   severity = "CRITICAL"                │
   │   system_level = "Level 1"             │
   │   status = "Hoạt động"                 │
   │ Kết quả: RULE-L1-CRITICAL              │
   │   alert_channels = "ECHAT,SMS,CALL"    │
   └────────────────────────────────────────┘
                    │
                    ▼
4. LẤY NHÓM LIÊN HỆ:
   ┌────────────────────────────────────────┐
   │ Alert Rule: RULE-L1-CRITICAL           │
   │ Nhóm được gán:                         │
   │   - Nhóm vận hành Core (echat: 123456) │
   │   - Nhóm NOC 24/7 (echat: 456789)      │
   └────────────────────────────────────────┘
                    │
                    ▼
5. GỬI CẢNH BÁO:
   ┌────────────────────────────────────────┐
   │ ECHAT:                                 │
   │   → Gửi đến nhóm 123456 ✅             │
   │   → Gửi đến nhóm 456789 ✅             │
   │ SMS: [Pending - chưa xử lý]            │
   │ CALL: [Pending - chưa xử lý]           │
   └────────────────────────────────────────┘
```

---

## Xử lý sự cố thường gặp

### 1. Log không được gửi cảnh báo

**Nguyên nhân có thể:**
- System name trong log không khớp với System Catalog
- Không có Alert Rule cho cặp Severity + System Level
- Alert Rule đang ở trạng thái "Tắt"
- Chưa gán nhóm liên hệ cho Alert Rule

**Cách kiểm tra:**
1. Xem giá trị `system_name` trong log
2. Kiểm tra System Catalog có tên khớp không
3. Kiểm tra System Level của hệ thống đó
4. Kiểm tra có Alert Rule cho Severity + System Level không
5. Kiểm tra Alert Rule có được gán nhóm không

### 2. Cảnh báo gửi sai nhóm

**Nguyên nhân có thể:**
- Gán nhầm nhóm liên hệ cho Alert Rule
- Echat ID của nhóm không đúng

**Cách khắc phục:**
1. Vào Alert Rule và kiểm tra lại danh sách nhóm được gán
2. Kiểm tra Echat ID của từng nhóm

### 3. Echatwork không nhận được tin nhắn

**Nguyên nhân có thể:**
- Echat ID không đúng
- API token Echatwork hết hạn
- Bot chưa được add vào nhóm Echat

**Cách khắc phục:**
1. Kiểm tra lại Echat ID
2. Kiểm tra cấu hình API token
3. Đảm bảo bot đã được add vào nhóm

---

## Bảo trì định kỳ

### Hàng tuần
- [ ] Kiểm tra log notification để phát hiện lỗi gửi cảnh báo
- [ ] Review các cảnh báo bị miss (nếu có)

### Hàng tháng
- [ ] Review và cập nhật danh sách System Catalog (thêm/bớt hệ thống)
- [ ] Review và cập nhật danh sách Group Contact
- [ ] Kiểm tra Echat ID còn hoạt động

### Khi có hệ thống mới
1. Thêm vào System Catalog với System Level phù hợp
2. Đảm bảo các Alert Rule đã tồn tại cho System Level đó
3. Nếu cần nhóm nhận cảnh báo riêng, tạo Alert Rule mới và gán nhóm

---

## Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình cấu hình, vui lòng liên hệ:
- **Email:** support@example.com
- **Hotline:** 1900-xxxx

---

*Cập nhật lần cuối: 2025-12-21*
