// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useAuth.js
// Auth hook — initializes session on mount and exposes current user state
// Use this in any component that needs to know who is logged in
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * Returns the current authenticated user and loading state.
 * Initializes the auth session from PocketBase's persisted store on first call.
 *
 * @returns {{ user: import('@/services/auth.service').AuthUser|null, isLoading: boolean }}
 *
 * @example
 * const { user, isLoading } = useAuth()
 * if (isLoading) return <Spinner />
 * if (!user)     return <Navigate to="/login" />
 */
export function useAuth() {
  const { user, isLoading, init } = useAuthStore()

  useEffect(() => {
    // Resolve session from PocketBase localStorage store on mount
    init()
  }, [init])

  return { user, isLoading }
}
