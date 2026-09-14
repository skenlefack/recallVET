import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const PrescriptionList = () => {
    const token = getToken();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const statusColors = { draft: 'secondary', active: 'primary', dispensed: 'success', expired: 'danger', cancelled: 'warning' };
    const statusLabels = { draft: 'Brouillon', active: 'Active', dispensed: 'Délivrée', expired: 'Expirée', cancelled: 'Annulée' };

    useEffect(() => {
        fetchPrescriptions();
    }, [statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPrescriptions = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/prescriptions?page=${currentPage}&limit=${itemsPerPage}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setPrescriptions(res.data || []);
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
                <span>Ordonnances</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-prescription" />Ordonnances <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/clinic/prescriptions/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle ordonnance
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
                    ) : prescriptions.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-prescription empty-icon" />
                            <p>Aucune ordonnance trouvée</p>
                            <Link to="/clinic/prescriptions/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>N°</th>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Prescripteur</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map(p => (
                                        <tr key={p.id}>
                                            <td><code>{p.prescription_number || p.id}</code></td>
                                            <td>{p.prescription_date ? new Date(p.prescription_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{p.animal_name || '-'}</strong></td>
                                            <td>{p.prescriber_name || '-'}</td>
                                            <td><span className={`badge-status ${p.status}`}>{statusLabels[p.status] || p.status}</span></td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <Link to={`/clinic/prescriptions/${p.id}`} className="btn btn-sm btn-outline-info" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/clinic/prescriptions/${p.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="ordonnances" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrescriptionList;
