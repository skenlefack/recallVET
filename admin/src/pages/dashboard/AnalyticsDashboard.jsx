import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { api, getToken } from '../../services/api'

const COLORS = ['#1a8b3f', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63']
const PIE_COLORS = ['#1a8b3f', '#2196F3', '#e53e3e', '#FF9800']

const formatXAF = (value) => new Intl.NumberFormat('fr-FR').format(value || 0) + ' XAF'
const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value || 0)

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('12m')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [revenue, setRevenue] = useState([])
  const [encountersByVet, setEncountersByVet] = useState([])
  const [appointmentStats, setAppointmentStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [vaccinationStats, setVaccinationStats] = useState([])
  const [stockAlerts, setStockAlerts] = useState({ below_reorder: [], expiring_soon: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    let from = new Date()
    if (period === '30d') from.setDate(now.getDate() - 30)
    else if (period === '90d') from.setDate(now.getDate() - 90)
    else if (period === '12m') from.setMonth(now.getMonth() - 11)

    if (period !== 'custom') {
      setDateFrom(from.toISOString().split('T')[0])
      setDateTo(now.toISOString().split('T')[0])
    }
  }, [period])

  useEffect(() => {
    if (dateFrom && dateTo) loadData()
  }, [dateFrom, dateTo])

  const loadData = async () => {
    setLoading(true)
    const token = getToken()
    const params = `date_from=${dateFrom}&date_to=${dateTo}`

    try {
      const [revRes, encRes, apptRes, prodRes, vaccRes, stockRes] = await Promise.all([
        api.get(`/v1/analytics/revenue?period=monthly&${params}`, token),
        api.get(`/v1/analytics/encounters-by-vet?${params}`, token),
        api.get('/v1/analytics/appointments-stats', token),
        api.get('/v1/analytics/top-products', token),
        api.get('/v1/analytics/vaccination-stats', token),
        api.get('/v1/analytics/stock-alerts', token)
      ])

      if (revRes.success) setRevenue(revRes.data || [])
      if (encRes.success) setEncountersByVet(encRes.data || [])
      if (apptRes.success) setAppointmentStats(apptRes.data || null)
      if (prodRes.success) setTopProducts(prodRes.data || [])
      if (vaccRes.success) setVaccinationStats(vaccRes.data || [])
      if (stockRes.success) setStockAlerts(stockRes.data || { below_reorder: [], expiring_soon: [] })
    } catch (e) {}
    setLoading(false)
  }

  // KPI calculations
  const totalRevenue = revenue.reduce((sum, r) => sum + (parseFloat(r.total_revenue) || 0), 0)
  const totalInvoices = revenue.reduce((sum, r) => sum + (parseInt(r.invoice_count) || 0), 0)
  const totalEncounters = encountersByVet.reduce((sum, e) => sum + (parseInt(e.count) || 0), 0)
  const totalVaccinations = vaccinationStats.reduce((sum, v) => sum + (parseInt(v.count) || 0), 0)
  const totalAlerts = (stockAlerts.below_reorder?.length || 0) + (stockAlerts.expiring_soon?.length || 0)

  const pieData = appointmentStats ? [
    { name: 'Planifiés', value: appointmentStats.scheduled || 0 },
    { name: 'Terminés', value: appointmentStats.completed || 0 },
    { name: 'Annulés', value: appointmentStats.cancelled || 0 },
    { name: 'Absents', value: appointmentStats.no_show || 0 }
  ].filter(d => d.value > 0) : []

  if (loading) {
    return (
      <div>
        <div className="rv-breadcrumb">
          <Link to="/dashboard">Accueil</Link>
          <span className="separator"><i className="fas fa-chevron-right" /></span>
          <span>Analytiques</span>
        </div>
        <div className="loading-container">
          <div className="spinner-border text-success" />
          <p>Chargement des analytiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Analytiques</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-chart-bar" />Tableau analytique</h4>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Chiffre d\'affaires', value: formatXAF(totalRevenue), sub: `${totalInvoices} factures`, icon: 'fas fa-coins', gradient: 'linear-gradient(135deg, #1a8b3f, #2db85a)' },
          { label: 'Consultations', value: formatNumber(totalEncounters), sub: `${encountersByVet.length} vétérinaires`, icon: 'fas fa-stethoscope', gradient: 'linear-gradient(135deg, #2196F3, #64B5F6)' },
          { label: 'Vaccinations', value: formatNumber(totalVaccinations), sub: 'sur la période', icon: 'fas fa-syringe', gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)' },
          { label: 'Alertes stock', value: totalAlerts, sub: `${stockAlerts.below_reorder?.length || 0} ruptures · ${stockAlerts.expiring_soon?.length || 0} péremptions`, icon: 'fas fa-exclamation-triangle', gradient: totalAlerts > 0 ? 'linear-gradient(135deg, #e53e3e, #fc8181)' : 'linear-gradient(135deg, #38a169, #68d391)' }
        ].map((kpi, i) => (
          <div key={i} className="col-6 col-xl-3">
            <div className="dashboard-stat-card" style={{ background: kpi.gradient }}>
              <div className="stat-card-icon"><i className={kpi.icon} /></div>
              <div className="stat-card-info">
                <div className="stat-card-value" style={{ fontSize: '1.3rem' }}>{kpi.value}</div>
                <div className="stat-card-label">{kpi.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2 }}>{kpi.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Period filter */}
      <div className="filter-bar mb-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="fas fa-calendar me-1" />Période :</span>
          {[
            { key: '30d', label: '30 jours' },
            { key: '90d', label: '90 jours' },
            { key: '12m', label: '12 mois' },
            { key: 'custom', label: 'Personnalisé' }
          ].map(p => (
            <button key={p.key} className={`btn btn-sm ${period === p.key ? 'btn-rv-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPeriod(p.key)}>
              {p.label}
            </button>
          ))}
          {period === 'custom' && (
            <>
              <input type="date" className="form-control form-control-sm" style={{ width: 'auto' }}
                value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span>—</span>
              <input type="date" className="form-control form-control-sm" style={{ width: 'auto' }}
                value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </>
          )}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="card form-card h-100">
            <div className="card-header"><i className="fas fa-chart-area me-2" />Évolution du chiffre d'affaires</div>
            <div className="card-body">
              {revenue.length === 0 ? (
                <div className="empty-state"><i className="fas fa-chart-line empty-icon" /><p>Aucune donnée pour cette période</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a8b3f" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a8b3f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#a0aec0" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#a0aec0" />
                    <Tooltip formatter={(v) => formatXAF(v)} />
                    <Area type="monotone" dataKey="total_revenue" stroke="#1a8b3f" strokeWidth={2.5} fill="url(#colorRevenue)" name="Revenu" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card form-card h-100">
            <div className="card-header"><i className="fas fa-calendar-check me-2" />Rendez-vous du mois</div>
            <div className="card-body d-flex align-items-center justify-content-center">
              {pieData.length === 0 ? (
                <div className="empty-state"><i className="fas fa-calendar empty-icon" /><p>Aucun rendez-vous</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                      paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card form-card h-100">
            <div className="card-header"><i className="fas fa-user-md me-2" />Consultations par vétérinaire</div>
            <div className="card-body">
              {encountersByVet.length === 0 ? (
                <div className="empty-state"><i className="fas fa-stethoscope empty-icon" /><p>Aucune consultation</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={encountersByVet} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#a0aec0" />
                    <YAxis dataKey="vet_name" type="category" width={110} tick={{ fontSize: 11 }} stroke="#a0aec0" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2196F3" radius={[0, 6, 6, 0]} name="Consultations" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card form-card h-100">
            <div className="card-header"><i className="fas fa-capsules me-2" />Top 10 produits vendus</div>
            <div className="card-body">
              {topProducts.length === 0 ? (
                <div className="empty-state"><i className="fas fa-pills empty-icon" /><p>Aucune vente</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                    <XAxis dataKey="product_name" tick={{ fontSize: 9, angle: -25 }} height={60} stroke="#a0aec0" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#a0aec0" />
                    <Tooltip />
                    <Bar dataKey="total_quantity" fill="#FF9800" radius={[6, 6, 0, 0]} name="Quantité" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vaccination trend */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="card form-card">
            <div className="card-header"><i className="fas fa-syringe me-2" />Tendance des vaccinations (12 mois)</div>
            <div className="card-body">
              {vaccinationStats.length === 0 ? (
                <div className="empty-state"><i className="fas fa-syringe empty-icon" /><p>Aucune vaccination</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={vaccinationStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#a0aec0" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#a0aec0" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9C27B0" radius={[6, 6, 0, 0]} name="Vaccinations" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock alerts */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card form-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="fas fa-exclamation-circle me-2 text-danger" />Ruptures de stock</span>
              {stockAlerts.below_reorder?.length > 0 && (
                <span className="badge bg-danger">{stockAlerts.below_reorder.length}</span>
              )}
            </div>
            <div className="card-body p-0">
              {!stockAlerts.below_reorder?.length ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: '#1a8b3f', opacity: 0.5 }} />
                  <p>Aucune rupture de stock</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>Produit</th><th>SKU</th><th className="text-end">Stock</th><th className="text-end">Seuil</th></tr></thead>
                    <tbody>
                      {stockAlerts.below_reorder.map((item, i) => (
                        <tr key={i}>
                          <td className="fw-bold">{item.name}</td>
                          <td><code>{item.sku}</code></td>
                          <td className="text-end">
                            <span className={`badge-status ${item.total_on_hand === 0 ? 'cancelled' : 'draft'}`}>{item.total_on_hand}</span>
                          </td>
                          <td className="text-end text-muted">{item.reorder_level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card form-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="fas fa-clock me-2 text-warning" />Péremptions proches</span>
              {stockAlerts.expiring_soon?.length > 0 && (
                <span className="badge bg-warning text-dark">{stockAlerts.expiring_soon.length}</span>
              )}
            </div>
            <div className="card-body p-0">
              {!stockAlerts.expiring_soon?.length ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: '#1a8b3f', opacity: 0.5 }} />
                  <p>Aucune péremption proche</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>Produit</th><th>Lot</th><th>Péremption</th><th className="text-end">Qté</th></tr></thead>
                    <tbody>
                      {stockAlerts.expiring_soon.map((item, i) => (
                        <tr key={i}>
                          <td className="fw-bold">{item.product_name}</td>
                          <td><code>{item.lot_number}</code></td>
                          <td><span className="badge-status draft">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('fr-FR') : ''}</span></td>
                          <td className="text-end">{item.quantity_on_hand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
