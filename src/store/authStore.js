// ─────────────────────────────────────────────────────────────────────────────
// src/store/authStore.js
// Global authentication state — Zustand store
// Persists user session across components without prop drilling
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { authService } from '@/services/auth.service'

/**
 * @typedef {Object} AuthState
 * @property {import('@/services/auth.service').AuthUser|null} user - Current user
 * @property {boolean} isLoading - True while initial session is being resolved
 * @property {Function} setUser  - Set the authenticated user
 * @property {Function} clearUser - Clear auth state (logout)
 * @property {Function} init     - Resolve initial session from PocketBase store
 */

/** @type {import('zustand').UseBoundStore<AuthState>} */
export const useAuthStore = create((set) => ({
  user:      null,
  isLoading: true,

  /**
   * Sets the authenticated user in global state.
   * @param {import('@/services/auth.service').AuthUser} user
   */
  setUser: (user) => set({ user, isLoading: false }),

  /**
   * Clears the user from global state (on logout).
   */
  clearUser: () => set({ user: null, isLoading: false }),

  /**
   * Resolves the current user from PocketBase's persisted auth store.
   * Call this once on app startup (see useAuth hook).
   */
  init: () => {
    const user = authService.getCurrentUser()
    set({ user, isLoading: false })
  },
}))
