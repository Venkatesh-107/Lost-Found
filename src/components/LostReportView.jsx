import React, { useState } from 'react'
import { postService } from '@/services/post.service'
import { useAuthStore } from '@/store/authStore'
import questionsData from '@/utils/questions.json'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function LostReportView() {
  const user = useAuthStore(s => s.user)
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [description, setDescription] = useState('')
  const [dateLost, setDateLost] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const mainCategories = Object.keys(questionsData)
  const subCategories = category ? Object.keys(questionsData[category] || {}) : []
  const formatLabel = (key) => key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!category || !subCategory || !description) {
      setError('Category, Sub-Category and Description are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await postService.createLostReport(user.id, category, subCategory, description, dateLost)
      setSuccess(true)
    } catch (err) {
      setError('Failed to submit report: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="empty-state" style={{marginTop: '20px'}}>
        <div style={{color: 'var(--success)', marginBottom: '16px'}}><CheckCircle size={48} /></div>
        <h2>Report Submitted</h2>
        <p>Your lost item report has been sent to the admin desk. They will notify you if a matching item is found.</p>
        <button className="btn-secondary" onClick={() => {
          setSuccess(false); setCategory(''); setSubCategory(''); setDescription(''); setDateLost('');
        }} style={{marginTop: '24px'}}>Submit Another Report</button>
      </div>
    )
  }

  return (
    <div className="feed-container" style={{padding: '24px 16px'}}>
      <div style={{background: 'var(--bg-card)', padding: '20px', borderRadius: '16px'}}>
        <h2 style={{marginBottom: '16px'}}>Report Lost Item</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem'}}>Lost something? Submit a report so the admin desk can keep an eye out for it.</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-alert" style={{marginBottom: '16px'}}><AlertCircle size={16}/> {error}</div>}
          
          <div className="input-group" style={{marginBottom: '16px'}}>
            <label>Category</label>
            <select className="input-field" value={category} onChange={e => {setCategory(e.target.value); setSubCategory('');}}>
              <option value="">Select Category</option>
              {mainCategories.map(cat => (
                <option key={cat} value={cat}>{formatLabel(cat)}</option>
              ))}
            </select>
          </div>

          {category && (
            <div className="input-group" style={{marginBottom: '16px'}}>
              <label>Item Type</label>
              <select className="input-field" value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                <option value="">Select Item Type</option>
                {subCategories.map(sub => (
                  <option key={sub} value={sub}>{formatLabel(sub)}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="input-group" style={{marginBottom: '16px'}}>
            <label>Date Lost (Optional)</label>
            <input type="date" className="input-field" value={dateLost} onChange={e => setDateLost(e.target.value)} />
          </div>

          <div className="input-group" style={{marginBottom: '24px'}}>
            <label>Description (color, size, unique marks)</label>
            <textarea 
              className="input-field" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Be as detailed as possible..."
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Lost Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
