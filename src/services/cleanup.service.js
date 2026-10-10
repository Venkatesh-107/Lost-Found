// ─────────────────────────────────────────────────────────────────────────────
// src/services/cleanup.service.js
// Cleanup service — triggers the Node.js companion server's cleanup job
// Used by the admin dashboard to manually run or check cleanup status
// ─────────────────────────────────────────────────────────────────────────────

const NODE_API_BASE = '/node-api'

export const cleanupService = {
  /**
   * Manually triggers the 20-day claimed post cleanup job.
   * Calls the Node.js Express endpoint which runs the same logic as the cron.
   *
   * @returns {Promise<{ deleted: number, message: string }>}
   */
  async runCleanup() {
    const response = await fetch(`${NODE_API_BASE}/cleanup/run`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Cleanup trigger failed')
    return response.json()
  },

  /**
   * Fetches the status of the last cleanup run.
   *
   * @returns {Promise<{ lastRun: string, deletedCount: number }>}
   */
  async getStatus() {
    const response = await fetch(`${NODE_API_BASE}/cleanup/status`)
    if (!response.ok) throw new Error('Could not fetch cleanup status')
    return response.json()
  },
}
