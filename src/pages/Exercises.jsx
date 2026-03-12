import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Star, X, Plus, Check, BookOpen,
  ChevronRight, ChevronLeft, Dumbbell, Trash2, Edit3,
} from 'lucide-react'
import { EXERCISE_DATA, GROUP_COLOR } from '../lib/exerciseData'

// ── localStorage helpers ───────────────────────────────────────────────────────
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem('exerciseFavorites') || '[]') } catch { return [] }
}
function saveFavorites(arr) {
  localStorage.setItem('exerciseFavorites', JSON.stringify(arr))
}
function loadWorkouts() {
  try { return JSON.parse(localStorage.getItem('customWorkouts') || '[]') } catch { return [] }
}
function persistNewWorkout(w) {
  try {
    const list = loadWorkouts(); list.push(w)
    localStorage.setItem('customWorkouts', JSON.stringify(list))
  } catch { /* ignore */ }
}
function persistUpdateWorkout(id, name, exercises) {
  try {
    const list = loadWorkouts().map(w => w.id === id ? { ...w, name, exercises } : w)
    localStorage.setItem('customWorkouts', JSON.stringify(list))
  } catch { /* ignore */ }
}
function persistDeleteWorkout(id) {
  try {
    localStorage.setItem('customWorkouts', JSON.stringify(loadWorkouts().filter(w => w.id !== id)))
  } catch { /* ignore */ }
}

