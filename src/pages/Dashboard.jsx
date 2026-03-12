import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap, Pencil } from 'lucide-react'
import { getSuggestedWorkoutType, getWorkoutLog, getDaysWithWorkouts, getBest1RMPerExercise } from '../lib/utils'
import { KEY_LIFTS, LIFT_COLORS } from '../lib/constants'

// ── Profile storage ───────────────────────────────────────────────────────────

function loadProfile() {
  try { return JSON.parse(localStorage.getItem('userProfile') || '{}') } catch { return {} }
}
function saveProfile(p) {
  localStorage.setItem('userProfile', JSON.stringify(p))
}

// ── Monthly calendar ──────────────────────────────────────────────────────────

function MonthlyCalendar({ workoutDays }) {
  const today    = new Date()
  const year     = today.getFullYear()
  const month    = today.getMonth()
  const todayStr = today.toISOString().slice(0, 10)

  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon-based
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div>
      <p className="text-sm font-semibold text-white mb-4">
        {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="text-center text-[10px] text-zinc-600 font-medium py-1">{l}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday    = dateStr === todayStr
          const hasWorkout = workoutDays.has(dateStr)
          return (
            <div key={dateStr} className="flex items-center justify-center py-0.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                  ${hasWorkout
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/40'
                    : isToday
                    ? 'border border-indigo-400 text-indigo-400'
                    : 'text-zinc-500'
                  }
                `}
              >
                {day}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Editable profile field ────────────────────────────────────────────────────

function ProfileField({ label, value, unit, placeholder, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value || '')
  const inputRef              = useRef(null)

  function startEdit() {
    setDraft(value || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commit() {
    setEditing(false)
    onSave(draft.trim())
  }

  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{label}</span>
        <button onClick={startEdit} className="text-zinc-600 hover:text-zinc-400 transition-colors">
          <Pencil size={11} />
        </button>
      </div>
      {editing ? (
        <div className="flex items-baseline gap-1">
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => e.key === 'Enter' && commit()}
            className="w-full bg-transparent text-xl font-bold text-white outline-none border-b border-indigo-500 pb-0.5"
            placeholder={placeholder}
          />
          {unit && <span className="text-xs text-zinc-500 flex-shrink-0">{unit}</span>}
        </div>
      ) : (
        <button onClick={startEdit} className="flex items-baseline gap-1 w-full text-left">
          {value ? (
            <>
              <span className="text-xl font-bold text-white">{value}</span>
              {unit && <span className="text-xs text-zinc-500">{unit}</span>}
            </>
          ) : (
            <span className="text-xl font-bold text-zinc-700">—</span>
          )}
        </button>
      )}
    </div>
  )
}

// ── Big 3 tile ────────────────────────────────────────────────────────────────

const BIG3 = [
  { key: 'Barbell Bench Press', label: 'Bench',    color: LIFT_COLORS['Barbell Bench Press'] },
  { key: 'Barbell Squat',       label: 'Squat',    color: LIFT_COLORS['Barbell Squat']       },
  { key: 'Deadlift',            label: 'Deadlift', color: LIFT_COLORS['Deadlift']             },
]

function Big3Tile({ label, color, value }) {
  return (
    <div
      className="flex-1 rounded-2xl p-3 flex flex-col gap-1 min-w-0"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <span className="text-[10px] font-medium uppercase tracking-widest truncate" style={{ color }}>
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

// ── Main export ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate  = useNavigate()
  const suggested = getSuggestedWorkoutType()
  const workoutDays = getDaysWithWorkouts()
  const bests1RM  = getBest1RMPerExercise()

  const [profile, setProfile] = useState(loadProfile)

  function updateField(field, value) {
    const next = { ...profile, [field]: value }
    setProfile(next)
    saveProfile(next)
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-28">
      {/* Header */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Today</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h1>
      </div>

      {/* Height & Weight */}
      <div className="flex gap-3">
        <ProfileField
          label="Height"
          value={profile.height}
          placeholder={`5'10"`}
          onSave={v => updateField('height', v)}
        />
        <ProfileField
          label="Weight"
          value={profile.weight}
          unit="lbs"
          placeholder="185"
          onSave={v => updateField('weight', v)}
        />
      </div>

      {/* Big 3 Est. 1RM */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-2.5">
          Big 3 Est. 1RM
        </p>
        <div className="flex gap-2.5">
          {BIG3.map(({ key, label, color }) => (
            <Big3Tile key={key} label={label} color={color} value={bests1RM[key] || 0} />
          ))}
        </div>
      </div>

      {/* Next Up card */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => navigate('/log')}
      >
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
            onClick={e => { e.stopPropagation(); navigate('/log') }}
          >
            Start Workout
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Monthly calendar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <MonthlyCalendar workoutDays={workoutDays} />
      </div>
    </div>
  )
}
