import React, { useState, useEffect } from 'react'
import { X, ShieldCheck, AlertCircle } from 'lucide-react'
import { claimService } from '@/services/claim.service'
import { generateClaimToken } from '@/utils/tokenChain'
import { useAuthStore } from '@/store/authStore'
import questionsData from '@/utils/questions.json'
import '@/styles/ClaimModal.css'

export default function ClaimModal({ post, onClose, onRefresh }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    // Load questions dynamically based on post category
    const cat = post.category
    const subCat = post.sub_category
    let qs = []
    
    if (cat && subCat && questionsData[cat] && questionsData[cat][subCat]) {
      qs = questionsData[cat][subCat]
    } else {
      qs = ["Can you describe this item in detail to prove ownership?", "When and where did you lose this item?"]
    }
    
    setQuestions(qs)
    setLoading(false)
  }, [post])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Create a claim attempt (passed = false since admin reviews it)
      await claimService.submitClaimAttempt(post.id, user.id, answers, [])
      
      // Generate Chain Token with pending status
      const timestamp = Date.now()
      const generatedToken = await generateClaimToken(post.id, user.id, timestamp)
      
      await claimService.issueClaimToken(post.id, user.id, generatedToken, post.id)
      
      setToken(generatedToken)
      setSuccess(true)

    } catch (err) {
      console.error(err)
      setError('An error occurred while submitting your claim.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="claim-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Claim Item</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {loading ? (
          <div className="modal-loader"><div className="spinner"></div></div>
        ) : success ? (
          <div className="success-view">
            <div className="success-icon-wrap"><ShieldCheck size={48} /></div>
            <h3>Claim Verified!</h3>
            <p>Your answers match. Please show this token to the admin to collect your item.</p>
            
            <div className="token-box">
              <span className="token-label">CLAIM TOKEN</span>
              <code className="token-value">{token.substring(0, 16)}...</code>
            </div>
            
            <button className="btn-secondary w-full" onClick={() => { onClose(); onRefresh(); }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="claim-form">
            <p className="claim-instructions">
              To verify ownership, please answer the following questions about the item exactly.
            </p>

            {error && (
              <div className="error-banner">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {questions.length === 0 ? (
              <div className="info-banner">
                No validation questions required for this item.
              </div>
            ) : (
              <div className="questions-list">
                {questions.map((q, idx) => (
                  <div key={idx} className="input-group">
                    <label>{q}</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Your answer..."
                      value={answers[idx] || ''}
                      onChange={e => setAnswers({ ...answers, [idx]: e.target.value })}
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Submit Claim'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