// ── Muscle group tile definitions ─────────────────────────────────────────────
const MUSCLE_TILES = [
  { id: 'Chest',             label: 'Chest',             color: 'text-indigo-400'  },
  { id: 'Back',              label: 'Back',              color: 'text-cyan-400'    },
  { id: 'Shoulders',         label: 'Shoulders',         color: 'text-violet-400'  },
  { id: 'Biceps',            label: 'Biceps',            color: 'text-sky-400'     },
  { id: 'Triceps',           label: 'Triceps',           color: 'text-sky-400'     },
  { id: 'Quads',             label: 'Quads',             color: 'text-cyan-400'    },
  { id: 'Hamstrings/Glutes', label: 'Hamstrings / Glutes', color: 'text-amber-400' },
  { id: 'Core',              label: 'Core',              color: 'text-emerald-400' },
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

// Filter groups used inside selection / muscle-group list views
const LIST_FILTERS = ['All', 'Favorites', 'Chest', 'Back', 'Shoulders', 'Arms', 'Quads', 'Glutes', 'Core']

// ── Root component ─────────────────────────────────────────────────────────────
export default function Exercises() {
  const navigate = useNavigate()

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [view, setView]               = useState('home')   // home | muscleGroup | myWorkouts | workoutDetail
  const [activeTile, setActiveTile]   = useState(null)
  const [activeWorkout, setActiveWorkout] = useState(null)

  // ── Data ───────────────────────────────────────────────────────────────────
  const [workouts, setWorkouts]   = useState(loadWorkouts)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [selectedExercise, setSelectedEx] = useState(null)

  // ── Create / edit workflow ─────────────────────────────────────────────────
  const [showNameModal, setShowNameModal]             = useState(false)
  const [selectionMode, setSelectionMode]             = useState(false)
  const [selectionContext, setSelectionContext]        = useState('create') // 'create' | 'edit'
  const [editingWorkoutId, setEditingWorkoutId]       = useState(null)
  const [workoutName, setWorkoutName]                 = useState('')
  const [selectedExercises, setSelectedExercises]     = useState([])

  function reloadWorkouts() { setWorkouts(loadWorkouts()) }

  function toggleFavorite(name) {
    setFavorites(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
      saveFavorites(next)
      return next
    })
  }

  function enterSelectionMode(name, context = 'create', preSelected = [], editId = null) {
    setWorkoutName(name)
    setSelectionMode(true)
    setSelectionContext(context)
    setSelectedExercises(preSelected)
    setEditingWorkoutId(editId)
    setShowNameModal(false)
  }

  function cancelSelection() {
    const wasEditing = selectionContext === 'edit'
    setSelectionMode(false)
    setWorkoutName('')
    setSelectedExercises([])
    setSelectionContext('create')
    setEditingWorkoutId(null)
    if (wasEditing) setView('workoutDetail')
  }

  function toggleSelected(name) {
    setSelectedExercises(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  function handleSaveWorkout() {
    if (!workoutName.trim() || selectedExercises.length === 0) return
    if (selectionContext === 'edit' && editingWorkoutId) {
      persistUpdateWorkout(editingWorkoutId, workoutName.trim(), selectedExercises)
      reloadWorkouts()
      setActiveWorkout(loadWorkouts().find(w => w.id === editingWorkoutId) ?? activeWorkout)
      setView('workoutDetail')
    } else {
      const nw = {
        id: Date.now().toString(),
        name: workoutName.trim(),
        exercises: selectedExercises,
        createdAt: new Date().toISOString(),
      }
      persistNewWorkout(nw)
      reloadWorkouts()
      setView('home')
    }
    setSelectionMode(false)
    setWorkoutName('')
    setSelectedExercises([])
    setSelectionContext('create')
    setEditingWorkoutId(null)
  }

  function handleDeleteWorkout(id) {
    persistDeleteWorkout(id)
    reloadWorkouts()
    setActiveWorkout(null)
    setView('myWorkouts')
  }

  function handleEditWorkout(workout) {
    enterSelectionMode(workout.name, 'edit', [...workout.exercises], workout.id)
  }

  // ── Shared detail-sheet props ──────────────────────────────────────────────
  const sharedDetail = {
    favorites,
    onToggleFavorite: toggleFavorite,
    selectedExercise,
    onSelectExercise: setSelectedEx,
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {selectionMode ? (
        <SelectionView
          workoutName={workoutName}
          onChangeName={setWorkoutName}
          selectionContext={selectionContext}
          selectedExercises={selectedExercises}
          onToggleSelected={toggleSelected}
          onCancel={cancelSelection}
          onSave={handleSaveWorkout}
          {...sharedDetail}
        />
      ) : view === 'home' ? (
        <HomeView
          workouts={workouts}
          onOpenCreate={() => setShowNameModal(true)}
          onGoMyWorkouts={() => setView('myWorkouts')}
          onGoMuscleGroup={tile => { setActiveTile(tile); setView('muscleGroup') }}
        />
      ) : view === 'muscleGroup' ? (
        <MuscleGroupScreen
          tile={activeTile}
          onBack={() => setView('home')}
          {...sharedDetail}
        />
      ) : view === 'myWorkouts' ? (
        <MyWorkoutsScreen
          workouts={workouts}
          onBack={() => setView('home')}
          onSelectWorkout={w => { setActiveWorkout(w); setView('workoutDetail') }}
        />
      ) : view === 'workoutDetail' ? (
        <WorkoutDetailScreen
          workout={activeWorkout}
          onBack={() => setView('myWorkouts')}
          onEdit={handleEditWorkout}
          onDelete={handleDeleteWorkout}
          onStartWorkout={() => navigate('/log')}
        />
      ) : null}

      {/* Global modals — render on top of any view */}
      {selectedExercise && (
        <ExerciseDetailSheet
          exercise={selectedExercise}
          isFavorite={favorites.includes(selectedExercise.name)}
          onToggleFavorite={() => toggleFavorite(selectedExercise.name)}
          onClose={() => setSelectedEx(null)}
        />
      )}
      {showNameModal && (
        <NameModal
          onClose={() => setShowNameModal(false)}
          onAddExercises={name => enterSelectionMode(name)}
        />
      )}
    </>
  )
}

// ── Home view — muscle group tiles ────────────────────────────────────────────
function HomeView({ workouts, onOpenCreate, onGoMyWorkouts, onGoMuscleGroup }) {
  return (
    <div className="min-h-dvh pb-28">
      {/* Header */}
      <div className="px-4 pt-6 pb-5 border-b border-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">LIBRARY</p>
            <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
          </div>
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400
              text-white text-sm font-semibold px-4 py-2.5 rounded-xl
              transition-all active:scale-95"
          >
            <Plus size={15} strokeWidth={2.5} />
            Create Workout
          </button>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* My Workouts row */}
        <button
          onClick={onGoMyWorkouts}
          className="w-full flex items-center justify-between
            bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4 mb-6
            hover:border-zinc-700 hover:bg-zinc-800/60 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20
              flex items-center justify-center flex-shrink-0">
              <Dumbbell size={17} className="text-indigo-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white text-[15px] leading-tight">My Workouts</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {workouts.length === 0
                  ? 'No saved workouts'
                  : `${workouts.length} saved workout${workouts.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-600 flex-shrink-0" />
        </button>

        {/* Muscle group tiles */}
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mb-3">
          MUSCLE GROUPS
        </p>
        <div className="grid grid-cols-2 gap-3">
          {MUSCLE_TILES.map(tile => {
            const count = getTileExercises(tile.id).length
            return (
              <button
                key={tile.id}
                onClick={() => onGoMuscleGroup(tile)}
                className="text-left bg-zinc-900 border border-zinc-800 rounded-2xl
                  px-4 py-5 hover:border-zinc-700 hover:bg-zinc-800/60
                  active:scale-[0.98] transition-all"
              >
                <p className={`text-base font-bold leading-tight mb-1 ${tile.color}`}>
                  {tile.label}
                </p>
                <p className="text-xs text-zinc-600">{count} exercises</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Muscle group screen ────────────────────────────────────────────────────────
function MuscleGroupScreen({ tile, onBack, favorites, onToggleFavorite, onSelectExercise }) {
  const [search, setSearch] = useState('')

  const allExercises = useMemo(() => getTileExercises(tile.id), [tile.id])
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allExercises.filter(e => e.name.toLowerCase().includes(q))
  }, [allExercises, search])

  return (
    <div className="min-h-dvh pb-28">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm
        px-4 pt-6 pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-800 border border-zinc-700
              text-zinc-400 hover:text-white transition-all flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className={`text-[10px] uppercase tracking-widest font-medium ${tile.color}`}>
              MUSCLE GROUP
            </p>
            <h1 className="text-2xl font-bold tracking-tight truncate">{tile.label}</h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tile.label}…`}
            className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl
              pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600
              focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No exercises found</p>
          </div>
        ) : (
          filtered.map(ex => (
            <ExerciseCard
              key={ex.name}
              exercise={ex}
              isFavorite={favorites.includes(ex.name)}
              onFavorite={e => { e.stopPropagation(); onToggleFavorite(ex.name) }}
              onTap={() => onSelectExercise(ex)}
              selectionMode={false}
              isSelected={false}
              onToggleSelect={() => {}}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── My Workouts screen ────────────────────────────────────────────────────────
function MyWorkoutsScreen({ workouts, onBack, onSelectWorkout }) {
  return (
    <div className="min-h-dvh pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm
        px-4 pt-6 pb-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-800 border border-zinc-700
              text-zinc-400 hover:text-white transition-all flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">SAVED</p>
            <h1 className="text-2xl font-bold tracking-tight">My Workouts</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {workouts.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Dumbbell size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-zinc-500">No workouts yet.</p>
            <p className="text-xs text-zinc-600 mt-1">Tap + Create Workout to get started.</p>
          </div>
        ) : (
          workouts.map(workout => (
            <button
              key={workout.id}
              onClick={() => onSelectWorkout(workout)}
              className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl
                px-4 py-4 hover:border-zinc-700 hover:bg-zinc-800/60
                active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-[15px] truncate">{workout.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight size={18} className="text-zinc-600 flex-shrink-0" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ── Workout detail screen ─────────────────────────────────────────────────────
function WorkoutDetailScreen({ workout, onBack, onEdit, onDelete, onStartWorkout }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  if (!workout) return null

  return (
    <div className="min-h-dvh pb-40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm
        px-4 pt-6 pb-4 border-b border-zinc-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-zinc-800 border border-zinc-700
                text-zinc-400 hover:text-white transition-all flex-shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">WORKOUT</p>
              <h1 className="text-2xl font-bold tracking-tight truncate">{workout.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(workout)}
              className="p-2 rounded-xl bg-zinc-800 border border-zinc-700
                text-zinc-400 hover:text-white transition-all"
              aria-label="Edit workout"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl bg-zinc-800 border border-zinc-700
                text-zinc-500 hover:text-red-400 transition-all"
              aria-label="Delete workout"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-4 pt-5">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mb-3">
          {workout.exercises.length} EXERCISE{workout.exercises.length !== 1 ? 'S' : ''}
        </p>
        <div className="flex flex-col gap-2">
          {workout.exercises.map((name, i) => {
            const ex = EXERCISE_DATA.find(e => e.name === name)
            return (
              <div
                key={name}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800
                  rounded-xl px-4 py-3"
              >
                <span className="text-xs text-zinc-600 font-mono w-4 flex-shrink-0 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{name}</p>
                  {ex && (
                    <p className={`text-xs mt-0.5 ${GROUP_COLOR[ex.displayGroup] || 'text-zinc-500'}`}>
                      {ex.primaryMuscle}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Start Workout — fixed above bottom nav */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-[55]">
        <button
          onClick={onStartWorkout}
          className="w-full py-4 rounded-2xl font-semibold text-[15px]
            bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30
            active:scale-[0.98] transition-all"
        >
          Start Workout
        </button>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          workoutName={workout.name}
          onConfirm={() => { setShowDeleteConfirm(false); onDelete(workout.id) }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

// ── Selection / edit mode view ────────────────────────────────────────────────
function SelectionView({
  workoutName, onChangeName, selectionContext,
  selectedExercises, onToggleSelected,
  onCancel, onSave,
  favorites, onToggleFavorite, onSelectExercise,
}) {
  const [search, setSearch]           = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return EXERCISE_DATA.filter(ex => {
      const matchSearch = ex.name.toLowerCase().includes(q)
      const matchFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Favorites' && favorites.includes(ex.name)) ||
        ex.displayGroup === activeFilter
      return matchSearch && matchFilter
    })
  }, [search, activeFilter, favorites])

  const isEdit = selectionContext === 'edit'

  return (
    <div className="min-h-dvh pb-40">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm
        px-4 pt-6 pb-3 border-b border-zinc-900">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mb-1">
              {isEdit ? 'EDITING WORKOUT' : 'CREATING WORKOUT'}
            </p>
            {isEdit ? (
              /* Editable name when editing */
              <input
                value={workoutName}
                onChange={e => onChangeName(e.target.value)}
                className="text-2xl font-bold bg-transparent text-white w-full
                  border-b border-zinc-700 focus:outline-none focus:border-indigo-500
                  pb-0.5 transition-colors truncate"
              />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight truncate">{workoutName}</h1>
            )}
          </div>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700
              border border-zinc-700 text-zinc-300 text-sm font-semibold
              px-3.5 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0"
          >
            <X size={14} strokeWidth={2.5} />
            Cancel
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {LIST_FILTERS.map(g => (
            <button
              key={g}
              onClick={() => setActiveFilter(g)}
              className={`
                flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                ${activeFilter === g
                  ? g === 'Favorites'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600 hover:text-zinc-300'
                }
              `}
            >
              {g === 'Favorites' && <span className="mr-1">★</span>}
              {g}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl
              pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600
              focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Vertical selection tracker ────────────────────────────────── */}
      {selectedExercises.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium mb-2">
            Selected · {selectedExercises.length}
          </p>
          <div className="flex flex-col gap-1.5">
            {selectedExercises.map((name, i) => (
              <div
                key={name}
                className="flex items-center justify-between
                  bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-zinc-600 font-mono w-4 flex-shrink-0 text-right">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-zinc-300 truncate">{name}</span>
                </div>
                <button
                  onClick={() => onToggleSelected(name)}
                  className="flex-shrink-0 ml-2 p-1 rounded text-zinc-600
                    hover:text-zinc-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No exercises found</p>
          </div>
        ) : (
          filtered.map(ex => (
            <ExerciseCard
              key={ex.name}
              exercise={ex}
              isFavorite={favorites.includes(ex.name)}
              onFavorite={e => { e.stopPropagation(); onToggleFavorite(ex.name) }}
              onTap={() => onSelectExercise(ex)}
              selectionMode
              isSelected={selectedExercises.includes(ex.name)}
              onToggleSelect={e => { e.stopPropagation(); onToggleSelected(ex.name) }}
            />
          ))
        )}
      </div>

      {/* Fixed Save / Update button */}
      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-[55]">
        <button
          onClick={onSave}
          disabled={selectedExercises.length === 0}
          className={`
            w-full py-4 rounded-2xl font-semibold text-[15px] transition-all
            ${selectedExercises.length > 0
              ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30 active:scale-[0.98]'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }
          `}
        >
          {selectedExercises.length > 0
            ? `${isEdit ? 'Update' : 'Save'} "${workoutName}" · ${selectedExercises.length} exercise${selectedExercises.length !== 1 ? 's' : ''}`
            : 'Select exercises to save'
          }
        </button>
      </div>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function ExerciseCard({
  exercise, isFavorite, onFavorite, onTap,
  selectionMode, isSelected, onToggleSelect,
}) {
  const { name, primaryMuscle, secondaryMuscles, displayGroup } = exercise
  const colorClass = GROUP_COLOR[displayGroup] || 'text-zinc-400'

  return (
    <button
      onClick={onTap}
      className={`
        w-full text-left rounded-2xl px-4 py-3.5 transition-all
        ${selectionMode && isSelected
          ? 'bg-indigo-500/10 border border-indigo-500/40'
          : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
        }
        ${selectionMode ? '' : 'active:scale-[0.99]'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-[15px] leading-snug truncate
            ${isSelected && selectionMode ? 'text-indigo-100' : 'text-white'}`}>
            {name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs font-medium ${colorClass}`}>{primaryMuscle}</span>
            {secondaryMuscles && secondaryMuscles !== 'None' && secondaryMuscles !== 'None (Isolation)' && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-xs text-zinc-600 truncate">{secondaryMuscles}</span>
              </>
            )}
          </div>
        </div>

        {selectionMode ? (
          <button
            onClick={onToggleSelect}
            className={`
              mt-0.5 w-7 h-7 rounded-full flex items-center justify-center
              flex-shrink-0 transition-all active:scale-90
              ${isSelected
                ? 'bg-indigo-500 text-white'
                : 'bg-zinc-800 border border-zinc-600 text-zinc-500 hover:border-indigo-500/60 hover:text-indigo-400'
              }
            `}
          >
            {isSelected ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
          </button>
        ) : (
          <button
            onClick={onFavorite}
            className="mt-0.5 p-1 -mr-1 rounded-lg transition-all active:scale-90"
          >
            <Star
              size={16}
              className={`transition-all ${
                isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-700 hover:text-zinc-500'
              }`}
            />
          </button>
        )}
      </div>
    </button>
  )
}

function ExerciseDetailSheet({ exercise, isFavorite, onToggleFavorite, onClose }) {
  const { name, primaryMuscle, secondaryMuscles, displayGroup, description } = exercise
  const [animIn, setAnimIn] = useState(false)
  const colorClass = GROUP_COLOR[displayGroup] || 'text-zinc-400'

  useEffect(() => { requestAnimationFrame(() => setAnimIn(true)) }, [])

  function handleClose() { setAnimIn(false); setTimeout(onClose, 280) }

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300
          ${animIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          ${animIn ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>
        <div className="px-5 pb-10 pt-3 max-h-[75vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-widest ${colorClass} mb-1`}>
                {displayGroup}
              </p>
              <h2 className="text-2xl font-bold text-white leading-tight">{name}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={onToggleFavorite}
                className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 transition-all active:scale-90"
              >
                <Star size={18}
                  className={`transition-all ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`} />
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400
                  hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <MuscleTag label={primaryMuscle} primary colorClass={colorClass} />
            {secondaryMuscles.split(',').map(m => m.trim())
              .filter(m => m && m !== 'None' && m !== 'None (Isolation)')
              .map(m => <MuscleTag key={m} label={m} />)}
          </div>

          <div className="border-t border-zinc-800 mb-5" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Why It Works
          </p>
          <p className="text-zinc-300 text-[15px] leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

function MuscleTag({ label, primary, colorClass }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold
      ${primary
        ? `bg-zinc-800 border border-zinc-700 ${colorClass}`
        : 'bg-zinc-800/60 border border-zinc-800 text-zinc-500'
      }`}>
      {label}
    </span>
  )
}

function NameModal({ onClose, onAddExercises }) {
  const [name, setName]     = useState('')
  const [animIn, setAnimIn] = useState(false)
  const inputRef            = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      setAnimIn(true)
      setTimeout(() => inputRef.current?.focus(), 200)
    })
  }, [])

  function handleClose() { setAnimIn(false); setTimeout(onClose, 200) }

  function handleAdd() {
    if (!name.trim()) { inputRef.current?.focus(); return }
    onAddExercises(name.trim())
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200
          ${animIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full max-w-[320px] bg-zinc-900 border border-zinc-700/80
          rounded-2xl shadow-2xl p-5 transition-all duration-200
          ${animIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">New Workout</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleClose() }}
          placeholder="Workout name…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl
            px-3.5 py-3 text-sm text-white placeholder-zinc-600
            focus:outline-none focus:border-indigo-500 transition-colors mb-3"
        />
        <button
          onClick={handleAdd}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]
            ${name.trim()
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
        >
          Add Exercises
        </button>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ workoutName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-[300px] bg-zinc-900 border border-zinc-700/80
        rounded-2xl shadow-2xl p-5">
        <h2 className="text-base font-bold text-white mb-2">Delete Workout?</h2>
        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
          "{workoutName}" will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-zinc-800
              text-zinc-300 hover:bg-zinc-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold
              bg-red-500/20 border border-red-500/30 text-red-400
              hover:bg-red-500/30 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
