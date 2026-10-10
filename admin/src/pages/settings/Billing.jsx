import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'

export default function Billing() {
  const [currentSub, setCurrentSub] = useState(null)
  const [plans, setPlans] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [subRes, plansRes, invoicesRes] = await Promise.all([
      api.get('/account/subscription', getToken()),
      api.get('/public/plans'),
      api.get('/account/invoices', getToken())
    ])
    if (subRes.success) setCurrentSub(subRes.data)
    if (plansRes.success) setPlans(plansRes.data || [])
    if (invoicesRes.success) setInvoices(invoicesRes.data || [])
    setLoading(false)
  }

  const statusBadge = (status) => {
    const colors = { trialing: 'info', active: 'success', past_due: 'warning', cancelled: 'secondary', expired: 'danger' }
    const labels = { trialing: 'Essai', active: 'Actif', past_due: 'Impayé', cancelled: 'Annulé', expired: 'Expiré' }
    return <span className={`badge bg-${colors[status] || 'secondary'}`}>{labels[status] || status}</span>
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatPrice = (price) => {
    if (price == null) return '-'
    return new Intl.NumberFormat('fr-FR').format(price) + ' XAF'
  }

  const isCurrentPlan = (plan) => {
    if (!currentSub) return false
    return plan.code === currentSub.plan_code || plan.id === currentSub.plan_id
  }

  const planColor = (index) => {
    const colors = ['#6c757d', '#1a8b3f', '#2196F3', '#FF9800']
    return colors[index % colors.length]
  }

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-border text-success" />
      <p>Chargement...</p>
    </div>
  )

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/settings/subscription">Paramètres</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Facturation</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-file-invoice-dollar me-2" />Facturation</h4>
      </div>

      {/* Plan actuel */}
      {currentSub && (
        <div className="card form-card mb-4">
          <div className="card-header"><i className="fas fa-box-open me-2" />Plan actuel</div>
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="badge bg-primary px-3 py-2" style={{ fontSize: '1.1rem' }}>
                {currentSub.plan_name_fr || currentSub.plan_name || currentSub.plan_code}
              </span>
              {statusBadge(currentSub.status)}
              {currentSub.price_monthly != null && (
                <span className="text-muted">{formatPrice(currentSub.price_monthly)}/mois</span>
              )}
              {currentSub.current_period_end && (
                <span className="text-muted ms-auto">
                  <i className="fas fa-calendar me-1" />Prochaine échéance : {formatDate(currentSub.current_period_end)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans disponibles */}
      <h5 className="mb-3"><i className="fas fa-th-large me-2" />Plans disponibles</h5>
      {plans.length > 0 ? (
        <div className="row g-3 mb-4">
          {plans.map((plan, idx) => {
            const isCurrent = isCurrentPlan(plan)
            const features = plan.features
              ? (typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features)
              : {}

            return (
              <div key={plan.id || idx} className="col-md-6 col-xl-3">
                <div className={`card form-card h-100 ${isCurrent ? 'border-success' : ''}`}
                  style={isCurrent ? { borderWidth: '2px' } : {}}>
                  <div className="card-header text-center" style={{ background: planColor(idx), color: '#fff' }}>
                    <h5 className="mb-0">{plan.name_fr || plan.name}</h5>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="text-center mb-3">
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {plan.price_monthly != null ? formatPrice(plan.price_monthly) : 'Gratuit'}
                      </span>
                      {plan.price_monthly > 0 && <span className="text-muted"> /mois</span>}
                    </div>

                    {isCurrent && (
                      <div className="text-center mb-3">
                        <span className="badge bg-success px-3 py-1">
                          <i className="fas fa-check me-1" />Plan actuel
                        </span>
                      </div>
                    )}

                    <ul className="list-unstyled flex-grow-1">
                      {plan.max_users != null && (
                        <li className="py-1 border-bottom">
                          <i className="fas fa-users me-2 text-muted" style={{ width: '20px' }} />
                          {plan.max_users === -1 ? 'Utilisateurs illimités' : `${plan.max_users} utilisateur(s)`}
                        </li>
                      )}
                      {plan.max_animals != null && (
                        <li className="py-1 border-bottom">
                          <i className="fas fa-paw me-2 text-muted" style={{ width: '20px' }} />
                          {plan.max_animals === null || plan.max_animals === -1 ? 'Animaux illimités' : `${plan.max_animals} animaux`}
                        </li>
                      )}
                      {Object.entries(features).map(([key, val]) => (
                        <li key={key} className="py-1 border-bottom d-flex justify-content-between">
                          <span>{key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</span>
                          {val
                            ? <i className="fas fa-check-circle text-success" />
                            : <i className="fas fa-times-circle text-danger" />
                          }
                        </li>
                      ))}
                    </ul>

                    <div className="text-center mt-3">
                      {isCurrent ? (
                        <button className="btn btn-outline-success w-100" disabled>
                          <i className="fas fa-check me-1" />Plan actuel
                        </button>
                      ) : (
                        <button
                          className="btn btn-rv-primary w-100"
                          onClick={() => alert('Contactez-nous pour changer de plan')}
                        >
                          <i className="fas fa-arrow-up me-1" />Choisir ce plan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card form-card mb-4">
          <div className="card-body text-center text-muted py-4">
            <i className="fas fa-th-large fa-2x mb-2 d-block" />
            Aucun plan disponible pour le moment.
          </div>
        </div>
      )}

      {/* Upgrade message */}
      <div className="alert alert-info mb-4">
        <i className="fas fa-info-circle me-2" />
        <strong>Changer de plan :</strong> Contactez-nous pour changer de plan. L'intégration de paiement en ligne sera disponible prochainement.
      </div>

      {/* Historique de facturation */}
      <div className="card form-card">
        <div className="card-header">
          <i className="fas fa-receipt me-2" />Historique de facturation
        </div>
        <div className="card-body p-0">
          {invoices.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td><small>{formatDate(inv.created_at || inv.date)}</small></td>
                      <td>{inv.description || inv.plan_name || '-'}</td>
                      <td>{formatPrice(inv.amount)}</td>
                      <td>
                        <span className={`badge bg-${inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'secondary'}`}>
                          {inv.status === 'paid' ? 'Payée' : inv.status === 'pending' ? 'En attente' : inv.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="fas fa-receipt fa-2x mb-2 d-block" />
              Aucune facture pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
