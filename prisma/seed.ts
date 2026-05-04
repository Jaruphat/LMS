import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const HERO_THUMB = "/images/generated/hero-automation-banner.png"
const MOCKUP_THUMB = "/images/generated/course-showcase-mockup.png"

type SeedLesson = {
  title: string
  content: string
  isPreview?: boolean
}

type SeedCourse = {
  title: string
  description: string
  price: number
  thumbnailUrl: string
  question: string
  choices: string[]
  correctAnswer: string
  lessons: SeedLesson[]
}

const COURSE_CATALOG: SeedCourse[] = [
  {
    title: "พื้นฐานระบบอัตโนมัติด้วย n8n",
    description:
      "เรียนรู้การออกแบบ trigger, branching, AI step และ workflow ที่พร้อมนำไปใช้งานจริงในงาน automation ธุรกิจ",
    price: 0,
    thumbnailUrl: HERO_THUMB,
    question: "แนวคิดใดช่วยมากที่สุดเมื่อต้องสร้าง automation ด้วย n8n?",
    choices: ["ทำงานซ้ำด้วยมือ", "วางแผน workflow", "เดา input ไปก่อน", "ข้ามเรื่อง retry"],
    correctAnswer: "วางแผน workflow",
    lessons: [
      {
        title: "วางแผนระบบอัตโนมัติแรกของคุณ",
        content:
          "# เริ่มจากแผนภาพ workflow\n\nจดให้ชัดว่าระบบนี้มี trigger อะไร ดึงข้อมูลจากไหน ใช้ AI ตรงใด และสุดท้ายต้องส่งผลลัพธ์ไปที่ไหนก่อนค่อยเริ่มต่อ node",
        isPreview: true,
      },
      {
        title: "เชื่อม Sheets แชต ที่เก็บไฟล์ และ OCR",
        content:
          "# สร้าง pipeline แรกของคุณ\n\nออกแบบ node ให้แยกเป็นขั้นตอนชัดเจน เช่น รับข้อมูล แปลงข้อมูล เติมข้อมูล ตรวจสอบ และส่งมอบผลลัพธ์",
      },
      {
        title: "ปล่อยใช้งานพร้อม retry, log และผู้ดูแลระบบ",
        content:
          "# เช็กลิสต์ก่อนขึ้นระบบจริง\n\nworkflow ที่พร้อมใช้งานจริงควรมี error handling, กฎ retry, การแจ้งเตือน และหน้าติดตามสถานะให้ทีมดูได้",
      },
    ],
  },
  {
    title: "โรงงานสร้างครีเอทีฟโฆษณา AI จาก Google Sheets",
    description:
      "เปลี่ยนข้อมูลสินค้าจากตารางเดียวให้กลายเป็น prompt ภาพ ข้อความโฆษณา และชุด asset พร้อมใช้งานในแคมเปญ",
    price: 2490,
    thumbnailUrl: MOCKUP_THUMB,
    question: "Google Sheets มีประโยชน์อย่างไรใน pipeline สร้างโฆษณา?",
    choices: ["ช่วยตัดขั้นตอนอนุมัติทั้งหมด", "เก็บ input ของแคมเปญอย่างเป็นระบบ", "เรนเดอร์วิดีโอสุดท้ายได้เอง", "ใช้แทนโมเดล AI ได้ทั้งหมด"],
    correctAnswer: "เก็บ input ของแคมเปญอย่างเป็นระบบ",
    lessons: [
      {
        title: "ออกแบบชีตตั้งต้นของแคมเปญ",
        content:
          "# สร้างแหล่งข้อมูลกลางของทีม\n\nวางคอลัมน์สำหรับข้อเสนอ กลุ่มเป้าหมาย hook ของสินค้า มุมภาพ CTA และสถานะการเผยแพร่ให้ครบ",
        isPreview: true,
      },
      {
        title: "สร้างชุด prompt และข้อความโฆษณาหลายแบบ",
        content:
          "# ออกแบบระบบ prompt ให้ใช้ซ้ำได้\n\nใช้ template ระดับแถวข้อมูล เพื่อให้แต่ละ record สร้าง copy, prompt ภาพ และข้อมูล QA ได้อย่างสม่ำเสมอ",
      },
      {
        title: "รีวิว ให้คะแนน และปล่อย asset เป็น batch",
        content:
          "# เดินระบบแบบโรงงานครีเอทีฟ\n\nเพิ่มสถานะ review เวลาอนุมัติ และสัญญาณพร้อมเผยแพร่ก่อนส่ง asset ไปยังขั้นตอนถัดไป",
      },
    ],
  },
  {
    title: "LINE Bot + AI Agent สำหรับค้นหาข้อมูลหน้างาน",
    description:
      "สร้างผู้ช่วยบน LINE ที่ตอบคำถามจาก Sheets, ตารางความรู้ และบริบทของ workflow ได้ภายในไม่กี่วินาที",
    price: 2190,
    thumbnailUrl: HERO_THUMB,
    question: "อะไรทำให้บอทสำหรับงานปฏิบัติการเชื่อถือได้?",
    choices: ["ตอบเร็วอย่างเดียว", "ตอบจากข้อมูลภายในที่ตรวจสอบได้", "มี avatar สวย", "มีเครื่องมือไม่จำกัด"],
    correctAnswer: "ตอบจากข้อมูลภายในที่ตรวจสอบได้",
    lessons: [
      {
        title: "ออกแบบประสบการณ์การค้นหาข้อมูล",
        content:
          "# เลือกงานที่ควรให้บอทช่วยตอบ\n\nเริ่มจากคำถามที่ถูกถามซ้ำบ่อย เช่น สต๊อก สถานะคำสั่งซื้อ งานอนุมัติ และข้อมูลติดต่อของทีม",
        isPreview: true,
      },
      {
        title: "เชื่อม LINE, AI routing และแหล่งข้อมูล",
        content:
          "# สร้าง chat workflow\n\nจัดเส้นทางข้อความผ่านขั้นตอนจำแนกคำถาม ดึงข้อมูล สร้างคำตอบ และบันทึก log ให้ครบ",
      },
      {
        title: "จัดการ escalation และกฎเรื่องความมั่นใจ",
        content:
          "# ทำ automation ให้ปลอดภัย\n\nส่งต่อให้คนเมื่อความมั่นใจต่ำ ข้อมูลไม่พอ หรือคำขอนั้นต้องใช้สิทธิ์อนุมัติจากทีม",
      },
    ],
  },
  {
    title: "สร้าง OCR ภาษาไทยด้วย TyphoonOCR",
    description:
      "ดึง field สำคัญจากเอกสารภาษาไทยแล้วแปลงให้เป็นชุดข้อมูลที่พร้อมนำไปใช้ต่อในระบบอัตโนมัติ",
    price: 1990,
    thumbnailUrl: MOCKUP_THUMB,
    question: "เรื่องสำคัญอันดับแรกของ OCR automation เมื่อจะขึ้นใช้งานจริงคืออะไร?",
    choices: ["เลือกสีของหน้าจอ", "การตรวจ field", "ใส่เพลงประกอบ", "เขียน prompt ให้ยาวขึ้น"],
    correctAnswer: "การตรวจ field",
    lessons: [
      {
        title: "กำหนด field เป้าหมายและประเภทเอกสาร",
        content:
          "# กำหนดขอบเขต pipeline\n\nลิสต์ประเภทเอกสาร field ที่ต้องการดึง และกฎตรวจสอบข้อมูลให้ครบก่อนเริ่มวัดคุณภาพ OCR",
        isPreview: true,
      },
      {
        title: "จัดรูปข้อมูล OCR หลายหน้าให้เป็นระเบียบ",
        content:
          "# ทำความสะอาดข้อมูลที่อ่านได้\n\nแยกหน้า จัดตาราง รวมบรรทัดที่ขาด และรักษาความหมายของข้อมูลก่อนบันทึกลงระบบ",
      },
      {
        title: "ตรวจสอบและส่งออกผลลัพธ์แบบมีโครงสร้าง",
        content:
          "# ให้คุณภาพมาก่อน automation\n\nเช็ก confidence เทียบกับกฎตรวจสอบ แล้วค่อยเขียนผลลัพธ์ลง Sheets หรือฐานข้อมูล",
      },
    ],
  },
  {
    title: "แยกข้อมูลหนังสือราชการด้วย Mistral OCR",
    description:
      "สร้าง workflow สำหรับ parsing หนังสือราชการ ประกาศ และเอกสารอ้างอิง ให้ตรวจสอบย้อนหลังได้ง่าย",
    price: 2290,
    thumbnailUrl: HERO_THUMB,
    question: "ทำไมหนังสือราชการจึงควรมีการแยกข้อมูลแบบตรวจสอบย้อนหลังได้?",
    choices: ["เพื่อปรับสีเอกสาร", "เพื่อ trace และ review ได้", "เพื่อลดพื้นที่เก็บข้อมูล", "เพื่อไม่ต้องใช้ OCR"],
    correctAnswer: "เพื่อ trace และ review ได้",
    lessons: [
      {
        title: "เข้าใจโครงสร้างของหนังสือราชการ",
        content:
          "# อ่านรูปแบบก่อนเริ่มดึงข้อมูล\n\nแยกหัวกระดาษ เลขอ้างอิง เนื้อหา วันที่ และส่วนลายเซ็นให้ชัดก่อนค่อยดึงค่า",
        isPreview: true,
      },
      {
        title: "ดึงเลขอ้างอิง วันที่ และ action item",
        content:
          "# สร้างผลลัพธ์ที่ระบบใช้ต่อได้\n\nคืนค่าเป็น field ที่พร้อมใช้สำหรับ routing งาน การอนุมัติ และติดตาม deadline",
      },
      {
        title: "สร้าง audit trail ให้ทุกระเบียน",
        content:
          "# ทำให้ตรวจสอบย้อนหลังได้เสมอ\n\nเก็บ path ของไฟล์ต้นฉบับ เวลา extraction สรุป confidence และสถานะผู้ตรวจไว้ทุกครั้ง",
      },
    ],
  },
  {
    title: "ระบบอ่านสลิปจาก LINE ด้วย SpaceOCR",
    description:
      "รับสลิปจากแชต ดึงข้อมูลผู้โอน และซิงก์ข้อมูลการชำระเงินไปยังแดชบอร์ดและคิวอนุมัติของทีม",
    price: 1890,
    thumbnailUrl: MOCKUP_THUMB,
    question: "ขั้นตอนไหนทำให้ slip OCR กลายเป็น workflow ธุรกิจที่ใช้งานได้จริง?",
    choices: ["เพิ่มแอนิเมชัน", "จับคู่ข้อมูลที่อ่านได้กับคำสั่งซื้อ", "เปลี่ยนชื่อไฟล์ด้วยมือ", "ซ่อนเวลาโอน"],
    correctAnswer: "จับคู่ข้อมูลที่อ่านได้กับคำสั่งซื้อ",
    lessons: [
      {
        title: "รับไฟล์สลิปจากแชตอย่างปลอดภัย",
        content:
          "# รับข้อมูลเข้าอย่างเป็นระบบ\n\nดึงไฟล์ ติดป้ายข้อมูลผู้ส่ง และย้ายไปยังพื้นที่เก็บที่ปลอดภัยและตรวจสอบย้อนหลังได้",
        isPreview: true,
      },
      {
        title: "ดึงยอดเงิน ผู้โอน และเวลาโอน",
        content:
          "# ออกแบบ field ของ OCR\n\nเลือก field ที่ต้องใช้จากสลิป และทำรูปแบบวันเวลาให้มาตรฐานก่อนเริ่มจับคู่ข้อมูล",
      },
      {
        title: "จับคู่กับคำสั่งซื้อค้างตรวจและแจ้งทีมงาน",
        content:
          "# ปิดลูปการทำงานให้ครบ\n\nเชื่อมผล OCR เข้ากับคิวตรวจชำระเงิน แล้วส่งสถานะที่ชัดเจนกลับไปยังทีมงานหรือลูกค้า",
      },
    ],
  },
  {
    title: "โรงงานวิดีโอโฆษณา UGC ด้วย fal.ai",
    description:
      "สร้างชุดโฆษณาสไตล์ UGC แบบขยายจำนวนได้ด้วยระบบ prompt, batch control และ creative review loop",
    price: 2790,
    thumbnailUrl: HERO_THUMB,
    question: "อะไรทำให้ระบบโฆษณา UGC ขยายผลได้จริง?",
    choices: ["มี prompt ไม่จำกัด", "มี template และขั้นตอน review ที่ชัดเจน", "export งานทีละชิ้นด้วยมือ", "ไม่ต้องมี brief"],
    correctAnswer: "มี template และขั้นตอน review ที่ชัดเจน",
    lessons: [
      {
        title: "แยก brief โฆษณาเป็น prompt slot ที่ใช้ซ้ำได้",
        content:
          "# ทำให้ความคิดสร้างสรรค์เป็นระบบ\n\nแยก persona, hook, proof, CTA และ visual treatment เพื่อให้สร้าง asset ได้อย่างสม่ำเสมอ",
        isPreview: true,
      },
      {
        title: "รันการสร้างงานแบบ batch พร้อม guardrail",
        content:
          "# ทำ batch ให้ปลอดภัย\n\nให้คะแนนงานตาม policy, ความเข้ากับแบรนด์ และความชัดเจนก่อนส่งไปยังคิวเผยแพร่",
      },
      {
        title: "สร้าง review loop สำหรับงานที่ผลงานดีที่สุด",
        content:
          "# พัฒนา conversion อย่างต่อเนื่อง\n\nเก็บว่ามุมไหนเวิร์ก แล้วปรับ prompt และ creative angle สำหรับรอบถัดไป",
      },
    ],
  },
  {
    title: "เก็บไฟล์จาก LINE เข้า Drive และ Sheets อัตโนมัติ",
    description:
      "บันทึกไฟล์ที่รับเข้ามาโดยอัตโนมัติ เติม metadata และเก็บ log ที่ค้นหาย้อนหลังได้สำหรับทีมงาน",
    price: 1590,
    thumbnailUrl: MOCKUP_THUMB,
    question: "อะไรทำให้การเก็บไฟล์มีประโยชน์จริงหลังจากรับไฟล์เข้าระบบแล้ว?",
    choices: ["โฟลเดอร์ที่ซ่อนอยู่", "metadata ที่ค้นหาได้", "ไฟล์ภาพที่ใหญ่ขึ้น", "ตอบแชตเพิ่มอีกหนึ่งข้อความ"],
    correctAnswer: "metadata ที่ค้นหาได้",
    lessons: [
      {
        title: "เก็บไฟล์พร้อม metadata ของผู้ส่ง",
        content:
          "# ออกแบบ intake ให้ครบ\n\nเก็บ sender ID, เวลาอัปโหลด, ชื่อไฟล์ และบริบทของบทสนทนาไว้คู่กับทุกไฟล์",
        isPreview: true,
      },
      {
        title: "จัดไฟล์ลงโฟลเดอร์ Drive แบบมีโครงสร้าง",
        content:
          "# จัดระบบให้ทีมค้นหาง่าย\n\nกำหนดกฎการสร้างโฟลเดอร์ตามทีม เดือน ลูกค้า หรือประเภทของ workflow",
      },
      {
        title: "สร้างดัชนีไฟล์บนชีตที่ค้นหาได้",
        content:
          "# ทำให้ค้นเจอทุกไฟล์\n\nทุกไฟล์ที่เก็บควรมีแถวข้อมูลพร้อมลิงก์ tag และสถานะการทำงานเพื่อค้นหาย้อนหลังได้ง่าย",
      },
    ],
  },
  {
    title: "แปลงเอกสารให้เป็นข้อมูลแบบมีโครงสร้างด้วย Llama Workflows",
    description:
      "ผสาน OCR, parsing และ validation เพื่อเปลี่ยนเอกสารที่ไม่เป็นระเบียบให้กลายเป็นข้อมูลที่ใช้งานสม่ำเสมอ",
    price: 2390,
    thumbnailUrl: HERO_THUMB,
    question: "ทำไมจึงควรทำ parsing ควบคู่กับ validation หลังจาก OCR?",
    choices: ["เพื่อเพิ่มสีสัน", "เพื่อเปลี่ยนข้อความดิบให้เป็น field ที่เชื่อถือได้", "เพื่อไม่ต้องออกแบบ schema", "เพื่อตัดคนออกจากกระบวนการทั้งหมด"],
    correctAnswer: "เพื่อเปลี่ยนข้อความดิบให้เป็น field ที่เชื่อถือได้",
    lessons: [
      {
        title: "กำหนด schema ปลายทางก่อนเริ่ม parsing",
        content:
          "# คิดแบบ schema-first\n\nกำหนดให้ชัดว่าระบบปลายทางต้องการ field และรูปแบบข้อมูลแบบไหนก่อนเริ่มสร้าง prompt หรือ parser",
        isPreview: true,
      },
      {
        title: "แปลงข้อความที่กระจัดกระจายให้เป็นระเบียนที่มีโครงสร้าง",
        content:
          "# ออกแบบ extraction flow\n\nแยก parsing เป็นหลายช่วง เพื่อไม่ให้ summary, field extraction และ confidence check ชนกันใน prompt เดียว",
      },
      {
        title: "ตรวจ ซ่อม และส่งออกข้อมูลระเบียน",
        content:
          "# เพิ่มชั้นความน่าเชื่อถือ\n\nใช้ rule checks, repair steps และ review flags ก่อนเขียนข้อมูลเข้าสู่ระบบ production",
      },
    ],
  },
  {
    title: "โรงงานวิดีโอคำคมสำหรับ YouTube",
    description:
      "สร้างระบบที่ทำซ้ำได้สำหรับเปลี่ยนคลังคำคมให้เป็นไอเดียวิดีโอสั้น ชุดงาน batch และเช็กลิสต์ก่อนเผยแพร่",
    price: 1690,
    thumbnailUrl: MOCKUP_THUMB,
    question: "อะไรทำให้ระบบสร้างคอนเทนต์สั้นมีความสม่ำเสมอ?",
    choices: ["หยิบหัวข้อแบบสุ่ม", "มี template ที่ทำซ้ำได้", "เพิ่มขั้นตอนตัดต่ออย่างเดียว", "ไม่มีเช็กลิสต์รีวิว"],
    correctAnswer: "มี template ที่ทำซ้ำได้",
    lessons: [
      {
        title: "สร้างโมเดลแปลงคำคมให้เป็นวิดีโอ",
        content:
          "# เริ่มจากโครงสร้างที่ใช้ซ้ำได้\n\nกำหนดแหล่งที่มาของคำคม อารมณ์ของคลิป visual mood caption hook และสถานะเผยแพร่ไว้ใน template เดียว",
        isPreview: true,
      },
      {
        title: "เตรียม asset และ caption ให้พร้อมทำเป็น batch",
        content:
          "# เตรียมชุดเผยแพร่ให้พร้อม\n\nสร้าง visual prompt, motion direction, caption หลายแบบ และไอเดีย thumbnail จากข้อมูลต้นทางเพียงหนึ่งแถว",
      },
      {
        title: "ติดตามการอนุมัติและจังหวะการปล่อยงาน",
        content:
          "# ทำให้ปล่อยงานได้สม่ำเสมอ\n\nใช้ปฏิทินเผยแพร่ status tag และจุด review เพื่อให้คอนเทนต์ออกได้ต่อเนื่องแบบมีระบบ",
      },
    ],
  },
]

