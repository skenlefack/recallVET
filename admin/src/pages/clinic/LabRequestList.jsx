import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const statusLabels = { requested: 'Demandé', in_progress: 'En cours', completed: 'Terminé', cancelled: 'Annulé' };
const statusColors = { requested: 'warning', in_progress: 'info', completed: 'success', cancelled: 'secondary' };
const priorityLabels = { routine: 'Routine', urgent: 'Urgent' };

const LabRequestList = () => {
    const token = getToken();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchRequests = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/lab/requests?page=${currentPage}&limit=${itemsPerPage}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setRequests(res.data || []);
            setTotalItems(res.pagination?.total || (res.data || []).length);
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
                <span>Laboratoire</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-flask" />Laboratoire <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/clinic/lab/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle demande
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-4">
                        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                            <option value="">Tous les statuts</option>
                            <option value="requested">Demandé</option>
                            <option value="in_progress">En cours</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : requests.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-flask empty-icon" />
                            <p>Aucune demande de laboratoire trouvée</p>
                            <Link to="/clinic/lab/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer la première
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Animal</th>
                                        <th>Type</th>
                                        <th>Test</th>
                                        <th>Priorité</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(r => (
                                        <tr key={r.id}>
                                            <td><strong>{r.animal_name || '-'}</strong></td>
                                            <td>{r.test_type || '-'}</td>
                                            <td>{r.test_name || '-'}</td>
                                            <td>
                                                <span className={`badge bg-${r.priority === 'urgent' ? 'danger' : 'secondary'}`}>
                                                    {priorityLabels[r.priority] || r.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${statusColors[r.status] || 'secondary'}`}>
                                                    {statusLabels[r.status] || r.status}
                                                </span>
                                            </td>
                                            <td>{r.requested_at ? new Date(r.requested_at).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td>
                                                <div className="btn-group-actions">
                                                    <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(r.id)}>
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <Link to={`/clinic/lab/${r.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="demandes" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="lab_request"
                entityId={detailId}
                editUrl={detailId ? `/clinic/lab/${detailId}` : null}
            />
        </div>
    );
};

export default LabRequestList;
