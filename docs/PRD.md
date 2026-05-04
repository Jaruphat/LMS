# LearnHub LMS PRD

> Updated: `2026-05-04`
> Status: `MVP ready locally`
> App source of truth: `lms/`

---

## 1. Product Overview

LearnHub คือระบบ LMS สำหรับคอร์สสาย Automation, OCR, AI Ops และ workflow training โดยมีทั้งฝั่ง public storefront, student learning flow, และ admin commerce backoffice

MVP ปัจจุบันถูกออกแบบให้ใช้งานได้จริงใน local environment พร้อม flow สำคัญครบ:

- สมัครสมาชิก / login
- ดูคอร์สสาธารณะ
- ซื้อคอร์สผ่าน cart + checkout
- อัปโหลด slip
- ให้ admin approve / reject
- สร้าง enrollment อัตโนมัติ
- เข้าเรียนบทเรียนที่ได้รับสิทธิ์แล้ว
- ทำ quiz และ track progress

---

## 2. MVP Status

### Done

- Core LMS
- Commerce flow
- Public storefront
- Admin dashboard
- Order approval flow
- Thai-first public copy
- Custom 404

### Verified

- `npm run lint`
- `npm run build`
- `npm run test:e2e` ผ่าน `7/7`

### Not in MVP yet

- Forgot password / reset password
- Dedicated home page separate from `/courses`
- Search / filter
- Drag-and-drop lesson reorder
- Email notifications
- Production object storage for payment slips

---

## 3. User Roles

| Role | Scope |
|---|---|
| Guest | ดู `/courses`, `/about`, `/contact`, รายละเอียดคอร์ส, preview lesson, และ free course content |
| Student | สั่งซื้อคอร์ส, checkout, upload slip, ดู order history, ดูคอร์สที่ได้รับสิทธิ์, เรียนและทำ quiz |
| Admin | จัดการคอร์ส, บทเรียน, คำสั่งซื้อ, dashboard stats, และ approve/reject payment |

---

## 4. Pages and Routes in Current MVP

### Public

| Route | Status | Notes |
|---|---|---|
| `/` | Shipped | redirect ไป `/courses` |
| `/courses` | Shipped | storefront หลักพร้อม hero + catalog |
| `/courses/[courseId]` | Shipped | รายละเอียดคอร์ส + lesson list + access state |
| `/about` | Shipped | public about page |
| `/contact` | Shipped | public contact page |
| `404` | Shipped | custom not-found page |

### Auth

| Route | Status |
|---|---|
| `/login` | Shipped |
| `/register` | Shipped |
| `/forgot-password` | Backlog |
| `/reset-password` | Backlog |

### Student

| Route | Status | Notes |
|---|---|---|
| `/dashboard` | Shipped | summary dashboard |
| `/dashboard/my-courses` | Shipped | approved / available courses |
| `/dashboard/orders` | Shipped | order history |
| `/cart` | Shipped | localStorage cart |
| `/checkout` | Shipped | order creation + slip upload |
| `/courses/[courseId]/lessons/[lessonId]` | Shipped | lesson viewer + quiz |

### Admin

| Route | Status | Notes |
|---|---|---|
| `/admin` | Shipped | stats + recent orders |
| `/admin/courses` | Shipped | course management |
| `/admin/courses/new` | Shipped | create course |
| `/admin/courses/[courseId]/edit` | Shipped | edit course |
| `/admin/courses/[courseId]` | Shipped | lesson management |
| `/admin/courses/[courseId]/lessons/new` | Shipped | create lesson |
| `/admin/courses/[courseId]/lessons/[lessonId]/edit` | Shipped | edit lesson |
| `/admin/orders` | Shipped | review slip + approve/reject |
| `/admin/users` | Backlog |
| `/admin/enrollments` | Backlog |

---

## 5. Data Model

