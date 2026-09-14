import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const SalesList = () => {
    const token = getToken();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const statusColors = { completed: 'success', voided: 'danger', pending: 'warning' };
    const statusLabels = { completed: 'Complétée', voided: 'Annulée', pending: 'En attente' };

    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0);

    useEffect(() => {
        fetchSales();
    }, [dateFrom, dateTo, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSales = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/sales?page=${currentPage}&limit=${itemsPerPage}`;
        if (dateFrom) endpoint += `&date_from=${dateFrom}`;
        if (dateTo) endpoint += `&date_to=${dateTo}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setSales(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const voidSale = async (id) => {
        if (!window.confirm('Annuler cette vente ?')) return;
        const res = await api.put(`/v1/pharmacy/sales/${id}/void`, {}, token);
        if (res.success) fetchSales();
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Pharmacie</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Ventes</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-receipt" />Ventes <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <div className="d-flex gap-2">
                    <a href={`${import.meta.env.VITE_API_URL || '/api'}/v1/exports/sales`}
                       className="btn btn-outline-secondary btn-sm" target="_blank" rel="noreferrer">
                        <i className="fas fa-download me-1" />Exporter
                    </a>
                    <Link to="/pharmacy/dispense" className="btn btn-outline-primary">
                        <i className="fas fa-prescription-bottle-alt me-1"></i>Délivrance
                    </Link>
                    <Link to="/pharmacy/retail-sale" className="btn btn-rv-primary">
                        <i className="fas fa-cash-register me-1"></i>Vente comptoir
                    </Link>
                </div>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-3">
                        <input type="date" className="form-control" placeholder="Date début" value={dateFrom}
                            onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control" placeholder="Date fin" value={dateTo}
                            onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : sales.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-receipt empty-icon" />
                            <p>Aucune vente trouvée</p>
                            <Link to="/pharmacy/retail-sale" className="btn btn-rv-primary btn-sm">
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
                                        <th>Paiement</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map(s => (
                                        <tr key={s.id}>
                                            <td><code>{s.sale_number || s.id}</code></td>
                                            <td>{s.sale_date ? new Date(s.sale_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td>{s.party_name || 'Comptoir'}</td>
                                            <td className="fw-bold">{formatAmount(s.total_amount)} XAF</td>
                                            <td>
                                                {s.payment_method === 'cash' ? 'Espèces' :
                                                    s.payment_method === 'mobile_money' ? 'Mobile Money' :
                                                        s.payment_method === 'card' ? 'Carte' :
                                                            s.payment_method === 'transfer' ? 'Virement' :
                                                                s.payment_method === 'credit' ? 'Crédit' : s.payment_method || '-'}
                                            </td>
                                            <td><span className={`badge-status ${s.status}`}>{statusLabels[s.status] || s.status}</span></td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <Link to={`/pharmacy/sales/${s.id}`} className="btn btn-sm btn-outline-info" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                {s.status === 'completed' && (
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => voidSale(s.id)} title="Annuler">
                                                        <i className="fas fa-ban"></i>
                                                    </button>
                                                )}
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
                            itemName="ventes" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesList;
