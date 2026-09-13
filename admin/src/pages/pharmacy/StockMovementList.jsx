import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const StockMovementList = () => {
    const token = getToken();
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [movementType, setMovementType] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchMovements();
    }, [movementType, dateFrom, dateTo, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMovements = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/stock/movements?page=${currentPage}&limit=${itemsPerPage}`;
        if (movementType) endpoint += `&movement_type=${movementType}`;
        if (dateFrom) endpoint += `&date_from=${dateFrom}`;
        if (dateTo) endpoint += `&date_to=${dateTo}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setMovements(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const incomingTypes = ['adjustment_in', 'return', 'receipt'];
    const outgoingTypes = ['adjustment_out', 'transfer', 'damaged', 'expired', 'sale', 'dispense'];

    const movementTypeBadge = (type) => {
        const labels = {
            adjustment_in: 'Ajustement +', adjustment_out: 'Ajustement -',
            transfer: 'Transfert', damaged: 'Endommage', expired: 'Expire',
            return: 'Retour', receipt: 'Reception', sale: 'Vente', dispense: 'Dispensation'
        };
        const color = incomingTypes.includes(type) ? 'success' : outgoingTypes.includes(type) ? 'danger' : 'secondary';
        return <span className={`badge bg-${color}`}>{labels[type] || type}</span>;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Pharmacie</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Mouvements de stock</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-exchange-alt" />Mouvements de stock <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/pharmacy/stock/movement" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau mouvement
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-3">
                        <select className="form-select" value={movementType} onChange={e => { setMovementType(e.target.value); setCurrentPage(1); }}>
                            <option value="">Tous les types</option>
                            <option value="adjustment_in">Ajustement +</option>
                            <option value="adjustment_out">Ajustement -</option>
                            <option value="transfer">Transfert</option>
                            <option value="damaged">Endommage</option>
                            <option value="expired">Expire</option>
                            <option value="return">Retour</option>
                            <option value="receipt">Reception</option>
                            <option value="sale">Vente</option>
                            <option value="dispense">Dispensation</option>
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
                    ) : movements.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-exchange-alt empty-icon" />
                            <p>Aucun mouvement de stock trouve</p>
                            <Link to="/pharmacy/stock/movement" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Creer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Produit</th>
                                        <th>Type</th>
                                        <th>Quantite</th>
                                        <th>Lot</th>
                                        <th>Raison</th>
                                        <th>Date</th>
                                        <th>Par</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map(m => (
                                        <tr key={m.id}>
                                            <td><strong>{m.product_name || '-'}</strong></td>
                                            <td>{movementTypeBadge(m.movement_type)}</td>
                                            <td>
                                                <span className={incomingTypes.includes(m.movement_type) ? 'text-success' : 'text-danger'}>
                                                    {incomingTypes.includes(m.movement_type) ? '+' : '-'}{m.quantity}
                                                </span>
                                            </td>
                                            <td>{m.batch_number || m.lot_number || '-'}</td>
                                            <td>{m.reason || '-'}</td>
                                            <td>{formatDate(m.created_at || m.movement_date)}</td>
                                            <td>{m.created_by_name || m.user_name || '-'}</td>
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
                            itemName="mouvements" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockMovementList;
