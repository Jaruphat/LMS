function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

function isDirectVideoFile(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)
}

export function VideoLesson({ url }: { url: string }) {
  const videoId = extractYouTubeId(url)

  if (isDirectVideoFile(url)) {
    return (
      <div className="overflow-hidden rounded-xl bg-black shadow-sm">
        <video data-testid="lesson-video-player" controls preload="metadata" className="aspect-video h-full w-full bg-black">
          <source src={url} />
          Your browser does not support HTML5 video playback.
        </video>
      </div>
    )
  }

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-gray-100 px-6 text-center text-sm text-gray-400">
        รองรับลิงก์ YouTube หรือไฟล์วิดีโอที่ลงท้ายด้วย .mp4, .webm, .ogg, .mov, .m4v
      </div>
    )
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-sm">
      <iframe
        data-testid="lesson-video-embed"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Lesson video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  )
}
