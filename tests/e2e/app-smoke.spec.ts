import { expect, test, type Page, type TestInfo } from "@playwright/test"

const studentEmail = `playwright.student.${Date.now()}@example.com`
const studentPassword = "Playwright123!"
const createdCourseTitle = `คอร์สทดสอบ Playwright ${Date.now()}`
const discussionTitle = `คำถามจาก Playwright ${Date.now()}`
const discussionContent = "อยากลองระบบ webboard ว่าตั้งกระทู้และแสดงผลบนหน้าคอร์สได้จริงหรือไม่"
const studentReviewText = `รีวิวจาก Playwright ${Date.now()}`
const seededPaidCourseTitle = "โรงงานสร้างครีเอทีฟโฆษณา AI จาก Google Sheets"
const seededFreeCourseTitle = "พื้นฐานระบบอัตโนมัติด้วย n8n"
const seededPreviewVideoCourseTitle = "พื้นฐาน TypeScript และ Frameworks Workshop"
const seededPreviewVideoLessonTitle = "Day 1: Introduction to TypeScript และการเตรียมเครื่องมือ"
const seededFreeQuizCorrectChoice = "วางแผน workflow"
const slipFixturePath = "C:\\AI\\LMS\\lms\\public\\images\\generated\\course-showcase-mockup.png"
const uploadedMp4LessonTitle = `à¸§à¸´à¸”à¸µà¹‚à¸­ MP4 à¸ˆà¸²à¸ Playwright ${Date.now()}`
const uploadedWebmLessonTitle = `à¸§à¸´à¸”à¸µà¹‚à¸­ WebM à¸ˆà¸²à¸ Playwright ${Date.now()}`
const uploadedMp4FixturePath = "C:\\AI\\LMS\\lms\\tests\\fixtures\\videos\\flower.mp4"
const uploadedWebmFixturePath = "C:\\AI\\LMS\\lms\\tests\\fixtures\\videos\\flower.webm"

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage: true })
  await testInfo.attach(name, { path, contentType: "image/png" })
}

async function gotoAndWaitForReady(page: Page, path: string, readyTestId?: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" })

  if (readyTestId) {
    await expect(page.getByTestId(readyTestId)).toHaveAttribute("data-client-ready", "true", { timeout: 15000 })
  }
}

async function login(page: Page, email: string, password: string) {
  await gotoAndWaitForReady(page, "/login", "login-form")
  await page.getByTestId("login-email").fill(email)
  await page.getByTestId("login-password").fill(password)
  await expect(page.getByTestId("login-submit")).toBeEnabled()
  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith("/login")),
    page.getByTestId("login-submit").click(),
  ])
  await page.waitForLoadState("networkidle")
}

