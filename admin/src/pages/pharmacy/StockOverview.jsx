import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const LOCATION_TYPES = [
    { value: 'main_store', label: 'Magasin principal' },
    { value: 'dispensary', label: 'Dispensaire' },
    { value: 'fridge', label: 'Réfrigérateur' },
    { value: 'quarantine', label: 'Quarantaine' },
    { value: 'mobile', label: 'Mobile' }
];

const StockOverview = () => {
    const token = getToken();
    const [levels, setLevels] = useState([]);
    const [lots, setLots] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('levels');
    const [productFilter, setProductFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    // Location form state
    const [locForm, setLocForm] = useState({ name: '', location_type: 'main_store', site_id: '' });
    const [editingLocId, setEditingLocId] = useState(null);
    const [savingLoc, setSavingLoc] = useState(false);

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        setLoading(true);
        const [levelsRes, lotsRes, locsRes] = await Promise.all([
            api.get('/v1/pharmacy/stock/levels', token),
            api.get('/v1/pharmacy/stock/lots', token),
            api.get('/v1/pharmacy/stock/locations', token)
        ]);
        if (levelsRes.success) setLevels(levelsRes.data || []);
        if (lotsRes.success) setLots(lotsRes.data || []);
        if (locsRes.success) setLocations(locsRes.data || []);
        setLoading(false);
    };

    const handleLocSubmit = async (e) => {
        e.preventDefault();
        setSavingLoc(true);
        const payload = { ...locForm };
        if (!payload.site_id) delete payload.site_id;
        let res;
        if (editingLocId) {
            res = await api.put(`/v1/pharmacy/stock/locations/${editingLocId}`, payload, token);
        } else {
            res = await api.post('/v1/pharmacy/stock/locations', payload, token);
        }
        setSavingLoc(false);
        if (res.success) {
            setLocForm({ name: '', location_type: 'main_store', site_id: '' });
            setEditingLocId(null);
            const locsRes = await api.get('/v1/pharmacy/stock/locations', token);
            if (locsRes.success) setLocations(locsRes.data || []);
        }
    };

    const startEditLoc = (loc) => {
        setEditingLocId(loc.id);
        setLocForm({ name: loc.name, location_type: loc.location_type || 'main_store', site_id: loc.site_id || '' });
    };

    const cancelEditLoc = () => {
        setEditingLocId(null);
        setLocForm({ name: '', location_type: 'main_store', site_id: '' });
    };

    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0);

    const getExpiryClass = (expiryDate) => {
        if (!expiryDate) return '';
        const days = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (days < 0) return 'table-danger';
        if (days < 30) return 'table-warning';
        if (days < 90) return 'table-info';
        return '';
    };

    const filteredLevels = levels.filter(l =>
        (!productFilter || (l.product_name || '').toLowerCase().includes(productFilter.toLowerCase())) &&
        (!locationFilter || (l.location || '').toLowerCase().includes(locationFilter.toLowerCase()))
    );

    const filteredLots = lots.filter(l =>
        (!productFilter || (l.product_name || '').toLowerCase().includes(productFilter.toLowerCase())) &&
        (!locationFilter || (l.location || '').toLowerCase().includes(locationFilter.toLowerCase()))
    );

    if (loading) return <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>;

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Pharmacie</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Stock</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-warehouse" />Stock <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{levels.length}</span></h4>
                <div>
                    <Link to="/pharmacy/goods-receipts/new" className="btn btn-rv-primary me-2">
                        <i className="fas fa-box-open me-1"></i>Réception
                    </Link>
                    <Link to="/pharmacy/stock/movement" className="btn btn-outline-primary">
                        <i className="fas fa-exchange-alt me-1"></i>Mouvement
                    </Link>
                </div>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-4">
                        <input type="text" className="form-control" placeholder="Filtrer par produit..."
                            value={productFilter} onChange={e => setProductFilter(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Filtrer par emplacement..."
                            value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
                    </div>
                </div>
            </div>

            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'levels' ? 'active' : ''}`} onClick={() => setActiveTab('levels')}>
                        <i className="fas fa-chart-bar me-1"></i>Niveaux de stock ({filteredLevels.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'lots' ? 'active' : ''}`} onClick={() => setActiveTab('lots')}>
                        <i className="fas fa-boxes me-1"></i>Lots ({filteredLots.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>
                        <i className="fas fa-map-marker-alt me-1"></i>Emplacements ({locations.length})
                    </button>
                </li>
            </ul>

            {activeTab === 'levels' && (
                <div className="card">
                    <div className="card-body p-0">
                        {filteredLevels.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-warehouse empty-icon" />
                                <p>Aucune donnée de stock</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Produit</th>
                                            <th>SKU</th>
                                            <th>Emplacement</th>
                                            <th>Quantité</th>
                                            <th>Seuil</th>
                                            <th>Statut</th>
                                            <th>Valeur</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLevels.map((l, idx) => (
                                            <tr key={idx} className={(l.quantity || 0) <= (l.reorder_level || 0) ? 'table-warning' : ''}>
                                                <td><strong>{l.product_name}</strong></td>
                                                <td><code>{l.sku || '-'}</code></td>
                                                <td>{l.location || 'Principal'}</td>
                                                <td className="fw-bold">{l.quantity || 0}</td>
                                                <td>{l.reorder_level || '-'}</td>
                                                <td>
                                                    {(l.quantity || 0) <= 0 ? <span className="badge bg-danger">Rupture</span>
                                                        : (l.quantity || 0) <= (l.reorder_level || 0) ? <span className="badge bg-warning">Bas</span>
                                                            : <span className="badge bg-success">OK</span>}
                                                </td>
                                                <td>{formatAmount((l.quantity || 0) * (l.unit_cost || l.unit_price || 0))} XAF</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'lots' && (
                <div className="card">
                    <div className="card-body p-0">
                        {filteredLots.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-boxes empty-icon" />
                                <p>Aucun lot trouvé</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Produit</th>
                                            <th>N° lot</th>
                                            <th>Batch</th>
                                            <th>Expiration</th>
                                            <th>Emplacement</th>
                                            <th>Quantité</th>
                                            <th>Coût unit.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLots.map((l, idx) => (
                                            <tr key={idx} className={getExpiryClass(l.expiry_date)}>
                                                <td><strong>{l.product_name}</strong></td>
                                                <td><code>{l.lot_number || '-'}</code></td>
                                                <td>{l.batch || '-'}</td>
                                                <td>
                                                    {l.expiry_date ? (
                                                        <span className={new Date(l.expiry_date) < new Date() ? 'text-danger fw-bold' : ''}>
                                                            {new Date(l.expiry_date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td>{l.location || 'Principal'}</td>
                                                <td className="fw-bold">{l.quantity || 0}</td>
                                                <td>{formatAmount(l.unit_cost || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'locations' && (
                <div className="card">
                    <div className="card-body">
                        {locations.length > 0 && (
                            <div className="table-responsive mb-3">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nom</th>
                                            <th>Type</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {locations.map(loc => (
                                            <tr key={loc.id}>
                                                <td><strong>{loc.name}</strong></td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        {LOCATION_TYPES.find(t => t.value === loc.location_type)?.label || loc.location_type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => startEditLoc(loc)}>
                                                        <i className="fas fa-pen"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <form onSubmit={handleLocSubmit} className="row g-2 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">
                                    {editingLocId ? 'Modifier l\'emplacement' : 'Ajouter un emplacement'}
                                </label>
                                <input type="text" className="form-control form-control-sm" placeholder="Nom *"
                                    value={locForm.name} onChange={e => setLocForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small">Type</label>
                                <select className="form-select form-select-sm" value={locForm.location_type}
                                    onChange={e => setLocForm(p => ({ ...p, location_type: e.target.value }))}>
                                    {LOCATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-sm btn-success" disabled={savingLoc}>
                                        {savingLoc ? <span className="spinner-border spinner-border-sm" /> : (
                                            <><i className="fas fa-save me-1"></i>{editingLocId ? 'Modifier' : 'Ajouter'}</>
                                        )}
                                    </button>
                                    {editingLocId && (
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancelEditLoc}>
                                            Annuler
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockOverview;
