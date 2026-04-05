TRƯỜNG ĐẠI HỌC CÔNG NGHỆ TP.HCM  
KHOA CÔNG NGHỆ THÔNG TIN

# BÁO CÁO ĐỒ ÁN
## WEBSITE HỌC TIẾNG ANH TEFAST (TOEIC/IELTS)

**Ngành:** Công nghệ Thông tin  
**Chuyên ngành:** Công nghệ Phần mềm  
**Môn học:** Ngôn ngữ và Phát triển Ứng dụng Mới  
**Giảng viên hướng dẫn:** ThS. Nguyễn Thanh Tùng  

**Sinh viên thực hiện:**  
- Tô Phạm Thành Đạt – 2280606268  
- Nguyễn Vũ Tuấn Kiệt – 2280618886  
- Đinh Vạn Tài – 2280618783  

**TP. Hồ Chí Minh, 2026**

---

# TRANG PHỤ BÌA

**ĐỒ ÁN MÔN HỌC**  
**NGÔN NGỮ VÀ PHÁT TRIỂN ỨNG DỤNG MỚI**  
**ĐỀ TÀI: WEBSITE HỌC TIẾNG ANH TEFAST (TOEIC/IELTS)**

---

# LỜI CAM ĐOAN

Nhóm sinh viên xin cam đoan nội dung trong báo cáo này là kết quả nghiên cứu, phân tích, thiết kế và xây dựng hệ thống do nhóm thực hiện. Các tài liệu, khái niệm, công nghệ, kết quả nghiên cứu của tác giả khác được sử dụng trong báo cáo đều được trích dẫn nguồn tham khảo phù hợp. Nhóm xin hoàn toàn chịu trách nhiệm về tính trung thực của nội dung báo cáo.

---

# MỤC LỤC

Trang phụ bìa  
Lời cam đoan  
Danh mục các ký hiệu, các chữ viết tắt  
Danh mục các bảng  
Danh mục các hình vẽ, đồ thị  

**Chương 1. TỔNG QUAN**  
1.1. Giới thiệu đề tài  
1.2. Tính cấp thiết của đề tài  
1.3. Mục tiêu nghiên cứu  
1.4. Đối tượng và phạm vi nghiên cứu  
1.5. Nhiệm vụ thực hiện  
1.6. Cấu trúc đồ án  

**Chương 2. CƠ SỞ LÝ THUYẾT**  
2.1. Tổng quan hệ thống học tiếng Anh trực tuyến  
2.2. Công nghệ sử dụng  
2.3. Kiến trúc hệ thống  
2.4. Cơ sở dữ liệu và mô hình dữ liệu  
2.5. Phân quyền và bảo mật  
2.6. API và giao tiếp giữa các thành phần  

**Chương 3. KẾT QUẢ THỰC NGHIỆM**  
3.1. Phân tích chức năng hệ thống  
3.2. Thiết kế hệ thống  
3.3. Cài đặt và triển khai  
3.4. Giao diện và minh họa demo  
3.5. Đánh giá kết quả thực nghiệm  

**Chương 4. KẾT LUẬN VÀ KIẾN NGHỊ**  
4.1. Kết luận  
4.2. Kết quả đạt được  
4.3. Hạn chế  
4.4. Hướng phát triển  

Tài liệu tham khảo  
Phụ lục  

---

# DANH MỤC CÁC KÝ HIỆU, CÁC CHỮ VIẾT TẮT

- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **UI**: User Interface
- **UX**: User Experience
- **CRUD**: Create, Read, Update, Delete
- **REST**: Representational State Transfer
- **SQL**: Structured Query Language
- **ERD**: Entity Relationship Diagram
- **UML**: Unified Modeling Language
- **TOEIC**: Test of English for International Communication
- **IELTS**: International English Language Testing System
- **STUDENT**: Vai trò học viên
- **TEACHER**: Vai trò giảng viên
- **ADMIN**: Vai trò quản trị viên

---

# DANH MỤC CÁC BẢNG

**Bảng 2.1.** Các công nghệ sử dụng trong hệ thống  
**Bảng 2.2.** Các bảng dữ liệu chính trong hệ thống  
**Bảng 3.1.** Các chức năng chính của hệ thống  
**Bảng 3.2.** Danh sách các API chính  

