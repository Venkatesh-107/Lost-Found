// ─────────────────────────────────────────────────────────────────────────────
// src/pages/Home.jsx
// Candidate Home — Instagram-style vertical scroll-snap feed
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import Navbar       from '@/components/Navbar'
import PostCard     from '@/components/PostCard'
import ClaimModal   from '@/components/ClaimModal'
import { useFeed }  from '@/hooks/useFeed'

export default function Home() {
  const { posts, isLoading, error, loadMore, refresh } = useFeed()

  /** @type {[object|null, Function]} Active post being claimed */
  const [claimTarget,   setClaimTarget]   = useState(null)


  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Opens the claim Q&A modal for a specific post */
  function openClaim(post)  { setClaimTarget(post) }

  /** Closes the claim modal and refreshes feed on success */
  function closeClaim(didClaim) {
    setClaimTarget(null)
    if (didClaim) refresh()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div id="home-page" className="home-page">
      <Navbar />

      {/* ── Feed ─────────────────────────────────────────────────────────── */}
      <section
        id="post-feed"
        className="post-feed"
        aria-label="Lost and found items feed"
      >
        {isLoading && posts.length === 0 && (
          <div className="feed-loader" aria-busy="true">Loading items…</div>
        )}

        {error && (
          <p className="feed-error" role="alert">{error}</p>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClaim={() => openClaim(post)}
          />
        ))}

        {/* Infinite scroll sentinel */}
        {posts.length > 0 && (
          <button
            id="load-more-btn"
            className="load-more-btn"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </section>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {claimTarget && (
        <ClaimModal post={claimTarget} onClose={closeClaim} />
      )}
    </div>
  )
}
