BÁO CÁO ĐỒ ÁN: TEFast — Web Học Tiếng Anh TOEIC & IELTS (Backend TypeScript)1. Tổng quan đồ án1.1. Giới thiệuTEFast là nền tảng học tiếng Anh trực tuyến chuyên biệt cho hai kỳ thi phổ biến nhất tại Việt Nam: TOEIC (Test of English for International Communication) và IELTS (International English Language Testing System).
Hệ thống cho phép giáo viên tạo khóa học, đề thi, từ vựng và học viên đăng ký học, luyện đề, theo dõi tiến độ.1.2. Mục tiêuXây dựng hệ thống web full-stack với backend REST API.Chia rõ 2 lớp học: TOEIC và IELTS, mỗi lớp có khóa học, đề thi, từ vựng riêng.Đảm bảo đầy đủ chức năng: CRUD, Authentication, Authorization, Upload file.1.3. Công nghệ sử dụngBackend: Node.js, Express.js, TypeScript.Database: MongoDB, Mongoose ODM.Xác thực: JWT (jsonwebtoken), bcryptjs.Upload file: Multer.Gửi mail: Nodemailer.2. Cấu trúc Backend (TypeScript)Dựa trên cấu trúc ban đầu, thư mục bin đã được loại bỏ. File app.ts sẽ đảm nhận cả vai trò cấu hình Express và khởi tạo HTTP server. Toàn bộ các file logic được chuyển sang định dạng .ts.

├─ app.ts                 # Entry point: Khởi tạo HTTP server, kết nối DB, cấu hình Express
├─ routes/                # Các endpoint REST API
│  ├─ index.ts
│  ├─ auth.ts
│  ├─ users.ts
│  ├─ courses.ts
│  ├─ lessons.ts
│  ├─ exams.ts
│  ├─ questions.ts
│  ├─ examResults.ts
│  ├─ vocabulary.ts
│  ├─ comments.ts
│  ├─ enrollments.ts
│  └─ upload.ts
├─ schemas/               # Mongoose Schemas & TypeScript Interfaces
│  ├─ roles.ts
│  ├─ users.ts
│  ├─ courses.ts
│  ├─ lessons.ts
│  ├─ exams.ts
│  ├─ questions.ts
│  ├─ examResults.ts
│  ├─ vocabulary.ts
│  ├─ comments.ts
│  └─ enrollments.ts
├─ utils/                 # Các hàm tiện ích dùng chung
│  ├─ authHandler.ts
│  ├─ validationHandler.ts
│  ├─ uploadHandler.ts
│  ├─ mailHandler.ts
│  └─ helper.ts
├─ public/                # File tĩnh được upload
│  └─ uploads/
│     ├─ images/
│     ├─ audio/
│     └─ docs/
├─ views/                 # Template EJS
├─ .env                   # Biến môi trường
├─ tsconfig.json          # File cấu hình TypeScript (Thêm mới)
├─ package.json
└─ package-lock.json
1. Vai trò các thư mục & Lưu ý khi dùng TypeScriptapp.ts: Thay thế cho bin/www và app.js cũ. File này chịu trách nhiệm kết nối MongoDB, gắn middleware, mount routes, xử lý lỗi và trực tiếp khởi tạo server (lắng nghe port).routes/: Định nghĩa tất cả REST endpoints và xử lý CRUD. Trong TypeScript, các tham số req, res, next sẽ được ép kiểu rõ ràng bằng Request, Response, NextFunction từ module express.schemas/: Định nghĩa Mongoose Schema (validation, index, methods). Đặc biệt trong TypeScript, thư mục này đồng thời chứa các Interface mô tả chi tiết kiểu dữ liệu của Document (ví dụ: IUser, ICourse) để sử dụng trong toàn dự án.utils/: Chứa các hàm hỗ trợ chung (xác thực JWT, phân quyền, validate input, cấu hình Multer, phân trang).public/ & views/: Lưu trữ file tĩnh (ảnh, audio, tài liệu) và EJS template.Lưu ý TypeScript: Quá trình xác thực JWT sẽ gắn thông tin user vào req.user. Bạn sẽ cần tạo một file định nghĩa type (ví dụ types/express/index.d.ts) để mở rộng interface Request của Express nhằm tránh lỗi Type Checking khi gọi req.user.4. Hệ thống phân quyền — 3 RolesHệ thống quản lý quyền truy cập qua collection roles độc lập. Trường role trong schema users tham chiếu (ObjectId) tới collection này. Khi xác thực, middleware tiến hành populate và kiểm tra req.user.role.name.Student: Xem khóa học, đăng ký học, làm bài thi, nộp bài, xem kết quả cá nhân và bình luận.Teacher: Toàn bộ quyền của student. Bổ sung quyền tạo/sửa/xóa tài nguyên học tập (khóa học, bài học, đề thi, câu hỏi, từ vựng) do mình tạo ra, xem kết quả học viên, upload file.Admin: Toàn quyền hệ thống, quản lý tài khoản user và phân quyền.5. Cơ chế phân chia TOEIC & IELTSHệ thống không chia nhỏ thành các database độc lập. Cơ chế phân luồng hoạt động thông qua trường category (Enum: ['TOEIC', 'IELTS']) tại 3 schema nền tảng:courses: Phân biệt khóa học.exams: Phân biệt đề thi.vocabulary: Phân biệt bộ từ vựng.Các entity con (như lessons, questions) không cần trường này do luôn được kế thừa phân loại từ khóa học hoặc đề thi gốc.6. Tổng quan API Endpoints (Tổng cộng: 53) Hệ thống bao gồm 53 endpoints chính, cung cấp đầy đủ chức năng quản trị và học tập:Auth (3 endpoints): Đăng ký, đăng nhập và lấy thông tin phiên (/me).Users (5 endpoints): Quản lý hồ sơ cá nhân và danh sách người dùng (Admin).Courses (6 endpoints): Xem, lọc theo TOEIC/IELTS và CRUD khóa học.Lessons (5 endpoints): Quản lý nội dung học tập bên trong khóa học.Exams (6 endpoints): Xử lý các loại bài kiểm tra (Mini Test, Full Test, Practice).Questions (5 endpoints): Ngân hàng câu hỏi thuộc các đề thi.Exam Results (5 endpoints): Ghi nhận quá trình nộp bài, chấm tự động và tra cứu kết quả.Vocabulary (6 endpoints): Ngân hàng từ vựng có hỗ trợ bộ lọc và full-text search.Comments (5 endpoints): Quản lý tương tác, hỏi đáp (hỗ trợ nested reply qua parentComment).Enrollments (5 endpoints): Đăng ký khóa học và lưu trữ tiến độ (Progress tracking).Upload (2 endpoints): Lưu trữ file đơn hoặc mảng file (tối đa 5 file) lên server.