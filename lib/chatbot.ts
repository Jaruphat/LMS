type CourseContext = {
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

export type CourseChatReference = {
  title: string
  snippet: string
  lessonId?: string
}

export type CourseChatAnswer = {
  answer: string
  references: CourseChatReference[]
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

function buildQuickAnswer(course: CourseContext, question: string) {
  const previewLessons = course.lessons.filter((lesson) => lesson.isPreview)
  const lowered = normalizeText(question)

  if (lowered.includes("ราคา") || lowered.includes("เท่าไหร่")) {
    return {
      answer:
        course.price === 0
          ? `คอร์ส ${course.title} เปิดให้เรียนฟรี ตอนนี้มีทั้งหมด ${course.lessons.length} บทเรียน`
          : `คอร์ส ${course.title} ราคา ${course.price.toLocaleString("th-TH")} บาท และมีทั้งหมด ${course.lessons.length} บทเรียน`,
      references: [
        {
          title: "ข้อมูลคอร์ส",
          snippet: excerptText(course.description),
        },
      ],
    } satisfies CourseChatAnswer
  }

  if (lowered.includes("preview") || lowered.includes("ทดลอง") || lowered.includes("ดูฟรี")) {
    return {
      answer:
        previewLessons.length > 0
          ? `คอร์สนี้มีบทเรียน preview ${previewLessons.length} บทเรียน ลองเริ่มจาก ${previewLessons
              .slice(0, 2)
              .map((lesson) => lesson.title)
              .join(" และ ")} ได้เลย`
          : `คอร์สนี้ยังไม่ได้เปิดบทเรียน preview เพิ่มเติม แต่คุณยังดูรายละเอียดคอร์สและสารบัญบทเรียนได้`,
      references: previewLessons.slice(0, 3).map((lesson) => ({
        title: lesson.title,
        lessonId: lesson.id,
        snippet: lesson.summary ? excerptText(lesson.summary) : `บทเรียน ${lesson.contentType === "VIDEO" ? "วิดีโอ" : "เนื้อหา"}${lesson.durationText ? ` • ${lesson.durationText}` : ""}`,
      })),
    } satisfies CourseChatAnswer
  }

  if (lowered.includes("กี่บท") || lowered.includes("กี่คลิป") || lowered.includes("มีกี่")) {
    const videoLessons = course.lessons.filter((lesson) => lesson.contentType === "VIDEO")
    return {
      answer: `คอร์สนี้มีทั้งหมด ${course.lessons.length} บทเรียน โดยเป็นวิดีโอ ${videoLessons.length} บทเรียน และ preview ${previewLessons.length} บทเรียน`,
      references: course.lessons.slice(0, 3).map((lesson) => ({
        title: lesson.title,
        lessonId: lesson.id,
        snippet: lesson.summary ? excerptText(lesson.summary) : `บทเรียนลำดับนี้${lesson.durationText ? ` • ${lesson.durationText}` : ""}`,
      })),
    } satisfies CourseChatAnswer
  }

  return null
}

export function answerCourseQuestion(course: CourseContext, question: string): CourseChatAnswer {
  const quickAnswer = buildQuickAnswer(course, question)
  if (quickAnswer) return quickAnswer

  const candidates: CourseChatReference[] = [
    {
      title: `ภาพรวมคอร์ส ${course.title}`,
      snippet: excerptText(course.description, 220),
    },
    ...course.lessons.map((lesson) => ({
      title: lesson.title,
      lessonId: lesson.id,
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
      answer: `ผมหาข้อความที่ตรงกับคำถามนี้แบบชัดเจนไม่เจอในคอร์ส ${course.title} แต่คุณลองเริ่มจากสารบัญบทเรียน preview หรือดูคำอธิบายคอร์สก่อน แล้วถามใหม่เป็นชื่อหัวข้อหรือบทเรียนที่สนใจได้`,
      references: candidates.slice(0, 3),
    }
  }

  return {
    answer: `ผมเจอหัวข้อที่น่าจะช่วยตอบคำถามนี้ ${useful.length} จุดในคอร์ส ${course.title} ลองเริ่มจากรายการด้านล่างได้เลย`,
    references: useful,
  }
}