---

# DANH MỤC CÁC HÌNH VẼ, ĐỒ THỊ

**Hình 2.1.** Mô hình kiến trúc tổng thể của hệ thống  
**Hình 2.2.** Mô hình phân quyền người dùng  
**Hình 3.1.** Giao diện trang chủ  
**Hình 3.2.** Giao diện đăng nhập  
**Hình 3.3.** Giao diện danh sách khóa học  
**Hình 3.4.** Giao diện dashboard giảng viên  
**Hình 3.5.** Giao diện làm bài thi  
**Hình 3.6.** Giao diện kết quả bài thi  

---

# CHƯƠNG 1. TỔNG QUAN

## 1.1. Giới thiệu đề tài

Trong giai đoạn hiện nay, tiếng Anh là một trong những kỹ năng quan trọng đối với sinh viên và người đi làm. Đặc biệt, các chứng chỉ quốc tế như TOEIC và IELTS ngày càng trở thành yêu cầu phổ biến trong học tập và tuyển dụng. Tuy nhiên, nhiều người học vẫn gặp khó khăn trong việc tiếp cận một nền tảng học tập trực tuyến có khả năng kết hợp giữa học lý thuyết, luyện tập, thi thử và theo dõi kết quả trên cùng một hệ thống.

Xuất phát từ nhu cầu đó, nhóm thực hiện đề tài **Website học tiếng Anh TEFast (TOEIC/IELTS)**. Đây là một hệ thống web hỗ trợ người dùng học tập theo lộ trình khóa học, truy cập bài học, tham gia thi thử, xem kết quả và tra cứu từ vựng. Đồng thời, hệ thống cũng hỗ trợ giảng viên quản lý học liệu và quản trị viên điều hành toàn bộ nền tảng.

Đề tài được xây dựng theo định hướng ứng dụng web hiện đại, tách frontend và backend rõ ràng, có cơ chế xác thực, phân quyền và tổ chức dữ liệu phù hợp với một hệ thống học tập trực tuyến.

## 1.2. Tính cấp thiết của đề tài

Hiện nay, nhu cầu luyện thi TOEIC và IELTS ngày càng tăng. Nhiều nền tảng học tập trực tuyến đang xuất hiện, nhưng vẫn tồn tại một số hạn chế như giao diện phức tạp, thiếu tính đồng bộ giữa học và thi, hoặc chỉ tập trung vào một phần nhỏ của quá trình học tập. Trong khi đó, người học có nhu cầu sử dụng một hệ thống đơn giản, trực quan, dễ tiếp cận nhưng vẫn có đủ các chức năng thiết yếu.

Việc xây dựng một website học tiếng Anh có các module như quản lý khóa học, bài học, đề thi, câu hỏi, từ vựng và kết quả là cần thiết cả về mặt học thuật lẫn thực tiễn. Đề tài không chỉ giúp áp dụng các kiến thức đã học về phát triển ứng dụng web mà còn có khả năng phát triển thành một sản phẩm hoàn chỉnh hơn trong tương lai.

## 1.3. Mục tiêu nghiên cứu

### 1.3.1. Mục tiêu tổng quát

Xây dựng một website học tiếng Anh trực tuyến phục vụ cho việc học và luyện thi TOEIC/IELTS, hỗ trợ cả người học, giảng viên và quản trị viên trên cùng một nền tảng thống nhất.

### 1.3.2. Mục tiêu cụ thể

- Xây dựng hệ thống đăng ký, đăng nhập, xác thực email và quản lý hồ sơ.
- Xây dựng module quản lý khóa học và bài học.
- Xây dựng module đăng ký khóa học và theo dõi tiến độ học tập.
- Xây dựng module đề thi, câu hỏi, làm bài và chấm điểm tự động.
- Xây dựng module kết quả thi và review kết quả.
- Xây dựng module từ vựng theo chủ đề và cấp độ.
- Xây dựng module bình luận để tăng tương tác.
- Thiết kế giao diện web hiện đại, dễ sử dụng và dễ mở rộng.

## 1.4. Đối tượng và phạm vi nghiên cứu

### 1.4.1. Đối tượng nghiên cứu

