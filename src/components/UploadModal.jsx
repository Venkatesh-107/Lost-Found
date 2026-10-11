import React, { useState } from 'react'
import { X, UploadCloud, AlertCircle } from 'lucide-react'
import { postService } from '@/services/post.service'
import { useAuthStore } from '@/store/authStore'
import questionsData from '@/utils/questions.json'
import '@/styles/UploadModal.css'

export default function UploadModal({ onClose, onRefresh }) {
  const user = useAuthStore(s => s.user)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imageFile || !description || !category || !subCategory) {
      setError('Please provide all fields.')
      return
    }
    setLoading(true)
    try {
      await postService.create(imageFile, description, category, subCategory, user.id)
      onRefresh && onRefresh()
      onClose()
    } catch (err) {
      setError('Failed to upload. ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const mainCategories = Object.keys(questionsData)
  const subCategories = category ? Object.keys(questionsData[category] || {}) : []

  const formatLabel = (key) => key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Report Found Item</h3>
          <button onClick={onClose} className="btn-ghost"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-alert"><AlertCircle size={16}/> {error}</div>}
          
          <div className="image-upload-area">
            {preview ? (
              <img src={preview} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <UploadCloud size={32} />
                <p>Click or drag image here<br/><small>(Max 5MB)</small></p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
          </div>

          <div className="input-group" style={{marginTop: '16px'}}>
            <label>Category</label>
            <select className="input-field" value={category} onChange={e => {setCategory(e.target.value); setSubCategory('');}}>
              <option value="">Select Category</option>
              {mainCategories.map(cat => (
                <option key={cat} value={cat}>{formatLabel(cat)}</option>
              ))}
            </select>
          </div>

          {category && (
            <div className="input-group">
              <label>Sub Category</label>
              <select className="input-field" value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                <option value="">Select Item Type</option>
                {subCategories.map(sub => (
                  <option key={sub} value={sub}>{formatLabel(sub)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label>Description (Max 200 chars)</label>
            <textarea 
              className="input-field" 
              value={description}
              onChange={e => setDescription(e.target.value.substring(0, 200))}
              rows={3}
              placeholder="e.g. Found near the library..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
