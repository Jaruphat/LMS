type CourseContext = {
  id: string
  title: string
  description: string
  price: number
  lessons: Array<{
    id: string
    title: string
    contentType: "VIDEO" | "TEXT"
    summary?: string | null
    content: string
    isPreview: boolean
    durationText?: string | null
  }>
}

type CatalogCourseContext = {
  id: string
  title: string
  description: string
  price: number
  status: "DRAFT" | "PUBLISHED"
  viewCount: number
  lessonCount: number
  enrollmentCount: number
  previewCount: number
  videoCount: number
  ratingAverage: number
  ratingCount: number
  lessonTopics: string[]
}

export type CourseChatReference = {
  title: string
  snippet: string
  lessonId?: string
  href?: string
  badge?: string
}

export type CourseChatAnswer = {
  answer: string
  references: CourseChatReference[]
}

export type GlobalChatbotContext = {
  activeCourse: CourseContext | null
  courses: CatalogCourseContext[]
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[#*_`>[\](){}|~!?,.:;"'\\/\n\r\t-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function toNgrams(value: string, size = 3) {
  const compact = normalizeText(value).replace(/\s+/g, "")
  if (compact.length <= size) return new Set([compact])

  const grams = new Set<string>()
  for (let index = 0; index <= compact.length - size; index += 1) {
    grams.add(compact.slice(index, index + size))
  }
  return grams
}

function overlapScore(question: string, candidate: string) {
  const questionGrams = toNgrams(question)
  const candidateGrams = toNgrams(candidate)

  let hits = 0
  for (const gram of questionGrams) {
    if (candidateGrams.has(gram)) hits += 1
  }

  const questionText = normalizeText(question)
  const candidateText = normalizeText(candidate)
  const exactBoost = candidateText.includes(questionText) || questionText.includes(candidateText) ? 5 : 0

  return hits + exactBoost
}

function excerptText(value: string, maxLength = 180) {
  const plain = value
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#*_`>[\](){}|~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength).trim()}...`
}

function formatPriceLabel(price: number) {
  return price === 0 ? "เรียนฟรี" : `${price.toLocaleString("th-TH")} บาท`
}

function buildCourseOverviewReference(course: CourseContext): CourseChatReference {
  return {
    title: `ภาพรวมคอร์ส ${course.title}`,
    snippet: excerptText(course.description, 220),
    href: `/courses/${course.id}`,
    badge: formatPriceLabel(course.price),
  }
}

function buildQuickAnswer(course: CourseContext, question: string) {
  const previewLessons = course.lessons.filter((lesson) => lesson.isPreview)
  const lowered = normalizeText(question)

  if (lowered.includes("ราคา") || lowered.includes("เท่าไหร่")) {
    return {
      answer:
        course.price === 0
          ? `คอร์ส ${course.title} เปิดให้เรียนฟรี ตอนนี้มีทั้งหมด ${course.lessons.length} บทเรียน`
          : `คอร์ส ${course.title} ราคา ${course.price.toLocaleString("th-TH")} บาท และมีทั้งหมด ${course.lessons.length} บทเรียน`,
      references: [buildCourseOverviewReference(course)],
    } satisfies CourseChatAnswer
  }

  if (lowered.includes("preview") || lowered.includes("ทดลอง") || lowered.includes("ดูฟรี")) {
    return {
      answer:
        previewLessons.length > 0
          ? `คอร์สนี้มีบทเรียน preview ${previewLessons.length} บท ลองเริ่มจาก ${previewLessons
              .slice(0, 2)
              .map((lesson) => lesson.title)
              .join(" และ ")} ได้เลย`
          : `คอร์สนี้ยังไม่ได้เปิดบทเรียน preview เพิ่มเติม แต่คุณยังดูรายละเอียดคอร์สและสารบัญบทเรียนได้`,
      references: previewLessons.slice(0, 3).map((lesson) => ({
        title: lesson.title,
        lessonId: lesson.id,
        href: `/courses/${course.id}/lessons/${lesson.id}`,
        badge: lesson.durationText || (lesson.contentType === "VIDEO" ? "วิดีโอ" : "บทความ"),
        snippet:
          lesson.summary && lesson.summary.trim().length > 0
            ? excerptText(lesson.summary)
            : `บทเรียน ${lesson.contentType === "VIDEO" ? "วิดีโอ" : "เนื้อหา"}${lesson.durationText ? ` • ${lesson.durationText}` : ""}`,
      })),
    } satisfies CourseChatAnswer
  }

  if (lowered.includes("กี่บท") || lowered.includes("กี่คลิป") || lowered.includes("มีกี่")) {
    const videoLessons = course.lessons.filter((lesson) => lesson.contentType === "VIDEO")
    return {
      answer: `คอร์สนี้มีทั้งหมด ${course.lessons.length} บทเรียน โดยเป็นวิดีโอ ${videoLessons.length} บท และ preview ${previewLessons.length} บท`,
      references: course.lessons.slice(0, 3).map((lesson) => ({
        title: lesson.title,
        lessonId: lesson.id,
        href: `/courses/${course.id}/lessons/${lesson.id}`,
        badge: lesson.durationText || (lesson.contentType === "VIDEO" ? "วิดีโอ" : "บทความ"),
        snippet:
          lesson.summary && lesson.summary.trim().length > 0
            ? excerptText(lesson.summary)
            : `บทเรียนลำดับนี้${lesson.durationText ? ` • ${lesson.durationText}` : ""}`,
      })),
    } satisfies CourseChatAnswer
  }

  return null
}

export function answerCourseQuestion(course: CourseContext, question: string): CourseChatAnswer {
  const quickAnswer = buildQuickAnswer(course, question)
  if (quickAnswer) return quickAnswer

  const candidates: CourseChatReference[] = [
    buildCourseOverviewReference(course),
    ...course.lessons.map((lesson) => ({
      title: lesson.title,
      lessonId: lesson.id,
      href: `/courses/${course.id}/lessons/${lesson.id}`,
      badge: lesson.durationText || (lesson.contentType === "VIDEO" ? "วิดีโอ" : "บทความ"),
      snippet:
        lesson.summary && lesson.summary.trim().length > 0
          ? excerptText(lesson.summary, 180)
          : lesson.contentType === "VIDEO"
            ? `บทเรียนวิดีโอ${lesson.durationText ? ` • ${lesson.durationText}` : ""}`
            : excerptText(lesson.content, 180),
    })),
  ]

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: overlapScore(question, `${candidate.title} ${candidate.snippet}`),
    }))
    .sort((left, right) => right.score - left.score)

  const useful = ranked.filter((item) => item.score > 0).slice(0, 3).map((item) => item.candidate)

  if (useful.length === 0) {
    return {
      answer: `ผมหาข้อความที่ตรงกับคำถามนี้แบบชัดเจนไม่เจอในคอร์ส ${course.title} แต่คุณลองเริ่มจากบท preview หรือถามด้วยชื่อหัวข้อ/บทเรียนที่สนใจได้เลย`,
      references: candidates.slice(0, 3),
    }
  }

  return {
    answer: `ผมเจอหัวข้อที่น่าจะช่วยตอบคำถามนี้ ${useful.length} จุดในคอร์ส ${course.title} ลองเริ่มจากรายการด้านล่างได้เลย`,
    references: useful,
  }
}

