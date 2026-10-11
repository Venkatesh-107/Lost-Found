/**
 * Generates a SHA-256 chained claim token using browser native Crypto.
 *
 * The token is derived from:
 *   - `prevToken`    — the previous claimant's token (or post.id for genesis)
 *   - `candidateId`  — the claiming user's PocketBase ID
 *   - `timestamp`    — Unix timestamp in milliseconds
 *
 * @param {string} prevToken 
 * @param {string} candidateId 
 * @param {number} timestamp 
 * @returns {Promise<string>} Hex-encoded SHA-256 token
 */
export async function generateClaimToken(prevToken, candidateId, timestamp) {
  const raw = `${prevToken}::${candidateId}::${timestamp}`
  const encoded = new TextEncoder().encode(raw)
  const hashBuf = await crypto.subtle.digest('SHA-256', encoded)
  const hashArr = Array.from(new Uint8Array(hashBuf))
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('')
}
