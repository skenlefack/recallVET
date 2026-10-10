import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

export default function DemoRequestList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  useEffect(() => { loadData() }, [currentPage])

  const loadData = async () => {
    setLoading(true)
    const res = await api.get(`/admin/demo-requests?page=${currentPage}&limit=${itemsPerPage}`, getToken())
    if (res.success) {
      setItems(res.data)
      setTotalItems(res.total || 0)
    }
    setLoading(false)
  }

  const filtered = items.filter(d =>
    !search || (d.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const updateStatus = async (id, status) => {
    const res = await api.put(`/admin/demo-requests/${id}`, { status }, getToken())
    if (res.success) loadData()
  }

  const statusClass = (status) => {
    const map = { new: 'info', contacted: 'warning', completed: 'success', converted: 'success', cancelled: 'secondary' }
    return map[status] || 'secondary'
  }

  const statusLabel = (status) => {
    const map = { new: 'Nouveau', contacted: 'Contacte', completed: 'Termine', converted: 'Converti', cancelled: 'Annule' }
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
        <span>Demandes demo</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-envelope-open-text" />Demandes de demo <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
      </div>

      <div className="filter-bar">
        <div className="row g-2">
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Rechercher par nom ou email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card form-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement des demandes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-envelope-open-text empty-icon" />
              <p>Aucune demande trouvee</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Cabinet</th>
                    <th>Pays</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td className="fw-bold">{d.full_name}</td>
                      <td><small>{d.email}</small></td>
                      <td><small>{d.practice_name || '-'}</small></td>
                      <td><small>{d.country || '-'}</small></td>
                      <td><span className={`badge bg-${statusClass(d.status)}`}>{statusLabel(d.status)}</span></td>
                      <td><small className="text-muted">{fmtDate(d.created_at)}</small></td>
                      <td>
                        <div className="btn-group-actions">
                          {d.status === 'new' && (
                            <button className="btn btn-sm btn-outline-warning" title="Marquer contacte"
                              onClick={() => updateStatus(d.id, 'contacted')}>
                              <i className="fas fa-phone" />
                            </button>
                          )}
                          {(d.status === 'new' || d.status === 'contacted') && (
                            <button className="btn btn-sm btn-outline-success" title="Marquer termine"
                              onClick={() => updateStatus(d.id, 'completed')}>
                              <i className="fas fa-check" />
                            </button>
                          )}
                        </div>
                      </td>
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
          onPageChange={setCurrentPage} itemName="demandes" />
      )}
    </div>
  )
}
