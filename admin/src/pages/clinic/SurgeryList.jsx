import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const SurgeryList = () => {
    const token = getToken();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    const statusColors = { planned: 'secondary', in_progress: 'info', completed: 'success', cancelled: 'danger' };
    const statusLabels = { planned: 'Planifiée', in_progress: 'En cours', completed: 'Terminée', cancelled: 'Annulée' };

    useEffect(() => {
        fetchItems();
    }, [statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchItems = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/surgeries?page=${currentPage}&limit=${itemsPerPage}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setItems(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Clinique</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Chirurgies</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-cut" />Chirurgies <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/clinic/surgeries/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle chirurgie
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-3">
                        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                            <option value="">Tous les statuts</option>
                            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : items.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-cut empty-icon" />
                            <p>Aucune chirurgie trouvée</p>
                            <Link to="/clinic/surgeries/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer la première
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Animal</th>
                                        <th>Procédure</th>
                                        <th>Chirurgien</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(s => (
                                        <tr key={s.id}>
                                            <td><strong>{s.animal_name || '-'}</strong></td>
                                            <td>{s.procedure_name || '-'}</td>
                                            <td>{s.surgeon_name || '-'}</td>
                                            <td>{s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><span className={`badge-status ${s.status}`}>{statusLabels[s.status] || s.status}</span></td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(s.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/clinic/surgeries/${s.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {totalItems > 0 && (
                    <div className="card-footer">
                        <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)}
                            totalItems={totalItems} itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage} onItemsPerPageChange={v => { setItemsPerPage(v); setCurrentPage(1); }}
                            itemName="chirurgies" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="surgery"
                entityId={detailId}
                editUrl={detailId ? `/clinic/surgeries/${detailId}` : null}
            />
        </div>
    );
};

export default SurgeryList;
