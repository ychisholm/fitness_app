import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, Star, X, Plus, Check, BookOpen } from 'lucide-react'
import { EXERCISE_DATA, FILTER_GROUPS, GROUP_COLOR } from '../lib/exerciseData'

// ── Persistence helpers ────────────────────────────────────────────────────────
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem('exerciseFavorites') || '[]') }
  catch { return [] }
}
function saveFavorites(arr) {
  localStorage.setItem('exerciseFavorites', JSON.stringify(arr))
}
function saveCustomWorkout(workout) {
  try {
    const list = JSON.parse(localStorage.getItem('customWorkouts') || '[]')
    list.push(workout)
    localStorage.setItem('customWorkouts', JSON.stringify(list))
  } catch { /* ignore */ }
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Exercises() {
  const [search, setSearch]                   = useState('')
  const [activeFilter, setActiveFilter]       = useState('All')
  const [favorites, setFavorites]             = useState(loadFavorites)
  const [selectedExercise, setSelectedEx]     = useState(null)

  // Create workout flow
  const [showNameModal, setShowNameModal]     = useState(false)
  const [selectionMode, setSelectionMode]     = useState(false)
  const [workoutName, setWorkoutName]         = useState('')
  const [selectedExercises, setSelectedExercises] = useState([])

  function toggleFavorite(name) {
    setFavorites(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
      saveFavorites(next)
      return next
    })
  }

  // Called from NameModal when user taps "Add Exercises"
  function enterSelectionMode(name) {
    setWorkoutName(name)
    setShowNameModal(false)
    setSelectionMode(true)
    setSelectedExercises([])
  }

  function cancelSelection() {
    setSelectionMode(false)
    setWorkoutName('')
    setSelectedExercises([])
  }

  function toggleSelected(name) {
    setSelectedExercises(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  function handleSaveWorkout() {
    if (!workoutName.trim() || selectedExercises.length === 0) return
    saveCustomWorkout({
      id: Date.now().toString(),
      name: workoutName.trim(),
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
    })
    cancelSelection()
  }

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

  return (
    <div className={`min-h-dvh ${selectionMode ? 'pb-40' : 'pb-28'}`}>

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm px-4 pt-6 pb-3 border-b border-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
              {selectionMode ? 'CREATING WORKOUT' : 'LIBRARY'}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectionMode ? workoutName : 'Exercises'}
            </h1>
          </div>

          {selectionMode ? (
            <button
              onClick={cancelSelection}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700
                border border-zinc-700 text-zinc-300 text-sm font-semibold
                px-4 py-2.5 rounded-xl transition-all active:scale-95"
            >
              <X size={14} strokeWidth={2.5} />
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setShowNameModal(true)}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400
                text-white text-sm font-semibold px-4 py-2.5 rounded-xl
                transition-all active:scale-95"
            >
              <Plus size={15} strokeWidth={2.5} />
              Create
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTER_GROUPS.map(group => (
            <FilterPill
              key={group}
              label={group}
              active={activeFilter === group}
              isFav={group === 'Favorites'}
              onClick={() => setActiveFilter(group)}
            />
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
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

      {/* ── Selection tracker bar ───────────────────────────────────────── */}
      {selectionMode && selectedExercises.length > 0 && (
        <div className="px-4 pt-3">
          <div
            className="flex gap-2 overflow-x-auto py-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {selectedExercises.map(name => (
              <div
                key={name}
                className="flex-shrink-0 flex items-center gap-1.5
                  bg-indigo-500/10 border border-indigo-500/25
                  rounded-full pl-3 pr-1.5 py-1"
              >
                <span className="text-xs font-medium text-indigo-300 whitespace-nowrap">
                  {name}
                </span>
                <button
                  onClick={() => toggleSelected(name)}
                  className="w-4 h-4 flex items-center justify-center
                    rounded-full bg-indigo-500/20 hover:bg-indigo-500/40
                    text-indigo-400 transition-colors flex-shrink-0"
                >
                  <X size={9} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Exercise list ──────────────────────────────────────────────── */}
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
              onFavorite={e => { e.stopPropagation(); toggleFavorite(ex.name) }}
              onTap={() => !selectionMode && setSelectedEx(ex)}
              selectionMode={selectionMode}
              isSelected={selectedExercises.includes(ex.name)}
              onToggleSelect={e => { e.stopPropagation(); toggleSelected(ex.name) }}
            />
          ))
        )}
      </div>

      {/* ── Save Workout fixed button (selection mode only) ─────────────── */}
      {selectionMode && (
        <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-[55]">
          <button
            onClick={handleSaveWorkout}
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
              ? `Save "${workoutName}" · ${selectedExercises.length} exercise${selectedExercises.length !== 1 ? 's' : ''}`
              : 'Select exercises to save'
            }
          </button>
        </div>
      )}

      {/* ── Exercise detail sheet ──────────────────────────────────────── */}
      {selectedExercise && (
        <ExerciseDetailSheet
          exercise={selectedExercise}
          isFavorite={favorites.includes(selectedExercise.name)}
          onToggleFavorite={() => toggleFavorite(selectedExercise.name)}
          onClose={() => setSelectedEx(null)}
        />
      )}

      {/* ── Name modal ─────────────────────────────────────────────────── */}
      {showNameModal && (
        <NameModal
          onClose={() => setShowNameModal(false)}
          onAddExercises={enterSelectionMode}
        />
      )}
    </div>
  )
}

