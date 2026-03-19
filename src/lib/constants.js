export const STORAGE_KEY = 'workoutLog'

export const WORKOUT_TYPES = {
  UPPER: 'Upper Body',
  LEGS: 'Leg Day',
}

export const EXERCISES = {
  [WORKOUT_TYPES.UPPER]: [
    'Barbell Bench Press',
    'Lat Pulldown',
    'Incline DB Press',
    'Seated Cable Row',
    'Barbell Row',
    'Dumbbell Flyes',
    'One-Arm DB Row',
  ],
  [WORKOUT_TYPES.LEGS]: [
    'Back Squat',
    'Deadlift',
    'Leg Extension',
    'Lying Leg Curl',
    'Bulgarian Split Squat',
  ],
}

export const KEY_LIFTS = ['Barbell Bench Press', 'Back Squat', 'Deadlift']

export const LIFT_COLORS = {
  'Barbell Bench Press': '#6366f1',
  'Back Squat': '#22d3ee',
  Deadlift: '#f59e0b',
}
