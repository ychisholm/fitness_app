import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Trophy, TrendingUp, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  get1RMHistory,
  getBest1RMPerExercise,
  formatDate,
} from '../lib/utils'
import { KEY_LIFTS, LIFT_COLORS, EXERCISES, WORKOUT_TYPES } from '../lib/constants'

function mergeByDate(datasets) {
  const map = {}
  datasets.forEach(({ name, points }) => {
    points.forEach(({ date, value }) => {
      const label = formatDate(date)
      if (!map[label]) map[label] = { date: label }
      map[label][name] = value
    })
  })
  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey}: {Math.round(p.value)} lbs
        </p>
      ))}
    </div>
  )
}

function PRCard({ rank, name, value, onClick }) {
  const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3 border-b border-zinc-800 last:border-0 active:bg-zinc-800/50 -mx-1 px-1 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg w-6 text-center">{medal || <span className="text-xs text-zinc-600">{rank + 1}</span>}</span>
        <span className="text-sm text-zinc-200 font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <span className="text-sm font-bold text-white">{Math.round(value)}</span>
          <span className="text-xs text-zinc-500 ml-1">lbs</span>
        </div>
        <ChevronRight size={14} className="text-zinc-600" />
      </div>
    </button>
  )
}

function ExerciseRow({ name, hasData, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0 active:bg-zinc-800/50 -mx-1 px-1 rounded-lg transition-colors"
    >
      <span className="text-sm text-zinc-300">{name}</span>
      <div className="flex items-center gap-2">
        {!hasData && <span className="text-xs text-zinc-600">No data</span>}
        <ChevronRight size={14} className="text-zinc-600" />
      </div>
    </button>
  )
}

export default function Analytics() {
  const navigate = useNavigate()

  const datasets = KEY_LIFTS.map((name) => ({
    name,
    points: get1RMHistory(name),
  }))
  const chartData = mergeByDate(datasets)
  const hasData = chartData.length > 0

  const bests = getBest1RMPerExercise()
  const allExercises = [
    ...EXERCISES[WORKOUT_TYPES.UPPER],
    ...EXERCISES[WORKOUT_TYPES.LEGS],
  ]
  const prs = allExercises
    .filter((name) => bests[name] > 0)
    .map((name) => ({ name, value: bests[name] }))
    .sort((a, b) => b.value - a.value)

  const unloggedExercises = allExercises.filter((name) => !bests[name])

  const goToExercise = (name) =>
    navigate(`/stats/${encodeURIComponent(name)}`)

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-28">
      {/* Header */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Analytics</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Your Progress</h1>
      </div>

      {/* 1RM Trend Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Estimated 1RM Trends</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-4">Bench Press · Barbell Squat · Deadlift</p>

        <div className="flex gap-4 mb-4">
          {KEY_LIFTS.map((name) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: LIFT_COLORS[name] }} />
              <span className="text-xs text-zinc-400">{name.split(' ')[1] || name}</span>
            </div>
          ))}
        </div>

        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {KEY_LIFTS.map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={LIFT_COLORS[name]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: LIFT_COLORS[name], strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <TrendingUp size={32} className="text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">No data yet</p>
            <p className="text-xs text-zinc-600 mt-1">Log workouts to track your 1RM trends</p>
          </div>
        )}
      </div>

      {/* Personal Records — tappable */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Personal Records</h2>
          <span className="ml-auto text-xs text-zinc-500">Est. 1RM</span>
        </div>

        {prs.length > 0 ? (
          <div>
            {prs.map((pr, i) => (
              <PRCard
                key={pr.name}
                rank={i}
                name={pr.name}
                value={pr.value}
                onClick={() => goToExercise(pr.name)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trophy size={32} className="text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">No PRs yet</p>
            <p className="text-xs text-zinc-600 mt-1">Complete your first workout to set records</p>
          </div>
        )}
      </div>

      {/* All Exercises — tappable */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-white mb-4">All Exercises</h2>

        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Upper Body</p>
        {EXERCISES[WORKOUT_TYPES.UPPER].map((name) => (
          <ExerciseRow
            key={name}
            name={name}
            hasData={!!bests[name]}
            onClick={() => goToExercise(name)}
          />
        ))}

        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-4 mb-2">Leg Day</p>
        {EXERCISES[WORKOUT_TYPES.LEGS].map((name) => (
          <ExerciseRow
            key={name}
            name={name}
            hasData={!!bests[name]}
            onClick={() => goToExercise(name)}
          />
        ))}
      </div>
    </div>
  )
}
