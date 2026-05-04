# LMS Project Tasks

> Updated: `2026-05-04`
> Application repo: `lms/`
> Status: `MVP ready locally`

---

## MVP Release Status

- [x] Core LMS พร้อมใช้งาน
- [x] Commerce flow พร้อมใช้งาน
- [x] Public storefront พร้อมใช้งาน
- [x] Admin dashboard และ order review พร้อมใช้งาน
- [x] Lint ผ่าน
- [x] Build ผ่าน
- [x] E2E smoke tests ผ่าน `7/7`

---

## Phase 1 — Core LMS

### Auth

- [x] Register API + UI
- [x] Login with NextAuth credentials
- [x] Session-based route protection
- [x] Admin role guard

### Course Management

- [x] Prisma models: `User`, `Course`, `Lesson`
- [x] Admin create course
- [x] Admin update course
- [x] Admin delete course
- [x] Public course list
- [x] Public course detail
- [x] Public vs protected access rules

### Lesson, Quiz, Progress

- [x] Admin create lesson
- [x] Admin update lesson
- [x] Admin delete lesson
- [x] Lesson viewer (video + markdown)
- [x] Quiz create
- [x] Quiz submit
- [x] Progress tracking

---

## Phase 2 — Commerce

### Data Model

- [x] `price`
- [x] `thumbnailUrl`
- [x] `status`
- [x] `isPreview`
- [x] `Order`
- [x] `OrderItem`
- [x] `Enrollment`

### Student Flow

- [x] Cart stored in `localStorage`
- [x] Cart page
- [x] Checkout page
- [x] Create order from selected courses
- [x] Upload payment slip
- [x] Student order history
- [x] Student my courses page

### Admin Flow

- [x] Admin dashboard stats
- [x] Recent orders widget
- [x] Orders management page
- [x] Approve order
- [x] Reject order
- [x] Auto-create enrollment after approval

### Access Control

- [x] Free course lessons accessible without purchase
- [x] Preview lessons accessible before purchase
- [x] Locked lessons require approved enrollment
- [x] Admin can access draft + published content

---

## Phase 3 — Public Site

- [x] `/courses` storefront page
- [x] `/about`
- [x] `/contact`
- [x] Public course detail with preview lessons
- [x] Custom `404 fallback`
- [x] Thai-first public content
- [ ] Dedicated marketing home page separate from `/courses`
- [ ] Forgot password
- [ ] Reset password

---

## Phase 4 — Polish / Production Hardening

- [ ] Drag-and-drop lesson reorder
- [ ] Course search and filtering
- [ ] Email notifications
- [ ] Certificate generation
- [ ] Replace local slip storage with persistent object storage
- [ ] Production deployment verification on Vercel

---

## GitHub Readiness

- [x] README updated for real project setup
- [x] `.env.example` added
- [x] `.gitignore` updated for logs and uploaded slips
- [x] Repo docs mirrored inside `docs/`
- [x] Local verification captured

---

## Vercel Preparation

- [ ] Create production PostgreSQL database
- [ ] Set `DATABASE_URL`
- [ ] Set `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL`
- [ ] Replace `/public/uploads/` slip storage
- [ ] Import GitHub repo into Vercel
- [ ] Run post-deploy smoke tests

---

## Post-MVP Backlog

1. Dedicated landing page at `/`
2. Forgot/reset password
3. Search + filter
4. Lesson reorder UX
5. Persistent production file storage
6. Production deploy + monitoring
