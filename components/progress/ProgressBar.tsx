interface Props {
  percent: number
  completedLessons: number
  totalLessons: number
}

export function ProgressBar({ percent, completedLessons, totalLessons }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600 font-medium">Your progress</span>
        <span className="font-semibold text-indigo-600">{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">
        {completedLessons} of {totalLessons} lessons completed
      </p>
    </div>
  )
}