- Người học tiếng Anh theo định hướng TOEIC và IELTS.
- Giảng viên có nhu cầu quản lý học liệu và đánh giá kết quả học viên.
- Hệ thống web học tập trực tuyến sử dụng kiến trúc frontend – backend.

### 1.4.2. Phạm vi nghiên cứu

Đề tài tập trung xây dựng các chức năng chính của một hệ thống học tập trực tuyến, bao gồm:
- Quản lý người dùng.
- Quản lý khóa học.
- Quản lý bài học.
- Quản lý đề thi và câu hỏi.
- Quản lý kết quả thi.
- Quản lý từ vựng.
- Quản lý bình luận và upload tài nguyên.

Đề tài chưa đi sâu vào các chức năng nâng cao như thanh toán trực tuyến, chống gian lận thi cử bằng AI, lớp học trực tiếp thời gian thực hoặc ứng dụng di động.

## 1.5. Nhiệm vụ thực hiện

Để hoàn thành đề tài, nhóm thực hiện các nhiệm vụ chính sau:
- Khảo sát nhu cầu và phân tích bài toán.
- Xây dựng mô hình chức năng của hệ thống.
- Lựa chọn công nghệ phù hợp cho frontend, backend và cơ sở dữ liệu.
- Thiết kế kiến trúc hệ thống và cơ sở dữ liệu.
- Xây dựng giao diện và các chức năng nghiệp vụ chính.
- Kiểm thử các luồng sử dụng quan trọng.
- Hoàn thiện báo cáo và chuẩn bị nội dung demo hệ thống.

## 1.6. Cấu trúc đồ án

Nội dung đồ án được trình bày trong 4 chương:

- **Chương 1 – Tổng quan:** Trình bày lý do chọn đề tài, mục tiêu nghiên cứu, phạm vi, nhiệm vụ và cấu trúc báo cáo.
- **Chương 2 – Cơ sở lý thuyết:** Trình bày các khái niệm, công nghệ, kiến trúc hệ thống, mô hình dữ liệu, phân quyền và API.
- **Chương 3 – Kết quả thực nghiệm:** Trình bày quá trình phân tích chức năng, thiết kế, cài đặt, triển khai và minh họa giao diện thực tế của hệ thống.
- **Chương 4 – Kết luận và kiến nghị:** Tổng kết kết quả đạt được, nêu hạn chế và đề xuất hướng phát triển.

---

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

## 2.1. Tổng quan hệ thống học tiếng Anh trực tuyến

Một hệ thống học tiếng Anh trực tuyến hiện đại thường bao gồm các chức năng chính như quản lý tài khoản, tổ chức khóa học, xây dựng nội dung bài học, đánh giá người học và theo dõi tiến độ. Đối với hệ thống luyện thi TOEIC/IELTS, các chức năng thi thử và quản lý câu hỏi đóng vai trò đặc biệt quan trọng.

TEFast được xây dựng như một hệ thống tích hợp, trong đó người học có thể thực hiện toàn bộ quy trình học tập trên một nền tảng duy nhất:
- Tạo tài khoản và đăng nhập.
- Tìm kiếm khóa học phù hợp.
- Đăng ký và học bài.
- Làm bài thi thử.
- Xem kết quả và phản hồi.
- Tra cứu từ vựng liên quan đến mục tiêu học tập.

## 2.2. Công nghệ sử dụng

### 2.2.1. Công nghệ frontend

Frontend được xây dựng bằng **Next.js 16** kết hợp **React 19** và **TypeScript**. Đây là bộ công nghệ phù hợp để xây dựng giao diện web hiện đại, có khả năng tổ chức route tốt, hỗ trợ render linh hoạt và dễ mở rộng.

Hệ thống sử dụng thêm:
- **Tailwind CSS 4** để thiết kế giao diện nhanh và đồng bộ.
- **shadcn/ui** và **Radix UI** để xây dựng các thành phần giao diện như button, card, dialog, table, tabs.
- **React Hook Form** và **Zod** để xử lý form và kiểm tra dữ liệu.
- **Sonner** để hiển thị thông báo thao tác.

### 2.2.2. Công nghệ backend

Backend được xây dựng bằng **Bun** kết hợp với **Express**. Backend cung cấp REST API cho toàn bộ hệ thống, xử lý nghiệp vụ và giao tiếp với cơ sở dữ liệu.

