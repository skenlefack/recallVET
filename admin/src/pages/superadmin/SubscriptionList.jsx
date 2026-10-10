import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

export default function SubscriptionList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  useEffect(() => { loadData() }, [currentPage])

  const loadData = async () => {
    setLoading(true)
    const res = await api.get(`/admin/subscriptions?page=${currentPage}&limit=${itemsPerPage}`, getToken())
    if (res.success) {
      setItems(res.data)
      setTotalItems(res.total || 0)
    }
    setLoading(false)
  }

  const filtered = items.filter(s =>
    !search || (s.tenant_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const statusClass = (status) => {
    const map = { active: 'active', trialing: 'trialing', past_due: 'draft', cancelled: 'cancelled', expired: 'expired' }
    return map[status] || ''
  }

  const statusLabel = (status) => {
    const map = { active: 'Actif', trialing: 'Essai', past_due: 'Impayé', cancelled: 'Annulé', expired: 'Expiré' }
    return map[status] || status || '-'
  }

  const fmtDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Super Admin</span>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Abonnements</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-credit-card" />Abonnements <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
      </div>

      <div className="filter-bar">
        <div className="row g-2">
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Rechercher par tenant..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card form-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement des abonnements...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-credit-card empty-icon" />
              <p>Aucun abonnement trouve</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tenant</th>
                    <th>Plan</th>
                    <th>Statut</th>
                    <th>Debut</th>
                    <th>Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td className="fw-bold">{s.tenant_name || '-'}</td>
                      <td><span className="badge bg-light text-dark">{s.plan_name || '-'}</span></td>
                      <td><span className={`badge-status ${statusClass(s.status)}`}>{statusLabel(s.status)}</span></td>
                      <td><small className="text-muted">{fmtDate(s.start_date || s.created_at)}</small></td>
                      <td><small className="text-muted">{fmtDate(s.end_date)}</small></td>
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
          onPageChange={setCurrentPage} itemName="abonnements" />
      )}
    </div>
  )
}
