import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const InvoiceList = () => {
    const token = getToken();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    const statusColors = { draft: 'secondary', sent: 'primary', paid: 'success', partial: 'warning', overdue: 'danger', cancelled: 'dark' };
    const statusLabels = { draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', partial: 'Partielle', overdue: 'En retard', cancelled: 'Annulée' };

    const formatAmount = (amount, currency = 'XAF') => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount || 0);
    };

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchInvoices = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/invoices?page=${currentPage}&limit=${itemsPerPage}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setInvoices(res.data || []);
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
                <span>Factures</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-file-invoice" />Factures <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <div className="d-flex gap-2">
                    <a href={`${import.meta.env.VITE_API_URL || '/api'}/v1/exports/invoices`}
                       className="btn btn-outline-secondary btn-sm" target="_blank" rel="noreferrer">
                        <i className="fas fa-download me-1" />Exporter
                    </a>
                    <Link to="/clinic/invoices/new" className="btn btn-rv-primary">
                        <i className="fas fa-plus me-1"></i>Nouvelle facture
                    </Link>
                </div>
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
                    ) : invoices.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-file-invoice empty-icon" />
                            <p>Aucune facture trouvée</p>
                            <Link to="/clinic/invoices/new" className="btn btn-rv-primary btn-sm">
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
                                        <th>Client</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.id}>
                                            <td><code>{inv.invoice_number || inv.id}</code></td>
                                            <td>{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{inv.party_name || '-'}</strong></td>
                                            <td className="fw-bold">{formatAmount(inv.total_amount, inv.currency)}</td>
                                            <td><span className={`badge-status ${inv.status}`}>{statusLabels[inv.status] || inv.status}</span></td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(inv.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/clinic/invoices/${inv.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="factures" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="invoice"
                entityId={detailId}
                editUrl={detailId ? `/clinic/invoices/${detailId}` : null}
            />
        </div>
    );
};

export default InvoiceList;