Một số thư viện chính:
- **pg**: kết nối PostgreSQL.
- **jsonwebtoken**: tạo và xác thực token.
- **bcrypt**: mã hóa mật khẩu.
- **express-validator**: validate dữ liệu đầu vào.
- **multer**: upload file.
- **nodemailer**: gửi email xác thực và quên mật khẩu.
- **EJS**: phục vụ render view nếu cần.

### 2.2.3. Cơ sở dữ liệu và hạ tầng

Hệ thống sử dụng **PostgreSQL 16** làm hệ quản trị cơ sở dữ liệu chính. PostgreSQL phù hợp với các hệ thống có dữ liệu quan hệ như người dùng, khóa học, bài học, đề thi, câu hỏi và kết quả.

Ngoài ra, hệ thống còn được cấu hình với:
- **Redis 7** trong môi trường Docker local.
- **Docker Compose** để chạy đồng thời frontend, backend, PostgreSQL và Redis.
- **Turbo** để điều phối script trong monorepo.

### 2.2.4. Bảng công nghệ sử dụng

**Bảng 2.1. Các công nghệ sử dụng trong hệ thống**

| STT | Công nghệ | Vai trò |
|---|---|---|
| 1 | Next.js 16 | Xây dựng giao diện web |
| 2 | React 19 | Xây dựng component giao diện |
| 3 | TypeScript | Kiểm soát kiểu dữ liệu |
| 4 | Tailwind CSS | Thiết kế giao diện |
| 5 | Bun | Runtime cho backend |
| 6 | Express | Xây dựng REST API |
| 7 | PostgreSQL | Lưu trữ dữ liệu |
| 8 | JWT | Xác thực người dùng |
| 9 | bcrypt | Mã hóa mật khẩu |
| 10 | multer | Upload file |
| 11 | nodemailer | Gửi email |
| 12 | Docker Compose | Triển khai cục bộ |

## 2.3. Kiến trúc hệ thống

### 2.3.1. Kiến trúc tổng thể

Hệ thống TEFast được xây dựng theo mô hình **frontend – backend – database**. Frontend là nơi người dùng tương tác trực tiếp. Backend chịu trách nhiệm xử lý nghiệp vụ, xác thực, phân quyền và truy vấn dữ liệu. PostgreSQL chịu trách nhiệm lưu trữ dữ liệu lâu dài.

**Hình 2.1. Mô hình kiến trúc tổng thể của hệ thống**  
*[Chèn sơ đồ kiến trúc tổng thể tại đây]*

Luồng hoạt động cơ bản:
1. Người dùng truy cập giao diện web trên frontend.
2. Frontend gọi các API nội bộ hoặc proxy.
3. Backend nhận request, kiểm tra quyền truy cập.
4. Backend thực hiện truy vấn dữ liệu từ PostgreSQL.
5. Kết quả được trả lại frontend để hiển thị cho người dùng.

### 2.3.2. Kiến trúc backend

Backend của TEFast được tổ chức theo kiểu **module-based Express**. Toàn bộ hệ thống tập trung tại file `app.ts` để khởi tạo server, kết nối database và mount các module route.

Các thư mục chính gồm:
- `routes/`: chứa định tuyến và xử lý nghiệp vụ từng module.
- `schemas/`: mô tả cấu trúc dữ liệu cho từng đối tượng.
- `utils/`: chứa middleware và helper dùng chung.
- `scripts/`: chứa script khởi tạo cơ sở dữ liệu và seed dữ liệu.

Kiểu tổ chức này giúp đồ án gọn, rõ ràng, dễ kiểm soát và phù hợp với quy mô hệ thống hiện tại.

### 2.3.3. Kiến trúc frontend

Frontend sử dụng App Router của Next.js để chia hệ thống thành các khu vực:
- `(marketing)`: giao diện công khai cho người dùng chưa đăng nhập.
- `(auth)`: đăng nhập, đăng ký, quên mật khẩu.
- `(app)`: khu vực sử dụng của học viên.
- `teacher`: khu vực giảng viên quản lý nội dung.
- `admin`: khu vực quản trị hệ thống.

