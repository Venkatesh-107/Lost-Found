import { create } from 'zustand'
import { authService } from '@/services/auth.service'

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true, // Used by App to show a loader until the session is checked

  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),

  // Resolves the initial session state from PocketBase on mount
  init: () => {
    const user = authService.getCurrentUser()
    set({ user, isLoading: false })
  }
}))
