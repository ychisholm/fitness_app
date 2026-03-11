export const STORAGE_KEY = 'workoutLog'

export const WORKOUT_TYPES = {
  UPPER: 'Upper Body',
  LEGS: 'Leg Day',
}

export const EXERCISES = {
  [WORKOUT_TYPES.UPPER]: [
    'Barbell Bench Press',
    'Cable Lat Pulldown',
    'Incline Dumbbell Press',
    'Seated Cable Row',
    'Hammer Strength Row',
    'Dumbbell Chest Fly',
    'Single-Arm Dumbbell Row',
  ],
  [WORKOUT_TYPES.LEGS]: [
    'Barbell Squat',
    'Deadlift',
    'Leg Extension Machine',
    'Hamstring Curl Machine',
    'Bulgarian Split Squat',
  ],
}

export const KEY_LIFTS = ['Barbell Bench Press', 'Barbell Squat', 'Deadlift']

export const LIFT_COLORS = {
  'Barbell Bench Press': '#6366f1',
  'Barbell Squat': '#22d3ee',
  Deadlift: '#f59e0b',
}
