import { useState } from 'react'
import { Trophy, ChevronRight, ChevronLeft, BarChart2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getBest1RMPerExercise,
  getWorkoutLog,
  formatDate,
} from '../lib/utils'
import { KEY_LIFTS, LIFT_COLORS, EXERCISES, WORKOUT_TYPES } from '../lib/constants'
import { EXERCISE_DATA } from '../lib/exerciseData'
import VolumeChart from '../components/VolumeChart'

// ── Muscle group tile definitions (mirrors Exercises page) ────────────────────

const MUSCLE_TILES = [
  { id: 'Chest',             label: 'Chest',               color: 'text-indigo-400',  dot: '#6366f1' },
  { id: 'Back',              label: 'Back',                color: 'text-cyan-400',    dot: '#22d3ee' },
  { id: 'Shoulders',         label: 'Shoulders',           color: 'text-violet-400',  dot: '#a78bfa' },
  { id: 'Biceps',            label: 'Biceps',              color: 'text-sky-400',     dot: '#38bdf8' },
  { id: 'Triceps',           label: 'Triceps',             color: 'text-sky-400',     dot: '#38bdf8' },
  { id: 'Quads',             label: 'Quads',               color: 'text-cyan-400',    dot: '#22d3ee' },
  { id: 'Hamstrings/Glutes', label: 'Hamstrings / Glutes', color: 'text-amber-400',   dot: '#f59e0b' },
  { id: 'Core',              label: 'Core',                color: 'text-emerald-400', dot: '#34d399' },
]

function getTileExercises(tileId) {
  if (tileId === 'Biceps')
    return EXERCISE_DATA.filter(e => e.displayGroup === 'Arms' && e.primaryMuscle.toLowerCase().includes('bicep'))
  if (tileId === 'Triceps')
    return EXERCISE_DATA.filter(e => e.displayGroup === 'Arms' && e.primaryMuscle.toLowerCase().includes('tricep'))
  if (tileId === 'Hamstrings/Glutes')
    return EXERCISE_DATA.filter(e => e.displayGroup === 'Glutes')
  return EXERCISE_DATA.filter(e => e.displayGroup === tileId)
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function getMaxWeightPerExercise() {
  const log = getWorkoutLog()
  const maxes = {}
  for (const workout of log) {
    for (const ex of workout.exercises || []) {
      for (const set of ex.sets || []) {
        const w = Number(set.weight)
        if (w > 0 && w > (maxes[ex.name] || 0)) maxes[ex.name] = w
      }
    }
  }
  return maxes
}

function getLastTrainedForTile(tileId) {
  const names = new Set(getTileExercises(tileId).map(e => e.name))
  const log = getWorkoutLog()
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].exercises?.some(ex => names.has(ex.name))) {
      return formatDate(log[i].date)
    }
  }
  return null
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PRCard({ rank, name, value, onClick }) {
  const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3 border-b border-zinc-800 last:border-0 active:bg-zinc-800/50 -mx-1 px-1 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        {medal ? (
          <span className="text-lg w-6 text-center">{medal}</span>
        ) : (
          <span className="text-xs text-zinc-500 font-mono w-6 text-center">{rank + 1}</span>
        )}
        <span className="text-sm text-zinc-200 font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white">{value}</span>
        <span className="text-xs text-zinc-500">lbs</span>
        <ChevronRight size={14} className="text-zinc-600" />
      </div>
    </button>
  )
}

function Big3Tile({ label, color, value }) {
  return (
    <div
      className="flex-1 rounded-2xl p-3 flex flex-col gap-1 min-w-0"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color }}>
        {label}
      </span>
      {value > 0 ? (
        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-bold text-white leading-tight">{Math.round(value)}</span>
          <span className="text-xs text-zinc-500">lbs</span>
        </div>
      ) : (
        <span className="text-sm text-zinc-600 font-medium">—</span>
      )}
      <span className="text-[10px] text-zinc-600">Est. 1RM</span>
    </div>
  )
}

function MuscleGroupTile({ tile, exerciseCount, lastDate, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-5 hover:border-zinc-700 hover:bg-zinc-800/60 active:scale-[0.98] transition-all"
    >
      <p className={`text-base font-bold leading-tight mb-1 ${tile.color}`}>{tile.label}</p>
      <p className="text-xs text-zinc-600">
        {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
        {lastDate ? ` · ${lastDate}` : ''}
      </p>
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

// ── Constants ─────────────────────────────────────────────────────────────────

const BIG3 = [
  { key: 'Barbell Bench Press', label: 'Bench',    color: LIFT_COLORS['Barbell Bench Press'] },
  { key: 'Back Squat',          label: 'Squat',    color: LIFT_COLORS['Back Squat']          },
  { key: 'Deadlift',            label: 'Deadlift', color: LIFT_COLORS['Deadlift']             },
]

// ── Main export ───────────────────────────────────────────────────────────────

export default function Analytics() {
  const navigate = useNavigate()
  const [statsView, setStatsView] = useState('groups') // 'groups' | 'exercises'
  const [selectedTile, setSelectedTile] = useState(null)

  const maxWeights = getMaxWeightPerExercise()
  const bests1RM   = getBest1RMPerExercise()

  // PRs — top 5 by real logged weight
  const allExercises = [
    ...EXERCISES[WORKOUT_TYPES.UPPER],
    ...EXERCISES[WORKOUT_TYPES.LEGS],
  ]
  const prs = allExercises
    .filter(name => maxWeights[name] > 0)
    .map(name => ({ name, value: maxWeights[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const goToExercise = (name) => navigate(`/stats/${encodeURIComponent(name)}`)

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-28">
      {/* Header */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Analytics</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Your Progress</h1>
      </div>

      {/* ── 1. Personal Records ──────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Personal Records</h2>
          <span className="ml-auto text-xs text-zinc-500">Top weight</span>
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

      {/* ── 2. Big 3 Estimated 1RM ───────────────────────────────────────── */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">
          Big 3 Estimated 1RM
        </p>
        <div className="flex gap-2.5">
          {BIG3.map(({ key, label, color }) => (
            <Big3Tile key={key} label={label} color={color} value={bests1RM[key] || 0} />
          ))}
        </div>
      </div>

      {/* ── 3. Total Volume Chart ────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Total Volume</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-3">Weight × Reps per session</p>
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs text-zinc-400">Upper Body</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-zinc-400">Leg Day</span>
          </div>
        </div>
        <VolumeChart />
      </div>

      {/* ── 4. Exercise Stats Browser ─────────────────────────────────────── */}
      <div>
        {statsView === 'groups' ? (
          <>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">
              Exercise Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MUSCLE_TILES.map(tile => {
                const exercises = getTileExercises(tile.id)
                const lastDate  = getLastTrainedForTile(tile.id)
                return (
                  <MuscleGroupTile
                    key={tile.id}
                    tile={tile}
                    exerciseCount={exercises.length}
                    lastDate={lastDate}
                    onClick={() => { setSelectedTile(tile); setStatsView('exercises') }}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
              <button
                onClick={() => { setStatsView('groups'); setSelectedTile(null) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
              >
                <ChevronLeft size={16} className="text-zinc-300" />
              </button>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Exercise Stats</p>
                <h3 className={`text-sm font-bold leading-tight ${selectedTile.color}`}>
                  {selectedTile.label}
                </h3>
              </div>
            </div>

            {/* Exercise list */}
            <div className="px-4 py-1">
              {getTileExercises(selectedTile.id).map(ex => (
                <ExerciseRow
                  key={ex.name}
                  name={ex.name}
                  hasData={!!maxWeights[ex.name]}
                  onClick={() => goToExercise(ex.name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
