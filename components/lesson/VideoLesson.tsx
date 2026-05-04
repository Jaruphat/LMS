function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

export function VideoLesson({ url }: { url: string }) {
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        Invalid video URL
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Lesson video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