function buildCourseRecommendationReference(course: CatalogCourseContext): CourseChatReference {
  return {
    title: course.title,
    href: `/courses/${course.id}`,
    badge: course.price === 0 ? "ฟรี" : `${course.price.toLocaleString("th-TH")} บาท`,
    snippet: `${excerptText(course.description, 120)} • ${course.lessonCount} บทเรียน • preview ${course.previewCount} บท • คะแนน ${course.ratingAverage.toFixed(1)} จาก ${course.ratingCount} รีวิว`,
  }
}

function buildPlatformAnswer(
  context: GlobalChatbotContext,
  question: string
): CourseChatAnswer | null {
  const activeCourse = context.activeCourse

  if (
    question.includes("สั่งซื้อ") ||
    question.includes("checkout") ||
    question.includes("ชำระ") ||
    question.includes("slip") ||
    question.includes("สลิป")
  ) {
    return {
      answer:
        "ถ้าต้องการซื้อคอร์ส ให้เลือกคอร์สจากหน้าแคตตาล็อกแล้วเพิ่มลงตะกร้า จากนั้นไปหน้า checkout เพื่ออัปโหลดสลิปโอนเงิน เมื่อแอดมินอนุมัติแล้วคอร์สจะเข้าไปอยู่ในแดชบอร์ดของผู้เรียนอัตโนมัติ",
      references: [
        {
          title: "หน้าแคตตาล็อกคอร์ส",
          href: "/courses",
          badge: "เริ่มเลือกคอร์ส",
          snippet: "ดูคอร์สทั้งหมด เปรียบเทียบราคา และเปิดดูรายละเอียดก่อนเพิ่มลงตะกร้า",
        },
        {
          title: "หน้าตะกร้าสินค้า",
          href: "/cart",
          badge: "ตรวจรายการ",
          snippet: "สรุปรายการคอร์สที่เลือกไว้ก่อนส่งต่อไปยัง checkout",
        },
        {
          title: "ติดตามคำสั่งซื้อ",
          href: "/dashboard/orders",
          badge: "หลังชำระเงิน",
          snippet: "เช็กสถานะคำสั่งซื้อที่รออนุมัติหรือได้รับสิทธิ์เข้าเรียนแล้ว",
        },
      ],
    }
  }

  if (
    question.includes("webboard") ||
    question.includes("ถามตอบ") ||
    question.includes("ผู้สอน") ||
    question.includes("discussion")
  ) {
    return {
      answer:
        "ระบบมีพื้นที่ถาม-ตอบในหน้าคอร์สและหน้าบทเรียน ผู้เรียนสามารถโพสต์คำถาม ส่งบริบท หรือคุยกับผู้สอนและเพื่อนร่วมคอร์สได้โดยตรง ถ้าเป็นคอนเทนต์แบบ preview บางบทก็เปิดถามได้เลยเช่นกัน",
      references: activeCourse
        ? [
            {
              title: `ไปที่หน้า ${activeCourse.title}`,
              href: `/courses/${activeCourse.id}`,
              badge: "Q&A ของคอร์ส",
              snippet: "ในหน้าคอร์สจะมี discussion board สำหรับถามภาพรวมคอร์สและการบ้านเชิง workflow",
            },
          ]
        : [
            {
              title: "เลือกคอร์สเพื่อเข้า Q&A",
              href: "/courses",
              badge: "เริ่มจากคอร์ส",
              snippet: "เปิดหน้าคอร์สที่สนใจแล้วเลื่อนลงไปส่วนถาม-ตอบเพื่อเริ่มโพสต์ได้ทันที",
            },
          ],
    }
  }

  if (question.includes("สมัคร") || question.includes("เข้าสู่ระบบ") || question.includes("login") || question.includes("register")) {
    return {
      answer:
        "ถ้ายังไม่มีบัญชี ให้สมัครสมาชิกก่อน จากนั้นค่อยเข้าสู่ระบบเพื่อซื้อคอร์ส แนบสลิป และติดตามคำสั่งซื้อหรือคอร์สที่เรียนอยู่ได้จากแดชบอร์ดส่วนตัว",
      references: [
        {
          title: "สมัครสมาชิก",
          href: "/register",
          badge: "เริ่มต้น",
          snippet: "สร้างบัญชีผู้เรียนเพื่อใช้งานระบบสั่งซื้อและติดตามคอร์ส",
        },
        {
          title: "เข้าสู่ระบบ",
          href: "/login",
          badge: "สำหรับสมาชิก",
          snippet: "ใช้เมื่อมีบัญชีแล้วและต้องการกลับมาเรียนต่อหรือเช็กคำสั่งซื้อ",
        },
      ],
    }
  }

  return null
}

