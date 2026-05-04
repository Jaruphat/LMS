# Deployment Notes

> Updated: `2026-05-04`
> Scope: GitHub push preparation + Vercel readiness for the current MVP

---

## Current Release Readiness

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] Public pages checked
- [x] Student purchase flow checked
- [x] Admin approve flow checked

---

## GitHub Checklist

### Before push

- [x] README updated
- [x] `.env*` ignored
- [x] uploaded slip files ignored
- [x] dev logs ignored
- [x] docs included inside repo

### Recommended commands

```bash
cd C:\AI\LMS\lms
git add .
git commit -m "Prepare LearnHub LMS MVP for GitHub and Vercel"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

---

## Vercel Readiness

### Required environment variables

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BLOB_READ_WRITE_TOKEN`

### Optional for local migration workflow

- `SHADOW_DATABASE_URL`

### Slip storage note

ตอนนี้โค้ดรองรับ Vercel Blob แล้ว

- ถ้ามี `BLOB_READ_WRITE_TOKEN` ระบบจะอัปโหลด slip ไปที่ Vercel Blob
- ถ้ายังไม่มี token ระบบจะ fallback ไปเขียนที่ `public/uploads/` สำหรับ local development

สำหรับ preview และ production บน Vercel ควรสร้าง Blob store และผูก token ให้ครบก่อน deploy

ข้อจำกัดของแนวทาง server upload นี้คือควรใช้ไฟล์ไม่เกิน `4.5MB`

---

## Vercel Deployment Flow

1. Push repo ขึ้น GitHub
2. Import repo ใน Vercel
3. เลือก framework เป็น Next.js
4. ตั้ง environment variables ให้ครบ
5. Deploy preview
6. Run smoke test
7. Promote to production

---

## Smoke Tests After Deploy

### Public

- [ ] `/courses` โหลดได้
- [ ] `/about` โหลดได้
- [ ] `/contact` โหลดได้
- [ ] `404 fallback` ทำงาน

### Auth

- [ ] Register ได้
- [ ] Login ได้
- [ ] Role guard ทำงาน

### Student

- [ ] Add to cart ได้
- [ ] Checkout ได้
- [ ] Upload slip ได้
- [ ] Order history โหลดได้

### Admin

- [ ] Create course ได้
- [ ] Create lesson ได้
- [ ] Approve order ได้
- [ ] Enrollment ถูกสร้างหลัง approve

---

## Rollback Notes

ถ้า deploy แล้วมีปัญหา:

1. rollback deployment บน Vercel ไป release ก่อนหน้า
2. ตรวจ env vars
3. ตรวจ database connectivity
4. ตรวจ storage integration ของ slip upload
5. rerun smoke tests
