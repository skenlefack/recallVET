import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

export default function TenantList() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  useEffect(() => { loadTenants() }, [currentPage])

  const loadTenants = async () => {
    setLoading(true)
    const res = await api.get(`/admin/tenants?page=${currentPage}&limit=${itemsPerPage}`, getToken())
    if (res.success) {
      setTenants(res.data)
      setTotalItems(res.total || 0)
    }
    setLoading(false)
  }

  const toggleTenant = async (id, name, isActive) => {
    const action = isActive ? 'désactiver' : 'activer'
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} "${name}" ?`)) return
    await api.put(`/admin/tenants/${id}/toggle`, {}, getToken())
    loadTenants()
  }

  const filteredTenants = tenants.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  )

  const statusClass = (status) => {
    const map = { active: 'active', trialing: 'trialing', past_due: 'draft', cancelled: 'cancelled', expired: 'expired' }
    return map[status] || ''
  }

  const statusLabel = (status) => {
    const map = { active: 'Actif', trialing: 'Essai', past_due: 'Impayé', cancelled: 'Annulé', expired: 'Expiré' }
    return map[status] || status || '-'
  }

  const relativeDate = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    const now = new Date()
    const days = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Hier'
    if (days < 30) return `Il y a ${days}j`
    if (days < 365) return `Il y a ${Math.floor(days/30)} mois`
    return d.toLocaleDateString('fr-FR')
  }

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Super Admin</span>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Tenants</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-sitemap" />Tenants <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
      </div>

      <div className="filter-bar">
        <div className="row g-2">
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Rechercher par nom..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card form-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement des tenants...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-sitemap empty-icon" />
              <p>Aucun tenant trouvé</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Plan</th>
                    <th>Statut</th>
                    <th>Utilisateurs</th>
                    <th>Actif</th>
                    <th>Créé</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map(t => (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/superadmin/tenants/${t.id}`} className="text-decoration-none fw-bold">
                          {t.name}
                        </Link>
                        <div className="text-muted" style={{fontSize:'0.75rem'}}>{t.slug}</div>
                      </td>
                      <td><span className="badge bg-light text-dark">{t.plan_name || '-'}</span></td>
                      <td><span className={`badge-status ${statusClass(t.sub_status)}`}>{statusLabel(t.sub_status)}</span></td>
                      <td>
                        <span className="fw-bold">{t.user_count}</span>
                        <i className="fas fa-users ms-1 text-muted" style={{fontSize:'0.7rem'}} />
                      </td>
                      <td>
                        {t.is_active
                          ? <span className="badge-status active"><i className="fas fa-check me-1" />Actif</span>
                          : <span className="badge-status cancelled"><i className="fas fa-ban me-1" />Inactif</span>
                        }
                      </td>
                      <td><small className="text-muted">{relativeDate(t.created_at)}</small></td>
                      <td>
                        <div className="btn-group-actions">
                          <Link to={`/superadmin/tenants/${t.id}`} className="btn btn-sm btn-outline-info" title="Détails">
                            <i className="fas fa-eye" />
                          </Link>
                          <button
                            className={`btn btn-sm btn-outline-${t.is_active ? 'danger' : 'success'}`}
                            onClick={() => toggleTenant(t.id, t.name, t.is_active)}
                            title={t.is_active ? 'Désactiver' : 'Activer'}
                          >
                            <i className={`fas fa-${t.is_active ? 'ban' : 'check'}`} />
                          </button>
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
          onPageChange={setCurrentPage} itemName="tenants" />
      )}
    </div>
  )
}
