import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

export default function TenantList() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

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

  const toggleTenant = async (id) => {
    await api.put(`/admin/tenants/${id}/toggle`, {}, getToken())
    loadTenants()
  }

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/superadmin">Super Admin</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Tenants</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-sitemap me-2" />Gestion des tenants</h4>
      </div>
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-success" /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr><th>Nom</th><th>Plan</th><th>Statut abo</th><th>Utilisateurs</th><th>Actif</th><th>Date creation</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id}>
                      <td><Link to={`/superadmin/tenants/${t.id}`} className="text-decoration-none fw-bold">{t.name}</Link></td>
                      <td><small>{t.plan_name || '-'}</small></td>
                      <td><span className={`badge bg-${t.sub_status === 'active' ? 'success' : t.sub_status === 'trialing' ? 'info' : 'secondary'}`}>{t.sub_status || '-'}</span></td>
                      <td>{t.user_count}</td>
                      <td>{t.is_active ? <span className="badge bg-success">Oui</span> : <span className="badge bg-danger">Non</span>}</td>
                      <td><small>{new Date(t.created_at).toLocaleDateString('fr-FR')}</small></td>
                      <td>
                        <button className={`btn btn-sm btn-outline-${t.is_active ? 'danger' : 'success'}`} onClick={() => toggleTenant(t.id)}>
                          {t.is_active ? 'Desactiver' : 'Activer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} itemName="tenants" />
    </div>
  )
}
