import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Plus, ChevronDown, CheckCircle2 } from 'lucide-react'
import {
  getSuggestedWorkoutType,
  getLastSetsForExercise,
  saveWorkout,
  generateId,
} from '../lib/utils'
import { WORKOUT_TYPES, EXERCISES } from '../lib/constants'
import WeightPicker from '../components/WeightPicker'
import RepsPicker from '../components/RepsPicker'

function buildExercises(type) {
  return (EXERCISES[type] || []).map((name) => {
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

function SetRow({ set, index, lastSet, onChange, onToggle }) {
  return (
    <div
      className={`flex items-center gap-2 py-2 transition-opacity ${
        set.completed ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* Set number */}
      <span className="w-5 text-center text-xs font-medium text-zinc-500">{index + 1}</span>

      {/* Weight picker */}
      <WeightPicker
        value={set.weight}
        lastWeight={lastSet?.weight}
        onChange={(v) => onChange(set.id, 'weight', v)}
        disabled={set.completed}
      />

      {/* Reps picker */}
      <RepsPicker
        value={set.reps}
        lastReps={lastSet?.reps}
        onChange={(v) => onChange(set.id, 'reps', v)}
        disabled={set.completed}
      />

      {/* Complete checkbox */}
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
      {/* Header */}
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

      {/* Column headers */}
      <div className="flex items-center gap-2 mb-1 px-0">
        <span className="w-5" />
        <span className="flex-1 text-center text-xs text-zinc-600">Weight</span>
        <span className="flex-1 text-center text-xs text-zinc-600">Reps</span>
        <span className="w-8" />
      </div>

      {/* Sets */}
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

      {/* Add set */}
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

export default function WorkoutLogger() {
  const navigate = useNavigate()
  const suggested = getSuggestedWorkoutType()
  const [workoutType, setWorkoutType] = useState(suggested)
  const [exercises, setExercises] = useState(() => buildExercises(suggested))
  const [saving, setSaving] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const handleTypeChange = (type) => {
    setWorkoutType(type)
    setExercises(buildExercises(type))
    setShowTypeDropdown(false)
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

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Logging</p>
            <div className="relative mt-0.5">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1.5 text-xl font-bold text-white"
              >
                {workoutType}
                <ChevronDown size={18} className={`transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-20 min-w-[160px]">
                  {Object.values(WORKOUT_TYPES).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
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
          <div className="text-right">
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
          {saving ? 'Saving...' : `Finish Workout`}
        </button>
      </div>
    </div>
  )
}