// ── Filter pill ────────────────────────────────────────────────────────────────
function FilterPill({ label, active, isFav, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all
        ${active
          ? isFav
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600 hover:text-zinc-300'
        }
      `}
    >
      {isFav && <span className="mr-1">★</span>}
      {label}
    </button>
  )
}

// ── Exercise card ──────────────────────────────────────────────────────────────
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
          <p className={`font-semibold text-[15px] leading-snug truncate ${isSelected && selectionMode ? 'text-indigo-100' : 'text-white'}`}>
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
          // ── Selection mode: + / ✓ button ──────────────────────────────
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
            {isSelected
              ? <Check size={14} strokeWidth={2.5} />
              : <Plus  size={14} strokeWidth={2.5} />
            }
          </button>
        ) : (
          // ── Default mode: star ─────────────────────────────────────────
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

// ── Small centered name modal ──────────────────────────────────────────────────
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

  function handleClose() {
    setAnimIn(false)
    setTimeout(onClose, 200)
  }

  function handleAddExercises() {
    if (!name.trim()) { inputRef.current?.focus(); return }
    onAddExercises(name.trim())
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') handleAddExercises()
    if (e.key === 'Escape') handleClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${animIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Floating card */}
      <div
        className={`
          relative w-full max-w-[320px]
          bg-zinc-900 border border-zinc-700/80
          rounded-2xl shadow-2xl p-5
          transition-all duration-200
          ${animIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">New Workout</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Name input */}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Workout name…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl
            px-3.5 py-3 text-sm text-white placeholder-zinc-600
            focus:outline-none focus:border-indigo-500 transition-colors mb-3"
        />

        {/* Add Exercises button */}
        <button
          onClick={handleAddExercises}
          className={`
            w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]
            ${name.trim()
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          Add Exercises
        </button>
      </div>
    </div>
  )
}

// ── Exercise detail bottom sheet ───────────────────────────────────────────────
function ExerciseDetailSheet({ exercise, isFavorite, onToggleFavorite, onClose }) {
  const { name, primaryMuscle, secondaryMuscles, displayGroup, description } = exercise
  const [animIn, setAnimIn] = useState(false)
  const colorClass = GROUP_COLOR[displayGroup] || 'text-zinc-400'

  useEffect(() => {
    requestAnimationFrame(() => setAnimIn(true))
  }, [])

  function handleClose() {
    setAnimIn(false)
    setTimeout(onClose, 280)
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${animIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`
          absolute bottom-0 left-0 right-0
          bg-zinc-900 rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          ${animIn ? 'translate-y-0' : 'translate-y-full'}
        `}
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
                <Star
                  size={18}
                  className={`transition-all ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`}
                />
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <MuscleTag label={primaryMuscle} primary colorClass={colorClass} />
            {secondaryMuscles
              .split(',')
              .map(m => m.trim())
              .filter(m => m && m !== 'None' && m !== 'None (Isolation)')
              .map(m => <MuscleTag key={m} label={m} />)
            }
          </div>

          <div className="border-t border-zinc-800 mb-5" />

          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
              Why It Works
            </p>
            <p className="text-zinc-300 text-[15px] leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MuscleTag({ label, primary, colorClass }) {
  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-semibold
        ${primary
          ? `bg-zinc-800 border border-zinc-700 ${colorClass}`
          : 'bg-zinc-800/60 border border-zinc-800 text-zinc-500'
        }
      `}
    >
      {label}
    </span>
  )
}