function rankCourses(courses: CatalogCourseContext[], question: string) {
  const normalizedQuestion = normalizeText(question)
  const wantsFree = normalizedQuestion.includes("ฟรี")
  const wantsStarter =
    normalizedQuestion.includes("เริ่มต้น") ||
    normalizedQuestion.includes("พื้นฐาน") ||
    normalizedQuestion.includes("มือใหม่") ||
    normalizedQuestion.includes("beginner")

  return courses
    .map((course) => {
      const candidateText = [course.title, course.description, course.lessonTopics.join(" ")].join(" ")
      let score = overlapScore(question, candidateText)

      if (wantsFree) {
        score += course.price === 0 ? 8 : -2
      }

      if (wantsStarter) {
        const starterText = normalizeText(`${course.title} ${course.description}`)
        if (
          starterText.includes("พื้นฐาน") ||
          starterText.includes("เริ่มต้น") ||
          starterText.includes("เบื้องต้น")
        ) {
          score += 6
        }
        if (course.lessonCount <= 10) {
          score += 2
        }
      }

      score += Math.min(course.previewCount, 3)
      score += Math.min(course.enrollmentCount, 20) / 10
      score += Math.min(course.viewCount, 50) / 25

      return { course, score }
    })
    .sort((left, right) => right.score - left.score)
}

