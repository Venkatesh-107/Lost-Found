// ─────────────────────────────────────────────────────────────────────────────
// src/components/Navbar.jsx — Top navigation bar
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useNavigate }  from 'react-router-dom'

export default function Navbar() {
  const navigate  = useNavigate()
  const clearUser = useAuthStore((s) => s.clearUser)

  function handleLogout() {
    authService.logout()
    clearUser()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <span className="navbar-brand">🔍 Lost &amp; Found</span>
      <button className="btn-ghost" onClick={handleLogout}>Logout</button>
    </header>
  )
}
