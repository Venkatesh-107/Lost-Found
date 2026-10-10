// ─────────────────────────────────────────────────────────────────────────────
// src/App.jsx
// Root component — defines all routes and protected route guards
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import Login    from '@/pages/Login'
import Home     from '@/pages/Home'
import Admin    from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

// ─── Protected Route ─────────────────────────────────────────────────────────
/**
 * Wraps a route so that only authenticated users with the correct role can access it.
 * Redirects unauthenticated users to /login.
 *
 * @param {React.ReactNode} children - The page component to render
 * @param {string[]} allowedRoles  - Required roles to access this route
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div className="splash-loader">Loading…</div>
  if (!user)     return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Candidate portal */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={['student', 'staff']}>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Admin portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