test.describe.serial("LearnHub smoke suite", () => {
  test("public pages render and 404 fallback works", async ({ page }, testInfo) => {
    const pages = [
      { path: "/", slug: "home-redirect", expectedUrl: /\/courses$/, expectedStatus: 200 },
      { path: "/courses", slug: "courses", expectedUrl: /\/courses$/, expectedStatus: 200 },
      { path: "/about", slug: "about", expectedUrl: /\/about$/, expectedStatus: 200 },
      { path: "/contact", slug: "contact", expectedUrl: /\/contact$/, expectedStatus: 200 },
      { path: "/missing-route-for-fallback", slug: "missing-route", expectedUrl: /\/missing-route-for-fallback$/, expectedStatus: 404 },
    ]

    const visited: Array<{ path: string; status: number | null; title: string }> = []

    for (const entry of pages) {
      const response = await page.goto(entry.path, { waitUntil: "networkidle" })
      expect(response?.status() ?? null).toBe(entry.expectedStatus)
      await expect(page).toHaveURL(entry.expectedUrl)
      await capture(page, testInfo, entry.slug)
      visited.push({
        path: entry.path,
        status: response?.status() ?? null,
        title: await page.title(),
      })
    }

    await testInfo.attach("public-pages.json", {
      body: Buffer.from(JSON.stringify(visited, null, 2)),
      contentType: "application/json",
    })
  })

  test("membership flow works for a brand-new student", async ({ page }, testInfo) => {
    await gotoAndWaitForReady(page, "/register", "register-form")
    await page.getByTestId("register-email").fill(studentEmail)
    await page.getByTestId("register-password").fill(studentPassword)
    await expect(page.getByTestId("register-submit")).toBeEnabled()
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/courses"),
      page.getByTestId("register-submit").click(),
    ])

    await capture(page, testInfo, "registered-student-courses")

    await page.goto("/dashboard", { waitUntil: "networkidle" })
    await expect(page.getByText("แดชบอร์ดนักเรียน")).toBeVisible()
    await capture(page, testInfo, "student-dashboard")

    await page.goto("/courses", { waitUntil: "networkidle" })
    await expect(page.getByText(seededFreeCourseTitle)).toBeVisible()
  })

  test("guest can preview a video lesson with chatbot and lesson webboard", async ({ page }, testInfo) => {
    await page.goto("/courses", { waitUntil: "networkidle" })
    await page.getByRole("link", { name: new RegExp(seededPreviewVideoCourseTitle, "i") }).first().click()
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(seededPreviewVideoCourseTitle)).toBeVisible()
    await expect(page.getByText("2 preview")).toBeVisible()

    await page.getByRole("link", { name: new RegExp(seededPreviewVideoLessonTitle, "i") }).click()
    await page.waitForLoadState("networkidle")

    await expect(page.getByText(seededPreviewVideoLessonTitle)).toBeVisible()
    await expect(page.getByTestId("lesson-video-embed")).toBeVisible()
    await expect(page.getByTestId("course-chatbot")).toBeVisible()
    await expect(page.getByTestId("discussion-board")).toBeVisible()
    await capture(page, testInfo, "guest-preview-video-lesson")
  })

  test("student can submit a rating and create a discussion thread", async ({ page }, testInfo) => {
    await login(page, studentEmail, studentPassword)

    await page.goto("/courses", { waitUntil: "networkidle" })
    await page.getByRole("link", { name: new RegExp(seededFreeCourseTitle, "i") }).first().click()
    await page.waitForLoadState("networkidle")

    await page.getByTestId("course-review-input").fill(studentReviewText)
    await page.getByTestId("course-review-submit").click()
    await expect(page.getByText(studentReviewText)).toBeVisible()

    await page.getByTestId("thread-title-input").fill(discussionTitle)
    await page.getByTestId("thread-content-input").fill(discussionContent)
    await page.getByTestId("thread-submit").click()
    await expect(page.getByText(discussionTitle)).toBeVisible()
    await capture(page, testInfo, "student-rating-and-webboard")
  })

  test("guest can submit the free-course quiz and see the result immediately", async ({ page }, testInfo) => {
    await page.goto("/courses", { waitUntil: "networkidle" })
    await page.getByRole("link", { name: new RegExp(seededFreeCourseTitle, "i") }).first().click()
    await page.waitForLoadState("networkidle")

    await page.getByRole("link", { name: "เริ่มเรียน" }).click()
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: seededFreeQuizCorrectChoice }).click()
    await page.getByTestId("quiz-submit").click()

    await expect(page.getByText("ตอบถูก")).toBeVisible()
    await expect(page.getByText("ยังไม่ได้บันทึกลงระบบ")).toBeVisible()
    await capture(page, testInfo, "guest-free-quiz-result")
  })

  test("admin can create a new published course", async ({ page }, testInfo) => {
    await login(page, "admin@lms.dev", "admin1234")

    await gotoAndWaitForReady(page, "/admin/courses/new", "course-form")
    await page.getByTestId("course-title-input").fill(createdCourseTitle)
    await page.getByTestId("course-description-input").fill(
      "คอร์สที่สร้างโดย Playwright เพื่อใช้ตรวจสอบ admin CRUD และการ publish สู่หน้าสาธารณะ"
    )
    await page.getByTestId("course-price-input").fill("3290")
    await page.getByTestId("course-status-input").selectOption("PUBLISHED")
    await page.getByTestId("course-thumbnail-input").fill("/images/generated/course-showcase-mockup.png")
    await expect(page.getByTestId("course-submit")).toBeEnabled()

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/admin/courses"),
      page.getByTestId("course-submit").click(),
    ])

    await expect(page.getByText(createdCourseTitle)).toBeVisible()
    await capture(page, testInfo, "admin-courses-after-create")
  })

  test("admin can upload real video lesson files and preview them", async ({ page }, testInfo) => {
    test.setTimeout(180000)

    await login(page, "admin@lms.dev", "admin1234")

    await page.goto("/admin/courses", { waitUntil: "networkidle" })

    const courseCard = page
      .locator("div.rounded-3xl")
      .filter({ has: page.getByRole("heading", { name: createdCourseTitle }) })
      .first()

    await expect(courseCard).toBeVisible()
    await courseCard.locator('a[href^="/admin/courses/"]:not([href$="/edit"])').click()
    await page.waitForLoadState("networkidle")

    await page.locator('a[href$="/lessons/new"]').click()
    await expect(page.getByTestId("lesson-form")).toHaveAttribute("data-client-ready", "true", { timeout: 15000 })
    await page.getByTestId("lesson-title-input").fill(uploadedMp4LessonTitle)
    await page.getByTestId("lesson-summary-input").fill("ทดสอบอัปโหลดไฟล์ MP4 จริงจากฟอร์มบทเรียน")
    await page.getByTestId("lesson-content-type-input").selectOption("VIDEO")
    await page.getByTestId("lesson-order-input").fill("1")
    await page.getByTestId("lesson-duration-input").fill("00:30")
    await page.getByTestId("lesson-preview-toggle").check()
    await page.getByTestId("lesson-video-upload-input").setInputFiles(uploadedMp4FixturePath)
    await page.getByTestId("lesson-video-upload-button").click()
    await expect(page.getByTestId("lesson-video-upload-status")).toContainText("อัปโหลดสำเร็จ", {
      timeout: 120000,
    })
    await expect(page.getByTestId("lesson-video-url-input")).toHaveValue(/(blob\.vercel-storage\.com|\/uploads\/videos\/)/)
    await capture(page, testInfo, "admin-lesson-upload-mp4")

    await Promise.all([
      page.waitForURL(/\/admin\/courses\/[^/]+$/),
      page.getByTestId("lesson-submit").click(),
    ])

    await page.locator('a[href$="/lessons/new"]').click()
    await expect(page.getByTestId("lesson-form")).toHaveAttribute("data-client-ready", "true", { timeout: 15000 })
    await page.getByTestId("lesson-title-input").fill(uploadedWebmLessonTitle)
    await page.getByTestId("lesson-summary-input").fill("ทดสอบอัปโหลดไฟล์ WebM จริงจากฟอร์มบทเรียน")
    await page.getByTestId("lesson-content-type-input").selectOption("VIDEO")
    await page.getByTestId("lesson-order-input").fill("2")
    await page.getByTestId("lesson-duration-input").fill("00:30")
    await page.getByTestId("lesson-video-upload-input").setInputFiles(uploadedWebmFixturePath)
    await page.getByTestId("lesson-video-upload-button").click()
    await expect(page.getByTestId("lesson-video-upload-status")).toContainText("อัปโหลดสำเร็จ", {
      timeout: 120000,
    })
    await expect(page.getByTestId("lesson-video-url-input")).toHaveValue(/(blob\.vercel-storage\.com|\/uploads\/videos\/)/)
    await capture(page, testInfo, "admin-lesson-upload-webm")

    await Promise.all([
      page.waitForURL(/\/admin\/courses\/[^/]+$/),
      page.getByTestId("lesson-submit").click(),
    ])

    const courseId = page.url().match(/\/admin\/courses\/([^/]+)$/)?.[1]
    if (!courseId) {
      throw new Error("Could not resolve the admin course id after saving lessons.")
    }

    const uploadedLessonEditLink = page
      .locator("div.rounded-2xl")
      .filter({ hasText: uploadedMp4LessonTitle })
      .locator('a[href*="/lessons/"][href$="/edit"]')
      .first()

    await expect(uploadedLessonEditLink).toBeVisible()
    const lessonEditHref = await uploadedLessonEditLink.getAttribute("href")
    const lessonId = lessonEditHref?.match(/\/lessons\/([^/]+)\/edit$/)?.[1]

    if (!lessonId) {
      throw new Error("Could not resolve the uploaded lesson id from the admin page.")
    }

    await page.goto(`/courses/${courseId}/lessons/${lessonId}`, { waitUntil: "networkidle" })
    await expect(page.getByTestId("lesson-video-player")).toBeVisible()
    await capture(page, testInfo, "uploaded-video-lesson-preview")
  })

  test("student can place a paid order with slip upload", async ({ page }, testInfo) => {
    await login(page, studentEmail, studentPassword)

    await page.goto("/courses", { waitUntil: "networkidle" })
    await page.getByRole("link", { name: new RegExp(seededPaidCourseTitle, "i") }).first().click()
    await page.waitForLoadState("networkidle")
    await capture(page, testInfo, "paid-course-detail")

    await expect(page.getByTestId("add-to-cart-button")).toHaveAttribute("data-client-ready", "true", { timeout: 15000 })
    await page.getByTestId("add-to-cart-button").click()
    await page.goto("/cart", { waitUntil: "networkidle" })
    await expect(page.getByText(seededPaidCourseTitle)).toBeVisible()
    await capture(page, testInfo, "student-cart")

    await page.getByTestId("go-to-checkout").click()
    await page.waitForURL(/\/checkout$/)
    await expect(page.getByTestId("checkout-form")).toHaveAttribute("data-client-ready", "true", { timeout: 15000 })
    await page.getByTestId("slip-upload-input").setInputFiles(slipFixturePath)
    await capture(page, testInfo, "checkout-with-slip")
    await expect(page.getByTestId("checkout-submit")).toBeEnabled()

    await Promise.all([
      page.waitForURL(/\/dashboard\/orders$/),
      page.getByTestId("checkout-submit").click(),
    ])

    await expect(page.getByText(seededPaidCourseTitle)).toBeVisible()
    await capture(page, testInfo, "student-orders-pending")
  })

  test("admin can approve the student's pending order", async ({ page }, testInfo) => {
    await login(page, "admin@lms.dev", "admin1234")

    await page.goto("/admin/orders", { waitUntil: "networkidle" })
    const orderCard = page
      .getByTestId("admin-order-card")
      .filter({ hasText: studentEmail })
      .filter({ hasText: seededPaidCourseTitle })
      .first()

    await expect(orderCard).toBeVisible()
    await expect(orderCard.getByTestId("admin-order-actions")).toHaveAttribute("data-client-ready", "true", {
      timeout: 15000,
    })
    await capture(page, testInfo, "admin-orders-before-approve")

    await orderCard.getByTestId("approve-order-button").click()
    await expect(orderCard.getByTestId("approve-order-button")).toHaveCount(0)
    await capture(page, testInfo, "admin-orders-after-approve")
  })

  test("student sees the approved course in My Courses", async ({ page }, testInfo) => {
    await login(page, studentEmail, studentPassword)

    await page.goto("/dashboard/my-courses", { waitUntil: "networkidle" })
    const courseCard = page.getByTestId("student-course-card").filter({ hasText: seededPaidCourseTitle }).first()
    await expect(courseCard).toBeVisible()
    await capture(page, testInfo, "student-my-courses-approved")

    await page.goto("/dashboard/orders", { waitUntil: "networkidle" })
    await expect(page.getByText(seededPaidCourseTitle)).toBeVisible()
    await capture(page, testInfo, "student-order-history-approved")
  })
})
