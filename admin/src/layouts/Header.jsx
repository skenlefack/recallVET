import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantContext'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import NotificationBell from '../components/NotificationBell'
import api from '../services/api'

export default function Header({ toggleSidebar }) {
  const { user, tenants, logout } = useAuth()
  const { tenant, switchTenant } = useTenant()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showTenantDropdown, setShowTenantDropdown] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const langRef = useRef(null)

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'sw', label: 'Kiswahili' }
  ]
  const currentLang = localStorage.getItem('i18nextLng') || 'fr'
  const currentLangLabel = languages.find(l => l.code === currentLang)?.label || currentLang.toUpperCase()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchInputRef = useRef(null)
  const searchRef = useRef(null)
  const searchTimeout = useRef(null)

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (query.length < 2) { setSearchResults(null); setShowSearchResults(false); return }
    searchTimeout.current = setTimeout(async () => {
      const res = await api.get(`/v1/search?q=${encodeURIComponent(query)}`)
      if (res?.success) { setSearchResults(res.data); setShowSearchResults(true) }
    }, 300)
  }

  const closeSearch = () => {
    setShowSearchResults(false)
    setSearchQuery('')
    setSearchResults(null)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
        setShowTenantDropdown(false)
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangDropdown(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false)
      }
    }
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
        {/* Global search */}
        <div className="header-search-wrapper d-none d-md-block" ref={searchRef}>
          <div className="header-search">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Rechercher... (Ctrl+K)"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => searchResults && setShowSearchResults(true)}
              ref={searchInputRef}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => { setSearchQuery(''); setSearchResults(null); }}>
                <i className="fas fa-times" />
              </button>
            )}
          </div>
          {showSearchResults && searchResults && (
            <div className="search-dropdown">
              {searchResults.animals?.length === 0 && searchResults.parties?.length === 0 && searchResults.products?.length === 0 ? (
                <div className="search-empty">
                  <i className="fas fa-search" />
                  <span>Aucun résultat pour "{searchQuery}"</span>
                </div>
              ) : (
                <>
                  {searchResults.animals?.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title"><i className="fas fa-paw me-1" />Animaux</div>
                      {searchResults.animals.map(item => (
                        <div key={`a-${item.id}`} className="search-item" onClick={() => { navigate(`/clinic/animals/${item.id}`); closeSearch(); }}>
                          <span className="search-item-label">{item.label}</span>
                          <span className="search-item-sub">{item.sublabel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.parties?.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title"><i className="fas fa-users me-1" />Clients</div>
                      {searchResults.parties.map(item => (
                        <div key={`p-${item.id}`} className="search-item" onClick={() => { navigate(`/clinic/parties/${item.id}`); closeSearch(); }}>
                          <span className="search-item-label">{item.label}</span>
                          <span className="search-item-sub">{item.sublabel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.products?.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title"><i className="fas fa-pills me-1" />Produits</div>
                      {searchResults.products.map(item => (
                        <div key={`pr-${item.id}`} className="search-item" onClick={() => { navigate(`/pharmacy/products/${item.id}`); closeSearch(); }}>
                          <span className="search-item-label">{item.label}</span>
                          <span className="search-item-sub">{item.sublabel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
        <div className="position-relative" ref={langRef}>
          <button className="header-btn header-lang" onClick={() => setShowLangDropdown(!showLangDropdown)}>
            <i className="fas fa-globe me-1" />
            <span className="d-none d-md-inline">{currentLangLabel}</span>
            <span className="d-inline d-md-none">{currentLang.toUpperCase()}</span>
            <i className="fas fa-chevron-down ms-1" style={{ fontSize: '0.6rem' }} />
          </button>
          {showLangDropdown && (
            <div className="header-dropdown">
              <div className="header-dropdown-title">Langue / Language</div>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`header-dropdown-item ${currentLang === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    localStorage.setItem('i18nextLng', lang.code)
                    setShowLangDropdown(false)
                    window.location.reload()
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

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
