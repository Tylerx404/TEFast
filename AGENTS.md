# AGENTS.md

Hướng dẫn này dành cho coding agent làm việc trong repo `TEFast`. Mục tiêu là giúp agent hiểu nhanh cấu trúc dự án, sửa đúng chỗ, verify tối thiểu và tránh các thay đổi lan rộng không cần thiết.

## 1. Tổng quan dự án

- Monorepo dùng `bun` workspaces và `turbo`.
- `frontend`: Next.js 16, React 19, App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
- `backend`: Express chạy trên Bun, TypeScript nhưng đang theo style CommonJS cũ (`require`, `module.exports`, `var`).
- Hạ tầng local có PostgreSQL và Redis qua `docker-compose.yml`.

## 2. Nguyên tắc làm việc trong repo này

- Ưu tiên thay đổi tối thiểu, đúng phạm vi yêu cầu.
- Giữ nguyên style hiện có của từng khu vực:
  - Frontend dùng import/export ESM, component/function hiện đại.
  - Backend đang dùng `require`, `module.exports`, `var`; không tự ý refactor hàng loạt sang ESM hoặc `const`/`let` nếu task không yêu cầu.
- Không thêm dependency mới nếu có thể tận dụng code sẵn có.
- Không sửa file ngoài phạm vi vấn đề trừ khi bắt buộc để hoàn tất luồng.
- Khi thay đổi API hoặc shape dữ liệu, luôn kiểm tra cả backend và frontend liên quan.

## 3. Cấu trúc thư mục quan trọng

```text
.
├── frontend
│   ├── src/app                 # App Router pages/layouts/api routes
│   ├── src/components          # UI và form components
│   ├── src/features            # API wrappers theo domain
│   ├── src/lib                 # config, auth, api helpers, utils
│   └── src/types               # kiểu dữ liệu API/domain/forms
├── backend
│   ├── src/app.ts              # entrypoint Express app
│   ├── src/routes              # route handlers
│   ├── src/schemas             # schema metadata, enum, SQL table bootstrap
│   ├── src/utils               # helper/auth/upload/validation/mail
│   └── views                   # EJS views
├── turbo.json
└── docker-compose.yml
```

## 4. Lệnh thường dùng

Chạy từ root repo:

```bash
bun install
bun run dev
bun run dev:frontend
bun run dev:backend
bun run lint
bun run typecheck
bun run check
bun run build
```

Lệnh theo app:

```bash
bun --cwd frontend run dev
bun --cwd frontend run lint
bun --cwd frontend run typecheck

bun --cwd backend run dev
bun --cwd backend run typecheck
```

Docker local:

```bash
docker compose up --build
docker compose down
```

## 5. Môi trường và config

- Frontend hiện lấy API base URL từ:
  - `API_BASE_URL`, hoặc
  - `NEXT_PUBLIC_API_BASE_URL`
- Lưu ý: `frontend/.env.example` hiện đang dùng tên `NEXT_PUBLIC_API_URL`, không khớp với `frontend/src/lib/config.ts`. Khi debug lỗi gọi API, ưu tiên kiểm tra biến môi trường thực tế trước.
- Backend cần các biến chính:
  - `HOST`
  - `PORT`
  - `DATABASE_URL`
  - `REDIS_URL`

## 6. Luồng sửa backend

Khi sửa hoặc thêm endpoint:

1. Xác định route trong `backend/src/routes`.
2. Kiểm tra helper/auth liên quan trong `backend/src/utils`.
3. Nếu thay đổi enum, field hoặc table contract, kiểm tra file tương ứng trong `backend/src/schemas`.
4. Giữ format response nhất quán qua `helper.sendSuccess`, `helper.sendCreated`, `helper.sendError`.
5. Khi thay đổi request/response shape, cập nhật frontend phần gọi API và type liên quan.

Pattern đang dùng:

- Kết nối PostgreSQL lấy từ `req.app.locals.pg`.
- Auth/role check đi qua `checkLogin`, `checkRole`, hoặc helper trong `authHandler`.
- Validation hiện chủ yếu làm thủ công trong route, không có validation layer tập trung hoàn chỉnh cho mọi route.

## 7. Luồng sửa frontend

Khi sửa UI/form có gọi API:

1. Tìm page entry trong `frontend/src/app`.
2. Tìm API wrapper/domain logic trong `frontend/src/features/<domain>`.
3. Tìm component form trong `frontend/src/components/forms`.
4. Kiểm tra type trong `frontend/src/types`.
5. Nếu form dùng validation, cập nhật schema tại `frontend/src/features/*/schemas.ts`.

Pattern đang dùng:

- Server-side fetch wrapper: `frontend/src/lib/api/server.ts`
- Client-side fetch wrapper: `frontend/src/lib/api/client.ts`
- Form state: `react-hook-form` + `zod`
- UI primitives: shadcn/ui trong `frontend/src/components/ui`
- Thông báo lỗi/thành công: `sonner`

## 8. Khi thay đổi contract dữ liệu

Nếu thêm/sửa field cho một domain như course, lesson, exam, user:

1. Backend route đọc/ghi field đó.
2. Backend schema hoặc enum liên quan trong `backend/src/schemas`.
3. Frontend types trong `frontend/src/types/domain.ts` hoặc `frontend/src/types/forms.ts`.
4. Frontend feature API wrapper.
5. Form/page đang hiển thị hoặc submit field đó.

Không chỉ sửa một phía rồi dừng.

## 9. Verify tối thiểu

Repo hiện chưa thấy test suite tự động rõ ràng ở mức project. Verify mặc định nên là:

```bash
bun run check
```

Nếu chỉ chạm một app:

```bash
bun run check:frontend
bun run check:backend
```

Nếu thay đổi luồng API hoặc auth, nên verify thủ công thêm bằng cách chạy app tương ứng. Nếu chưa chạy verify, phải nói rõ `Chưa verify`.

## 10. Cảnh báo và bẫy hiện có

- Backend đang theo style code cũ; đừng trộn refactor style với fix nghiệp vụ.
- `frontend/.env.example` và code runtime đang lệch tên biến API base URL.
- `docker-compose.yml` hiện có dấu hiệu lệch cấu hình PostgreSQL giữa service database, healthcheck và chuỗi kết nối của backend. Trước khi sửa lỗi liên quan Docker hoặc DB bootstrapping, hãy kiểm tra lại toàn bộ cấu hình thay vì giả định stack Docker đang đúng.
- Repo đang có cả frontend lẫn backend trong cùng workspace; tránh chạy format/refactor diện rộng nếu task chỉ nằm ở một app.

## 11. Cách báo cáo kết quả

Khi hoàn tất một task:

- Nói ngắn gọn đã đổi gì.
- Nêu lý do thay đổi nếu không hiển nhiên.
- Nêu rủi ro hoặc phần chưa đụng tới nếu còn.
- Ghi rõ đã verify bằng lệnh nào, hoặc ghi `Chưa verify`.

## 12. Không nên làm

- Không tự động rewrite style backend sang module syntax mới.
- Không thêm framework state management hoặc form library mới.
- Không đổi tên hàng loạt file/module chỉ để "đẹp hơn".
- Không giả định Docker đang chạy đúng nếu chưa đối chiếu env thật.
- Không in hoặc sao chép secret ra log/tài liệu.
