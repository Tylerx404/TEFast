# TEFast Backend Structure

## 1. Tong quan

Backend TEFast duoc to chuc theo huong `module-based Express` chay tren `Bun`.
Day khong phai MVC thuan. Day la kieu `MVC-lite / Transaction Script`:

- `app.ts` la file bootstrap chinh va cung la entry point chay server.
- `routes/` vua dinh tuyen, vua chua route handler.
- khong tach `controller/` rieng.
- `schemas/` duoc giu theo quy uoc do an.
- `utils/` chua middleware va helper dung chung.

He thong hien tai su dung:

- Runtime: `Bun`
- HTTP framework: `Express`
- Database: `PostgreSQL`
- Driver: `pg`
- Auth: `jsonwebtoken`, `bcrypt`
- Validation: `express-validator`
- Upload: `multer`
- Mail: `nodemailer`
- View engine: `ejs`

He thong khong bao gom:

- chat realtime
- websocket
- socket.io
- mongoose
- mongodb

## 2. Nguyen tac kien truc

Backend duoc to chuc theo cac nguyen tac sau:

1. `app.ts` bootstrap Express app, khoi tao ket noi database, mount router va tu chay server.
2. Tat ca module nghiep vu duoc khai bao trong `routes/`.
3. Logic duoc phep viet truc tiep trong route handler.
4. Neu logic duoc tai su dung nhieu noi thi tach sang `utils/`.
5. `schemas/` la noi mo ta schema/model cua tung module theo kieu custom cua do an.
6. Khong them `controller/`, `service/`, `repository/` neu chua that su can.

## 3. Cau truc thu muc

```text
backend/
|-- public/
|   `-- uploads/
|       |-- images/
|       |-- audio/
|       `-- docs/
|-- src/
|   |-- app.ts
|   |-- routes/
|   |   |-- index.ts
|   |   |-- auth.ts
|   |   |-- users.ts
|   |   |-- courses.ts
|   |   |-- lessons.ts
|   |   |-- exams.ts
|   |   |-- questions.ts
|   |   |-- examResults.ts
|   |   |-- vocabulary.ts
|   |   |-- comments.ts
|   |   |-- enrollments.ts
|   |   `-- upload.ts
|   |-- schemas/
|   |   |-- roles.ts
|   |   |-- users.ts
|   |   |-- courses.ts
|   |   |-- lessons.ts
|   |   |-- exams.ts
|   |   |-- questions.ts
|   |   |-- examResults.ts
|   |   |-- vocabulary.ts
|   |   |-- comments.ts
|   |   `-- enrollments.ts
|   `-- utils/
|       |-- authHandler.ts
|       |-- validationHandler.ts
|       |-- uploadHandler.ts
|       |-- mailHandler.ts
|       `-- helper.ts
|-- views/
|-- .env.example
|-- Dockerfile
|-- package.json
|-- pattent.md
|-- README.md
`-- tsconfig.json
```

Luu y:

- Khong co `src/server.ts` trong cau truc hien tai.
- `app.ts` dang la file duy nhat de start backend.
- `bun.lock` nam o root workspace cua monorepo, khong nam rieng trong `backend/`.

## 4. Vai tro tung phan

### `src/app.ts`

`app.ts` la noi:

- khoi tao Express app
- doc `PORT`, `HOST`, `DATABASE_URL`
- khoi tao `Pool` cua PostgreSQL
- dang ky middleware chung
- mount static files trong `public/`
- dang ky view engine `ejs`
- mount tat ca routers trong `routes/`
- gan 404 handler va error handler
- tu khoi dong HTTP server khi chay truc tiep
- export `app` de co the tai su dung neu can

### `src/routes/`

Moi file route dai dien cho mot module nghiep vu.

Moi file:

- export `Router`
- tu khai bao endpoint
- tu xu ly nghiep vu trong route handler
- co the goi helper tu `utils/`
- co the thao tac truc tiep voi schema/model cua module

Backend khong dung `controller/` rieng.

### `src/schemas/`

`schemas/` la noi dinh nghia schema/model cho tung module.
Du backend dung PostgreSQL, ten thu muc nay van duoc giu theo quy uoc do an.

Schema hien tai duoc viet theo kieu cu:

- `require(...)`
- `module.exports`
- field object dung cac key nhu `required`, `default`, `enum`, `ref`

Nhung ve ban chat van la schema custom cho PostgreSQL, khong phai Mongoose.

### `src/utils/`

`utils/` chua concern dung chung:

- `authHandler.ts`: xac thuc va phan quyen
- `validationHandler.ts`: validation middleware
- `uploadHandler.ts`: upload config
- `mailHandler.ts`: gui mail
- `helper.ts`: helper nho dung chung

Nguyen tac:

- middleware dung chung thi dat o `utils/`
- route nao can thi import vao route do
- khong dua logic rieng cua 1 module vao `app.ts`

### `public/`

Noi luu file upload:

- images
- audio
- docs

### `views/`

`views/` chua cac file EJS phuc vu render neu can.

## 5. Route mount pattern

He thong hien tai mount router truc tiep trong `app.ts`.
Mau to chuc:

```ts
app.use('/', require('./routes/index').indexRouter);
app.use('/auth', require('./routes/auth').authRouter);
app.use('/users', require('./routes/users').usersRouter);
```

Muc dich:

- de doc
- de doi chieu endpoint nhanh
- hop voi style code cu ma project dang theo

## 6. Workflow xu ly trong code

Workflow chung cua backend:

1. Request vao `app.ts`
2. Middleware chung xu ly body, cookie, static file
3. Request duoc dieu huong den route tuong ung
4. Route handler xu ly nghiep vu truc tiep
5. Route co the goi `utils/` va `schemas/`
6. Ket qua tra ve JSON response hoac view neu can

Pattern nay uu tien:

- don gian
- de doc
- de lam do an
- de mo rong theo module

## 7. Phan quyen

He thong co 3 role:

- `STUDENT`
- `TEACHER`
- `ADMIN`

Quy uoc quyen:

- `STUDENT`: hoc, thi, dang ky khoa hoc, xem ket qua, binh luan
- `TEACHER`: toan bo quyen cua student + CRUD hoc lieu minh quan ly
- `ADMIN`: toan quyen he thong

## 8. Phan chia TOEIC / IELTS

He thong khong tach thanh database rieng cho TOEIC va IELTS.
Phan chia nghiep vu thong qua truong `category`:

- `TOEIC`
- `IELTS`

Ap dung chu yeu cho:

- `courses`
- `exams`
- `vocabulary`

## 9. Quy tac mo rong he thong

Khi them module moi:

1. Tao file route moi trong `routes/`
2. Tao schema tuong ung trong `schemas/`
3. Tao helper/middleware trong `utils/` neu can
4. Mount router moi vao `app.ts`

Khong tu y them:

- `controller/`
- `service/`
- `repository/`
- `models/`

neu chua co nhu cau that su.

## 10. Trang thai hien tai

Structure hien tai phai duoc hieu la:

- day la khung backend chinh thuc dang chay
- `structure.md` mo ta cau truc va cach to chuc file
- `pattent.md` la tai lieu pattern tom tat
- `doc.md` o root project la tai lieu workflow + API contract
