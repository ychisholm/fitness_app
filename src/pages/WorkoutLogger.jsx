import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, Plus, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight,
  Dumbbell, Trash2, Calendar, PlayCircle, MessageSquare,
} from 'lucide-react'
import {
  getLastSetsForExercise,
  saveWorkout,
  deleteWorkout,
  generateId,
  getWorkoutLog,
} from '../lib/utils'
import { WORKOUT_TYPES, EXERCISES } from '../lib/constants'
import WeightPicker from '../components/WeightPicker'
import RepsPicker from '../components/RepsPicker'

// ── Constants ─────────────────────────────────────────────────────────────────

const IN_PROGRESS_KEY = 'workoutInProgress'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadCustomWorkouts() {
  try { return JSON.parse(localStorage.getItem('customWorkouts') || '[]') } catch { return [] }
}
function saveInProgress(state) { localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(state)) }
function clearInProgress()     { localStorage.removeItem(IN_PROGRESS_KEY) }
function loadInProgress() {
  try { const r = localStorage.getItem(IN_PROGRESS_KEY); return r ? JSON.parse(r) : null } catch { return null }
}

// Returns the most recent workout-level note for a given type
function getLastWorkoutNote(type) {
  const log = getWorkoutLog()
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].type === type && log[i].note) return log[i].note
  }
  return null
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function fmtDate(iso) {
  const d = new Date(iso)
  const today = new Date(), yest = new Date(today)
  yest.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yest.toDateString())  return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function fmtDateLabel(yyyymmdd) {
  const d = new Date(yyyymmdd + 'T12:00:00')
  const today = new Date(), yest = new Date(today)
  yest.setDate(today.getDate() - 1)
  if (yyyymmdd === todayStr()) return 'Today'
  if (yyyymmdd === yest.toISOString().slice(0, 10)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function calcVolume(workout) {
  let t = 0
  for (const ex of workout.exercises || [])
    for (const s of ex.sets || [])
      if (s.weight && s.reps) t += Number(s.weight) * Number(s.reps)
  return t
}

// ── Exercise builder: pre-fill sets, weight, reps, and notes from last session

function buildExercisesFromNames(names) {
  return names.map((name) => {
    const lastSets = getLastSetsForExercise(name)
    // Pre-fill set count from last session (Feature: pre-fill set count)
    const count = lastSets?.length ? Math.min(lastSets.length, 5) : 3
    return {
      name,
      sets: Array.from({ length: count }, (_, i) => ({
        id:        generateId(),
        weight:    lastSets?.[i]?.weight ?? '',
        reps:      lastSets?.[i]?.reps   ?? '',
        note:      '',
        completed: false,
      })),
      lastSets,  // kept for "last session" label + per-set note placeholders
    }
  })
}

function buildExercises(type) {
  return buildExercisesFromNames(EXERCISES[type] || [])
}

// ── SetRow — compact, with inline notes icon ──────────────────────────────────

function SetRow({ set, index, lastSet, onChange, onToggle }) {
  const [showNote, setShowNote] = useState(!!set.note)

  return (
    <div className={`transition-opacity ${set.completed ? 'opacity-40' : 'opacity-100'}`}>
      {/* Main row */}
      <div className="flex items-center gap-1.5 py-1">
        <span className="w-4 text-center text-[10px] font-medium text-zinc-600 flex-shrink-0">
          {index + 1}
        </span>
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
        {/* Complete */}
        <button
          onClick={() => onToggle(set.id)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
            ${set.completed
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
              : 'border-zinc-700 text-transparent hover:border-zinc-500'}`}
        >
          <Check size={12} />
        </button>
        {/* Note toggle — inline, no added height */}
        <button
          onClick={() => setShowNote((v) => !v)}
          className={`w-6 h-6 flex items-center justify-center rounded flex-shrink-0 transition-colors
            ${(showNote || set.note) ? 'text-indigo-400' : 'text-zinc-700 hover:text-zinc-500'}`}
        >
          <MessageSquare size={11} />
        </button>
      </div>

      {/* Inline note input — appears below the row when toggled */}
      {(showNote || set.note) && (
        <div className="pl-5 pr-1 pb-1.5">
          <input
            value={set.note}
            onChange={(e) => onChange(set.id, 'note', e.target.value)}
            placeholder={lastSet?.note || 'Set note…'}
            className="w-full bg-transparent text-[11px] text-zinc-400 placeholder:text-zinc-700 outline-none border-b border-zinc-800 focus:border-zinc-600 pb-0.5 transition-colors"
          />
        </div>
      )}
    </div>
  )
}

// ── ExerciseBlock — compact layout ────────────────────────────────────────────

function ExerciseBlock({ exercise, lastWorkoutNote, onSetChange, onSetToggle, onAddSet }) {
  const completedCount = exercise.sets.filter((s) => s.completed).length
  const total          = exercise.sets.length

  // Build the "last session" summary: "last session · 195 · 195 · 195 lbs"
  const lastWeights = exercise.lastSets?.filter((s) => s.weight).map((s) => s.weight)
  const lastLabel   = lastWeights?.length ? lastWeights.join(' · ') + ' lbs' : null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white leading-tight">{exercise.name}</h3>
          {lastLabel && (
            <p className="text-[10px] text-zinc-600 mt-0.5">
              last session · <span className="text-zinc-500">{lastLabel}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {completedCount > 0 && (
            <span className="text-[10px] text-emerald-400 font-medium">{completedCount}/{total}</span>
          )}
          {completedCount === total && completedCount > 0 && (
            <CheckCircle2 size={14} className="text-emerald-400" />
          )}
        </div>
      </div>

      {/* Set rows — no column headers, they're self-describing */}
      <div>
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
        className="flex items-center gap-1 mt-1.5 text-[11px] text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
      >
        <Plus size={12} />
        Add Set
      </button>
    </div>
  )
}

// ── WorkoutHistoryRow (home page) ─────────────────────────────────────────────

function WorkoutHistoryRow({ workout, expanded, onToggle, isDeleteMode, onLongPress, onDelete }) {
  const vol       = calcVolume(workout)
  const totalSets = workout.exercises?.reduce((a, ex) => a + ex.sets.length, 0) ?? 0
  const pressTimer = useRef(null)

  function handlePointerDown() {
    pressTimer.current = setTimeout(() => onLongPress(workout.id), 500)
  }
  function cancelPress() { clearTimeout(pressTimer.current) }

  return (
    <div className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-200
      ${isDeleteMode ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800'}`}
    >
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onClick={isDeleteMode ? undefined : onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left select-none"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{workout.type}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{fmtDate(workout.date)}</p>
          {workout.note && (
            <p className="text-[11px] text-zinc-600 mt-0.5 truncate italic">"{workout.note}"</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {isDeleteMode ? (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(workout.id) }}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
            >
              <Trash2 size={13} />
              Delete
            </button>
          ) : (
            <>
              <div className="text-right">
                {vol > 0 && <p className="text-xs text-zinc-400 font-medium">{vol.toLocaleString()} lbs</p>}
                <p className="text-xs text-zinc-600">{totalSets} sets</p>
              </div>
              <ChevronDown size={16} className={`text-zinc-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </>
          )}
        </div>
      </button>

      {expanded && !isDeleteMode && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-800 space-y-3">
          {workout.exercises?.map((ex) => (
            <div key={ex.name}>
              <p className="text-xs font-medium text-zinc-400 mb-1.5">{ex.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {ex.sets.map((s, i) => (
                  <div key={i}>
                    <span className="text-xs bg-zinc-800 text-zinc-300 rounded-lg px-2 py-1 font-mono">
                      {s.weight} × {s.reps}
                    </span>
                    {s.note && (
                      <p className="text-[10px] text-zinc-600 italic mt-0.5 px-1">{s.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── TemplateRow ───────────────────────────────────────────────────────────────

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

// ── HomeView ──────────────────────────────────────────────────────────────────

function HomeView({ onNewWorkout, onResume }) {
  const inProgress = loadInProgress()
  const [workouts, setWorkouts]     = useState(() => [...getWorkoutLog()].reverse().slice(0, 5))
  const [expandedId, setExpandedId] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)

  useEffect(() => {
    if (!deleteId) return
    function handleOutside() { setDeleteId(null) }
    document.addEventListener('pointerdown', handleOutside)
    return () => document.removeEventListener('pointerdown', handleOutside)
  }, [deleteId])

  function handleDelete(id) {
    deleteWorkout(id)
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
    setDeleteId(null)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-32">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">{today}</p>
        <h1 className="text-2xl font-bold text-white mt-1">Log Workout</h1>
      </div>

      {inProgress && (
        <button
          onClick={onResume}
          className="w-full flex items-center gap-3 bg-teal-500/10 border border-teal-500/40 rounded-2xl px-4 py-3.5 text-left hover:bg-teal-500/15 active:scale-[0.98] transition-all"
        >
          <PlayCircle size={20} className="text-teal-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-teal-300">Resume {inProgress.type}</p>
            <p className="text-xs text-teal-500 mt-0.5">Continue where you left off</p>
          </div>
          <ChevronRight size={16} className="text-teal-500 flex-shrink-0 ml-auto" />
        </button>
      )}

      <button
        onClick={onNewWorkout}
        className="w-full flex items-center justify-center gap-2.5 bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white font-semibold text-base rounded-2xl py-4 transition-all duration-200 shadow-lg shadow-indigo-500/30"
      >
        <Plus size={20} />
        New Workout
      </button>

      {workouts.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Recent Workouts</p>
          <div className="flex flex-col gap-2.5">
            {workouts.map((w) => (
              <WorkoutHistoryRow
                key={w.id}
                workout={w}
                expanded={expandedId === w.id}
                onToggle={() => {
                  if (deleteId) { setDeleteId(null); return }
                  setExpandedId(expandedId === w.id ? null : w.id)
                }}
                isDeleteMode={deleteId === w.id}
                onLongPress={(id) => { setDeleteId(id); setExpandedId(null) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <p className="text-center text-xs text-zinc-700 mt-3">Hold a workout to delete it</p>
        </div>
      )}

      {workouts.length === 0 && (
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

// ── TemplateSelectView ────────────────────────────────────────────────────────

function TemplateSelectView({ onBack, onSelect }) {
  const customWorkouts = loadCustomWorkouts()
  const defaultTemplates = [
    { name: WORKOUT_TYPES.UPPER, exercises: EXERCISES[WORKOUT_TYPES.UPPER] || [] },
    { name: WORKOUT_TYPES.LEGS,  exercises: EXERCISES[WORKOUT_TYPES.LEGS]  || [] },
  ]

  return (
    <div className="flex flex-col pb-32">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">
          <ChevronLeft size={18} className="text-zinc-300" />
        </button>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Choose Template</p>
          <h2 className="text-lg font-bold text-white leading-tight">New Workout</h2>
        </div>
      </div>
      <div className="flex flex-col gap-6 px-4 pt-6">
        {customWorkouts.length > 0 && (
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">My Workouts</p>
            <div className="flex flex-col gap-2.5">
              {customWorkouts.map((w) => (
                <TemplateRow key={w.id} name={w.name} count={w.exercises?.length}
                  onPress={() => onSelect(w.name, buildExercisesFromNames(w.exercises || []))}
                />
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Default</p>
          <div className="flex flex-col gap-2.5">
            {defaultTemplates.map((t) => (
              <TemplateRow key={t.name} name={t.name} count={t.exercises.length}
                onPress={() => onSelect(t.name, buildExercisesFromNames(t.exercises))}
              />
            ))}
          </div>
        </div>
        {customWorkouts.length === 0 && (
          <p className="text-xs text-zinc-600 text-center -mt-2">Create custom workouts in the Exercises tab.</p>
        )}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function WorkoutLogger() {
  const navigate = useNavigate()

  const [view,             setView]             = useState('home')
  const [workoutType,      setWorkoutType]      = useState('')
  const [exercises,        setExercises]        = useState([])
  const [workoutDate,      setWorkoutDate]      = useState(todayStr)
  const [workoutNote,      setWorkoutNote]      = useState('')
  const [lastWorkoutNote,  setLastWorkoutNote]  = useState(null)
  const [saving,           setSaving]           = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const dateInputRef = useRef(null)

  // Persist in-progress state (includes notes)
  useEffect(() => {
    if (view !== 'logging') return
    saveInProgress({ type: workoutType, workoutDate, workoutNote, exercises })
  }, [view, workoutType, workoutDate, workoutNote, exercises])

  function resumeWorkout() {
    const saved = loadInProgress()
    if (!saved) return
    setWorkoutType(saved.type)
    setExercises(saved.exercises)
    setWorkoutDate(saved.workoutDate || todayStr())
    setWorkoutNote(saved.workoutNote || '')
    setLastWorkoutNote(getLastWorkoutNote(saved.type))
    setSaving(false)
    setView('logging')
  }

  function startWorkout(name, exerciseList) {
    setWorkoutType(name)
    setExercises(exerciseList)
    setWorkoutDate(todayStr())
    setWorkoutNote('')
    setLastWorkoutNote(getLastWorkoutNote(name))
    setSaving(false)
    setView('logging')
  }

  function discardWorkout() {
    clearInProgress()
    setView('home')
  }

  // ── Set handlers ─────────────────────────────────────────────────────────────

  const handleSetChange = useCallback((exerciseIndex, setId, field, value) => {
    setExercises((prev) =>
      prev.map((ex, i) => i !== exerciseIndex ? ex : {
        ...ex,
        sets: ex.sets.map((s) => s.id === setId ? { ...s, [field]: value } : s),
      })
    )
  }, [])

  const handleSetToggle = useCallback((exerciseIndex, setId) => {
    setExercises((prev) =>
      prev.map((ex, i) => i !== exerciseIndex ? ex : {
        ...ex,
        sets: ex.sets.map((s) => s.id === setId ? { ...s, completed: !s.completed } : s),
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
          sets: [...ex.sets, { id: generateId(), weight: last?.weight || '', reps: last?.reps || '', note: '', completed: false }],
        }
      })
    )
  }, [])

  const completedExercises = exercises.filter((ex) => ex.sets.some((s) => s.completed)).length

  function handleFinish() {
    setSaving(true)
    const workout = {
      id:   generateId(),
      date: new Date(workoutDate + 'T12:00:00').toISOString(),
      type: workoutType,
      note: workoutNote.trim(),
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets
          .filter((s) => s.completed && (s.weight || s.reps))
          .map(({ weight, reps, note }) => ({
            weight: Number(weight),
            reps:   Number(reps),
            ...(note?.trim() && { note: note.trim() }),
          })),
      })).filter((ex) => ex.sets.length > 0),
    }
    saveWorkout(workout)
    clearInProgress()
    setTimeout(() => navigate('/'), 300)
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (view === 'home')      return <HomeView onNewWorkout={() => setView('templates')} onResume={resumeWorkout} />
  if (view === 'templates') return <TemplateSelectView onBack={() => setView('home')} onSelect={startWorkout} />

  // view === 'logging'
  return (
    <div className="flex flex-col pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={discardWorkout} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0">
            <ChevronLeft size={18} className="text-zinc-300" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Logging</p>
            <div className="relative mt-0.5">
              <button onClick={() => setShowTypeDropdown(!showTypeDropdown)} className="flex items-center gap-1 text-lg font-bold text-white">
                <span className="truncate max-w-[180px]">{workoutType}</span>
                <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-20 min-w-[160px]">
                  {Object.values(WORKOUT_TYPES).map((t) => (
                    <button key={t} onClick={() => { setWorkoutType(t); setExercises(buildExercises(t)); setShowTypeDropdown(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${t === workoutType ? 'text-indigo-400 bg-indigo-500/10 font-medium' : 'text-white hover:bg-zinc-700'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Date chip */}
            <button
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
              className="flex items-center gap-1 mt-0.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Calendar size={10} />
              <span>{fmtDateLabel(workoutDate)}</span>
              <ChevronDown size={10} />
            </button>
            <input ref={dateInputRef} type="date" max={todayStr()} value={workoutDate}
              onChange={(e) => e.target.value && setWorkoutDate(e.target.value)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-zinc-500">{completedExercises}/{exercises.length}</p>
            <p className="text-[10px] text-zinc-600">exercises</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${exercises.length ? (completedExercises / exercises.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Workout-level note */}
      <div className="px-4 pt-3 pb-1">
        <input
          value={workoutNote}
          onChange={(e) => setWorkoutNote(e.target.value)}
          placeholder={lastWorkoutNote ? `Last time: "${lastWorkoutNote}"` : 'Workout note…'}
          className="w-full bg-transparent text-xs text-zinc-400 placeholder:text-zinc-700 outline-none border-b border-zinc-800/60 focus:border-zinc-600 pb-1 transition-colors"
        />
      </div>

      {/* Exercise blocks */}
      <div className="flex flex-col gap-2 px-4 pt-2">
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
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200
            ${completedExercises > 0
              ? 'bg-indigo-500 text-white hover:bg-indigo-400 active:scale-[0.98] shadow-lg shadow-indigo-500/30'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
        >
          {saving ? 'Saving…' : 'Finish Workout'}
        </button>
      </div>
    </div>
  )
}
