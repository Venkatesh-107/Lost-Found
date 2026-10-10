// ─────────────────────────────────────────────────────────────────────────────
// src/utils/tokenChain.js
// Claim Token Chain Generator
// Produces a SHA-256 derived token chained to the previous claimant's token.
// This creates an auditable, tamper-evident history of item claimants.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a SHA-256 chained claim token.
 *
 * The token is derived from:
 *   - `prevToken`    — the previous claimant's token (or post.id for genesis)
 *   - `candidateId`  — the claiming user's PocketBase ID
 *   - `timestamp`    — Unix timestamp in milliseconds
 *
 * This ensures:
 *   ✅ Each token is unique and deterministic
 *   ✅ Tokens form an auditable chain (each depends on the previous)
 *   ✅ Tampering with any token breaks the entire chain
 *
 * @param {string} prevToken    - Previous claim token (use post.id for first claim)
 * @param {string} candidateId  - User ID of the claimant
 * @param {number} timestamp    - Unix timestamp (e.g., Date.now())
 * @returns {Promise<string>}   - Hex-encoded SHA-256 token
 *
 * @example
 * // First claim (genesis)
 * const token = await generateClaimToken(post.id, user.id, Date.now())
 *
 * // Subsequent claim
 * const token = await generateClaimToken(prevToken, user.id, Date.now())
 */
export async function generateClaimToken(prevToken, candidateId, timestamp) {
  const raw     = `${prevToken}::${candidateId}::${timestamp}`
  const encoded = new TextEncoder().encode(raw)
  const hashBuf = await crypto.subtle.digest('SHA-256', encoded)
  const hashArr = Array.from(new Uint8Array(hashBuf))
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('')
}
