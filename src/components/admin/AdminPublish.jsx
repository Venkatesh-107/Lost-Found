// ─────────────────────────────────────────────────────────────────────────────
// src/components/admin/AdminPublish.jsx
// Admin Publisher — QR code scanner for student info + form to publish post
// Includes dynamic rule-based questions loading from questions.json
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { postService } from '@/services/post.service'
import { claimService } from '@/services/claim.service'
import { validatePostForm } from '@/utils/validators'
import questionsData from '@/utils/questions.json'

export default function AdminPublish() {
  const [scannedStudentId, setScannedStudentId] = useState(null)
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  
  // Category selection for Rule-Based Questions
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [answers, setAnswers] = useState({}) // { [questionText]: "admin's answer" }

  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Scanner cleanup on unmount
  const scannerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  function startScanner() {
    setIsScanning(true)
    setError(null)
    setScannedStudentId(null)

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      )

      scannerRef.current.render(
        (decodedText) => {
          setScannedStudentId(decodedText)
          setIsScanning(false)
          scannerRef.current.clear()
        },
        (errorMessage) => {
          // parse error, ignore
        }
      )
    }, 100)
  }

  function handleCancelScan() {
    if (scannerRef.current) {
      scannerRef.current.clear()
    }
    setIsScanning(false)
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) setImageFile(file)
  }

  function handleAnswerChange(questionText, value) {
    setAnswers((prev) => ({ ...prev, [questionText]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!scannedStudentId) {
      setError('Please scan the student QR code first.')
      return
    }

    const { valid, errors } = validatePostForm(imageFile, description)
    if (!valid) {
      setError(errors.join(' '))
      return
    }

    const currentQuestions = selectedSubcategory
      ? questionsData[selectedCategory][selectedSubcategory]
      : []

    // Ensure all required questions have answers provided by the Admin
    for (const q of currentQuestions) {
      if (!answers[q] || answers[q].trim() === '') {
        setError('Please provide correct answers for all the rule-based questions.')
        return
      }
    }

    setLoading(true)
    try {
      // Create the post record
      const post = await postService.create(imageFile, description, scannedStudentId)
      
      // Save all rule-based questions with their correct answers
      for (const q of currentQuestions) {
        await claimService.createQuestion(post.id, q, answers[q].trim())
      }

      setSuccess(true)
      setScannedStudentId(null)
      setDescription('')
      setImageFile(null)
      setSelectedCategory('')
      setSelectedSubcategory('')
      setAnswers({})
    } catch (err) {
      setError(err.message || 'Failed to publish item.')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestions = selectedSubcategory
    ? questionsData[selectedCategory][selectedSubcategory]
    : []

  return (
    <section className="admin-publish">
      <h2>Publish Found Item</h2>
      <p>Scan the student's QR code, enter item details, set claim validation answers, and publish to the public feed.</p>

      {/* ── Step 1: QR Scanner ────────────────────────────────────────────── */}
      <div className="card">
        <h3>1. Student Information</h3>
        {scannedStudentId ? (
          <div className="scanned-result">
            ✅ Verified Student: <strong>{scannedStudentId}</strong>
            <button className="btn-ghost" type="button" onClick={() => setScannedStudentId(null)}>Rescan</button>
          </div>
        ) : (
          <div>
            {!isScanning ? (
              <button className="btn-primary" type="button" onClick={startScanner}>Start QR Scanner</button>
            ) : (
              <div>
                <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
                <button className="btn-ghost" type="button" onClick={handleCancelScan} style={{ marginTop: '1rem' }}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Step 2: Item Details ──────────────────────────────────────────── */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>2. Item Details</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="field-label">Item Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="field-input" disabled={loading} required />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="field-label">Description</label>
              <textarea
                className="field-input"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Black Sony headphones found in Library..."
                disabled={loading}
                required
              ></textarea>
            </div>
        </div>

        {/* ── Step 3: Rule-Based Questions Setup ───────────────────────────── */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>3. Claim Validation Questions</h3>
          <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Select the product category. You must provide the correct answers based on the physical item. Candidates will be asked these questions to claim it.</p>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="field-label">Category</label>
            <select
              className="field-input"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedSubcategory('')
                setAnswers({})
              }}
              disabled={loading}
              required
            >
              <option value="">-- Select Category --</option>
              {Object.keys(questionsData).map(cat => (
                <option key={cat} value={cat}>{cat.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="field-label">Subcategory</label>
              <select
                className="field-input"
                value={selectedSubcategory}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value)
                  setAnswers({})
                }}
                disabled={loading}
                required
              >
                <option value="">-- Select Subcategory --</option>
                {Object.keys(questionsData[selectedCategory]).map(subcat => (
                  <option key={subcat} value={subcat}>{subcat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          )}

          {currentQuestions.length > 0 && (
            <div className="questions-container" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--clr-bg)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--clr-text)' }}>Provide Correct Answers:</h4>
              {currentQuestions.map((q, idx) => (
                <div key={idx} className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="field-label">{q}</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter correct answer..."
                    value={answers[q] || ''}
                    onChange={(e) => handleAnswerChange(q, e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: 'var(--clr-success)', marginBottom: '1rem', padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--clr-success)', borderRadius: 'var(--radius-md)' }}>✅ Item and questions published successfully!</div>}

        <button type="submit" className="btn-primary" disabled={loading || !scannedStudentId} style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
          {loading ? 'Publishing...' : '🚀 Publish to Feed'}
        </button>
      </form>
    </section>
  )
}
