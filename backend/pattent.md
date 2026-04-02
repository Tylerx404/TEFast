# TEFast Backend Pattern

## 1. Muc tieu kien truc

Backend duoc to chuc theo huong `module-based Express` chay tren `Bun`.
Day khong phai MVC thuan. Day la kieu `MVC-lite / Transaction Script`:

- `app.ts` la entry point duy nhat.
- `routes/` vua dinh tuyen, vua chua route handler.
- Khong tach `controller/` rieng.
- `schemas/` la noi dinh nghia schema va model cua tung module.
- `utils/` chua cac concern dung chung.

Backend hien tai khong su dung realtime chat va khong dua `socket.io` vao kien truc.

## 2. Runtime va stack

- Runtime: `Bun`
- HTTP framework: `Express`
- Database: `PostgreSQL`
- Database driver: `pg`
- Validation: `express-validator`
- Auth: `jsonwebtoken`, `bcrypt`
- Upload: `multer`
- Mail: `nodemailer`
- View engine: `ejs`

## 3. Nguyen tac to chuc source

Thu muc backend duoc to chuc theo khung sau:

```text
backend/
├── public/
│   └── uploads/
├── src/
│   ├── app.ts
│   ├── routes/
│   ├── schemas/
│   └── utils/
├── views/
├── package.json
└── tsconfig.json
```

## 4. Vai tro tung phan

### `src/app.ts`

`app.ts` la noi:

- khoi tao Express app
- doc bien moi truong
- dang ky middleware chung
- mount static files va views
- tao `route registry`
- mount tat ca routers trong `routes/`
- gan error handler
- khoi dong HTTP server

`app.ts` khong chua business logic cua tung module.

### `src/routes/`

Moi file trong `routes/` dai dien cho mot module nghiep vu:

- `auth.ts`
- `users.ts`
- `courses.ts`
- `lessons.ts`
- `exams.ts`
- `questions.ts`
- `examResults.ts`
- `vocabulary.ts`
- `comments.ts`
- `enrollments.ts`
- `upload.ts`
- `index.ts`

Moi file route:

- export `Router`
- tu khai bao endpoint cua module do
- xu ly logic ngay trong route handler
- co the goi helper trong `utils/`
- co the lam viec truc tiep voi schema/model cua module

Khong tao `controller/` rieng.

## 5. Route registry pattern

He thong dung `route registry` tai `app.ts`.
Mau to chuc:

```ts
const routeRegistry = [
  { path: "/", router: indexRouter },
  { path: "/auth", router: authRouter },
  { path: "/users", router: usersRouter },
];
```

Sau do `app.ts` mount toan bo registry vao Express app.

Muc dich:

- giu `app.ts` ro rang
- nhin nhanh duoc toan bo module dang ton tai
- them module moi de dang

## 6. Logic xu ly nghiep vu

Kieu to chuc duoc chot la:

- route handler co the xu ly nghiep vu truc tiep
- cac thao tac ngan va ro rang de ngay trong route
- neu co logic dung chung thi tach ra `utils/`

Khong ep buoc chia thanh:

- controller
- service
- repository

Chi khi he thong lon hon moi can xem xet tach sau.

## 7. Database pattern voi PostgreSQL

He thong su dung `PostgreSQL`, khong dung `MongoDB`, khong dung `mongoose`.

Quy uoc:

- `DATABASE_URL` la bien ket noi chinh
- truy cap database thong qua `pg`
- `schemas/` duoc giu lai theo quy uoc do an
- model duoc tao tu schema, nen khong doi ten thu muc nay sang `models/`

`schemas/` la noi mo ta cau truc du lieu cua tung module, gom:

- roles
- users
- courses
- lessons
- exams
- questions
- examResults
- vocabulary
- comments
- enrollments

## 8. Utilities va middleware dung chung

Tat ca concern dung chung dat trong `utils/`:

- `authHandler.ts`: xac thuc JWT, gan thong tin user, phan quyen
- `validationHandler.ts`: tap trung xu ly validation
- `uploadHandler.ts`: cau hinh upload va luu file
- `mailHandler.ts`: gui email
- `helper.ts`: helper nho dung chung

Nguyen tac:

- middleware chung dat tai `utils/`
- route nao can thi import vao route do
- khong dua middleware logic vao `app.ts` neu chi phuc vu 1 module

## 9. Static files va views

- `public/uploads/` chua file upload
- `views/` chua EJS templates

Day la thanh phan ho tro cho cac chuc nang upload / render can thiet trong do an.

## 10. Pham vi hien tai

Pattern nay chi bao gom:

- REST API
- authentication / authorization
- CRUD theo module
- upload file
- mail
- PostgreSQL

Khong bao gom:

- chat realtime
- websocket
- socket.io

## 11. Nguyen tac khi mo rong he thong

Khi them module moi, uu tien theo thu tu:

1. Tao file route moi trong `routes/`
2. Tao schema tuong ung trong `schemas/`
3. Them helper dung chung neu can trong `utils/`
4. Dang ky router vao `route registry` trong `app.ts`

Khong tu y them cac tang khac ngoai pattern nay neu chua can thiet.
