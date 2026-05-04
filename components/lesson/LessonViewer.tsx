import { VideoLesson } from "./VideoLesson"
import { TextLesson } from "./TextLesson"

interface Props {
  contentType: "VIDEO" | "TEXT"
  content: string
}

export function LessonViewer({ contentType, content }: Props) {
  if (contentType === "VIDEO") {
    return <VideoLesson url={content} />
  }
  return <TextLesson content={content} />
}
