import { create } from 'zustand';

interface OfflineStore {
  isOnline: boolean;
  pendingSyncCount: number;
  
  setOnlineStatus: (status: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  incrementPendingSync: () => void;
  decrementPendingSync: () => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: navigator.onLine,
  pendingSyncCount: 0,

  setOnlineStatus: (status) => {
    set({ isOnline: status });
  },

  setPendingSyncCount: (count) => {
    set({ pendingSyncCount: count });
  },

  incrementPendingSync: () => {
    set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
  },

  decrementPendingSync: () => {
    set((state) => ({
      pendingSyncCount: Math.max(0, state.pendingSyncCount - 1),
    }));
  },
}));