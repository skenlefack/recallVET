import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const HospitalizationList = () => {
    const token = getToken();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    const statusColors = { admitted: 'info', discharged: 'success', transferred: 'warning', deceased: 'danger' };
    const statusLabels = { admitted: 'Admis', discharged: 'Sorti', transferred: 'Transféré', deceased: 'Décédé' };

    useEffect(() => {
        fetchItems();
    }, [statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchItems = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/hospitalizations?page=${currentPage}&limit=${itemsPerPage}`;
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
                <span>Hospitalisations</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-procedures" />Hospitalisations <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/clinic/hospitalizations/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle hospitalisation
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
                            <i className="fas fa-procedures empty-icon" />
                            <p>Aucune hospitalisation trouvée</p>
                            <Link to="/clinic/hospitalizations/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer la première
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Animal</th>
                                        <th>Cage</th>
                                        <th>Date admission</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(h => (
                                        <tr key={h.id}>
                                            <td><strong>{h.animal_name || '-'}</strong></td>
                                            <td>{h.cage_number || '-'}</td>
                                            <td>{h.admission_date ? new Date(h.admission_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><span className={`badge-status ${h.status}`}>{statusLabels[h.status] || h.status}</span></td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(h.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/clinic/hospitalizations/${h.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="hospitalisations" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="hospitalization"
                entityId={detailId}
                editUrl={detailId ? `/clinic/hospitalizations/${detailId}` : null}
            />
        </div>
    );
};

export default HospitalizationList;
