import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const PurchaseOrderList = () => {
    const token = getToken();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    const statusColors = { draft: 'secondary', submitted: 'primary', approved: 'info', received: 'success', cancelled: 'danger' };
    const statusLabels = { draft: 'Brouillon', submitted: 'Soumis', approved: 'Approuvé', received: 'Reçu', cancelled: 'Annulé' };

    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOrders = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/purchase-orders?page=${currentPage}&limit=${itemsPerPage}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setOrders(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Pharmacie</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Commandes</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-file-alt" />Bons de commande <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/pharmacy/purchase-orders/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau BC
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
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-file-alt empty-icon" />
                            <p>Aucun bon de commande trouvé</p>
                            <Link to="/pharmacy/purchase-orders/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>N° BC</th>
                                        <th>Date</th>
                                        <th>Fournisseur</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td><code>{o.po_number || o.id}</code></td>
                                            <td>{o.order_date ? new Date(o.order_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{o.supplier_name || '-'}</strong></td>
                                            <td>{formatAmount(o.total_amount)} XAF</td>
                                            <td><span className={`badge-status ${o.status}`}>{statusLabels[o.status] || o.status}</span></td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(o.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/pharmacy/purchase-orders/${o.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="bons de commande" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="purchaseOrder"
                entityId={detailId}
                editUrl={detailId ? `/pharmacy/purchase-orders/${detailId}` : null}
            />
        </div>
    );
};

export default PurchaseOrderList;
