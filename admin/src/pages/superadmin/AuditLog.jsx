import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

const ENTITY_TYPES = [
  '', 'party', 'animal', 'appointment', 'encounter', 'vaccination',
  'prescription', 'invoice', 'product', 'stock', 'user', 'tenant'
]

const ACTIONS = ['', 'create', 'update', 'delete', 'sign', 'cancel', 'login']

export default function AuditLog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

  // Filters
  const [tenants, setTenants] = useState([])
  const [filters, setFilters] = useState({ tenant_id: '', entity_type: '', action: '', from: '', to: '' })

  useEffect(() => { loadTenants() }, [])
  useEffect(() => { loadData() }, [currentPage, filters])

  const loadTenants = async () => {
    const res = await api.get('/admin/tenants?limit=100', getToken())
    if (res.success) setTenants(res.data)
  }

  const loadData = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: currentPage, limit: itemsPerPage })
    if (filters.tenant_id) params.append('tenant_id', filters.tenant_id)
    if (filters.entity_type) params.append('entity_type', filters.entity_type)
    if (filters.action) params.append('action', filters.action)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)

    const res = await api.get(`/admin/audit-log?${params.toString()}`, getToken())
    if (res.success) {
      setItems(res.data)
      setTotalItems(res.pagination?.total || 0)
    }
    setLoading(false)
  }

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }))
    setCurrentPage(1)
  }

  const fmtDate = (date) => date ? new Date(date).toLocaleString('fr-FR') : '-'

  const formatDetails = (row) => {
    try {
      const newVals = row.new_values ? JSON.parse(row.new_values) : null
      const oldVals = row.old_values ? JSON.parse(row.old_values) : null
      if (newVals) {
        const keys = Object.keys(newVals).slice(0, 3)
        return keys.map(k => `${k}: ${newVals[k]}`).join(', ')
      }
      if (oldVals) return 'Ancien: ' + Object.keys(oldVals).slice(0, 3).join(', ')
    } catch (e) { /* ignore */ }
    return row.entity_id ? `ID: ${row.entity_id}` : '-'
  }

  const actionBadge = (action) => {
    const colors = { create: 'success', update: 'primary', delete: 'danger', sign: 'info', cancel: 'warning', login: 'secondary' }
    return <span className={`badge bg-${colors[action] || 'secondary'}`}>{action}</span>
  }

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Super Admin</span>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Journal d'audit</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-history me-2" />Journal d'audit <span className="badge bg-light text-dark ms-2" style={{ fontSize: '0.75rem' }}>{totalItems}</span></h4>
      </div>

      <div className="filter-bar">
        <div className="row g-2">
          <div className="col-md-3">
            <select className="form-select" value={filters.tenant_id} onChange={e => updateFilter('tenant_id', e.target.value)}>
              <option value="">Tous les tenants</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filters.entity_type} onChange={e => updateFilter('entity_type', e.target.value)}>
              <option value="">Toutes entites</option>
              {ENTITY_TYPES.filter(Boolean).map(et => <option key={et} value={et}>{et}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filters.action} onChange={e => updateFilter('action', e.target.value)}>
              <option value="">Toutes actions</option>
              {ACTIONS.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" value={filters.from} onChange={e => updateFilter('from', e.target.value)} placeholder="Du" />
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" value={filters.to} onChange={e => updateFilter('to', e.target.value)} placeholder="Au" />
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setFilters({ tenant_id: '', entity_type: '', action: '', from: '', to: '' }); setCurrentPage(1) }}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>
      </div>

      <div className="card form-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-history empty-icon" />
              <p>Aucune entree trouvee</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Entite</th>
                    <th>Tenant</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(row => (
                    <tr key={row.id}>
                      <td><small className="text-muted">{fmtDate(row.created_at)}</small></td>
                      <td>
                        <div className="fw-bold">{row.user_name || '-'}</div>
                        <small className="text-muted">{row.user_email || ''}</small>
                      </td>
                      <td>{actionBadge(row.action)}</td>
                      <td>
                        <span className="badge bg-light text-dark">{row.entity_type}</span>
                        {row.entity_id && <small className="text-muted ms-1">#{row.entity_id}</small>}
                      </td>
                      <td><small>{row.tenant_name || '-'}</small></td>
                      <td><small className="text-muted" style={{ maxWidth: 250, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDetails(row)}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {totalItems > 0 && (
        <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)}
          totalItems={totalItems} itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage} itemName="entrees" />
      )}
    </div>
  )
}
