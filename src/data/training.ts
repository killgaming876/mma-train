export type Workout = {
  id: string;
  title: string;
  category: string;
  duration: string;
  intensity: string;
  description: string;
  exercises: string[];
};

export const workouts: Workout[] = [
  { id: 'foundation-01', title: 'Stance / distance', category: 'STRIKING', duration: '24 MIN', intensity: 'MODERATE', description: 'Build the quiet geometry behind every clean exchange.', exercises: ['Athletic stance reset', 'Forward / back step', 'Mirror shadowboxing'] },
  { id: 'conditioning-02', title: 'Engine room', category: 'CONDITIONING', duration: '32 MIN', intensity: 'HIGH', description: 'Short, technical intervals that keep your output sharp.', exercises: ['Jump rope cadence', 'Sprawl to stand', 'Nasal recovery walk'] },
  { id: 'defense-03', title: 'Guard / return', category: 'DEFENSE', duration: '28 MIN', intensity: 'CONTROLLED', description: 'Own the moment after contact. Protect, reset, respond.', exercises: ['High guard shell', 'Parry and frame', 'Exit on angle'] },
];

export const roadmapSteps = [
  { id: 'day-01', day: '01', title: 'The stance laboratory', category: 'FOUNDATION', duration: '24 MIN', difficulty: 'ENTRY', complete: false },
  { id: 'day-02', day: '02', title: 'Distance / rhythm', category: 'MOVEMENT', duration: '28 MIN', difficulty: 'ENTRY', complete: false },
  { id: 'day-03', day: '03', title: 'Guard / return', category: 'DEFENSE', duration: '28 MIN', difficulty: 'BUILD', complete: false },
  { id: 'day-04', day: '04', title: 'Engine room', category: 'CONDITIONING', duration: '32 MIN', difficulty: 'BUILD', complete: false },
  { id: 'day-05', day: '05', title: 'Combination study', category: 'STRIKING', duration: '36 MIN', difficulty: 'FOCUS', complete: false },
];

export const anatomyRegions = [
  { id: 'jaw', label: 'JAW REGION', region: 'HEAD / NECK', x: 0.56, y: 0.2, description: 'A mobile area to protect through posture, visual awareness, and a compact guard.', defensive: 'Keep the chin gently tucked and return hands to a usable guard after every action.', drill: 'Shadowbox with a reset cue: exhale, hands home, eyes level.' },
  { id: 'ribs', label: 'RIB CAGE', region: 'TORSO', x: 0.44, y: 0.43, description: 'The rib cage transfers force between the upper and lower body during rotation.', defensive: 'Use elbow position and trunk angle to keep the body compact while moving.', drill: 'Partner-free frame drill: rotate from the hips, then return to a stacked posture.' },
  { id: 'abdomen', label: 'CENTER LINE', region: 'TORSO', x: 0.54, y: 0.55, description: 'A useful reference for bracing, breathing, and maintaining balance under fatigue.', defensive: 'Avoid overextending; protect the center line with distance, frame, and footwork.', drill: 'Slow technical rounds with a three-second exhale on each reset.' },
  { id: 'thighs', label: 'LEAD LEG', region: 'LOWER BODY', x: 0.45, y: 0.74, description: 'The lead leg is an important base for pressure, balance, and safe movement.', defensive: 'Keep weight available to move. Do not lock the knee when changing direction.', drill: 'Step, settle, and pivot around a floor marker for three controlled rounds.' },
];

export const meals = [
  { id: 'breakfast', time: '07:30', name: 'BREAKFAST / THE START', tag: 'PROTEIN + CARB', ingredients: 'Eggs, sourdough, greens, citrus', description: 'A simple first meal for a steady training day.', macros: { protein: '28g', carbs: '42g', fats: '16g' } },
  { id: 'pre', time: '12:10', name: 'PRE-SESSION / IGNITION', tag: 'EASY FUEL', ingredients: 'Rice, banana, yogurt, sea salt', description: 'Light, familiar fuel before work. Keep the ritual repeatable.', macros: { protein: '18g', carbs: '54g', fats: '8g' } },
  { id: 'recovery', time: '18:45', name: 'RECOVERY / REBUILD', tag: 'REPAIR WINDOW', ingredients: 'Chicken or tofu, potatoes, greens', description: 'A colorful plate that supports recovery after a hard session.', macros: { protein: '36g', carbs: '58g', fats: '18g' } },
];