Frontend tổ chức thêm:
- `components/`: các thành phần giao diện dùng lại.
- `features/`: logic gọi API theo từng tính năng.
- `lib/`: cấu hình và helper phục vụ xác thực, API, tiện ích.

## 2.4. Cơ sở dữ liệu và mô hình dữ liệu

### 2.4.1. Các bảng dữ liệu chính

Hệ thống sử dụng các bảng chính sau:
- `roles`
- `users`
- `courses`
- `lessons`
- `enrollments`
- `exams`
- `questions`
- `exam_sessions`
- `exam_results`
- `comments`
- `vocabulary`

**Bảng 2.2. Các bảng dữ liệu chính trong hệ thống**

| STT | Bảng dữ liệu | Chức năng |
|---|---|---|
| 1 | roles | Lưu vai trò người dùng |
| 2 | users | Lưu thông tin tài khoản |
| 3 | courses | Lưu thông tin khóa học |
| 4 | lessons | Lưu bài học thuộc khóa học |
| 5 | enrollments | Lưu thông tin đăng ký học |
| 6 | exams | Lưu thông tin đề thi |
| 7 | questions | Lưu câu hỏi của đề thi |
| 8 | exam_sessions | Lưu phiên làm bài |
| 9 | exam_results | Lưu kết quả thi |
| 10 | comments | Lưu bình luận |
| 11 | vocabulary | Lưu dữ liệu từ vựng |

### 2.4.2. Quan hệ giữa các bảng

- Một vai trò có nhiều người dùng.
- Một giảng viên có thể tạo nhiều khóa học, đề thi và từ vựng.
- Một khóa học có nhiều bài học, học viên đăng ký và đề thi.
- Một đề thi có nhiều câu hỏi, nhiều phiên thi và nhiều kết quả.
- Một người dùng có thể có nhiều lượt đăng ký học, nhiều bình luận và nhiều kết quả thi.

Nếu cần trình bày theo hồ sơ thiết kế, phần này có thể bổ sung thêm sơ đồ ERD.

**Hình 2.2. Mô hình phân quyền người dùng**  
*[Chèn sơ đồ phân quyền hoặc ERD tại đây]*

## 2.5. Phân quyền và bảo mật

### 2.5.1. Phân quyền người dùng

Hệ thống hỗ trợ 3 vai trò chính:
- **STUDENT**: đăng ký khóa học, học bài, làm bài thi, xem kết quả, bình luận.
- **TEACHER**: tạo khóa học, bài học, đề thi, câu hỏi, từ vựng và theo dõi kết quả.
- **ADMIN**: quản trị người dùng và toàn bộ hệ thống.

Phân quyền được xử lý ở backend thông qua middleware kiểm tra đăng nhập và vai trò.

### 2.5.2. Bảo mật hệ thống

Hệ thống sử dụng JWT để xác thực. Sau khi đăng nhập thành công, token được lưu trong cookie `httpOnly`, giúp frontend không cần lưu token trong localStorage. Điều này giúp giảm rủi ro lộ token thông qua script phía client.

Ngoài ra, hệ thống còn áp dụng:
- Mã hóa mật khẩu bằng bcrypt.
- Validate dữ liệu đầu vào trước khi xử lý.
- Kiểm tra quyền truy cập với từng loại tài nguyên.
- Chỉ cho phép xem dữ liệu publish đối với người dùng công khai.

## 2.6. API và giao tiếp giữa các thành phần

TEFast hoạt động theo mô hình REST API. Một số nhóm API chính gồm:
- Auth API
- User API
- Course API
- Lesson API
- Exam API
- Question API
- Exam Result API
- Enrollment API
- Comment API
- Upload API
- Vocabulary API

Frontend gọi API thông qua các lớp `features/*` và `proxyApiFetch` hoặc `safeServerApiFetch`. Việc tách logic gọi API giúp mã nguồn dễ bảo trì và tái sử dụng.

---

# CHƯƠNG 3. KẾT QUẢ THỰC NGHIỆM

## 3.1. Phân tích chức năng hệ thống

Dựa trên yêu cầu ban đầu, hệ thống đã được xây dựng với các nhóm chức năng chính sau:

### 3.1.1. Chức năng dành cho học viên

