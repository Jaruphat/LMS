# LearnHub LMS MVP

ระบบ LMS แบบ MVP สำหรับขายและเรียนคอร์สออนไลน์สาย Automation, AI Workflow, และเทรนนิงเชิงปฏิบัติการ

## Status

- ใช้งานได้จริงทั้งฝั่ง public, student, และ admin
- ผ่าน `npm run lint`
- ผ่าน `npm run build`
- ผ่าน `npm run test:e2e` จำนวน `10/10` เคส
- อัปเดตล่าสุด: `2026-05-05`

## ฟีเจอร์หลัก

### Public

- `/courses` storefront ภาษาไทย
- `/courses/[courseId]` รายละเอียดคอร์ส
- `/about`
- `/contact`
- `404 fallback`

### Student

- สมัครสมาชิก / เข้าสู่ระบบ
- cart + checkout
- upload slip
- order history
- my courses
- lesson viewer
- quiz + progress
- rating / review
- webboard ต่อคอร์สและต่อบทเรียน
- course chatbot

### Admin

- dashboard stats
- course CRUD
- lesson CRUD
- อัปโหลดไฟล์วิดีโอจริงสำหรับบทเรียน
- approve / reject orders
- auto-create enrollment หลัง approve

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Prisma 7 + PostgreSQL
- NextAuth v4
- Vercel Blob
- Playwright

## Source of Truth

application source จริงอยู่ที่ root ของ repo นี้ (`lms/`)

เอกสารสำคัญ:

- [PRD](./docs/PRD.md)
- [Project Tasks](./docs/PROJECT_TASKS.md)
- [Deployment Notes](./docs/DEPLOYMENT.md)

## Local Setup

1. ติดตั้ง dependency

```bash
npm install
```

2. สร้างไฟล์ env

```bash
cp .env.example .env.local
```

3. ใส่ค่าที่ต้องใช้ใน `.env.local`

- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BLOB_READ_WRITE_TOKEN` ถ้าต้องการทดสอบ Vercel Blob จากเครื่อง local

4. sync schema และ seed

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

5. รัน dev server

```bash
npm run dev -- --port 3000 --webpack
```

หรือใช้สคริปต์จาก workspace root:

```powershell
..\start-lms-dev.cmd 3000
```

## Demo Accounts

- `admin@lms.dev / admin1234`
- `student@lms.dev / student1234`

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run test:e2e
```

## Upload / Storage Notes

### Slip upload

- ถ้ามี `BLOB_READ_WRITE_TOKEN` ระบบจะเก็บ slip ที่ Vercel Blob
- ถ้าไม่มี token ระบบจะ fallback ไปที่ `public/uploads/`
- slip ยังใช้แนวทาง server upload จึงควรคุมไฟล์ไม่เกิน `4.5MB`

### Video lesson upload

- ถ้ามี `BLOB_READ_WRITE_TOKEN` ฟอร์มบทเรียนจะอัปโหลดวิดีโอจาก browser ไป Vercel Blob โดยตรง
- ถ้าไม่มี token ระบบจะ fallback ไปที่ `public/uploads/videos/`
- repo มีไฟล์ fixture สำหรับทดสอบอยู่ที่ `tests/fixtures/videos/`

## GitHub

ตัวอย่างคำสั่ง push:

```bash
cd C:\AI\LMS\lms
git status
git add .
git commit -m "Add admin video upload flow"
git push
```

## Vercel

ค่าที่ต้องมีอย่างน้อย:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BLOB_READ_WRITE_TOKEN`

รายละเอียด deployment checklist อยู่ที่ [Deployment Notes](./docs/DEPLOYMENT.md)