function buildRecommendationAnswer(courses: CatalogCourseContext[], question: string): CourseChatAnswer {
  const ranked = rankCourses(courses, question)
  const bestMatches = ranked.filter((item) => item.score > 0).slice(0, 3).map((item) => item.course)
  const fallbackMatches = ranked.slice(0, 3).map((item) => item.course)
  const picks = bestMatches.length > 0 ? bestMatches : fallbackMatches
  const lowered = normalizeText(question)

  if (lowered.includes("ฟรี")) {
    const freeCourses = picks.filter((course) => course.price === 0)
    if (freeCourses.length > 0) {
      return {
        answer: `ถ้ากำลังมองหาคอร์สฟรี ผมคัดรายการที่เปิดเรียนได้ทันทีและมีเนื้อหาพอให้ลองก่อนตัดสินใจซื้อคอร์สขั้นสูงไว้ให้แล้ว`,
        references: freeCourses.map(buildCourseRecommendationReference),
      }
    }
  }

  return {
    answer:
      picks.length > 0
        ? "จากคำถามนี้ ผมแนะนำให้เริ่มดูคอร์สตามรายการด้านล่างก่อน เพราะมีหัวข้อและระดับความเข้มข้นที่ใกล้กับสิ่งที่กำลังหาอยู่มากที่สุด"
        : "ตอนนี้ผมยังเดาความสนใจได้ไม่ชัด ลองบอกหัวข้อที่อยากเรียนเพิ่มอีกนิด เช่น automation, OCR, AI, n8n หรือ workflow สำหรับธุรกิจ แล้วผมจะช่วยคัดคอร์สให้ตรงขึ้น",
    references: picks.map(buildCourseRecommendationReference),
  }
}

export function answerGlobalAssistantQuestion(
  context: GlobalChatbotContext,
  question: string
): CourseChatAnswer {
  const normalizedQuestion = normalizeText(question)
  const activeCourse = context.activeCourse

  const currentCourseSignals =
    normalizedQuestion.includes("คอร์สนี้") ||
    normalizedQuestion.includes("บทเรียนนี้") ||
    normalizedQuestion.includes("preview") ||
    normalizedQuestion.includes("ราคา") ||
    normalizedQuestion.includes("กี่บท") ||
    (activeCourse ? overlapScore(question, activeCourse.title) > 3 : false)

  const looksLikeRecommendation =
    normalizedQuestion.includes("แนะนำ") ||
    normalizedQuestion.includes("คอร์สไหนดี") ||
    normalizedQuestion.includes("ควรเรียน") ||
    normalizedQuestion.includes("อยากเรียน") ||
    normalizedQuestion.includes("เริ่มจาก")

  if (activeCourse && currentCourseSignals && !looksLikeRecommendation) {
    return answerCourseQuestion(activeCourse, question)
  }

  const platformAnswer = buildPlatformAnswer(context, normalizedQuestion)
  if (platformAnswer) {
    return platformAnswer
  }

  return buildRecommendationAnswer(context.courses, question)
}
