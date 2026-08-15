import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { roadmapSteps } from '../data/training';

export type UserProfile = {
  name: string;
  age: string;
  experience: string;
  goal: string;
  trainingDays: string;
  sessionDuration: string;
  conditioning: string;
  equipment: string;
  nutrition: string;
  sleep: string;
};

type MMAState = {
  profile: UserProfile | null;
  roadmap: typeof roadmapSteps;
  completedWorkouts: string[];
  trainingStreak: number;
  selectedBodyPart: string | null;
  activeMeal: string | null;
  setProfile: (profile: UserProfile) => void;
  completeWorkout: (id: string) => void;
  selectBodyPart: (id: string | null) => void;
  setActiveMeal: (id: string | null) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
};

export const useMMAStore = create<MMAState>()(
  persist(
    (set) => ({
      profile: null,
      roadmap: roadmapSteps,
      completedWorkouts: [],
      trainingStreak: 4,
      selectedBodyPart: null,
      activeMeal: null,
      setProfile: (profile) => set({ profile }),
      completeWorkout: (id) => set((state) => {
        if (state.completedWorkouts.includes(id)) return state;
        return {
          completedWorkouts: [...state.completedWorkouts, id],
          trainingStreak: state.trainingStreak + 1,
          roadmap: state.roadmap.map((step, index) => index === state.completedWorkouts.length ? { ...step, complete: true } : step),
        };
      }),
      selectBodyPart: (id) => set({ selectedBodyPart: id }),
      setActiveMeal: (id) => set({ activeMeal: id }),
      updateProfile: (profile) => set((state) => ({ profile: state.profile ? { ...state.profile, ...profile } : state.profile })),
    }),
    { name: 'forge-mma-state', partialize: (state) => ({ profile: state.profile, roadmap: state.roadmap, completedWorkouts: state.completedWorkouts, trainingStreak: state.trainingStreak }) },
  ),
);
