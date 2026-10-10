import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'

export default function Subscription() {
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    const res = await api.get('/account/subscription', getToken())
    if (res.success) setSub(res.data)
    setLoading(false)
  }

  const statusBadge = (status) => {
    const colors = { trialing: 'info', active: 'success', past_due: 'warning', cancelled: 'secondary', expired: 'danger' }
    const labels = { trialing: 'Essai', active: 'Actif', past_due: 'Impayé', cancelled: 'Annulé', expired: 'Expiré' }
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{labels[status] || status}</span>
  }

  const isStarterOrTrial = sub && (sub.status === 'trialing' || sub.plan_code === 'starter' || sub.plan_code === 'free')

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/settings">Paramètres</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Abonnement</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-crown me-2" />Abonnement</h4>
      </div>

      {sub ? (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card form-card">
              <div className="card-header"><i className="fas fa-box-open me-2"></i>Plan actuel</div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <span className="badge bg-primary px-4 py-2" style={{ fontSize: '1.25rem' }}>
                    {sub.plan_name_fr || sub.plan_code}
                  </span>
                  <div className="mt-2">{statusBadge(sub.status)}</div>
                </div>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="text-muted">Facturation</td><td>{sub.billing_cycle === 'yearly' ? 'Annuelle' : 'Mensuelle'}</td></tr>
                    <tr><td className="text-muted">Prix</td><td>{new Intl.NumberFormat('fr-FR').format(sub.price_monthly)} XAF/mois</td></tr>
                    {sub.status === 'trialing' && <tr><td className="text-muted">Fin essai</td><td>{sub.trial_ends_at}</td></tr>}
                    {sub.current_period_end && <tr><td className="text-muted">Prochaine échéance</td><td>{sub.current_period_end}</td></tr>}
                    <tr><td className="text-muted">Utilisateurs max</td><td>{sub.max_users === -1 ? 'Illimité' : sub.max_users}</td></tr>
                    <tr><td className="text-muted">Animaux max</td><td>{sub.max_animals === null ? 'Illimité' : sub.max_animals}</td></tr>
                  </tbody>
                </table>
                {isStarterOrTrial && (
                  <div className="text-center mt-3">
                    <Link to="/settings/billing" className="btn btn-rv-primary">
                      <i className="fas fa-arrow-up me-2"></i>Passer au plan supérieur
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card form-card">
              <div className="card-header"><i className="fas fa-list-check me-2"></i>Fonctionnalités incluses</div>
              <div className="card-body">
                {sub.features && (() => {
                  const f = typeof sub.features === 'string' ? JSON.parse(sub.features) : sub.features
                  return Object.entries(f).map(([k, v]) => (
                    <div key={k} className="d-flex justify-content-between py-1 border-bottom">
                      <span>{k.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</span>
                      {v ? <i className="fas fa-check-circle text-success"></i> : <i className="fas fa-times-circle text-danger"></i>}
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card form-card">
          <div className="card-body text-center py-5">
            <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
            <h5 className="text-muted mb-3">Aucun abonnement actif</h5>
            <p className="text-muted mb-4">Vous n'avez pas encore d'abonnement. Choisissez un plan pour débloquer toutes les fonctionnalités.</p>
            <Link to="/settings/billing" className="btn btn-rv-primary btn-lg">
              <i className="fas fa-crown me-2"></i>Choisir un plan
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