async function main() {
  await db.progress.deleteMany()
  await db.quizAttempt.deleteMany()
  await db.quiz.deleteMany()
  await db.enrollment.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.lesson.deleteMany()
  await db.course.deleteMany()
  await db.user.deleteMany()

  const adminHash = await bcrypt.hash("admin1234", 10)
  const studentHash = await bcrypt.hash("student1234", 10)

  const admin = await db.user.create({
    data: {
      email: "admin@lms.dev",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })

  const student = await db.user.create({
    data: {
      email: "student@lms.dev",
      passwordHash: studentHash,
      role: "STUDENT",
    },
  })

  const createdCourses: {
    id: string
    title: string
    price: number
    lessonIds: string[]
  }[] = []

  for (const courseData of COURSE_CATALOG) {
    const course = await db.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        createdBy: admin.id,
        price: courseData.price,
        status: "PUBLISHED",
        thumbnailUrl: courseData.thumbnailUrl,
      },
    })

    const lessonIds: string[] = []

    for (const [index, lesson] of courseData.lessons.entries()) {
      const createdLesson = await db.lesson.create({
        data: {
          courseId: course.id,
          title: lesson.title,
          contentType: "TEXT",
          content: lesson.content,
          order: index,
          isPreview: lesson.isPreview ?? false,
        },
      })

      lessonIds.push(createdLesson.id)
    }

    await db.quiz.create({
      data: {
        lessonId: lessonIds[0],
        question: courseData.question,
        choices: [...courseData.choices],
        correctAnswer: courseData.correctAnswer,
      },
    })

    createdCourses.push({
      id: course.id,
      title: course.title,
      price: course.price,
      lessonIds,
    })
  }

  const starterCourse = createdCourses[0]
  const paidApprovedCourse = createdCourses[1]
  const paidPendingCourse = createdCourses[2]

  await db.progress.createMany({
    data: [
      {
        userId: student.id,
        lessonId: starterCourse.lessonIds[0],
        completed: true,
        completedAt: new Date(),
      },
      {
        userId: student.id,
        lessonId: starterCourse.lessonIds[1],
        completed: true,
        completedAt: new Date(),
      },
    ],
  })

  const approvedOrder = await db.order.create({
    data: {
      userId: student.id,
      totalAmount: paidApprovedCourse.price,
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: admin.id,
      items: {
        create: [
          {
            courseId: paidApprovedCourse.id,
            price: paidApprovedCourse.price,
          },
        ],
      },
    },
  })

  await db.enrollment.createMany({
    data: [
      {
        userId: student.id,
        courseId: starterCourse.id,
      },
      {
        userId: student.id,
        courseId: paidApprovedCourse.id,
        orderId: approvedOrder.id,
      },
    ],
  })

  await db.order.create({
    data: {
      userId: student.id,
      totalAmount: paidPendingCourse.price,
      status: "PENDING",
      items: {
        create: [
          {
            courseId: paidPendingCourse.id,
            price: paidPendingCourse.price,
          },
        ],
      },
    },
  })

  console.log("Seed complete")
  console.log("  admin@lms.dev    / admin1234")
  console.log("  student@lms.dev  / student1234")
  console.log(`  Published courses: ${createdCourses.length}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
