import { useNavigate } from 'react-router-dom'
import { Dumbbell, ChevronRight, Zap } from 'lucide-react'
import WeeklyCalendar from '../components/WeeklyCalendar'
import ChartCarousel from '../components/ChartCarousel'
import { getSuggestedWorkoutType } from '../lib/utils'
import { getWorkoutLog } from '../lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const suggested = getSuggestedWorkoutType()
  const log = getWorkoutLog()
  const totalWorkouts = log.length

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Today</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Dumbbell size={18} className="text-indigo-400" />
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">This Week</p>
        <WeeklyCalendar />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500">Total Workouts</p>
          <p className="text-2xl font-bold text-white mt-1">{totalWorkouts}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500">Streak</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalWorkouts > 0 ? '🔥' : '—'}
          </p>
        </div>
      </div>

      {/* Next Up card */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => navigate('/log')}
      >
        {/* Background decoration */}
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-indigo-200" />
            <p className="text-xs font-medium text-indigo-200 uppercase tracking-widest">Next Up</p>
          </div>
          <h2 className="text-xl font-bold text-white mb-4">{suggested}</h2>
          <button
            className="flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate('/log') }}
          >
            Start Workout
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Charts carousel */}
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Progress</p>
        <ChartCarousel />
      </div>
    </div>
  )
}
