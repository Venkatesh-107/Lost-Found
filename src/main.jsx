import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

// Premium Error Boundary for a polished fail state
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Crashed:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0f111a',
          color: '#f8fafc', fontFamily: 'Outfit, sans-serif', padding: 32, textAlign: 'center', gap: 20
        }}>
          <h1 style={{ fontSize: '2rem', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            System Error
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 400 }}>An unexpected error occurred. The system has logged the incident.</p>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 12, fontSize: '0.85rem', color: '#ef4444', maxWidth: '90vw', overflow: 'auto', textAlign: 'left' }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button className="btn-primary" onClick={() => window.location.reload()}>Reload Dashboard</button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
