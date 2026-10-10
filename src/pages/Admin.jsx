// ─────────────────────────────────────────────────────────────────────────────
// src/pages/Admin.jsx
// Admin Portal — post management, claim review, question editor
// Only accessible to users with role === 'admin'
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { authService } from '@/services/auth.service'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

import AdminPublish from '@/components/admin/AdminPublish'

/** @typedef {'publish'|'posts'|'claims'|'questions'} AdminTab */

export default function Admin() {
  const navigate          = useNavigate()
  /** @type {[AdminTab, Function]} */
  const [activeTab, setActiveTab] = useState('publish')

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleLogout() {
    authService.logout()
    navigate('/login', { replace: true })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div id="admin-page" className="admin-page">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="admin-header">
        <h1 className="admin-title">🛡 Admin Portal</h1>
        <button id="admin-logout" className="btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* ── Sidebar Tabs ──────────────────────────────────────────────────── */}
      <nav className="admin-tabs" role="tablist" aria-label="Admin sections">
        {[
          { id: 'publish',   label: '📢 Publish' },
          { id: 'posts',     label: '📋 Posts' },
          { id: 'claims',    label: '🏷 Claims' },
          { id: 'questions', label: '❓ Questions' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Tab Content ───────────────────────────────────────────────────── */}
      <main className="admin-content" role="tabpanel">
        {activeTab === 'publish'   && <AdminPublish />}
        {activeTab === 'posts'     && <PostManager />}
        {activeTab === 'claims'    && <ClaimRequests />}
        {activeTab === 'questions' && <QuestionEditor />}
      </main>
    </div>
  )
}

// ─── Sub-panels (will be broken into separate components in later versions) ──

/**
 * PostManager — displays all posts with status controls.
 * TODO: Extract to src/components/admin/PostManager.jsx
 */
function PostManager() {
  return (
    <section id="post-manager" className="admin-panel">
      <h2>All Posts</h2>
      <p className="placeholder-text">Post management coming in v0.7.0</p>
    </section>
  )
}

/**
 * ClaimRequests — lists pending verified claim tokens for admin review.
 * TODO: Extract to src/components/admin/ClaimRequests.jsx
 */
function ClaimRequests() {
  return (
    <section id="claim-requests" className="admin-panel">
      <h2>Claim Requests</h2>
      <p className="placeholder-text">Claim review coming in v0.7.0</p>
    </section>
  )
}

/**
 * QuestionEditor — allows admin to set rule-based Q&A per post.
 * TODO: Extract to src/components/admin/QuestionEditor.jsx
 */
function QuestionEditor() {
  return (
    <section id="question-editor" className="admin-panel">
      <h2>Rule-Based Questions</h2>
      <p className="placeholder-text">Question editor coming in v0.7.0</p>
    </section>
  )
}
