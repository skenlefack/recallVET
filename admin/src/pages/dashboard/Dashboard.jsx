import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

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

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ parties: 0, animals: 0, appointments: 0, encounters: 0 })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    loadStats()
    loadRecentActivity()
    const timer = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const loadStats = async () => {
    const token = getToken()
    try {
      const [partiesRes, animalsRes, appointmentsRes, encountersRes] = await Promise.all([
        api.get('/v1/clinic/parties?limit=1', token),
        api.get('/v1/clinic/animals?limit=1', token),
        api.get('/v1/clinic/appointments?limit=1', token),
        api.get('/v1/clinic/encounters?limit=1', token)
      ])
      setStats({
        parties: partiesRes.pagination?.total || 0,
        animals: animalsRes.pagination?.total || 0,
        appointments: appointmentsRes.pagination?.total || 0,
        encounters: encountersRes.pagination?.total || 0
      })
    } catch (e) {}
    setLoading(false)
  }

  const loadRecentActivity = async () => {
    setActivityLoading(true)
    const res = await api.get('/v1/notifications?limit=5', getToken())
    if (res.success) {
      setRecentActivity(res.data || [])
    }
    setActivityLoading(false)
  }

  const greeting = () => {
    const h = time.getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const dateStr = time.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const statCards = [
    { title: 'Clients', value: stats.parties, icon: 'fas fa-users', gradient: 'linear-gradient(135deg, #1a8b3f, #2db85a)', to: '/clinic/parties' },
    { title: 'Animaux', value: stats.animals, icon: 'fas fa-paw', gradient: 'linear-gradient(135deg, #2196F3, #64B5F6)', to: '/clinic/animals' },
    { title: 'Rendez-vous', value: stats.appointments, icon: 'fas fa-calendar-check', gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)', to: '/clinic/appointments' },
    { title: 'Consultations', value: stats.encounters, icon: 'fas fa-stethoscope', gradient: 'linear-gradient(135deg, #9C27B0, #CE93D8)', to: '/clinic/encounters' }
  ]

  const quickActions = [
    { section: 'Clinique', color: '#1a8b3f', icon: 'fas fa-stethoscope', links: [
      { to: '/clinic/parties/new', icon: 'fas fa-user-plus', label: 'Nouveau client' },
      { to: '/clinic/animals/new', icon: 'fas fa-paw', label: 'Nouvel animal' },
      { to: '/clinic/appointments/new', icon: 'fas fa-calendar-plus', label: 'Nouveau RDV' },
      { to: '/clinic/encounters/new', icon: 'fas fa-notes-medical', label: 'Nouvelle consultation' },
    ]},
    { section: 'Élevage', color: '#2196F3', icon: 'fas fa-tractor', links: [
      { to: '/farm/farms', icon: 'fas fa-warehouse', label: 'Exploitations' },
      { to: '/farm/farms/new', icon: 'fas fa-plus-circle', label: 'Nouvelle exploitation' },
      { to: '/farm/visits/new', icon: 'fas fa-clipboard-list', label: 'Nouvelle visite' },
      { to: '/farm/health-events', icon: 'fas fa-exclamation-triangle', label: 'Événements' },
    ]},
    { section: 'Pharmacie', color: '#FF9800', icon: 'fas fa-pills', links: [
      { to: '/pharmacy/products', icon: 'fas fa-capsules', label: 'Produits' },
      { to: '/pharmacy/stock', icon: 'fas fa-boxes-stacked', label: 'Stock' },
      { to: '/pharmacy/sales/new', icon: 'fas fa-cash-register', label: 'Nouvelle vente' },
      { to: '/pharmacy/dispensing/new', icon: 'fas fa-prescription-bottle', label: 'Dispensation' },
    ]}
  ]

  return (
    <div className="dashboard-page">
      {/* Welcome banner */}
      <div className="welcome-banner mb-4">
        <div className="welcome-content">
          <div className="welcome-text">
            <h3 className="mb-1">{greeting()}, {user?.first_name} !</h3>
            <p className="mb-0 opacity-75">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
          </div>
          <div className="welcome-illustration">
            <i className="fas fa-paw" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div key={card.title} className="col-6 col-xl-3">
            <Link to={card.to} className="text-decoration-none">
              <div className="dashboard-stat-card" style={{ background: card.gradient }}>
                <div className="stat-card-icon">
                  <i className={card.icon} />
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-value">{loading ? '...' : card.value}</div>
                  <div className="stat-card-label">{card.title}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h5 className="mb-3 fw-bold"><i className="fas fa-bolt me-2 text-warning" />Actions rapides</h5>
      <div className="row g-3 mb-4">
        {quickActions.map((section) => (
          <div key={section.section} className="col-md-4">
            <div className="card quick-action-card h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <div className="quick-action-header-icon" style={{ background: section.color }}>
                  <i className={section.icon} />
                </div>
                <span className="fw-bold">{section.section}</span>
              </div>
              <div className="card-body p-0">
                {section.links.map((link) => (
                  <Link key={link.to} to={link.to} className="quick-action-link">
                    <i className={link.icon} style={{ color: section.color }} />
                    <span>{link.label}</span>
                    <i className="fas fa-chevron-right ms-auto opacity-25" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="fw-bold"><i className="fas fa-clock-rotate-left me-2 text-success" />Activité récente</span>
          <Link to="/notifications" className="btn btn-link btn-sm text-decoration-none">
            Voir tout <i className="fas fa-chevron-right ms-1" />
          </Link>
        </div>
        <div className="card-body p-0">
          {activityLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-success" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox text-muted mb-3" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
              <p className="text-muted mb-0">Commencez à utiliser RecallVET pour voir votre activité ici</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {recentActivity.map(n => (
                <div key={n.id} className="list-group-item d-flex align-items-center gap-3 py-3">
                  <i className={typeIcon(n.type)} style={{ fontSize: '1.1rem' }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className={`small ${!n.is_read ? 'fw-bold' : ''}`}>{n.title}</div>
                    {n.body && <div className="text-muted small text-truncate">{n.body}</div>}
                  </div>
                  <small className="text-muted text-nowrap">{timeAgo(n.created_at)}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
