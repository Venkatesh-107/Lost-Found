// ─────────────────────────────────────────────────────────────────────────────
// src/components/ClaimModal.jsx — Claim Q&A modal (stub for v0.6.0)
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'

export default function ClaimModal({ post, onClose }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Claim item">
      <div className="modal-card">
        <h2>Claim Item</h2>
        <p>Q&amp;A flow coming in v0.6.0</p>
        <button className="btn-ghost" onClick={() => onClose(false)}>Close</button>
      </div>
    </div>
  )
}
