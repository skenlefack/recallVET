import { Outlet, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMobile } from '../hooks/useMobile'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'

export default function MainLayout() {
  const { isAuthenticated, loading } = useAuth()
  const { isMobile } = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-success" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const sidebarWidth = isMobile ? 0 : (sidebarOpen ? 250 : 64)

  return (
    <div className={`app-wrapper ${isMobile ? 'mobile' : ''}`}>
      {!isMobile && (
        <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      )}

      {/* Mobile: slide-over sidebar */}
      {isMobile && sidebarOpen && (
        <>
          <div className="rv-mobile-overlay" onClick={() => setSidebarOpen(false)} />
          <Sidebar isOpen={true} toggle={() => setSidebarOpen(false)} />
        </>
      )}

      <div className="main-content" style={{ marginLeft: sidebarWidth }}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`content-body ${isMobile ? 'mobile-body' : ''}`}>
          <Outlet />
        </div>
      </div>

      {isMobile && <MobileBottomNav />}
    </div>
  )
}
