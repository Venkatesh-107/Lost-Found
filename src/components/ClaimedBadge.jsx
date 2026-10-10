// ─────────────────────────────────────────────────────────────────────────────
// src/components/ClaimedBadge.jsx — "CLAIMED" overlay for post cards
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'

export default function ClaimedBadge() {
  return (
    <div className="claimed-badge" aria-label="This item has been claimed">
      ✅ Claimed
    </div>
  )
}
