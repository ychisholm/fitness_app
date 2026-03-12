export const FILTER_GROUPS = [
  'All', 'Favorites',
  'Chest', 'Back', 'Shoulders', 'Quads', 'Glutes', 'Arms', 'Core',
]

// Accent colour per muscle group (used for the card's left-border dot)
export const GROUP_COLOR = {
  Chest:     'text-indigo-400',
  Back:      'text-cyan-400',
  Shoulders: 'text-violet-400',
  Quads:     'text-cyan-400',
  Glutes:    'text-amber-400',
  Arms:      'text-indigo-400',
  Core:      'text-emerald-400',
}

export const EXERCISE_DATA = [
  // ── CHEST ───────────────────────────────────────────────────────────────
  {
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'Triceps, Shoulders',
    description: `The "king" of chest movements; allows for maximum weight load to build overall thickness.`,
  },
  {
    name: 'Dumbbell Bench Press',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'Triceps, Shoulders',
    description: `Offers a deeper stretch and more natural path than a barbell; fixes side-to-side imbalances.`,
  },
  {
    name: 'Incline DB Press',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Upper Chest', secondaryMuscles: 'Shoulders, Triceps',
    description: `Specifically targets the upper chest (clavicular head) to create a "full" look under the collarbone.`,
  },
  {
    name: 'Weighted Dips',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'Triceps, Shoulders',
    description: `The "upper body squat"; excellent for the lower chest and building raw pressing power.`,
  },
  {
    name: 'Push-ups',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'Triceps, Core',
    description: `Highly versatile; builds foundational stability and can be easily modified for difficulty.`,
  },
  {
    name: 'Cable Crossover',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'None (Isolation)',
    description: `Provides constant tension throughout the range of motion, which is great for muscle "pump."`,
  },
  {
    name: 'Pec Deck Machine',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'None (Isolation)',
    description: `Removes the need for stability, allowing you to focus entirely on squeezing the chest to failure.`,
  },
  {
    name: 'Dumbbell Flyes',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'Shoulders',
    description: `Focuses on the "stretch" at the bottom of the move, which is a major trigger for muscle growth.`,
  },
  {
    name: 'Machine Chest Press',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'Triceps',
    description: `Safest way to train to absolute failure without needing a spotter.`,
  },
  {
    name: 'Dumbbell Pullover',
    muscleGroup: 'Chest', displayGroup: 'Chest',
    primaryMuscle: 'Chest', secondaryMuscles: 'Lats, Triceps',
    description: `A classic move that expands the rib cage area and hits the serratus (muscles over the ribs).`,
  },

  // ── BACK ────────────────────────────────────────────────────────────────
  {
    name: 'Deadlift',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Lower Back / Glutes', secondaryMuscles: 'Hamstrings, Traps',
    description: `The ultimate total-body strength builder; develops the entire posterior chain and core.`,
  },
  {
    name: 'Pull-ups / Chin-ups',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Lats', secondaryMuscles: 'Biceps, Forearms',
    description: `The gold standard for back width (lats) and functional upper body pulling strength.`,
  },
  {
    name: 'Barbell Row',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Mid-Back / Lats', secondaryMuscles: 'Biceps, Core',
    description: `Essential for back "thickness"; teaches the body to stay stable while pulling heavy weight.`,
  },
  {
    name: 'Lat Pulldown',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Lats', secondaryMuscles: 'Biceps',
    description: `Allows for high-volume training of the lats; easier to control than bodyweight pull-ups.`,
  },
  {
    name: 'Seated Cable Row',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Mid-Back', secondaryMuscles: 'Biceps, Rear Delts',
    description: `Excellent for the rhomboids and mid-traps, helping to pull the shoulders back for better posture.`,
  },
  {
    name: 'One-Arm DB Row',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Lats', secondaryMuscles: 'Biceps',
    description: `Allows for a massive range of motion and a deep stretch in the lats.`,
  },
  {
    name: 'T-Bar Row',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Mid-Back', secondaryMuscles: 'Biceps',
    description: `A heavy compound move that targets the center of the back for that "thick" look.`,
  },
  {
    name: 'Face Pulls',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Rear Delts', secondaryMuscles: 'Traps',
    description: `Crucial for shoulder health and "rear delt" development; fixes the "hunched" gym posture.`,
  },
  {
    name: 'Back Extensions',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Lower Back', secondaryMuscles: 'Glutes',
    description: `Isolates the lower back muscles (erectors) to protect the spine during other big lifts.`,
  },
  {
    name: 'Barbell Shrugs',
    muscleGroup: 'Back', displayGroup: 'Back',
    primaryMuscle: 'Traps', secondaryMuscles: 'Forearms',
    description: `The most direct way to build the trapezius muscles for a powerful upper-back look.`,
  },

  // ── SHOULDERS ───────────────────────────────────────────────────────────
  {
    name: 'Overhead Press',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Shoulders', secondaryMuscles: 'Triceps, Upper Chest',
    description: `The foundation of shoulder strength; builds massive power and stability in the deltoids.`,
  },
  {
    name: 'DB Lateral Raise',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Side Delts', secondaryMuscles: 'Traps',
    description: `The #1 move for the "side delt," which creates the width that makes the waist look smaller.`,
  },
  {
    name: 'DB Shoulder Press',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Shoulders', secondaryMuscles: 'Triceps',
    description: `Allows the wrists to rotate naturally, making it often more "joint-friendly" than the barbell.`,
  },
  {
    name: 'Arnold Press',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Shoulders', secondaryMuscles: 'Triceps',
    description: `Increases the time under tension and rotates the muscle through multiple angles in one rep.`,
  },
  {
    name: 'Rear Delt Fly',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Rear Delts', secondaryMuscles: 'Mid-Back',
    description: `Targets the back of the shoulder, which is vital for a rounded, "3D" shoulder appearance.`,
  },
  {
    name: 'Front Raise',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Front Delts', secondaryMuscles: 'Traps',
    description: `Directly isolates the front part of the shoulder (anterior delt).`,
  },
  {
    name: 'Upright Row',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Side Delts', secondaryMuscles: 'Traps',
    description: `Combines side delt work with trap engagement; effective for building the "yoke."`,
  },
  {
    name: 'Push Press',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Shoulders', secondaryMuscles: 'Triceps, Legs',
    description: `A power move using the legs to drive weight up; great for handling heavier-than-usual loads.`,
  },
  {
    name: 'Landmine Press',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Front Delts', secondaryMuscles: 'Triceps, Core',
    description: `Offers a unique angle that is very safe for the shoulder joint while building pressing power.`,
  },
  {
    name: 'Machine Press',
    muscleGroup: 'Shoulders', displayGroup: 'Shoulders',
    primaryMuscle: 'Shoulders', secondaryMuscles: 'Triceps',
    description: `Great for maintaining constant tension on the delts without worrying about balance.`,
  },

  // ── QUADS ───────────────────────────────────────────────────────────────
  {
    name: 'Back Squat',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Glutes, Hamstrings',
    description: `The "King"; creates a massive hormonal and growth response in the entire lower body.`,
  },
  {
    name: 'Front Squat',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Core, Upper Back',
    description: `Shifts the weight forward, forcing the quads and the core to work much harder.`,
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Glutes',
    description: `Allows you to move massive weight and high volume with zero strain on the lower back.`,
  },
  {
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Glutes',
    description: `The best single-leg move; forces each leg to work independently to fix muscle gaps.`,
  },
  {
    name: 'Leg Extension',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'None (Isolation)',
    description: `The only move that completely isolates the quads at the end of the range of motion.`,
  },
  {
    name: 'Hack Squat',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Glutes',
    description: `Provides a fixed path that allows you to go very deep, putting maximum stress on the quads.`,
  },
  {
    name: 'Walking Lunges',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Glutes, Hamstrings',
    description: `Combines strength with balance and "real-world" athletic movement.`,
  },
  {
    name: 'Goblet Squat',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Core',
    description: `The best way for beginners to learn the squat pattern while still building serious leg strength.`,
  },
  {
    name: 'Step-ups',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Glutes',
    description: `Great for explosive power and building the "teardrop" muscle just above the knee.`,
  },
  {
    name: 'Sissy Squat',
    muscleGroup: 'Quads', displayGroup: 'Quads',
    primaryMuscle: 'Quads', secondaryMuscles: 'Core',
    description: `An old-school move that puts an incredible stretch on the quads for unique growth.`,
  },

  // ── GLUTES / HAMSTRINGS ─────────────────────────────────────────────────
  {
    name: 'Romanian Deadlift',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Hamstrings', secondaryMuscles: 'Glutes, Lower Back',
    description: `The gold standard for hamstring growth; focuses on the "stretch" under heavy weight.`,
  },
  {
    name: 'Hip Thrust',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Glutes', secondaryMuscles: 'Hamstrings',
    description: `The most effective exercise ever tested for building the glutes specifically.`,
  },
  {
    name: 'Lying Leg Curl',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Hamstrings', secondaryMuscles: 'None (Isolation)',
    description: `Isolates the hamstrings via knee flexion, which is a function deadlifts don't hit.`,
  },
  {
    name: 'Sumo Deadlift',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Glutes / Quads', secondaryMuscles: 'Hamstrings',
    description: `The wide stance targets the glutes and "inner thighs" more than the standard version.`,
  },
  {
    name: 'Glute-Ham Raise',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Hamstrings', secondaryMuscles: 'Glutes',
    description: `A bodyweight powerhouse that builds "bulletproof" hamstrings and lower back.`,
  },
  {
    name: 'Kettlebell Swings',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Glutes', secondaryMuscles: 'Hamstrings, Back',
    description: `Teaches explosive hip power and builds "snappy" glute strength.`,
  },
  {
    name: 'Seated Leg Curl',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Hamstrings', secondaryMuscles: 'None (Isolation)',
    description: `Recent studies show this grows the hamstrings even better than the lying version.`,
  },
  {
    name: 'Good Mornings',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Hamstrings', secondaryMuscles: 'Lower Back',
    description: `A heavy "hinge" move that builds the muscles that support your spine and hips.`,
  },
  {
    name: 'Glute Bridge',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Glutes', secondaryMuscles: 'Hamstrings',
    description: `A great high-rep move to finish a workout and get a massive glute "pump."`,
  },
  {
    name: 'Cable Kickbacks',
    muscleGroup: 'Ham/Glutes', displayGroup: 'Glutes',
    primaryMuscle: 'Glutes', secondaryMuscles: 'None (Isolation)',
    description: `Perfect for shaping the glutes from different angles to target the upper and side areas.`,
  },

  // ── ARMS ────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Curls',
    muscleGroup: 'Arms', displayGroup: 'Arms',
    primaryMuscle: 'Biceps', secondaryMuscles: 'Forearms',
    description: `The foundational mass builder for the biceps.`,
  },
  {
    name: 'Hammer Curls',
    muscleGroup: 'Arms', displayGroup: 'Arms',
    primaryMuscle: 'Biceps / Forearms', secondaryMuscles: 'None',
    description: `Targets the "brachialis" (under the bicep) to make the arm look thicker from the side.`,
  },
  {
    name: 'Tricep Pushdown',
    muscleGroup: 'Arms', displayGroup: 'Arms',
    primaryMuscle: 'Triceps', secondaryMuscles: 'None',
    description: `The go-to move for isolating the triceps; uses cables for constant tension.`,
  },
  {
    name: 'Skullcrushers',
    muscleGroup: 'Arms', displayGroup: 'Arms',
    primaryMuscle: 'Triceps', secondaryMuscles: 'None',
    description: `Specifically targets the "long head" of the tricep (the largest part of the arm).`,
  },
  {
    name: 'Dips (Arms focus)',
    muscleGroup: 'Arms', displayGroup: 'Arms',
    primaryMuscle: 'Triceps', secondaryMuscles: 'Shoulders',
    description: `Keeping the body upright targets the triceps more than the chest.`,
  },

  // ── CORE ────────────────────────────────────────────────────────────────
  {
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core', displayGroup: 'Core',
    primaryMuscle: 'Abs', secondaryMuscles: 'Hip Flexors',
    description: `The best move for the lower abs; also builds massive grip strength.`,
  },
  {
    name: 'Plank',
    muscleGroup: 'Core', displayGroup: 'Core',
    primaryMuscle: 'Core', secondaryMuscles: 'Shoulders',
    description: `Trains the core to "brace," which is vital for safety during squats and deadlifts.`,
  },
  {
    name: 'Ab Wheel Rollout',
    muscleGroup: 'Core', displayGroup: 'Core',
    primaryMuscle: 'Abs', secondaryMuscles: 'Lats',
    description: `One of the most "difficult" and effective ways to build deep abdominal strength.`,
  },
  {
    name: 'Cable Crunch',
    muscleGroup: 'Core', displayGroup: 'Core',
    primaryMuscle: 'Abs', secondaryMuscles: 'None',
    description: `Allows you to add weight to your abs, which is how you get them to "pop" through the skin.`,
  },
  {
    name: 'Russian Twist',
    muscleGroup: 'Core', displayGroup: 'Core',
    primaryMuscle: 'Obliques', secondaryMuscles: 'Abs',
    description: `The primary move for building the obliques (sides) and rotational power.`,
  },
]
