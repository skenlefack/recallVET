import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const DispenseList = () => {
    const token = getToken();
    const [dispensings, setDispensings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prescriptionId, setPrescriptionId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    useEffect(() => {
        fetchDispensings();
    }, [prescriptionId, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDispensings = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/dispensing?page=${currentPage}&limit=${itemsPerPage}`;
        if (prescriptionId) endpoint += `&prescription_id=${encodeURIComponent(prescriptionId)}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setDispensings(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Pharmacie</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Dispensation</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-prescription-bottle-alt" />Dispensation <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/pharmacy/dispensing/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle dispensation
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-4">
                        <input type="text" className="form-control" placeholder="Filtrer par ID ordonnance..."
                            value={prescriptionId} onChange={e => { setPrescriptionId(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : dispensings.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-prescription-bottle-alt empty-icon" />
                            <p>Aucune dispensation trouvee</p>
                            <Link to="/pharmacy/dispensing/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Creer la premiere
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>N Dispensation</th>
                                        <th>Animal</th>
                                        <th>Client</th>
                                        <th>Dispense par</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dispensings.map(d => (
                                        <tr key={d.id}>
                                            <td><code>{d.dispense_code || d.id}</code></td>
                                            <td>{d.animal_name || '-'}</td>
                                            <td>{d.client_name || d.party_name || '-'}</td>
                                            <td>{d.dispensed_by_name || d.dispensed_by || '-'}</td>
                                            <td>{formatDate(d.dispensed_at || d.created_at)}</td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(d.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/pharmacy/dispensing/${d.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="dispensations" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="dispense"
                entityId={detailId}
                editUrl={detailId ? `/pharmacy/dispensing/${detailId}` : null}
            />
        </div>
    );
};

export default DispenseList;
