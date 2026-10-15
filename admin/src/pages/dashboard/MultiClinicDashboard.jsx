import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useTenant } from '../../context/TenantContext'

export default function MultiClinicDashboard() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  async function loadSummary() {
    setLoading(true)
    const res = await api.get('/v1/analytics/multi-clinic-summary')
    if (res.success) setData(res.data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-success" />
      </div>
    )
  }

  if (!data || data.structures.length === 0) {
    return (
      <div className="container-fluid py-4">
        <h4>Vue Multi-Clinique</h4>
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2" />
          Aucune structure configurée. Ajoutez des structures dans
          <a href="/settings/tenant" className="ms-1">Paramètres &gt; Établissement</a>.
        </div>
      </div>
    )
  }

  const { structures, appointments, revenue, animals, stockAlerts } = data

  // Build lookup maps
  const apptMap = {}
  appointments.forEach(a => { apptMap[a.structure_id || 'none'] = a })
  const revMap = {}
  revenue.forEach(r => { revMap[r.structure_id || 'none'] = r })
  const animalMap = {}
  animals.forEach(a => { animalMap[a.structure_id || 'none'] = a })
  const alertMap = {}
  stockAlerts.forEach(a => { alertMap[a.structure_id || 'none'] = a })

  // Totals
  const totalAppts = appointments.reduce((s, a) => s + a.total, 0)
  const totalRevenue = revenue.reduce((s, r) => s + parseFloat(r.revenue || 0), 0)
  const totalAnimals = animals.reduce((s, a) => s + a.count, 0)
  const totalAlerts = stockAlerts.reduce((s, a) => s + a.alert_count, 0)

  const currency = tenant?.currency || 'XAF'

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="fas fa-building me-2 text-success" />
            Vue Multi-Clinique
          </h4>
          <p className="text-muted mb-0">{structures.length} structure(s) — Vue consolidée</p>
        </div>
        <button className="btn btn-outline-success btn-sm" onClick={loadSummary}>
          <i className="fas fa-sync me-1" />Actualiser
        </button>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="rv-stat-card">
            <div className="rv-stat-icon" style={{ background: 'rgba(13,110,63,0.1)', color: '#0d6e3f' }}>
              <i className="fas fa-calendar-check" />
            </div>
            <div className="rv-stat-content">
              <div className="rv-stat-value">{totalAppts}</div>
              <div className="rv-stat-label">RDV aujourd'hui</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="rv-stat-card">
            <div className="rv-stat-icon" style={{ background: 'rgba(25,135,84,0.1)', color: '#198754' }}>
              <i className="fas fa-coins" />
            </div>
            <div className="rv-stat-content">
              <div className="rv-stat-value">{totalRevenue.toLocaleString()} {currency}</div>
              <div className="rv-stat-label">Revenus ce mois</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="rv-stat-card">
            <div className="rv-stat-icon" style={{ background: 'rgba(13,110,253,0.1)', color: '#0d6efd' }}>
              <i className="fas fa-paw" />
            </div>
            <div className="rv-stat-content">
              <div className="rv-stat-value">{totalAnimals}</div>
              <div className="rv-stat-label">Animaux actifs</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="rv-stat-card">
            <div className="rv-stat-icon" style={{ background: totalAlerts > 0 ? 'rgba(220,53,69,0.1)' : 'rgba(108,117,125,0.1)', color: totalAlerts > 0 ? '#dc3545' : '#6c757d' }}>
              <i className="fas fa-exclamation-triangle" />
            </div>
            <div className="rv-stat-content">
              <div className="rv-stat-value">{totalAlerts}</div>
              <div className="rv-stat-label">Alertes stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-structure breakdown */}
      <div className="row g-3">
        {structures.map(struct => {
          const appt = apptMap[struct.id] || { total: 0, scheduled: 0, completed: 0 }
          const rev = revMap[struct.id] || { revenue: 0, invoice_count: 0 }
          const anim = animalMap[struct.id] || { count: 0 }
          const alert = alertMap[struct.id] || { alert_count: 0 }
          const typeLabels = { clinic: 'Clinique', pharmacy: 'Pharmacie', farm_practice: 'Élevage', mixed: 'Mixte' }

          return (
            <div key={struct.id} className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">
                      <i className="fas fa-building me-2 text-success" />
                      {struct.name}
                    </h6>
                    <small className="text-muted">
                      {typeLabels[struct.type] || struct.type}
                      {struct.site_count > 0 && ` — ${struct.site_count} site(s)`}
                    </small>
                  </div>
                  {alert.alert_count > 0 && (
                    <span className="badge bg-danger">
                      <i className="fas fa-exclamation-triangle me-1" />
                      {alert.alert_count} alerte(s)
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="text-center p-2 rounded" style={{ background: 'rgba(13,110,63,0.05)' }}>
                        <div className="fs-4 fw-bold text-success">{appt.total}</div>
                        <small className="text-muted">RDV aujourd'hui</small>
                        {appt.total > 0 && (
                          <div className="mt-1">
                            <span className="badge bg-warning text-dark me-1">{appt.scheduled} en attente</span>
                            <span className="badge bg-success">{appt.completed} terminé(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-2 rounded" style={{ background: 'rgba(25,135,84,0.05)' }}>
                        <div className="fs-4 fw-bold text-success">
                          {parseFloat(rev.revenue || 0).toLocaleString()}
                        </div>
                        <small className="text-muted">{currency} ce mois</small>
                        <div className="mt-1">
                          <span className="badge bg-secondary">{rev.invoice_count || 0} facture(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-2 rounded" style={{ background: 'rgba(13,110,253,0.05)' }}>
                        <div className="fs-5 fw-bold text-primary">{anim.count}</div>
                        <small className="text-muted">Animaux actifs</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-2 rounded" style={{ background: alert.alert_count > 0 ? 'rgba(220,53,69,0.05)' : 'rgba(108,117,125,0.05)' }}>
                        <div className={`fs-5 fw-bold ${alert.alert_count > 0 ? 'text-danger' : 'text-muted'}`}>{alert.alert_count}</div>
                        <small className="text-muted">Alertes stock</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
