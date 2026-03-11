import { getDaysWithWorkouts } from '../lib/utils'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getWeekDates() {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  // Monday-based week
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function WeeklyCalendar() {
  const workoutDays = getDaysWithWorkouts()
  const weekDates = getWeekDates()
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex justify-between items-center px-2">
      {weekDates.map((date, i) => {
        const dateStr = date.toISOString().slice(0, 10)
        const isToday = dateStr === todayStr
        const hasWorkout = workoutDays.has(dateStr)
        const dayNum = date.getDate()

        return (
          <div key={dateStr} className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-zinc-500">{DAY_LABELS[i]}</span>
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-200
                ${hasWorkout
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : isToday
                  ? 'border-2 border-indigo-400 text-indigo-400'
                  : 'text-zinc-400'
                }
              `}
            >
              {dayNum}
            </div>
          </div>
        )
      })}
    </div>
  )
}
