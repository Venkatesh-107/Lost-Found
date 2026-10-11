import pb from './pb'

export const claimService = {
  /**
   * Fetches rule-based questions for a specific post.
   */
  async getQuestionsForPost(postId) {
    return await pb.collection('item_questions').getFullList({
      filter: `post_id = '${postId}'`
    })
  },

  /**
   * Validates submitted answers against admin's correct answers and logs attempt.
   */
  async submitClaimAttempt(postId, candidateId, answersObj) {
    let passed = true
    
    // Fetch correct answers (if any) from admin approval
    const itemQs = await pb.collection('item_questions').getFullList({
      filter: `post_id = '${postId}'`
    })

    // Compare
    if (itemQs.length > 0) {
      for (let i = 0; i < itemQs.length; i++) {
        const q = itemQs[i]
        const candidateAnswer = (answersObj[i] || '').trim().toLowerCase()
        const correctAnswer = (q.answer || '').trim().toLowerCase()
        
        // Very basic matching for demonstration
        if (candidateAnswer !== correctAnswer && correctAnswer !== 'n/a') {
          passed = false
        }
      }
    } else {
      // If admin didn't set answers, it defaults to manual review (passed=false)
      passed = false
    }

    // Log the attempt
    const attempt = await pb.collection('claim_attempts').create({
      post_id: postId,
      candidate_id: candidateId,
      answers: answersObj,
      passed: passed
    })

    return attempt
  },

  /**
   * Generates and stores a claim token upon successful validation.
   */
  async issueClaimToken(postId, candidateId, tokenHash, prevToken) {
    return await pb.collection('claim_tokens').create({
      post_id: postId,
      candidate_id: candidateId,
      token: tokenHash,
      prev_token: prevToken,
      status: 'pending'
    })
  }
}
