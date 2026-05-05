# Deployment Notes

> Updated: `2026-05-05`
> Scope: GitHub push + Vercel deployment for the current MVP

## Current Readiness

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] Public pages checked
- [x] Commerce flow checked
- [x] Admin approve flow checked
- [x] Admin video upload + preview checked

## Required Environment Variables

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BLOB_READ_WRITE_TOKEN`

Optional for local migration workflow:

- `SHADOW_DATABASE_URL`

## Storage Behavior

### Slip upload

- ถ้ามี `BLOB_READ_WRITE_TOKEN` จะเก็บที่ Vercel Blob
- ถ้าไม่มี token จะ fallback ไป `public/uploads/`
- เนื่องจากเป็น server upload ควรคุม slip ไม่เกิน `4.5MB`

### Video upload

- ถ้ามี `BLOB_READ_WRITE_TOKEN` หน้าแอดมินจะใช้ client upload ไป Vercel Blob โดยตรง
- ถ้าไม่มี token จะ fallback ไป `public/uploads/videos/`
- fixture สำหรับทดสอบอยู่ที่ `tests/fixtures/videos/flower.mp4` และ `tests/fixtures/videos/flower.webm`

## GitHub Commands

```bash
cd C:\AI\LMS\lms
git status
git add .
git commit -m "Add admin video upload flow"
git push
```

## Vercel Flow

1. Push latest commit ขึ้น GitHub
2. Trigger deployment ผ่าน Git integration หรือ `vercel --prod`
3. รอ build ให้ผ่าน
4. Smoke test production

## Smoke Tests After Deploy

### Public

- [ ] `/courses` โหลดได้
- [ ] `/about` โหลดได้
- [ ] `/contact` โหลดได้
- [ ] `404 fallback` ทำงาน

### Auth / Student

- [ ] Register ได้
- [ ] Login ได้
- [ ] Add to cart ได้
- [ ] Checkout ได้
- [ ] Upload slip ได้
- [ ] Order history โหลดได้

### Admin

- [ ] Create course ได้
- [ ] Upload video lesson file ได้
- [ ] Preview lesson video ที่เพิ่งอัปโหลดได้
- [ ] Approve order ได้
- [ ] Enrollment ถูกสร้างหลัง approve

## Rollback Notes

1. rollback deployment บน Vercel ไป release ก่อนหน้า
2. ตรวจ env vars
3. ตรวจ database connectivity
4. ตรวจ Blob integration ของ slip และ video upload
5. rerun smoke tests
