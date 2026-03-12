import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Plus, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react'
import {
  getSuggestedWorkoutType,
  getLastSetsForExercise,
  saveWorkout,
  generateId,
  getWorkoutLog,
} from '../lib/utils'
import { WORKOUT_TYPES, EXERCISES } from '../lib/constants'
import WeightPicker from '../components/WeightPicker'
import RepsPicker from '../components/RepsPicker'

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadCustomWorkouts() {
  try {
    return JSON.parse(localStorage.getItem('customWorkouts') || '[]')
  } catch {
    return []
  }
}

function fmtDate(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function calcVolume(workout) {
  let total = 0
  for (const ex of workout.exercises || []) {
    for (const s of ex.sets || []) {
      if (s.weight && s.reps) total += Number(s.weight) * Number(s.reps)
    }
  }
  return total
}

function buildExercisesFromNames(names) {
  return names.map((name) => {
    const lastSets = getLastSetsForExercise(name)
    return {
      name,
      sets: [
        { id: generateId(), weight: '', reps: '', completed: false },
        { id: generateId(), weight: '', reps: '', completed: false },
        { id: generateId(), weight: '', reps: '', completed: false },
      ],
      lastSets,
    }
  })
}

function buildExercises(type) {
  return buildExercisesFromNames(EXERCISES[type] || [])
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SetRow({ set, index, lastSet, onChange, onToggle }) {
  return (
    <div
      className={`flex items-center gap-2 py-2 transition-opacity ${
        set.completed ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <span className="w-5 text-center text-xs font-medium text-zinc-500">{index + 1}</span>

      <WeightPicker
        value={set.weight}
        lastWeight={lastSet?.weight}
        onChange={(v) => onChange(set.id, 'weight', v)}
        disabled={set.completed}
      />

      <RepsPicker
        value={set.reps}
        lastReps={lastSet?.reps}
        onChange={(v) => onChange(set.id, 'reps', v)}
        disabled={set.completed}
      />

      <button
        onClick={() => onToggle(set.id)}
        className={`
          w-8 h-8 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 flex-shrink-0
          ${set.completed
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
            : 'border-zinc-600 text-transparent hover:border-zinc-400'
          }
        `}
      >
        <Check size={14} />
      </button>
    </div>
  )
}

function ExerciseBlock({ exercise, onSetChange, onSetToggle, onAddSet }) {
  const completedCount = exercise.sets.filter((s) => s.completed).length
  const total = exercise.sets.length

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-white">{exercise.name}</h3>
          {exercise.lastSets && (
            <span className="text-xs text-zinc-500 whitespace-nowrap">
              {exercise.lastSets
                .filter((s) => s.weight)
                .map((s) => s.weight)
                .join(' · ')} lbs
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {completedCount > 0 && (
            <span className="text-xs text-emerald-400 font-medium">
              {completedCount}/{total}
            </span>
          )}
          {completedCount === total && (
            <CheckCircle2 size={16} className="text-emerald-400" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1 px-0">
        <span className="w-5" />
        <span className="flex-1 text-center text-xs text-zinc-600">Weight</span>
        <span className="flex-1 text-center text-xs text-zinc-600">Reps</span>
        <span className="w-8" />
      </div>

      <div className="divide-y divide-zinc-800/50">
        {exercise.sets.map((set, i) => (
          <SetRow
            key={set.id}
            set={set}
            index={i}
            lastSet={exercise.lastSets?.[i]}
            onChange={onSetChange}
            onToggle={onSetToggle}
          />
        ))}
      </div>

      <button
        onClick={onAddSet}
        className="flex items-center gap-1.5 mt-3 text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
      >
        <Plus size={14} />
        Add Set
      </button>
    </div>
  )
}

function WorkoutHistoryRow({ workout, expanded, onToggle }) {
  const vol = calcVolume(workout)
  const totalSets = workout.exercises?.reduce((a, ex) => a + ex.sets.length, 0) ?? 0

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{workout.type}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{fmtDate(workout.date)}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <div className="text-right">
            {vol > 0 && (
              <p className="text-xs text-zinc-400 font-medium">{vol.toLocaleString()} lbs</p>
            )}
            <p className="text-xs text-zinc-600">{totalSets} sets</p>
          </div>
          <ChevronDown
            size={16}
            className={`text-zinc-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-800 space-y-3">
          {workout.exercises?.map((ex) => (
            <div key={ex.name}>
              <p className="text-xs font-medium text-zinc-400 mb-1.5">{ex.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {ex.sets.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs bg-zinc-800 text-zinc-300 rounded-lg px-2 py-1 font-mono"
                  >
                    {s.weight} × {s.reps}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TemplateRow({ name, count, onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-left hover:border-zinc-700 active:bg-zinc-800 transition-colors"
    >
      <div>
        <p className="text-sm font-semibold text-white">{name}</p>
        {count != null && (
          <p className="text-xs text-zinc-500 mt-0.5">{count} exercise{count !== 1 ? 's' : ''}</p>
        )}
      </div>
      <ChevronRight size={16} className="text-zinc-600 flex-shrink-0" />
    </button>
  )
}

// ── Views ─────────────────────────────────────────────────────────────────────

function HomeView({ onNewWorkout }) {
  const recentWorkouts = useMemo(() => {
    const log = getWorkoutLog()
    return [...log].reverse().slice(0, 5)
  }, [])

  const [expandedId, setExpandedId] = useState(null)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-32">
      {/* Date header */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">{today}</p>
        <h1 className="text-2xl font-bold text-white mt-1">Log Workout</h1>
      </div>

      {/* New Workout button */}
      <button
        onClick={onNewWorkout}
        className="w-full flex items-center justify-center gap-2.5 bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white font-semibold text-base rounded-2xl py-4 transition-all duration-200 shadow-lg shadow-indigo-500/30"
      >
        <Plus size={20} />
        New Workout
      </button>

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">
            Recent Workouts
          </p>
          <div className="flex flex-col gap-2.5">
            {recentWorkouts.map((w) => (
              <WorkoutHistoryRow
                key={w.id}
                workout={w}
                expanded={expandedId === w.id}
                onToggle={() => setExpandedId(expandedId === w.id ? null : w.id)}
              />
            ))}
          </div>
        </div>
      )}

      {recentWorkouts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
            <Dumbbell size={24} className="text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">No workouts yet.<br />Tap New Workout to get started.</p>
        </div>
      )}
    </div>
  )
}

function TemplateSelectView({ onBack, onSelect }) {
  const customWorkouts = useMemo(() => loadCustomWorkouts(), [])

  const defaultTemplates = [
    { name: WORKOUT_TYPES.UPPER, exercises: EXERCISES[WORKOUT_TYPES.UPPER] || [] },
    { name: WORKOUT_TYPES.LEGS, exercises: EXERCISES[WORKOUT_TYPES.LEGS] || [] },
  ]

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <ChevronLeft size={18} className="text-zinc-300" />
        </button>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Choose Template</p>
          <h2 className="text-lg font-bold text-white leading-tight">New Workout</h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6">
        {/* Custom workouts */}
        {customWorkouts.length > 0 && (
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">
              My Workouts
            </p>
            <div className="flex flex-col gap-2.5">
              {customWorkouts.map((w) => (
                <TemplateRow
                  key={w.id}
                  name={w.name}
                  count={w.exercises?.length}
                  onPress={() => onSelect(w.name, buildExercisesFromNames(w.exercises || []))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Default templates */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">
            Default
          </p>
          <div className="flex flex-col gap-2.5">
            {defaultTemplates.map((t) => (
              <TemplateRow
                key={t.name}
                name={t.name}
                count={t.exercises.length}
                onPress={() => onSelect(t.name, buildExercisesFromNames(t.exercises))}
              />
            ))}
          </div>
        </div>

        {customWorkouts.length === 0 && (
          <p className="text-xs text-zinc-600 text-center -mt-2">
            Create custom workouts in the Exercises tab.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function WorkoutLogger() {
  const navigate = useNavigate()

  // View state: 'home' | 'templates' | 'logging'
  const [view, setView] = useState('home')

  // Logging state
  const [workoutType, setWorkoutType] = useState('')
  const [exercises, setExercises] = useState([])
  const [saving, setSaving] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  function startWorkout(name, exerciseList) {
    setWorkoutType(name)
    setExercises(exerciseList)
    setSaving(false)
    setView('logging')
  }

  const handleSetChange = useCallback((exerciseIndex, setId, field, value) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIndex) return ex
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, [field]: value } : s
          ),
        }
      })
    )
  }, [])

  const handleSetToggle = useCallback((exerciseIndex, setId) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIndex) return ex
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, completed: !s.completed } : s
          ),
        }
      })
    )
  }, [])

  const handleAddSet = useCallback((exerciseIndex) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIndex) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: generateId(),
              weight: last?.weight || '',
              reps: last?.reps || '',
              completed: false,
            },
          ],
        }
      })
    )
  }, [])

  const completedExercises = exercises.filter((ex) =>
    ex.sets.some((s) => s.completed)
  ).length

  const handleFinish = () => {
    setSaving(true)
    const workout = {
      id: generateId(),
      date: new Date().toISOString(),
      type: workoutType,
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets
          .filter((s) => s.completed && (s.weight || s.reps))
          .map(({ weight, reps }) => ({ weight: Number(weight), reps: Number(reps) })),
      })).filter((ex) => ex.sets.length > 0),
    }
    saveWorkout(workout)
    setTimeout(() => navigate('/'), 300)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (view === 'home') {
    return <HomeView onNewWorkout={() => setView('templates')} />
  }

  if (view === 'templates') {
    return (
      <TemplateSelectView
        onBack={() => setView('home')}
        onSelect={startWorkout}
      />
    )
  }

  // view === 'logging'
  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('home')}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} className="text-zinc-300" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Logging</p>
            <div className="relative mt-0.5">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1.5 text-xl font-bold text-white"
              >
                <span className="truncate max-w-[200px]">{workoutType}</span>
                <ChevronDown size={18} className={`flex-shrink-0 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-20 min-w-[160px]">
                  {Object.values(WORKOUT_TYPES).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setWorkoutType(t)
                        setExercises(buildExercises(t))
                        setShowTypeDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        t === workoutType
                          ? 'text-indigo-400 bg-indigo-500/10 font-medium'
                          : 'text-white hover:bg-zinc-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-zinc-500">{completedExercises}/{exercises.length}</p>
            <p className="text-xs text-zinc-600">exercises</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${exercises.length ? (completedExercises / exercises.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Exercise blocks */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        {exercises.map((exercise, i) => (
          <ExerciseBlock
            key={exercise.name}
            exercise={exercise}
            onSetChange={(setId, field, value) => handleSetChange(i, setId, field, value)}
            onSetToggle={(setId) => handleSetToggle(i, setId)}
            onAddSet={() => handleAddSet(i)}
          />
        ))}
      </div>

      {/* Finish button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4">
        <button
          onClick={handleFinish}
          disabled={saving || completedExercises === 0}
          className={`
            w-full py-4 rounded-2xl font-semibold text-base
            transition-all duration-200
            ${completedExercises > 0
              ? 'bg-indigo-500 text-white hover:bg-indigo-400 active:scale-[0.98] shadow-lg shadow-indigo-500/30'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          {saving ? 'Saving...' : 'Finish Workout'}
        </button>
      </div>
    </div>
  )
}
