// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useClaim.js
// Claim hook — manages Q&A flow state for a single post claim attempt
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { claimService }  from '@/services/claim.service'
import { useAuthStore }  from '@/store/authStore'

/**
 * Manages the entire claim Q&A flow for a given post.
 *
 * @param {string} postId - ID of the post being claimed
 * @returns {{
 *   questions:  import('@/services/claim.service').Question[],
 *   answers:    Object,
 *   setAnswer:  Function,
 *   submit:     Function,
 *   result:     { passed: boolean, token?: string }|null,
 *   isLoading:  boolean,
 *   error:      string|null,
 * }}
 */
export function useClaim(postId) {
  const user = useAuthStore((s) => s.user)

  const [questions,  setQuestions]  = useState([])
  const [answers,    setAnswers]    = useState({})
  const [result,     setResult]     = useState(null)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState(null)

  // ── Fetch questions on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!postId) return
    setIsLoading(true)
    claimService
      .getQuestions(postId)
      .then(setQuestions)
      .catch((err) => setError(err.message || 'Failed to load questions.'))
      .finally(() => setIsLoading(false))
  }, [postId])

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Updates the candidate's answer for a specific question.
   * @param {string} questionId - Question record ID
   * @param {string} value      - Candidate's answer text
   */
  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  /**
   * Submits all answers for evaluation.
   * Sets `result` with pass/fail status and token (if passed).
   */
  async function submit() {
    setIsLoading(true)
    setError(null)
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer:     answers[q.id] || '',
      }))

      const outcome = await claimService.submitClaim(
        postId,
        user.id,
        payload,
        questions
      )
      setResult(outcome)
    } catch (err) {
      setError(err.message || 'Claim submission failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return { questions, answers, setAnswer, submit, result, isLoading, error }
}