### User

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`

### Course

- `id`
- `title`
- `description`
- `thumbnailUrl`
- `price`
- `status`
- `createdBy`
- `createdAt`

### Lesson

- `id`
- `courseId`
- `title`
- `contentType`
- `content`
- `order`
- `isPreview`

### Order

- `id`
- `userId`
- `totalAmount`
- `status`
- `slipUrl`
- `slipUploadedAt`
- `reviewedAt`
- `reviewedById`
- `createdAt`

### OrderItem

- `id`
- `orderId`
- `courseId`
- `price`

### Enrollment

- `id`
- `userId`
- `courseId`
- `orderId`
- `enrolledAt`

### Quiz / QuizAttempt / Progress

- lesson-level quiz
- answer submission
- completion tracking per lesson

---

## 6. Access Rules

### Guest

- เห็นเฉพาะคอร์ส `PUBLISHED`
- เข้า preview lesson ได้
- เข้า free course lesson ได้
- ทำ quiz บน free/preview content ได้ แต่ผลจะไม่ถูกบันทึกถ้ายังไม่ login

### Student

- ซื้อคอร์สได้
- upload slip ได้
- เข้าบทเรียนที่เป็น free course ได้
- เข้าบทเรียนแบบ locked ได้เมื่อมี `Enrollment`

### Admin

- เข้าถึง draft + published content ได้
- จัดการคอร์สและบทเรียนได้
- ตรวจคำสั่งซื้อและอนุมัติได้

---

## 7. Current API Surface

### Auth

- `POST /api/auth/register`
- `POST /api/auth/[...nextauth]`

### Courses

- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/[courseId]`
- `PATCH /api/courses/[courseId]`
- `DELETE /api/courses/[courseId]`

### Lessons

- `POST /api/lessons`
- `GET /api/lessons/[lessonId]`
- `PATCH /api/lessons/[lessonId]`
- `DELETE /api/lessons/[lessonId]`

### Quiz / Progress

- `POST /api/quiz`
- `POST /api/quiz/submit`
- `POST /api/progress`
- `GET /api/progress/[courseId]`

### Orders / Commerce

- `GET /api/orders`
- `POST /api/orders`
- `POST /api/orders/[orderId]/slip`
- `GET /api/enrollments`
- `GET /api/admin/stats`
- `POST /api/admin/orders/[orderId]/approve`
- `POST /api/admin/orders/[orderId]/reject`

---

## 8. Core User Flows

### Student Purchase Flow

1. เปิด `/courses`
2. ดูรายละเอียดคอร์ส
3. เพิ่มลง cart
4. checkout
5. upload slip
6. order status เป็น `PENDING`
7. รอ admin approve
8. ระบบสร้าง enrollment
9. student เข้าเรียนได้

### Admin Review Flow

1. login เป็น admin
2. เปิด `/admin/orders`
3. ตรวจสลิป
4. approve หรือ reject
5. ถ้า approve ระบบสร้าง enrollment ให้ทันที

### Learning Flow

1. student เปิดคอร์ส
2. เลือก lesson ที่เข้าถึงได้
3. อ่าน/ดูบทเรียน
4. submit quiz
5. mark complete
6. progress ถูกอัปเดต

---

## 9. Verification Standard for MVP

MVP จะถือว่าพร้อมเมื่อ:

- register / login ทำงาน
- admin สร้างคอร์สได้
- admin สร้างบทเรียนได้
- student add to cart และ checkout ได้
- student upload slip ได้
- admin approve order ได้
- enrollment ถูกสร้างอัตโนมัติ
- student เห็นคอร์สที่ซื้อแล้วใน my courses
- lesson access control ทำงาน
- quiz submit ทำงาน

สถานะปัจจุบัน: ผ่านทั้งหมดใน local verification

---

## 10. Deployment Notes

### GitHub

repo git ปัจจุบันอยู่ที่ `lms/`

### Vercel

deploy ได้หลังเตรียม:

- production PostgreSQL
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Important blocker before production payments

payment slip ตอนนี้เก็บด้วย local filesystem ที่ `public/uploads/`

ก่อนขึ้น production ควรย้ายไปใช้:

- Vercel Blob
- Cloudflare R2
- หรือ object storage ที่ persistent

---

## 11. Post-MVP Backlog

1. Dedicated landing page ที่ `/`
2. Forgot/reset password
3. Search + filters
4. Drag-and-drop lesson reorder
5. Email notifications
6. Certificate generation
7. Production storage migration
8. Vercel production release
