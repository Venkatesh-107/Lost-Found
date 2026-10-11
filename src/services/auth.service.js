import pb from './pb'

export const authService = {
  /**
   * Logs a user in with their email and password.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} The authenticated user record
   */
  async login(email, password) {
    const authData = await pb.collection('users').authWithPassword(email, password)
    return authData.record
  },

  /**
   * Logs out the current user by clearing the PocketBase auth store.
   */
  logout() {
    pb.authStore.clear()
  },

  /**
   * Retrieves the currently logged-in user from the local auth store.
   * @returns {Object|null}
   */
  getCurrentUser() {
    return pb.authStore.isValid ? pb.authStore.model : null
  }
}
