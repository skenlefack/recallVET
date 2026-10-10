import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getToken } from '../../services/api'

export default function TenantDetail() {
  const { id } = useParams()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => { loadTenant() }, [id])

  const loadTenant = async () => {
    setLoading(true)
    const res = await api.get(`/admin/tenants/${id}`, getToken())
    if (res.success) setTenant(res.data)
    setLoading(false)
  }

  const toggleTenant = async () => {
    const action = tenant.is_active ? 'désactiver' : 'activer'
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} "${tenant.name}" ?`)) return
    setToggling(true)
    await api.put(`/admin/tenants/${id}/toggle`, {}, getToken())
    await loadTenant()
    setToggling(false)
  }

  const statusClass = (status) => {
    const map = { active: 'active', trialing: 'trialing', past_due: 'draft', cancelled: 'cancelled', expired: 'expired' }
    return map[status] || ''
  }

  const statusLabel = (status) => {
    const map = { active: 'Actif', trialing: 'Essai', past_due: 'Impayé', cancelled: 'Annulé', expired: 'Expiré' }
    return map[status] || status || '-'
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-border text-success" />
      <p>Chargement du tenant...</p>
    </div>
  )

  if (!tenant) return (
    <div className="alert alert-danger">Impossible de charger les détails du tenant.</div>
  )

  const sub = tenant.subscription || {}
  const members = tenant.members || tenant.users || []
  const stats = tenant.stats || {}

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/superadmin/tenants">Tenants</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Détails</span>
      </div>
      <div className="page-title-bar">
        <h4>
          <i className="fas fa-sitemap me-2" />
          {tenant.name}
          {tenant.is_active
            ? <span className="badge-status active ms-2"><i className="fas fa-check me-1" />Actif</span>
            : <span className="badge-status cancelled ms-2"><i className="fas fa-ban me-1" />Inactif</span>
          }
        </h4>
        <button
          className={`btn btn-${tenant.is_active ? 'danger' : 'success'}`}
          onClick={toggleTenant}
          disabled={toggling}
        >
          {toggling && <span className="spinner-border spinner-border-sm me-2" />}
          <i className={`fas fa-${tenant.is_active ? 'ban' : 'check'} me-1`} />
          {tenant.is_active ? 'Désactiver' : 'Activer'}
        </button>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Animaux', value: stats.animals ?? stats.totalAnimals ?? '-', icon: 'fas fa-paw', color: '#00BCD4' },
          { label: 'Clients', value: stats.parties ?? stats.totalParties ?? '-', icon: 'fas fa-address-book', color: '#E91E63' },
          { label: 'Rendez-vous', value: stats.appointments ?? stats.totalAppointments ?? '-', icon: 'fas fa-calendar-check', color: '#FF9800' },
          { label: 'Utilisateurs', value: stats.users ?? tenant.user_count ?? members.length ?? '-', icon: 'fas fa-users', color: '#2196F3' },
        ].map(s => (
          <div key={s.label} className="col-sm-6 col-xl-3">
            <div className="card stat-mini-card">
              <div className="stat-mini-icon" style={{ background: s.color }}><i className={s.icon} /></div>
              <div className="stat-mini-value">{s.value}</div>
              <div className="stat-mini-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Informations du tenant */}
        <div className="col-lg-6">
          <div className="card form-card">
            <div className="card-header"><i className="fas fa-info-circle me-2" />Informations</div>
            <div className="card-body">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: '40%' }}>Nom</td><td>{tenant.name}</td></tr>
                  <tr><td className="text-muted">Slug</td><td><code>{tenant.slug}</code></td></tr>
                  <tr><td className="text-muted">Email</td><td>{tenant.email || '-'}</td></tr>
                  <tr><td className="text-muted">Téléphone</td><td>{tenant.phone || '-'}</td></tr>
                  <tr><td className="text-muted">Adresse</td><td>{tenant.address || '-'}</td></tr>
                  <tr><td className="text-muted">Créé le</td><td>{formatDate(tenant.created_at)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Abonnement */}
        <div className="col-lg-6">
          <div className="card form-card">
            <div className="card-header"><i className="fas fa-crown me-2" />Abonnement</div>
            <div className="card-body">
              {sub.plan_name || sub.plan_code ? (
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '40%' }}>Plan</td>
                      <td><span className="badge bg-primary">{sub.plan_name || sub.plan_code}</span></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Statut</td>
                      <td><span className={`badge-status ${statusClass(sub.status)}`}>{statusLabel(sub.status)}</span></td>
                    </tr>
                    {sub.trial_start && (
                      <tr><td className="text-muted">Début essai</td><td>{formatDate(sub.trial_start)}</td></tr>
                    )}
                    {sub.trial_ends_at && (
                      <tr><td className="text-muted">Fin essai</td><td>{formatDate(sub.trial_ends_at)}</td></tr>
                    )}
                    {sub.current_period_start && (
                      <tr><td className="text-muted">Début période</td><td>{formatDate(sub.current_period_start)}</td></tr>
                    )}
                    {sub.current_period_end && (
                      <tr><td className="text-muted">Fin période</td><td>{formatDate(sub.current_period_end)}</td></tr>
                    )}
                    {sub.billing_cycle && (
                      <tr><td className="text-muted">Facturation</td><td>{sub.billing_cycle === 'yearly' ? 'Annuelle' : 'Mensuelle'}</td></tr>
                    )}
                    {sub.price_monthly != null && (
                      <tr><td className="text-muted">Prix</td><td>{new Intl.NumberFormat('fr-FR').format(sub.price_monthly)} XAF/mois</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-box-open fa-2x mb-2 d-block" />
                  Aucun abonnement
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Membres de l'équipe */}
        <div className="col-12">
          <div className="card form-card">
            <div className="card-header">
              <i className="fas fa-users me-2" />Membres de l'équipe
              <span className="badge bg-light text-dark ms-2" style={{ fontSize: '0.75rem' }}>{members.length}</span>
            </div>
            <div className="card-body p-0">
              {members.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Inscrit le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id}>
                          <td>{m.first_name} {m.last_name}</td>
                          <td><small>{m.email}</small></td>
                          <td>
                            <span className={`badge bg-${m.role === 'owner' ? 'primary' : m.role === 'admin' ? 'info' : 'secondary'}`}>
                              {m.role === 'owner' ? 'Propriétaire' : m.role === 'admin' ? 'Admin' : m.role || '-'}
                            </span>
                          </td>
                          <td><small className="text-muted">{formatDate(m.created_at)}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-users fa-2x mb-2 d-block" />
                  Aucun membre trouvé
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
