// ─────────────────────────────────────────────────────────────────────────────
// src/pages/Login.jsx
// Login screen — role-aware auth entry point
// Admin  → /admin portal
// Candidate → /home feed portal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import { useNavigate }     from 'react-router-dom'
import { authService }     from '@/services/auth.service'
import { useAuthStore }    from '@/store/authStore'
import './Login.css'



export default function Login() {
  const navigate = useNavigate()
  const setUser  = useAuthStore((s) => s.setUser)

  const user     = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'student' || user.role === 'staff') {
        navigate('/home', { replace: true })
      } else {
        navigate('/home', { replace: true }) // fallback
      }
    }
  }, [user, navigate])

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  // ── Handlers ───────────────────────────────────────────────────────────────



  /**
   * Authenticates the user and routes by role.
   * @param {React.FormEvent} e
   */
  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }

    setError('')
    setLoading(true)

    try {
      const user = await authService.login(email, password)

      setUser(user)
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/home', { replace: true })
      }
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main id="login-page" className="login-page">
      <section className="login-card" aria-label="Sign in to Lost and Found">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="login-logo-wrapper">
          <div className="login-logo-bg" aria-hidden="true">🔍</div>
        </div>

        <h1 className="login-title">Lost &amp; Found</h1>
        <p className="login-subtitle">Sign in to your portal</p>



        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form
          id="login-form"
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <div className="form-group">
            <label className="field-label" htmlFor="login-email">Email address</label>
            <div className="field-input-wrapper">
              <span className="field-input-icon" aria-hidden="true">✉️</span>
              <input
                id="login-email"
                type="email"
                className="field-input with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="field-input-wrapper">
              <span className="field-input-icon" aria-hidden="true">🔒</span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="field-input with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPass ? 'Hide password' : 'Show password'}
                onClick={() => setShowPass((v) => !v)}
                tabIndex={0}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p id="login-error" className="login-error" role="alert" aria-live="assertive">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="btn-login"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                🚀 Sign In
              </>
            )}
          </button>
        </form>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <p className="login-footer">
          Lost &amp; Found Portal · Secure sign-in
        </p>

      </section>
    </main>
  )
}
