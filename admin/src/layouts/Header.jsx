import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantContext'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import NotificationBell from '../components/NotificationBell'

export default function Header({ toggleSidebar }) {
  const { user, tenants, logout } = useAuth()
  const { tenant, switchTenant } = useTenant()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showTenantDropdown, setShowTenantDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
        setShowTenantDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`

  return (
    <header className="app-header" ref={dropdownRef}>
      {/* Left: toggle + search */}
      <div className="header-left">
        <button className="header-toggle" onClick={toggleSidebar} title="Menu">
          <i className="fas fa-bars" />
        </button>
        <div className="header-search d-none d-md-flex">
          <i className="fas fa-search" />
          <input type="text" placeholder="Rechercher..." />
        </div>
      </div>

      {/* Right: actions */}
      <div className="header-right">
        {/* Tenant switcher */}
        {tenants.length > 1 && (
          <div className="position-relative">
            <button className="header-btn" onClick={() => setShowTenantDropdown(!showTenantDropdown)}>
              <i className="fas fa-building" />
              <span className="d-none d-lg-inline">{tenant?.name || 'Select'}</span>
              <i className="fas fa-chevron-down" style={{ fontSize: '0.6rem' }} />
            </button>
            {showTenantDropdown && (
              <div className="header-dropdown">
                <div className="header-dropdown-title">Changer d'établissement</div>
                {tenants.map(t => (
                  <button key={t.id} className={`header-dropdown-item ${tenant?.id === t.id ? 'active' : ''}`}
                    onClick={() => { switchTenant(t); setShowTenantDropdown(false); }}>
                    <i className="fas fa-building me-2" />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* Language */}
        <button className="header-btn header-lang" onClick={() => {
          const lang = localStorage.getItem('i18nextLng') === 'en' ? 'fr' : 'en'
          localStorage.setItem('i18nextLng', lang)
          window.location.reload()
        }}>
          {localStorage.getItem('i18nextLng') === 'en' ? 'FR' : 'EN'}
        </button>

        {/* User */}
        <div className="position-relative">
          <button className="header-user" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="header-avatar">{initials}</div>
            <div className="header-user-info d-none d-lg-block">
              <div className="header-user-name">{user?.first_name} {user?.last_name}</div>
              <div className="header-user-role">{tenant?.name || 'RecallVET'}</div>
            </div>
            <i className="fas fa-chevron-down d-none d-lg-block" style={{ fontSize: '0.6rem', color: '#adb5bd' }} />
          </button>
          {showDropdown && (
            <div className="header-dropdown">
              <div className="header-dropdown-title">
                <strong>{user?.first_name} {user?.last_name}</strong>
                <small className="d-block text-muted">{user?.email}</small>
              </div>
              <button className="header-dropdown-item" onClick={() => { navigate('/settings/profile'); setShowDropdown(false); }}>
                <i className="fas fa-user-cog me-2" />Profil
              </button>
              <button className="header-dropdown-item" onClick={() => { navigate('/settings/subscription'); setShowDropdown(false); }}>
                <i className="fas fa-crown me-2" />Abonnement
              </button>
              <button className="header-dropdown-item" onClick={() => { navigate('/settings/tenant'); setShowDropdown(false); }}>
                <i className="fas fa-building me-2" />Établissement
              </button>
              <div style={{ borderTop: '1px solid #edf2f7', margin: '0.25rem 0' }} />
              <button className="header-dropdown-item text-danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2" />Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
