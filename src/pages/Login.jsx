import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { Shield, User, Lock, ArrowRight, AlertTriangle } from 'lucide-react'
import '@/styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await authService.login(email, password)
      setUser(user)
      
      // Route based on role as defined in FLOW.md
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={32} color="var(--accent)" />
          </div>
          <h1>Lost & Found</h1>
          <p>Sign in to your {isAdminMode ? 'Admin' : 'Candidate'} portal</p>
        </div>

        <div className="mode-toggle">
          <button 
            type="button" 
            className={`toggle-btn ${!isAdminMode ? 'active' : ''}`}
            onClick={() => setIsAdminMode(false)}
          >
            Candidate
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${isAdminMode ? 'active' : ''}`}
            onClick={() => setIsAdminMode(true)}
          >
            Admin
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-banner">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="email" 
                className="input-field with-icon" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                className="input-field with-icon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-submit" disabled={loading}>
            {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
