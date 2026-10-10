// ─────────────────────────────────────────────────────────────────────────────
// src/services/pb.js
// PocketBase client singleton
// Import this wherever you need to interact with the PocketBase API.
// ─────────────────────────────────────────────────────────────────────────────

import PocketBase from 'pocketbase'

/**
 * Singleton PocketBase client instance.
 * The URL is read from the VITE_PB_URL environment variable.
 *
 * @type {PocketBase}
 */
const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090')

// Keep the auth store in sync automatically
pb.autoCancellation(false)

export default pb
