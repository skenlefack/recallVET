import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return "A l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days} jours`
}

function typeIcon(type) {
  switch (type) {
    case 'success': return 'fas fa-check-circle text-success'
    case 'warning': return 'fas fa-exclamation-triangle text-warning'
    case 'error': return 'fas fa-times-circle text-danger'
    default: return 'fas fa-info-circle text-primary'
  }
}

export default function NotificationList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filterType, setFilterType] = useState('')
  const [filterRead, setFilterRead] = useState('')
  const [markingAll, setMarkingAll] = useState(false)
  const itemsPerPage = 15

  useEffect(() => { loadData() }, [currentPage, filterType, filterRead])

  const loadData = async () => {
    setLoading(true)
    let url = `/v1/notifications?page=${currentPage}&limit=${itemsPerPage}`
    if (filterType) url += `&type=${filterType}`
    if (filterRead === 'unread') url += '&is_read=0'
    if (filterRead === 'read') url += '&is_read=1'

    const res = await api.get(url, getToken())
    if (res.success) {
      setItems(res.data || [])
      setTotalItems(res.pagination?.total || res.total || 0)
    }
    setLoading(false)
  }

  const handleMarkRead = async (id) => {
    const res = await api.put(`/v1/notifications/${id}/read`, {}, getToken())
    if (res.success) {
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    const res = await api.put('/v1/notifications/read-all', {}, getToken())
    if (res.success) {
      setItems(prev => prev.map(n => ({ ...n, is_read: 1 })))
    }
    setMarkingAll(false)
  }

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setCurrentPage(1)
  }

  const unreadCount = items.filter(n => !n.is_read).length

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Notifications</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-bell" />Notifications <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
        {unreadCount > 0 && (
          <button className="btn btn-outline-success btn-sm" onClick={handleMarkAllRead} disabled={markingAll}>
            <i className={`fas ${markingAll ? 'fa-spinner fa-spin' : 'fa-check-double'} me-1`} />
            Marquer tout comme lu
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="row g-2">
          <div className="col-md-3">
            <select className="form-select" value={filterType} onChange={handleFilterChange(setFilterType)}>
              <option value="">Tous les types</option>
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filterRead} onChange={handleFilterChange(setFilterRead)}>
              <option value="">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card form-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement des notifications...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-bell-slash empty-icon" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {items.map(n => (
                <div
                  key={n.id}
                  className={`list-group-item list-group-item-action d-flex align-items-start gap-3 py-3 ${!n.is_read ? 'bg-light' : ''}`}
                  style={{ cursor: !n.is_read ? 'pointer' : 'default' }}
                  onClick={() => { if (!n.is_read) handleMarkRead(n.id) }}
                >
                  <div className="mt-1">
                    <i className={typeIcon(n.type)} style={{ fontSize: '1.1rem' }} />
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className={`${!n.is_read ? 'fw-bold' : ''}`}>{n.title}</div>
                      <small className="text-muted ms-3 text-nowrap">{timeAgo(n.created_at)}</small>
                    </div>
                    {n.body && (
                      <div className="text-muted small mt-1">{n.body}</div>
                    )}
                  </div>
                  {!n.is_read && (
                    <span className="bg-primary rounded-circle mt-2" style={{ width: 8, height: 8, flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {totalItems > 0 && (
        <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)}
          totalItems={totalItems} itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage} itemName="notifications" />
      )}
    </div>
  )
}
