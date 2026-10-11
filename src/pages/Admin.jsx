import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Clock, Layers, Ticket, Flag, CheckCircle, Check, Trash2 } from 'lucide-react'
import { postService } from '@/services/post.service'
import pb from '@/services/pb'
import questionsData from '@/utils/questions.json'
import '@/styles/Admin.css'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Review posts')
  const [pendingPosts, setPendingPosts] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [lostReports, setLostReports] = useState([])
  const [loading, setLoading] = useState(true)

  // Question Prompt State
  const [approvingPost, setApprovingPost] = useState(null)
  const [adminAnswers, setAdminAnswers] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const pendingData = await postService.getPending(1, 50)
      setPendingPosts(pendingData.items)
      
      const allData = await postService.getAll(1, 50)
      setAllPosts(allData.items)

      const lostData = await postService.getLostReports(1, 50)
      setLostReports(lostData.items)
    } catch (err) {
      console.error("Failed to load posts", err)
    } finally {
      setLoading(false)
    }
  }

  function handleApproveClick(post) {
    setApprovingPost(post)
    setAdminAnswers({})
  }

  async function confirmApprovePost() {
    if(!approvingPost) return;
    try {
      // 1. Create correct answers in item_questions collection
      const qs = questionsData[approvingPost.category]?.[approvingPost.sub_category] || []
      for (let i = 0; i < qs.length; i++) {
        await pb.collection('item_questions').create({
          post_id: approvingPost.id,
          question: qs[i],
          answer: adminAnswers[i] || 'N/A'
        })
      }
      
      // 2. Update post to active
      await postService.updateStatus(approvingPost.id, 'active')
      setApprovingPost(null)
      await loadData()
    } catch (err) {
      console.error("Failed to approve post", err)
    }
  }

  async function deletePost(postId) {
    if(!window.confirm("Are you sure you want to delete this post entirely?")) return;
    try {
      await postService.delete(postId)
      await loadData()
    } catch (err) {
      console.error("Failed to delete post", err)
    }
  }

  async function handleClosePost(postId) {
    if(!window.confirm("Mark this post as successfully claimed/closed?")) return;
    try {
      await postService.updateStatus(postId, 'claimed')
      await loadData()
    } catch (err) {
      console.error("Failed to close post", err)
    }
  }

  const statCards = [
    { icon: <Clock size={20} color="var(--accent)" />, count: pendingPosts.length, label: 'To review', bg: 'rgba(134, 239, 172, 0.1)' },
    { icon: <Layers size={20} color="var(--success)" />, count: allPosts.length, label: 'Live posts', bg: 'rgba(34, 197, 94, 0.1)' },
    { icon: <Ticket size={20} color="var(--accent)" />, count: 1, label: 'Open tokens', bg: 'rgba(134, 239, 172, 0.1)' },
    { icon: <Flag size={20} color="var(--success)" />, count: lostReports.filter(l=>l.status==='open').length, label: 'New lost reports', bg: 'rgba(34, 197, 94, 0.1)' },
    { icon: <CheckCircle size={20} color="var(--success)" />, count: 0, label: 'Claimed', bg: 'rgba(34, 197, 94, 0.1)' },
  ]

  const tabs = ['Review posts', 'All posts', 'Claims & tokens', 'Lost reports']

  const renderPost = (post, isPending) => (
    <div key={post.id} className="admin-list-item">
      <div className="admin-item-image">
        {post.image ? (
          <img src={postService.getImageUrl(post, post.image)} alt="item" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <div style={{ background: '#555', width: '100%', height: '100%', display: 'flex' }}>
             <div style={{flex: 1, background: '#444'}}></div>
             <div style={{flex: 1, background: '#666'}}></div>
          </div>
        )}
      </div>
      
      <div className="admin-item-content">
        <div className="admin-item-header">
          {isPending ? (
            <span className="status-badge" style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.7rem' }}>PENDING REVIEW</span>
          ) : (
            <span className="status-badge" style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.7rem' }}>ACTIVE</span>
          )}
          <span className="time-ago">
            {new Date(post.created).toLocaleDateString()}
          </span>
        </div>
        
        <h4 className="admin-item-title">{post.category ? `${post.category.replace('_',' ')} / ${post.sub_category.replace('_',' ')}` : 'Found Item'}</h4>
        <p className="admin-item-desc">{post.description}</p>
        
        <div className="admin-item-meta">
          <div className="meta-row"><UserIcon /> {post.expand?.posted_by?.name || 'User'}</div>
        </div>
        
        <div className="admin-item-action-row" style={{ marginTop: '12px', gap: '8px', display: 'flex' }}>
          {isPending ? (
            <button className="btn-primary" onClick={() => handleApproveClick(post)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Check size={16} /> Approve
            </button>
          ) : post.status === 'active' ? (
            <button className="btn-secondary" onClick={() => handleClosePost(post.id)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <CheckCircle size={16} /> Mark Claimed
            </button>
          ) : null}
          <button className="btn-delete" onClick={() => deletePost(post.id)}><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  )

  const renderLostReport = (report) => (
    <div key={report.id} className="admin-list-item" style={{display:'block'}}>
      <div className="admin-item-header">
        <span className="status-badge" style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.7rem' }}>LOST REPORT</span>
        <span className="time-ago">
          {new Date(report.created).toLocaleDateString()}
        </span>
      </div>
      <h4 className="admin-item-title" style={{marginTop:'8px'}}>{report.category.replace('_',' ')} / {report.sub_category.replace('_',' ')}</h4>
      <p className="admin-item-desc" style={{margin:'8px 0'}}><strong>Lost on:</strong> {report.date_lost ? new Date(report.date_lost).toLocaleDateString() : 'Unknown'}</p>
      <p className="admin-item-desc">{report.description}</p>
      <div className="admin-item-meta" style={{marginTop:'8px'}}>
        <div className="meta-row"><UserIcon /> {report.expand?.user_id?.name || 'User'}</div>
      </div>
    </div>
  )

  return (
    <div className="admin-layout">
      <Navbar title="Admin Portal" />

      <main className="admin-container">
        {/* Stat Cards */}
        <div className="stat-cards-scroll">
          <div className="stat-cards-container">
            {statCards.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon-wrap" style={{ background: stat.bg }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <h3>{stat.count}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button 
              key={tab}
              className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} {tab === 'Claims & tokens' && <span className="tab-badge">1</span>}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="admin-list">
          {loading ? (
            <div className="spinner" style={{ margin: '20px auto' }}></div>
          ) : activeTab === 'Review posts' ? (
            pendingPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No posts pending review.</div>
            ) : pendingPosts.map(p => renderPost(p, true))
          ) : activeTab === 'All posts' ? (
            allPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No active posts.</div>
            ) : allPosts.map(p => renderPost(p, false))
          ) : activeTab === 'Lost reports' ? (
            lostReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No lost reports.</div>
            ) : lostReports.map(r => renderLostReport(r))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Feature coming soon.
            </div>
          )}
        </div>
      </main>

      {/* Admin Approval Questions Modal */}
      {approvingPost && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Set Answers for {approvingPost.category?.replace('_',' ')}</h3>
              <button className="btn-ghost" onClick={() => setApprovingPost(null)}>X</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px'}}>
                Since you have the physical item, provide the correct answers to these verification questions. Users must match these to claim the item.
              </p>
              {(questionsData[approvingPost.category]?.[approvingPost.sub_category] || []).map((q, idx) => (
                <div key={idx} className="input-group" style={{marginBottom: '12px'}}>
                  <label>{q}</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Correct answer..."
                    value={adminAnswers[idx] || ''}
                    onChange={e => setAdminAnswers({...adminAnswers, [idx]: e.target.value})}
                  />
                </div>
              ))}
              <div className="modal-actions" style={{marginTop: '20px'}}>
                <button className="btn-secondary" onClick={() => setApprovingPost(null)}>Cancel</button>
                <button className="btn-primary" onClick={confirmApprovePost}>Publish Post</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>; }

