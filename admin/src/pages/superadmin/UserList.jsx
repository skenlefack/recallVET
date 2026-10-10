import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

export default function UserList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  useEffect(() => { loadData() }, [currentPage])

  const loadData = async () => {
    setLoading(true)
    const res = await api.get(`/admin/users?page=${currentPage}&limit=${itemsPerPage}`, getToken())
    if (res.success) {
      setItems(res.data)
      setTotalItems(res.total || 0)
    }
    setLoading(false)
  }

  const filtered = items.filter(u =>
    !search || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const roleLabel = (role) => {
    const map = { superadmin: 'Super Admin', admin: 'Admin', veterinarian: 'Veterinaire', assistant: 'Assistant', receptionist: 'Receptionniste' }
    return map[role] || role || '-'
  }

  const roleColor = (role) => {
    const map = { superadmin: 'danger', admin: 'primary', veterinarian: 'success', assistant: 'info', receptionist: 'secondary' }
    return map[role] || 'secondary'
  }

  const fmtDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Super Admin</span>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Utilisateurs</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-users-cog" />Utilisateurs <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
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
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users-cog empty-icon" />
              <p>Aucun utilisateur trouve</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Statut</th>
                    <th>Cree le</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td className="fw-bold">{u.first_name} {u.last_name}</td>
                      <td><small>{u.email}</small></td>
                      <td><span className={`badge bg-${roleColor(u.role)}`}>{roleLabel(u.role)}</span></td>
                      <td>
                        {u.is_active !== false
                          ? <span className="badge-status active"><i className="fas fa-check me-1" />Actif</span>
                          : <span className="badge-status cancelled"><i className="fas fa-ban me-1" />Inactif</span>
                        }
                      </td>
                      <td><small className="text-muted">{fmtDate(u.created_at)}</small></td>
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
          onPageChange={setCurrentPage} itemName="utilisateurs" />
      )}
    </div>
  )
}
