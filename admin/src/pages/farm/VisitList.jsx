import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const VisitList = () => {
    const token = getToken();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchVisits();
    }, [status, dateFrom, dateTo, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchVisits = async () => {
        setLoading(true);
        let endpoint = `/v1/farm/visits?page=${currentPage}&limit=${itemsPerPage}`;
        if (status) endpoint += `&status=${status}`;
        if (dateFrom) endpoint += `&date_from=${dateFrom}`;
        if (dateTo) endpoint += `&date_to=${dateTo}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setVisits(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const statusBadge = (s) => {
        const colors = { planned: 'warning', in_progress: 'info', completed: 'success' };
        const labels = { planned: 'Planifiee', in_progress: 'En cours', completed: 'Terminee' };
        return <span className={`badge badge-status bg-${colors[s] || 'secondary'}`}>{labels[s] || s}</span>;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Elevage</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Visites</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-clipboard-list" />Visites <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/farm/visits/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle visite
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-3">
                        <select className="form-select" value={status} onChange={e => { setStatus(e.target.value); setCurrentPage(1); }}>
                            <option value="">Tous les statuts</option>
                            <option value="planned">Planifiee</option>
                            <option value="in_progress">En cours</option>
                            <option value="completed">Terminee</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control" placeholder="Date debut"
                            value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control" placeholder="Date fin"
                            value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : visits.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-clipboard-list empty-icon" />
                            <p>Aucune visite trouvee</p>
                            <Link to="/farm/visits/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Creer la premiere
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Ferme</th>
                                        <th>Veterinaire</th>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visits.map(v => (
                                        <tr key={v.id}>
                                            <td><strong>{v.farm_name || '-'}</strong></td>
                                            <td>{v.vet_name || '-'}</td>
                                            <td>{formatDate(v.visit_date || v.date)}</td>
                                            <td>{v.visit_type || v.type || '-'}</td>
                                            <td>{statusBadge(v.status)}</td>
                                            <td>
                                                <Link to={`/farm/visits/${v.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/farm/visits/${v.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
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
                            itemName="visites" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitList;
