import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  minutes: number;
  running: boolean;
  deadline: number | null;
  remaining: number | null; // Store remaining milliseconds when paused
  setMinutes: (minutes: number) => void;
  startTimer: (minutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  increaseTimer: (amountMinutes: number) => void;
  decreaseTimer: (amountMinutes: number) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      minutes: 10,
      running: false,
      deadline: null,
      remaining: null,

      setMinutes: (minutes) => set({ minutes }),

      startTimer: (minutes) => {
        const durationMinutes = minutes !== undefined ? minutes : get().minutes;
        const durationMs = durationMinutes * 60 * 1000;
        const deadline = Date.now() + durationMs;
        set({ 
          running: true, 
          deadline, 
          minutes: durationMinutes,
          remaining: null 
        });
      },

      pauseTimer: () => {
        const { deadline } = get();
        if (deadline) {
          const remaining = Math.max(0, deadline - Date.now());
          set({ running: false, remaining, deadline: null });
        } else {
          set({ running: false });
        }
      },

      resumeTimer: () => {
        const { remaining, minutes } = get();
        if (remaining !== null) {
          const deadline = Date.now() + remaining;
          set({ running: true, deadline, remaining: null });
        } else {
          // Fallback if no remaining time stored, start fresh
          get().startTimer(minutes);
        }
      },

      resetTimer: () => set({ running: false, deadline: null, remaining: null }),

      increaseTimer: (amountMinutes) => {
        const { deadline, running, remaining } = get();
        if (running && deadline) {
            set({ deadline: deadline + amountMinutes * 60 * 1000 });
        } else if (!running && remaining !== null) {
            set({ remaining: remaining + amountMinutes * 60 * 1000 });
        } else {
            // If not running and no remaining, just update the base minutes
             set((state) => ({ minutes: state.minutes + amountMinutes }));
        }
      },

      decreaseTimer: (amountMinutes) => {
        const { deadline, running, remaining, minutes } = get();
        if (running && deadline) {
            const newDeadline = deadline - amountMinutes * 60 * 1000;
            // Don't go below now
            if (newDeadline > Date.now()) {
                set({ deadline: newDeadline });
            } else {
                // If decreasing below now, maybe just expire? Or cap at 1 min?
                // Let's cap at 1 minute from now for safety or just expire.
                // User said "decrease", so let's just subtract.
                set({ deadline: newDeadline });
            }
        } else if (!running && remaining !== null) {
            set({ remaining: Math.max(0, remaining - amountMinutes * 60 * 1000) });
        } else {
             set((state) => ({ minutes: Math.max(1, state.minutes - amountMinutes) }));
        }
      }
    }),
    {
      name: 'timer-storage',
    }
  )
);
