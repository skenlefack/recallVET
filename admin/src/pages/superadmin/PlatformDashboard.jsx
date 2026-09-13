import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'

export default function PlatformDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const res = await api.get('/admin/dashboard', getToken())
    if (res.success) setData(res.data)
    setLoading(false)
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>
  if (!data) return <div className="alert alert-danger">Failed to load dashboard</div>

  const { stats, recentSignups, recentDemos } = data

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/superadmin">Super Admin</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Dashboard</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-chart-line me-2" />Vue plateforme</h4>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Tenants actifs', value: stats.totalTenants, icon: 'fas fa-sitemap', color: '#1a8b3f' },
          { label: 'Utilisateurs', value: stats.totalUsers, icon: 'fas fa-users', color: '#2196F3' },
          { label: 'Abonnements actifs', value: stats.activeSubscriptions, icon: 'fas fa-credit-card', color: '#FF9800' },
          { label: 'En essai', value: stats.trialSubscriptions, icon: 'fas fa-clock', color: '#9C27B0' },
          { label: 'Animaux', value: stats.totalAnimals, icon: 'fas fa-paw', color: '#00BCD4' },
          { label: 'Clients', value: stats.totalParties, icon: 'fas fa-address-book', color: '#E91E63' }
        ].map(s => (
          <div key={s.label} className="col-sm-6 col-xl-2">
            <div className="card stat-card">
              <div className="card-body text-center py-3">
                <div className="stat-icon mx-auto mb-2 text-white" style={{ background: s.color }}><i className={s.icon}></i></div>
                <h4 className="mb-0">{s.value}</h4>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">Inscriptions recentes</div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead><tr><th>Nom</th><th>Email</th><th>Date</th></tr></thead>
                <tbody>
                  {recentSignups?.map(u => (
                    <tr key={u.id}>
                      <td>{u.first_name} {u.last_name}</td>
                      <td><small>{u.email}</small></td>
                      <td><small className="text-muted">{new Date(u.created_at).toLocaleDateString('fr-FR')}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">Demandes de demo</div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead><tr><th>Nom</th><th>Cabinet</th><th>Statut</th></tr></thead>
                <tbody>
                  {recentDemos?.map(d => (
                    <tr key={d.id}>
                      <td>{d.full_name}</td>
                      <td><small>{d.practice_name || '-'}</small></td>
                      <td><span className={`badge bg-${d.status === 'new' ? 'info' : d.status === 'converted' ? 'success' : 'secondary'}`}>{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
