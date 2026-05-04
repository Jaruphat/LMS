# LearnHub LMS MVP

ระบบ LMS แบบ MVP สำหรับคอร์สสาย Automation, OCR, AI Ops และ manual payment approval flow

## Status

- MVP พร้อมใช้งานในเครื่องแล้ว
- ผ่าน `npm run lint`
- ผ่าน `npm run build`
- ผ่าน `npm run test:e2e` จำนวน `7/7` เคส
- วันที่อัปเดตสถานะล่าสุด: `2026-05-04`

## Scope ที่มีจริงใน MVP

### Public

- `/` redirect ไป `/courses`
- `/courses` storefront หลักพร้อม hero banner, course catalog, และภาพ mockup
- `/courses/[courseId]` รายละเอียดคอร์ส
- `/about`
- `/contact`
- `404 fallback`

### Auth

- สมัครสมาชิก
- เข้าสู่ระบบด้วย NextAuth credentials
- role guard สำหรับ `STUDENT` และ `ADMIN`

### Student

- cart ด้วย `localStorage`
- checkout
- upload slip
- order history
- purchased courses dashboard
- lesson viewer
- quiz submission
- progress tracking

### Admin

- dashboard stats
- course CRUD
- lesson CRUD
- order approve / reject
- enrollment auto-create หลัง approve

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Prisma 7 + `@prisma/adapter-pg`
- PostgreSQL
- NextAuth v4
- Playwright

## App Location

repo นี้คือ application source หลักอยู่ที่ root ของโฟลเดอร์ `lms/`

เอกสารสำคัญ:

- [PRD](./docs/PRD.md)
- [Project Tasks](./docs/PROJECT_TASKS.md)
- [Deployment Notes](./docs/DEPLOYMENT.md)

## Local Setup

1. ติดตั้ง dependency

```bash
npm install
```

2. สร้าง env จากตัวอย่าง

```bash
cp .env.example .env.local
```

3. ใส่ค่าที่ต้องใช้ใน `.env.local`

- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

4. push schema และ seed ข้อมูล

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

5. รัน dev server

```bash
npm run dev -- --port 3000 --webpack
```

หรือใช้สคริปต์ที่เตรียมไว้จาก workspace root:

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

## Notes เรื่องข้อมูลอัปโหลด

ตอนนี้ slip upload ใช้ local filesystem ที่ `public/uploads/` สำหรับ development

ถ้าจะ deploy production บน Vercel ควรเปลี่ยน storage ของ slip ไปเป็น:

- Vercel Blob
- Cloudflare R2
- หรือ object storage อื่นที่ persistent

## Push ขึ้น GitHub

สถานะ git ปัจจุบัน:

- current branch: `master`
- remote: ยังไม่มี

ตัวอย่างขั้นตอน:

```bash
cd C:\AI\LMS\lms
git status
git add .
git commit -m "Prepare LearnHub LMS MVP for GitHub and Vercel"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

ถ้า GitHub repo ถูกสร้างไว้แล้วแต่มี remote เดิมผิด:

```bash
git remote remove origin
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

## Prepare for Vercel

### Required

- production PostgreSQL database
- `DATABASE_URL` สำหรับ production
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- production-ready file storage สำหรับ slip

### Recommended Flow

1. push repo นี้ขึ้น GitHub ให้เรียบร้อย
2. import repo เข้า Vercel
3. ตั้ง Environment Variables
4. เปลี่ยน slip storage จาก local เป็น Vercel Blob หรือ R2
5. deploy
6. run smoke test หลัง deploy

รายละเอียด checklist อยู่ที่ [Deployment Notes](./docs/DEPLOYMENT.md)
