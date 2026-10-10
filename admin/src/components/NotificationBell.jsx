import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { api, getToken } from '../services/api'

function timeAgo(dateStr, t) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return t('notifications.justNow')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('notifications.minutesAgo', { count: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('notifications.hoursAgo', { count: hours })
  const days = Math.floor(hours / 24)
  return t('notifications.daysAgo', { count: days })
}

export default function NotificationBell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const fetchUnreadCount = useCallback(async () => {
    const res = await api.get('/v1/notifications/unread-count', getToken())
    if (res.success) {
      setUnreadCount(res.data.count)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    const res = await api.get('/v1/notifications?page=1&limit=10', getToken())
    if (res.success) {
      setNotifications(res.data)
    }
    setLoading(false)
  }, [])

  // Poll unread count every 60 seconds
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    const next = !showDropdown
    setShowDropdown(next)
    if (next) {
      fetchNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    const res = await api.put('/v1/notifications/read-all', {}, getToken())
    if (res.success) {
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    }
  }

  const handleMarkRead = async (id) => {
    const res = await api.put(`/v1/notifications/${id}/read`, {}, getToken())
    if (res.success) {
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
    }
  }

  const typeIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle text-success'
      case 'warning': return 'fas fa-exclamation-triangle text-warning'
      case 'error': return 'fas fa-times-circle text-danger'
      default: return 'fas fa-info-circle text-primary'
    }
  }

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link text-dark p-0 position-relative"
        onClick={handleToggle}
        aria-label={t('notifications.title')}
      >
        <i className="fas fa-bell fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '0.65rem' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="dropdown-menu show position-absolute end-0 mt-2 shadow"
          style={{ minWidth: 340, maxHeight: 420, overflowY: 'auto' }}>
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <strong>{t('notifications.title')}</strong>
            {unreadCount > 0 && (
              <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={handleMarkAllRead}>
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <hr className="dropdown-divider m-0" />

          {loading ? (
            <div className="text-center py-3 text-muted">
              <i className="fas fa-spinner fa-spin me-1"></i>
              {t('common.loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-bell-slash d-block mb-2 fs-4"></i>
              {t('notifications.empty')}
            </div>
          ) : (
            <>
              {notifications.map(n => (
                <button
                  key={n.id}
                  className={`dropdown-item py-2 px-3 d-flex align-items-start gap-2 ${!n.is_read ? 'bg-light' : ''}`}
                  style={{ whiteSpace: 'normal' }}
                  onClick={() => { if (!n.is_read) handleMarkRead(n.id) }}
                >
                  <i className={`${typeIcon(n.type)} mt-1`}></i>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold small">{n.title}</div>
                    {n.body && (
                      <div className="text-muted small text-truncate">{n.body}</div>
                    )}
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {timeAgo(n.created_at, t)}
                    </div>
                  </div>
                  {!n.is_read && (
                    <span className="bg-primary rounded-circle mt-1" style={{ width: 8, height: 8, flexShrink: 0 }}></span>
                  )}
                </button>
              ))}
            </>
          )}

          <hr className="dropdown-divider m-0" />
          <button className="dropdown-item text-center small py-2"
            onClick={() => { setShowDropdown(false); navigate('/notifications'); }}>
            {t('notifications.viewAll')}
          </button>
        </div>
      )}
    </div>
  )
}
