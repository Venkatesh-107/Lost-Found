// ─────────────────────────────────────────────────────────────────────────────
// src/pages/NotFound.jsx
// 404 — Page not found fallback
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <main id="not-found-page" className="not-found-page">
      <span className="not-found-emoji" aria-hidden="true">🔍</span>
      <h1 className="not-found-title">404 — Page Not Found</h1>
      <p className="not-found-sub">This item seems to be lost too.</p>
      <button
        id="not-found-back"
        className="btn-primary"
        onClick={() => navigate(-1)}
      >
        Go Back
      </button>
    </main>
  )
}
