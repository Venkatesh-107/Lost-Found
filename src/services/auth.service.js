// ─────────────────────────────────────────────────────────────────────────────
// src/services/auth.service.js
// Authentication service — login, logout, session persistence
// Wraps PocketBase auth API with role-aware helpers
// ─────────────────────────────────────────────────────────────────────────────

import pb from './pb'

/**
 * @typedef {Object} AuthUser
 * @property {string} id       - PocketBase user ID
 * @property {string} email    - User email
 * @property {string} name     - Display name
 * @property {'admin'|'candidate'} role - User role
 * @property {string} token    - JWT auth token
 */

export const authService = {
  /**
   * Authenticates a user with email and password.
   * Returns a normalized user object with role.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<AuthUser>}
   * @throws Will throw if credentials are invalid
   */
  async login(email, password) {
    const result = await pb
      .collection('users')
      .authWithPassword(email, password)

    return {
      id:    result.record.id,
      email: result.record.email,
      name:  result.record.name  || '',
      role:  result.record.role,
      token: result.token,
    }
  },

  /**
   * Clears the current auth session from PocketBase and localStorage.
   */
  logout() {
    pb.authStore.clear()
  },

  /**
   * Returns the currently authenticated user if a valid session exists.
   * Returns null if not authenticated or token is expired.
   *
   * @returns {AuthUser|null}
   */
  getCurrentUser() {
    if (!pb.authStore.isValid) return null

    const record = pb.authStore.model
    return {
      id:    record.id,
      email: record.email,
      name:  record.name  || '',
      role:  record.role,
      token: pb.authStore.token,
    }
  },

  /**
   * Subscribes to auth state changes (login / logout / token refresh).
   *
   * @param {Function} callback - Called with (token, model) on change
   * @returns {Function} Unsubscribe function
   */
  onAuthChange(callback) {
    return pb.authStore.onChange(callback)
  },
}
