// ─────────────────────────────────────────────────────────────────────────────
// src/services/claim.service.js
// Claim service — Q&A fetching, answer evaluation, and token issuance
// Implements the CLAIM_AGENT business logic
// ─────────────────────────────────────────────────────────────────────────────

import pb from './pb'
import { generateClaimToken } from '@/utils/tokenChain'

const QUESTIONS_COLLECTION = 'item_questions'
const TOKENS_COLLECTION    = 'claim_tokens'
const ATTEMPTS_COLLECTION  = 'claim_attempts'

/**
 * @typedef {Object} Question
 * @property {string} id       - Record ID
 * @property {string} post_id  - Associated post ID
 * @property {string} question - Question text shown to candidate
 * @property {string} answer   - Correct answer (admin-set, hidden from candidate)
 */

/**
 * @typedef {Object} ClaimToken
 * @property {string} id           - Record ID
 * @property {string} post_id      - Associated post ID
 * @property {string} candidate_id - Claimant user ID
 * @property {string} token        - SHA-256 chained token
 * @property {string} prev_token   - Previous claimant's token
 * @property {'pending'|'approved'|'rejected'} status
 */

export const claimService = {
  /**
   * Fetches all rule-based questions for a specific post.
   * Note: The `answer` field is filtered out by PocketBase API rules
   * on the client side — only admins can read it.
   *
   * @param {string} postId - The post to get questions for
   * @returns {Promise<Question[]>}
   */
  async getQuestions(postId) {
    const result = await pb
      .collection(QUESTIONS_COLLECTION)
      .getFullList({ filter: `post_id = '${postId}'` })
    return result
  },

  /**
   * Creates a rule-based question for a post.
   *
   * @param {string} postId - Associated post ID
   * @param {string} question - Question text
   * @param {string} answer - Correct answer text
   */
  async createQuestion(postId, question, answer) {
    return pb.collection(QUESTIONS_COLLECTION).create({
      post_id: postId,
      question: question,
      answer: answer
    })
  },

  /**
   * Evaluates candidate's answers against the correct answers.
   * Logs the attempt regardless of outcome.
   *
   * @param {string}   postId      - Post being claimed
   * @param {string}   candidateId - Candidate user ID
   * @param {Object[]} answers     - Array of { questionId, answer } submitted by candidate
   * @param {Question[]} questions - Full question records (with correct answers — server-side only)
   * @returns {Promise<{ passed: boolean, token?: string }>}
   */
  async submitClaim(postId, candidateId, answers, questions) {
    // Evaluate answers
    const passed = answers.every(({ questionId, answer }) => {
      const q = questions.find((q) => q.id === questionId)
      return q && q.answer.trim().toLowerCase() === answer.trim().toLowerCase()
    })

    // Log attempt
    await pb.collection(ATTEMPTS_COLLECTION).create({
      post_id:      postId,
      candidate_id: candidateId,
      answers:      JSON.stringify(answers),
      passed,
    })

    if (!passed) return { passed: false }

    // ── Issue chained token ────────────────────────────────────────────────
    const prevTokenRecord = await this._getLastToken(postId)
    const prevToken       = prevTokenRecord?.token ?? postId // genesis = postId
    const newToken        = generateClaimToken(prevToken, candidateId, Date.now())

    await pb.collection(TOKENS_COLLECTION).create({
      post_id:      postId,
      candidate_id: candidateId,
      token:        newToken,
      prev_token:   prevToken,
      status:       'pending',
    })

    return { passed: true, token: newToken }
  },

  /**
   * Fetches the most recent claim token for a post (for chain continuity).
   *
   * @param {string} postId
   * @returns {Promise<ClaimToken|null>}
   */
  async _getLastToken(postId) {
    try {
      const result = await pb.collection(TOKENS_COLLECTION).getList(1, 1, {
        filter: `post_id = '${postId}'`,
        sort:   '-created',
      })
      return result.items[0] ?? null
    } catch {
      return null
    }
  },

  /**
   * Fetches all pending claim tokens (for admin review).
   *
   * @returns {Promise<ClaimToken[]>}
   */
  async getPendingClaims() {
    return pb
      .collection(TOKENS_COLLECTION)
      .getFullList({ filter: "status = 'pending'", sort: '-created' })
  },

  /**
   * Admin approves a claim token and marks it as approved.
   *
   * @param {string} tokenId - Claim token record ID
   * @returns {Promise<ClaimToken>}
   */
  async approveClaim(tokenId) {
    return pb.collection(TOKENS_COLLECTION).update(tokenId, { status: 'approved' })
  },
}