- Đăng ký tài khoản.
- Đăng nhập và đăng xuất.
- Xác thực email.
- Xem danh sách khóa học công khai.
- Xem chi tiết khóa học.
- Đăng ký khóa học.
- Xem danh sách bài học.
- Truy cập bài học theo quyền.
- Bắt đầu bài thi.
- Làm bài và nộp bài.
- Xem kết quả thi.
- Cập nhật hồ sơ cá nhân.
- Bình luận trong khóa học hoặc bài học.
- Tra cứu từ vựng.

### 3.1.2. Chức năng dành cho giảng viên

- Tạo và quản lý khóa học.
- Tạo và quản lý bài học.
- Tạo và quản lý đề thi.
- Tạo và quản lý câu hỏi.
- Xem danh sách học viên đăng ký khóa học.
- Xem và review kết quả bài thi.
- Quản lý từ vựng.
- Upload tài nguyên học tập.

### 3.1.3. Chức năng dành cho quản trị viên

- Xem danh sách người dùng.
- Xem chi tiết tài khoản.
- Thay đổi vai trò người dùng.
- Theo dõi trạng thái hệ thống.
- Có quyền truy cập và quản trị toàn bộ nền tảng.

**Bảng 3.1. Các chức năng chính của hệ thống**

| Nhóm người dùng | Chức năng chính |
|---|---|
| Học viên | Học bài, làm bài thi, xem kết quả, bình luận |
| Giảng viên | Quản lý khóa học, bài học, đề thi, câu hỏi, từ vựng |
| Quản trị viên | Quản lý người dùng, vai trò và hệ thống |

## 3.2. Thiết kế hệ thống

### 3.2.1. Thiết kế luồng học tập

Luồng học tập cơ bản của hệ thống như sau:
1. Người dùng tạo tài khoản hoặc đăng nhập.
2. Người dùng xem danh sách khóa học phù hợp.
3. Người dùng đăng ký khóa học.
4. Người dùng truy cập các bài học trong khóa học đã đăng ký.
5. Người dùng bắt đầu làm bài thi liên quan.
6. Hệ thống chấm điểm và lưu kết quả.
7. Người dùng xem lịch sử kết quả và phản hồi.

### 3.2.2. Thiết kế module thi thử

Luồng module thi thử gồm:
- Tạo `exam_session` khi người dùng bắt đầu thi.
- Lấy danh sách câu hỏi từ đề thi.
- Giao diện đếm thời gian làm bài.
- Cho phép chọn đáp án cho từng câu.
- Gửi danh sách đáp án lên backend khi nộp bài.
- Backend so sánh đáp án, tính điểm và lưu vào `exam_results`.

### 3.2.3. Thiết kế giao diện quản trị

Khu vực giảng viên và quản trị viên được tách riêng, giúp thao tác rõ ràng hơn. Dashboard giảng viên ưu tiên nội dung giảng dạy như course, exam, lesson, vocabulary. Dashboard quản trị viên tập trung vào user management và system health.

Nếu cần nộp theo yêu cầu môn học, phần này có thể bổ sung thêm:
- Use case diagram
- Activity diagram
- Sequence diagram
- Class diagram

## 3.3. Cài đặt và triển khai

### 3.3.1. Cấu trúc thư mục dự án

Dự án được tổ chức theo monorepo như sau:

```text
TEFast/
├── backend/
├── frontend/
├── docker-compose.yml
├── package.json
└── turbo.json
```

### 3.3.2. Môi trường chạy hệ thống

Hệ thống có thể chạy cục bộ với các địa chỉ mặc định:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Backend health: `http://localhost:3001/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### 3.3.3. Các lệnh cài đặt và chạy

```bash
bun install
bun run dev
bun run dev:frontend
bun run dev:backend
bun run build
docker compose up --build
```

### 3.3.4. Các API chính của hệ thống

**Bảng 3.2. Danh sách các API chính**

| Nhóm API | Một số endpoint tiêu biểu |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/me` |
| Users | `/users/profile`, `/users/:id/role` |
| Courses | `/courses`, `/courses/:id`, `/courses/:courseId/lessons` |
| Lessons | `/lessons/:id`, `/lessons/:id/order` |
| Exams | `/exams`, `/exams/:id/start`, `/exams/:examId/questions` |
| Results | `/exam-results`, `/exam-results/my`, `/exam-results/:id/review` |
| Comments | `/comments`, `/comments/:id` |
| Enrollments | `/enrollments`, `/enrollments/my` |
| Upload | `/upload/single`, `/upload/multiple` |
| Vocabulary | `/vocabulary`, `/vocabulary/topics` |

