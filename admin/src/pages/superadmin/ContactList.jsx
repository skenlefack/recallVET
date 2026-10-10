import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

export default function ContactList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  useEffect(() => { loadData() }, [currentPage])

  const loadData = async () => {
    setLoading(true)
    const res = await api.get(`/admin/contacts?page=${currentPage}&limit=${itemsPerPage}`, getToken())
    if (res.success) {
      setItems(res.data)
      setTotalItems(res.total || 0)
    }
    setLoading(false)
  }

  const filtered = items.filter(c =>
    !search || (c.name || c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.subject || '').toLowerCase().includes(search.toLowerCase())
  )

  const fmtDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Super Admin</span>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Messages</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-inbox" />Messages de contact <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
      </div>

      <div className="filter-bar">
        <div className="row g-2">
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Rechercher par nom, email ou sujet..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card form-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement des messages...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox empty-icon" />
              <p>Aucun message trouve</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Sujet</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.name || c.full_name || '-'}</td>
                      <td><small>{c.email}</small></td>
                      <td><small>{c.subject || '-'}</small></td>
                      <td><small className="text-muted" style={{maxWidth: 300, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{c.message || '-'}</small></td>
                      <td><small className="text-muted">{fmtDate(c.created_at)}</small></td>
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
          onPageChange={setCurrentPage} itemName="messages" />
      )}
    </div>
  )
}
