// ─────────────────────────────────────────────────────────────────────────────
// src/components/PostCard.jsx
// Single post card — image, description, status badge, and claim button
// Used inside the vertical scroll-snap feed on the Home page
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { postService } from '@/services/post.service'
import ClaimedBadge    from './ClaimedBadge'

/**
 * @param {Object}   props
 * @param {import('@/services/post.service').Post} props.post     - Post record
 * @param {Function} props.onClaim - Called when the Claim button is clicked
 */
export default function PostCard({ post, onClaim }) {
  const isClaimed = post.status === 'claimed'
  const imageUrl  = postService.getImageUrl(post, post.image)

  return (
    <article
      id={`post-card-${post.id}`}
      className="post-card"
      aria-label={`Lost item: ${post.description}`}
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div className="post-image-wrapper">
        <img
          src={imageUrl}
          alt={post.description}
          className="post-image"
          loading="lazy"
        />
        {isClaimed && <ClaimedBadge />}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="post-body">
        <p className="post-description">{post.description}</p>

        {!isClaimed ? (
          <button
            id={`claim-btn-${post.id}`}
            className="btn-claim"
            onClick={onClaim}
            aria-label={`Claim this item: ${post.description}`}
          >
            🏷 Claim
          </button>
        ) : (
          <span className="claimed-label" aria-label="This item has been claimed">
            ✅ Claimed
          </span>
        )}
      </div>
    </article>
  )
}
