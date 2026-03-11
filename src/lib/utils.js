import { STORAGE_KEY, WORKOUT_TYPES, EXERCISES } from './constants'

// 1RM Epley formula
export function calc1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0
  if (reps === 1) return weight
  return weight / (1.0278 - 0.0278 * reps)
}

export function getWorkoutLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveWorkoutLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
}

export function saveWorkout(workout) {
  const log = getWorkoutLog()
  log.push(workout)
  saveWorkoutLog(log)
}

export function getSuggestedWorkoutType() {
  const log = getWorkoutLog()
  if (!log.length) return WORKOUT_TYPES.UPPER
  const last = log[log.length - 1]
  return last.type === WORKOUT_TYPES.LEGS ? WORKOUT_TYPES.UPPER : WORKOUT_TYPES.LEGS
}

export function getLastSetsForExercise(exerciseName) {
  const log = getWorkoutLog()
  for (let i = log.length - 1; i >= 0; i--) {
    const workout = log[i]
    const ex = workout.exercises?.find((e) => e.name === exerciseName)
    if (ex && ex.sets?.length) return ex.sets
  }
  return null
}

export function getBest1RMPerExercise() {
  const log = getWorkoutLog()
  const bests = {}
  for (const workout of log) {
    for (const ex of workout.exercises || []) {
      for (const set of ex.sets || []) {
        const rm = calc1RM(Number(set.weight), Number(set.reps))
        if (rm > (bests[ex.name] || 0)) bests[ex.name] = rm
      }
    }
  }
  return bests
}

export function get1RMHistory(exerciseName) {
  const log = getWorkoutLog()
  const points = []
  for (const workout of log) {
    const ex = workout.exercises?.find((e) => e.name === exerciseName)
    if (!ex) continue
    let best = 0
    for (const set of ex.sets || []) {
      const rm = calc1RM(Number(set.weight), Number(set.reps))
      if (rm > best) best = rm
    }
    if (best > 0) {
      points.push({ date: workout.date, value: Math.round(best) })
    }
  }
  return points
}

export function getVolumeHistory() {
  const log = getWorkoutLog()
  return log.map((workout) => {
    let volume = 0
    for (const ex of workout.exercises || []) {
      for (const set of ex.sets || []) {
        volume += Number(set.weight) * Number(set.reps)
      }
    }
    return {
      date: workout.date,
      type: workout.type,
      volume: Math.round(volume),
    }
  })
}

export function getDaysWithWorkouts() {
  const log = getWorkoutLog()
  return new Set(log.map((w) => w.date.slice(0, 10)))
}

export function getExerciseSessionHistory(exerciseName) {
  const log = getWorkoutLog()
  const sessions = []
  for (const workout of log) {
    const ex = workout.exercises?.find((e) => e.name === exerciseName)
    if (!ex || !ex.sets?.length) continue
    let volume = 0
    let maxWeight = 0
    let topSet = null
    let best1RM = 0
    for (const set of ex.sets) {
      const w = Number(set.weight)
      const r = Number(set.reps)
      if (!w || !r) continue
      volume += w * r
      if (w > maxWeight) {
        maxWeight = w
        topSet = { weight: w, reps: r }
      }
      const rm = calc1RM(w, r)
      if (rm > best1RM) best1RM = rm
    }
    if (volume > 0) {
      sessions.push({
        date: workout.date,
        maxWeight,
        volume: Math.round(volume),
        topSet,
        est1RM: Math.round(best1RM),
      })
    }
  }
  return sessions
}

export function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function buildEmptyWorkout(type) {
  const exerciseNames = EXERCISES[type] || []
  return {
    id: generateId(),
    date: new Date().toISOString(),
    type,
    exercises: exerciseNames.map((name) => ({
      name,
      sets: [
        { weight: '', reps: '', completed: false },
        { weight: '', reps: '', completed: false },
        { weight: '', reps: '', completed: false },
      ],
    })),
  }
}
