import React from 'react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Search, LogOut } from 'lucide-react'
import '@/styles/Navbar.css'

export default function Navbar({ title = "Lost & Found" }) {
  const user = useAuthStore(s => s.user)
  const clearUser = useAuthStore(s => s.clearUser)
  const navigate = useNavigate()

  function handleLogout() {
    authService.logout()
    clearUser()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-icon"><Search size={20} /></div>
        <span className="navbar-title">{title}</span>
      </div>
      
      <div className="navbar-actions">
        <div className="navbar-badge-live">
          <div className="live-dot"></div> Live
        </div>
        <button onClick={handleLogout} className="btn-ghost btn-logout" aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}
