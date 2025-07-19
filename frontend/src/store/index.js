/**
 * Simple store implementation for the medical AI app
 */
import { create } from 'zustand';

// Auth store
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
}));

// Medical data store
export const useMedicalStore = create((set, get) => ({
  diagnoses: [],
  currentAnalysis: null,
  
  addDiagnosis: (diagnosis) => set((state) => ({
    diagnoses: [...state.diagnoses, diagnosis]
  })),
  
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  clearCurrentAnalysis: () => set({ currentAnalysis: null }),
}));

// UI store for notifications and state
export const useUIStore = create((set, get) => ({
  notifications: [],
  isLoading: false,
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const notificationWithId = { ...notification, id };
    set((state) => ({
      notifications: [...state.notifications, notificationWithId]
    }));
    return id;
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}));

// Performance monitoring store
export const usePerformanceStore = create((set, get) => ({
  apiCalls: [],
  
  recordApiCall: (duration, success) => {
    const call = {
      duration,
      success,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      apiCalls: [...state.apiCalls.slice(-99), call] // Keep last 100 calls
    }));
  },
  
  getAverageResponseTime: () => {
    const { apiCalls } = get();
    if (apiCalls.length === 0) return 0;
    
    const totalTime = apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return totalTime / apiCalls.length;
  },
}));