## 3.4. Giao diện và minh họa demo

> **Lưu ý:** Phần này được chừa sẵn để chèn ảnh demo khi hoàn thiện báo cáo Word. Bạn chỉ cần chụp màn hình hệ thống rồi dán vào đúng các vị trí bên dưới.

### 3.4.1. Giao diện trang chủ

Mô tả: Trang chủ giới thiệu hệ thống TEFast, hiển thị thông tin tổng quan, khóa học nổi bật và điều hướng đến khu vực đăng ký/đăng nhập.

**Hình 3.1. Giao diện trang chủ**  
*[Chèn ảnh giao diện trang chủ tại đây]*

### 3.4.2. Giao diện đăng nhập

Mô tả: Giao diện cho phép người dùng đăng nhập bằng email và mật khẩu. Hệ thống hỗ trợ điều hướng đến chức năng quên mật khẩu, xác thực email và đăng ký.

**Hình 3.2. Giao diện đăng nhập**  
*[Chèn ảnh giao diện đăng nhập tại đây]*

### 3.4.3. Giao diện danh sách khóa học

Mô tả: Trang danh sách khóa học cho phép người dùng xem các khóa học công khai, lọc theo category và từ khóa.

**Hình 3.3. Giao diện danh sách khóa học**  
*[Chèn ảnh danh sách khóa học tại đây]*

### 3.4.4. Giao diện dashboard giảng viên

Mô tả: Dashboard giảng viên hiển thị số lượng khóa học, đề thi, từ vựng và các liên kết thao tác nhanh như tạo course, tạo đề thi, upload tài nguyên.

**Hình 3.4. Giao diện dashboard giảng viên**  
*[Chèn ảnh dashboard giảng viên tại đây]*

### 3.4.5. Giao diện làm bài thi

Mô tả: Giao diện làm bài thi hiển thị thời gian còn lại, danh sách câu hỏi, trạng thái câu đã trả lời và nút nộp bài.

**Hình 3.5. Giao diện làm bài thi**  
*[Chèn ảnh giao diện làm bài thi tại đây]*

### 3.4.6. Giao diện kết quả bài thi

Mô tả: Sau khi nộp bài, hệ thống hiển thị kết quả gồm điểm số, số câu đúng, số câu sai và thời gian hoàn thành.

**Hình 3.6. Giao diện kết quả bài thi**  
*[Chèn ảnh giao diện kết quả bài thi tại đây]*

### 3.4.7. Giao diện quản trị người dùng

Mô tả: Khu vực admin cho phép xem danh sách người dùng, vai trò, trạng thái và thực hiện phân quyền.

**Hình 3.7. Giao diện quản trị người dùng**  
*[Chèn ảnh giao diện quản trị người dùng tại đây]*

## 3.5. Đánh giá kết quả thực nghiệm

Sau khi triển khai các chức năng chính, hệ thống đã đạt được các kết quả sau:

- Hoàn thành luồng đăng ký, đăng nhập và xác thực email.
- Hoàn thành luồng quản lý khóa học và bài học.
- Hoàn thành luồng đăng ký khóa học và theo dõi tiến độ học tập.
- Hoàn thành luồng thi thử từ khâu bắt đầu bài thi đến nộp bài và xem kết quả.
- Hoàn thành chức năng review kết quả cho giảng viên.
- Hoàn thành module từ vựng, bình luận và upload tài nguyên.
- Giao diện được tổ chức theo vai trò, hỗ trợ thao tác thuận tiện hơn cho từng nhóm người dùng.

Kết quả cho thấy hệ thống đã đáp ứng tốt các yêu cầu cơ bản của một nền tảng học tiếng Anh trực tuyến phục vụ TOEIC/IELTS.

---

# CHƯƠNG 4. KẾT LUẬN VÀ KIẾN NGHỊ

## 4.1. Kết luận

