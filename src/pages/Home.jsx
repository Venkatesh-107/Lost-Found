import React, { useState, useEffect } from 'react'
import { postService } from '@/services/post.service'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import FAB from '@/components/FAB'
import UploadModal from '@/components/UploadModal'
import ClaimModal from '@/components/ClaimModal'
import LostReportView from '@/components/LostReportView'
import { Search, Home as HomeIcon, Flag, Ticket, User, LogOut } from 'lucide-react'

import '@/styles/Home.css'
import '@/styles/FAB.css'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [currentView, setCurrentView] = useState('home')
  
  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [claimingPost, setClaimingPost] = useState(null)
  
  const user = useAuthStore(s => s.user)
  const clearUser = useAuthStore(s => s.clearUser)
  const navigate = useNavigate()

  useEffect(() => {
    loadFeed()
  }, [])

  async function loadFeed() {
    setLoading(true)
    try {
      const data = await postService.getAll(1, 30)
      setPosts(data.items)
    } catch (err) {
      console.error("Failed to load posts", err)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    authService.logout()
    clearUser()
    navigate('/login')
  }

  const renderView = () => {
    if (currentView === 'home') {
      const filteredPosts = activeTab === 'All' ? posts : 
                            activeTab === 'My posts' ? posts.filter(p => p.posted_by === user.id) : 
                            activeTab === 'Available' ? posts.filter(p => p.status === 'active') : 
                            activeTab === 'Claimed' ? posts.filter(p => p.status === 'claimed') : posts;

      return (
        <>
          <div className="search-section">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search found items" />
            </div>
            
            <div className="tabs">
              {['All', 'Available', 'Claimed', 'My posts'].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <main className="feed-container">
            {loading ? (
              <div className="feed-loader"><div className="spinner"></div></div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <h2>No items found.</h2>
                <p>Check back later or report a lost item.</p>
              </div>
            ) : (
              <div className="vertical-feed">
                {filteredPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    imageUrl={post.image ? postService.getImageUrl(post, post.image) : null}
                    onClaimClick={(p) => setClaimingPost(p)}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )
    }
    
    if (currentView === 'lost') {
      return <LostReportView />
    }
    
    if (currentView === 'tokens') {
      return (
        <div className="empty-state">
          <h2>Your Claim Tokens</h2>
          <p>No tokens generated yet. Claim an item to receive a token.</p>
        </div>
      )
    }
    
    if (currentView === 'profile') {
      return (
        <div className="feed-container">
          <div style={{background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', textAlign: 'center'}}>
            <div style={{width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', color: '#000', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 'bold'}}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2>{user?.name || 'User'}</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '24px'}}>{user?.email || 'user@example.com'}</p>
            <button className="btn-secondary w-full" onClick={handleLogout} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
              <LogOut size={18} /> Log out
            </button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="home-layout">
      <Navbar title={currentView === 'home' ? "Lost & Found" : currentView.charAt(0).toUpperCase() + currentView.slice(1)} />
      
      {renderView()}

      <div className="bottom-nav">
        <button className={`bottom-nav-item ${currentView === 'home' ? 'active' : ''}`} onClick={() => setCurrentView('home')}>
          <HomeIcon size={24} />
          <span>Home</span>
        </button>
        <button className={`bottom-nav-item ${currentView === 'lost' ? 'active' : ''}`} onClick={() => setCurrentView('lost')}>
          <Flag size={24} />
          <span>Lost</span>
        </button>
        
        <div className="fab-container">
          <FAB onClick={() => setIsUploadOpen(true)} />
        </div>
        
        <button className={`bottom-nav-item ${currentView === 'tokens' ? 'active' : ''}`} onClick={() => setCurrentView('tokens')}>
          <div className="nav-icon-badge">
            <Ticket size={24} />
            <span className="badge">1</span>
          </div>
          <span>Tokens</span>
        </button>
        <button className={`bottom-nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
          <User size={24} />
          <span>Profile</span>
        </button>
      </div>

      {/* Modals */}
      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onRefresh={loadFeed} />}
      {claimingPost && <ClaimModal post={claimingPost} onClose={() => setClaimingPost(null)} onRefresh={loadFeed} />}
    </div>
  )
}
