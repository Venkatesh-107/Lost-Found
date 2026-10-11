import React, { useState, useEffect } from 'react'
import { Ticket } from 'lucide-react'
import pb from '@/services/pb'
import '@/styles/PostCard.css'

export default function PostCard({ post, imageUrl, onClaimClick }) {
  const [postCount, setPostCount] = useState(0)

  useEffect(() => {
    if (post.posted_by) {
      pb.collection('posts').getList(1, 1, {
        filter: `posted_by = "${post.posted_by}"`,
        fields: 'id'
      }).then(res => setPostCount(res.totalItems)).catch(() => {})
    }
  }, [post.posted_by])

  const postDate = post.created ? new Date(post.created).toLocaleDateString() : ''

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">
          {post.expand?.posted_by?.name ? post.expand.posted_by.name.charAt(0).toUpperCase() : 'H'}
        </div>
        <div className="post-meta">
          <div className="post-author">
            {post.expand?.posted_by?.name || 'hemu'} 
            <span className="post-count-badge"> ({postCount} {postCount === 1 ? 'post' : 'posts'})</span>
          </div>
          <div className="post-time">{postDate}</div>
        </div>
      </div>

      <div className="post-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={post.description} loading="lazy" />
        ) : (
          <div className="post-placeholder">No Image Available</div>
        )}
      </div>

      <div className="post-content">
        <p className="post-description">{post.description}</p>
        
        {post.status !== 'claimed' && (
          <button className="btn-primary claim-token-btn" onClick={() => onClaimClick(post)}>
            <Ticket size={18} /> Token #1 • 0 ahead
          </button>
        )}
      </div>
    </div>
  )
}