Đề tài **Website học tiếng Anh TEFast (TOEIC/IELTS)** đã xây dựng được một hệ thống web học tập trực tuyến tương đối hoàn chỉnh, bao gồm các chức năng cần thiết cho cả người học, giảng viên và quản trị viên. Hệ thống cho phép quản lý tài khoản, khóa học, bài học, đề thi, câu hỏi, kết quả thi, từ vựng, bình luận và upload tài nguyên trên cùng một nền tảng.

Việc xây dựng đề tài đã giúp nhóm vận dụng được các kiến thức về phát triển ứng dụng web, thiết kế hệ thống, xây dựng REST API, tổ chức cơ sở dữ liệu và phát triển giao diện người dùng hiện đại.

## 4.2. Kết quả đạt được

- Xây dựng thành công frontend bằng Next.js và backend bằng Express chạy trên Bun.
- Sử dụng PostgreSQL để tổ chức dữ liệu có quan hệ rõ ràng.
- Triển khai được cơ chế xác thực và phân quyền theo vai trò.
- Hoàn thiện các module chính phục vụ học tập và luyện thi.
- Tổ chức mã nguồn theo hướng dễ mở rộng và bảo trì.
- Có thể chạy hệ thống cục bộ thông qua Docker Compose.

## 4.3. Hạn chế

Bên cạnh những kết quả đạt được, hệ thống vẫn còn một số hạn chế:
- Chưa tích hợp thanh toán trực tuyến.
- Chưa có dashboard thống kê dữ liệu trực quan bằng biểu đồ.
- Chưa có chức năng chat realtime giữa học viên và giảng viên.
- Chưa triển khai các kỹ thuật chống gian lận thi cử.
- Chưa tối ưu toàn diện cho môi trường production quy mô lớn.

## 4.4. Hướng phát triển

Trong tương lai, hệ thống có thể được mở rộng theo các hướng sau:
- Tích hợp thanh toán cho khóa học trả phí.
- Bổ sung báo cáo thống kê học tập và dashboard trực quan.
- Tích hợp notification, email nhắc học và nhắc thi.
- Xây dựng ngân hàng câu hỏi lớn hơn và hỗ trợ sinh đề ngẫu nhiên.
- Phát triển chức năng chấm speaking/writing bằng AI.
- Xây dựng ứng dụng mobile hoặc tối ưu giao diện trên thiết bị di động.
- Tăng cường kiểm thử và bảo mật cho hệ thống triển khai thực tế.

---

# TÀI LIỆU THAM KHẢO

> **Lưu ý:** Danh mục dưới đây được viết theo kiểu tài liệu tham khảo phù hợp cho báo cáo. Khi nộp chính thức, bạn có thể giữ lại hoặc bổ sung thêm tài liệu đã thực sự sử dụng.

[1] Next.js. https://nextjs.org/docs  
[2] React. https://react.dev  
[3] Express.js. https://expressjs.com  
[4] PostgreSQL. https://www.postgresql.org/docs  
[5] Bun Runtime. https://bun.sh/docs  
[6] Tailwind CSS. https://tailwindcss.com/docs  
[7] Radix UI. https://www.radix-ui.com  
[8] JWT Introduction. https://jwt.io/introduction  
[9] NodeMailer Documentation. https://nodemailer.com  
[10] Multer Documentation. https://github.com/expressjs/multer  

---

# PHỤ LỤC

## Phụ lục A. Cấu trúc thư mục dự án

```text
TEFast/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── scripts/
│   ├── public/
│   └── views/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── lib/
│       └── types/
├── docker-compose.yml
├── package.json
└── turbo.json
```

## Phụ lục B. Gợi ý ảnh cần chèn trong báo cáo

- Ảnh trang chủ
- Ảnh trang đăng nhập
- Ảnh danh sách khóa học
- Ảnh chi tiết khóa học
- Ảnh dashboard giảng viên
- Ảnh giao diện tạo khóa học
- Ảnh giao diện tạo đề thi
- Ảnh giao diện làm bài thi
- Ảnh giao diện kết quả bài thi
- Ảnh giao diện quản trị người dùng

## Phụ lục C. Gợi ý bổ sung nếu giảng viên yêu cầu UML

- Use Case tổng quát cho 3 vai trò
- Activity Diagram cho luồng làm bài thi
- Sequence Diagram cho đăng nhập
- ERD cho cơ sở dữ liệu hệ thống
