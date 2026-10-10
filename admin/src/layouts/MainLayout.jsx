import { Outlet, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const { isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-success" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const sidebarWidth = sidebarOpen ? 250 : 64

  return (
    <div className="app-wrapper">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content" style={{ marginLeft: sidebarWidth }}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
