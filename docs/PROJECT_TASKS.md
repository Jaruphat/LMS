# LMS Project Tasks

> Updated: `2026-05-05`
> Application repo: `lms/`
> Status: `MVP ready, deployed, and smoke-tested on production`

## MVP Release Status

- [x] Core LMS พร้อมใช้งาน
- [x] Commerce flow พร้อมใช้งาน
- [x] Public storefront พร้อมใช้งาน
- [x] Admin dashboard และ order review พร้อมใช้งาน
- [x] Engagement layer พร้อมใช้งาน (`rating`, `webboard`, `chatbot`, `counter`)
- [x] Real video upload for admin lessons พร้อมใช้งาน
- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run test:e2e` ผ่าน `10/10`

## Completed Scope

### Phase 1 — Core LMS

- [x] Register / Login / Session guard
- [x] Admin role guard
- [x] Course CRUD
- [x] Lesson CRUD
- [x] Quiz submit
- [x] Progress tracking
- [x] Public vs protected lesson access

### Phase 2 — Commerce

- [x] Course pricing + publish status
- [x] Cart + checkout
- [x] Upload payment slip
- [x] Orders management
- [x] Approve / reject flow
- [x] Enrollment auto-create
- [x] Student my courses / order history

### Phase 3 — Public / Engagement

- [x] `/courses`, `/about`, `/contact`
- [x] Thai-first storefront
- [x] Custom 404
- [x] Course rating / review
- [x] Course + lesson webboard
- [x] Course chatbot
- [x] Course / lesson view counters

### Phase 4 — Media / Deployment

- [x] Vercel Blob support for slip upload
- [x] Real admin video upload with local fallback
- [x] MP4 / WebM preview verified via Playwright
- [x] Redeploy production with latest media changes

## Deployment Checklist

- [x] README updated
- [x] `.env.example` updated
- [x] `.gitignore` covers local uploads and logs
- [x] Repo docs mirrored inside `docs/`
- [x] Push latest commit to GitHub
- [x] Trigger new Vercel deployment
- [x] Smoke test production after redeploy

## Post-MVP Backlog

1. Dedicated landing page at `/`
2. Forgot / reset password
3. Search and filter
4. Drag-and-drop lesson ordering
5. Email notifications
6. Certificate generation
7. Analytics / moderation hardening for engagement features
