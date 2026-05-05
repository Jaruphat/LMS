# LearnHub LMS PRD

> Updated: `2026-05-05`
> Status: `MVP ready, deployed, and smoke-tested on production`
> App source of truth: `lms/`

## 1. Product Overview

LearnHub คือระบบ LMS สำหรับคอร์สสาย Automation, AI Workflow, และ workshop training โดยมีทั้งฝั่ง public storefront, student learning flow, และ admin commerce backoffice

MVP ปัจจุบันรองรับ flow สำคัญครบ:

- สมัครสมาชิก / login
- ดูคอร์สสาธารณะ
- ซื้อคอร์สผ่าน cart + checkout
- อัปโหลด slip และให้ admin approve / reject
- สร้าง enrollment อัตโนมัติ
- เรียนบทเรียน, ทำ quiz, track progress
- ใช้งาน rating, webboard, chatbot, และ view counters
- อัปโหลดไฟล์วิดีโอจริงสำหรับบทเรียนจากฝั่งแอดมิน

## 2. Verification Status

### Verified

- `npm run lint`
- `npm run build`
- `npm run test:e2e` ผ่าน `10/10`
- production smoke test ผ่าน `10/10`

### Covered by E2E

- public pages + 404
- register / login
- guest preview
- rating + discussion
- free-course quiz
- admin create course
- admin upload MP4 / WebM lesson files
- uploaded lesson preview
- checkout / slip upload
- approve order
- my courses

## 3. User Roles

| Role | Scope |
|---|---|
| Guest | ดู `/courses`, `/about`, `/contact`, รายละเอียดคอร์ส, preview lesson, และ free course content |
| Student | ซื้อคอร์ส, checkout, upload slip, ดู order history, ดู my courses, เรียน, ทำ quiz, รีวิว, ตั้งกระทู้ |
| Admin | จัดการคอร์ส, บทเรียน, คำสั่งซื้อ, dashboard stats, approve/reject payment, อัปโหลดวิดีโอบทเรียน |

## 4. Current Pages

### Public

- `/`
- `/courses`
- `/courses/[courseId]`
- `/courses/[courseId]/lessons/[lessonId]`
- `/about`
- `/contact`
- custom `404`

### Auth / Student

- `/login`
- `/register`
- `/dashboard`
- `/dashboard/my-courses`
- `/dashboard/orders`
- `/cart`
- `/checkout`

### Admin

- `/admin`
- `/admin/courses`
- `/admin/courses/new`
- `/admin/courses/[courseId]`
- `/admin/courses/[courseId]/edit`
- `/admin/courses/[courseId]/lessons/new`
- `/admin/courses/[courseId]/lessons/[lessonId]/edit`
- `/admin/orders`

## 5. Functional Modules

### Commerce

- cart ใน `localStorage`
- checkout
- manual payment via slip upload
- approve / reject order
- auto-create enrollment

### Learning

- markdown lessons
- video lessons
- preview / locked access control
- quiz and progress

### Engagement

- rating / review
- course webboard
- lesson webboard
- course chatbot
- course / lesson view counters

### Media

- YouTube URLs
- direct video URLs
- admin upload file จริง (`.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v`)

## 6. Data Model Summary

### User

- `id`, `name`, `email`, `passwordHash`, `role`, `createdAt`

### Course

- `title`, `description`, `thumbnailUrl`, `price`, `status`, `viewCount`

### Lesson

- `title`, `contentType`, `content`, `summary`, `durationText`, `order`, `isPreview`, `viewCount`

### Commerce

- `Order`
- `OrderItem`
- `Enrollment`

### Engagement

- `CourseReview`
- `DiscussionThread`
- `DiscussionReply`
- `CourseChatMessage`

## 7. Access Rules

### Guest

- เห็นเฉพาะคอร์ส `PUBLISHED`
- เข้า preview lesson ได้
- เข้า free course lesson ได้
- ทำ quiz บน free / preview content ได้ แต่ถ้ายังไม่ login จะไม่บันทึกผล

### Student

- ซื้อคอร์สและ upload slip ได้
- เข้า locked lesson ได้เมื่อมี enrollment
- ตั้งกระทู้และรีวิวได้ตามสิทธิ์ของคอร์ส

### Admin

- เข้าได้ทั้ง draft และ published content
- จัดการคอร์ส / บทเรียน / orders ได้
- อัปโหลดไฟล์วิดีโอจริงให้บทเรียนได้

## 8. API Surface

### Auth

- `POST /api/auth/register`
- `POST /api/auth/[...nextauth]`

### Courses / Lessons

- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/[courseId]`
- `PATCH /api/courses/[courseId]`
- `DELETE /api/courses/[courseId]`
- `POST /api/lessons`
- `GET /api/lessons/[lessonId]`
- `PATCH /api/lessons/[lessonId]`
- `DELETE /api/lessons/[lessonId]`

### Commerce

- `GET /api/orders`
- `POST /api/orders`
- `POST /api/orders/[orderId]/slip`
- `GET /api/enrollments`
- `GET /api/admin/stats`
- `POST /api/admin/orders/[orderId]/approve`
- `POST /api/admin/orders/[orderId]/reject`

### Engagement / Media

- `POST /api/admin/uploads/video`
- `GET|POST /api/courses/[courseId]/reviews`
- `GET|POST /api/courses/[courseId]/threads`
- `POST /api/threads/[threadId]/replies`
- `POST /api/courses/[courseId]/chatbot`
- `POST /api/courses/[courseId]/views`
- `POST /api/lessons/[lessonId]/views`

## 9. Upload and Storage Strategy

### Slip upload

- ใช้ Vercel Blob ถ้ามี `BLOB_READ_WRITE_TOKEN`
- fallback ไป `public/uploads/` ถ้ายังไม่มี token
- แนะนำไม่เกิน `4.5MB`

### Video upload

- ฝั่งแอดมินใช้ client upload ไป Vercel Blob โดยตรงเมื่อมี token
- fallback ไป `public/uploads/videos/` เมื่อไม่มี token
- มี fixture สำหรับทดสอบจริงใน repo

## 10. Current Backlog

1. Dedicated landing page ที่ `/`
2. Forgot / reset password
3. Search + filter
4. Drag-and-drop lesson reorder
5. Email notifications
6. Certificate generation
7. Search / analytics hardening for long-term operations
