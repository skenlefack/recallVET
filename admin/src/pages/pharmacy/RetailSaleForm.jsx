import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const emptyLine = () => ({ product_id: '', product_name: '', lot_id: '', quantity: 1, unit_price: 0 });

const RetailSaleForm = () => {
    const navigate = useNavigate();
    const token = getToken();
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        party_id: '', payment_method: 'cash', lines: [emptyLine()]
    });
    const [partySearch, setPartySearch] = useState('');
    const [partyResults, setPartyResults] = useState([]);
    const [selectedParty, setSelectedParty] = useState(null);
    const [showPartyDropdown, setShowPartyDropdown] = useState(false);
    const [products, setProducts] = useState([]);
    const [lotsMap, setLotsMap] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Product search per line
    const [productSearches, setProductSearches] = useState({});
    const [productResults, setProductResults] = useState({});
    const [showProductDropdown, setShowProductDropdown] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await api.get('/v1/pharmacy/products?limit=1000', token);
        if (res.success) setProducts(res.data || []);
    };

    const fetchLots = async (productId) => {
        const res = await api.get(`/v1/pharmacy/stock/lots?product_id=${productId}`, token);
        if (res.success) {
            setLotsMap(prev => ({ ...prev, [productId]: res.data || [] }));
            // Auto-select first lot with stock
            const availableLot = (res.data || []).find(l => l.quantity > 0);
            return availableLot ? availableLot.id : '';
        }
        return '';
    };

    const searchParties = (value) => {
        setPartySearch(value);
        setShowPartyDropdown(true);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.length < 2) { setPartyResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            const res = await api.get(`/v1/clinic/parties?search=${encodeURIComponent(value)}`, token);
            if (res.success) setPartyResults(res.data || []);
        }, 300);
    };

    const selectParty = (party) => {
        setSelectedParty(party);
        setPartySearch(party.display_name);
        setForm(prev => ({ ...prev, party_id: party.id }));
        setShowPartyDropdown(false);
    };

    const searchProduct = (idx, value) => {
        setProductSearches(prev => ({ ...prev, [idx]: value }));
        setShowProductDropdown(prev => ({ ...prev, [idx]: true }));
        if (value.length < 2) {
            setProductResults(prev => ({ ...prev, [idx]: [] }));
            return;
        }
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(value.toLowerCase()) ||
            (p.sku || '').toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10);
        setProductResults(prev => ({ ...prev, [idx]: filtered }));
    };

    const selectProduct = async (idx, product) => {
        setProductSearches(prev => ({ ...prev, [idx]: product.name }));
        setShowProductDropdown(prev => ({ ...prev, [idx]: false }));
        const autoLotId = await fetchLots(product.id);
        setForm(prev => {
            const lines = [...prev.lines];
            lines[idx] = {
                ...lines[idx],
                product_id: product.id,
                product_name: product.name,
                unit_price: product.unit_price || 0,
                lot_id: autoLotId || ''
            };
            return { ...prev, lines };
        });
    };

    const handleLineChange = (index, field, value) => {
        setForm(prev => {
            const lines = [...prev.lines];
            lines[index] = { ...lines[index], [field]: field === 'product_name' || field === 'lot_id' ? value : parseFloat(value) || 0 };
            return { ...prev, lines };
        });
    };

    const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
    const removeLine = (index) => {
        if (form.lines.length <= 1) return;
        setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
        setProductSearches(prev => { const n = { ...prev }; delete n[index]; return n; });
    };

    const total = form.lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(Math.round(amount));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await api.post('/v1/pharmacy/sales', form, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Vente enregistrée' });
            setTimeout(() => navigate('/pharmacy/sales'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSaving(false);
    };

    return (
        <div className="container-fluid">
            {toast && (
                <div className={`alert alert-${toast.type} alert-dismissible fade show position-fixed`}
                    style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
                    {toast.message}
                    <button className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <Link to="/pharmacy/sales">Pharmacie</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <Link to="/pharmacy/sales">Ventes</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Nouvelle</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-cash-register me-2" />Vente au comptoir</h4>
                <Link to="/pharmacy/sales" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card form-card mb-3">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h6 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>Articles</h6>
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>
                                    <i className="fas fa-plus me-1"></i>Ajouter
                                </button>
                            </div>
                            <div className="card-body">
                                {form.lines.map((line, idx) => (
                                    <div key={idx} className="border rounded p-2 mb-2">
                                        <div className="row g-2 align-items-end">
                                            <div className="col-md-4 position-relative">
                                                <input type="text" className="form-control form-control-sm"
                                                    placeholder="Rechercher un produit..."
                                                    value={productSearches[idx] || ''}
                                                    onChange={e => searchProduct(idx, e.target.value)}
                                                    onFocus={() => (productResults[idx] || []).length > 0 && setShowProductDropdown(prev => ({ ...prev, [idx]: true }))} />
                                                {showProductDropdown[idx] && (productResults[idx] || []).length > 0 && (
                                                    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 150, overflowY: 'auto' }}>
                                                        {productResults[idx].map(p => (
                                                            <li key={p.id} className="list-group-item list-group-item-action py-1" style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                                                                onClick={() => selectProduct(idx, p)}>
                                                                {p.name} <small className="text-muted">({p.sku}) - {formatAmount(p.unit_price)} XAF</small>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="col-md-2">
                                                <select className="form-select form-select-sm" value={line.lot_id}
                                                    onChange={e => handleLineChange(idx, 'lot_id', e.target.value)}>
                                                    <option value="">Lot auto</option>
                                                    {(lotsMap[line.product_id] || []).map(lot => (
                                                        <option key={lot.id} value={lot.id}>{lot.lot_number || 'N/A'} ({lot.quantity})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-2">
                                                <input type="number" className="form-control form-control-sm" placeholder="Qté" value={line.quantity}
                                                    onChange={e => handleLineChange(idx, 'quantity', e.target.value)} min="1" />
                                            </div>
                                            <div className="col-md-2">
                                                <input type="number" className="form-control form-control-sm" placeholder="Prix" value={line.unit_price}
                                                    onChange={e => handleLineChange(idx, 'unit_price', e.target.value)} min="0" />
                                            </div>
                                            <div className="col-md-1 text-end fw-bold" style={{ fontSize: '0.85rem' }}>
                                                {formatAmount(line.quantity * line.unit_price)}
                                            </div>
                                            <div className="col-md-1">
                                                {form.lines.length > 1 && (
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeLine(idx)}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card form-card mb-3">
                            <div className="card-header"><h6 className="mb-0"><i className="fas fa-user me-2"></i>Client (optionnel)</h6></div>
                            <div className="card-body">
                                <div className="position-relative">
                                    <input type="text" className="form-control" value={partySearch}
                                        onChange={e => searchParties(e.target.value)}
                                        onFocus={() => partyResults.length > 0 && setShowPartyDropdown(true)}
                                        placeholder="Rechercher un client..." />
                                    {selectedParty && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedParty.display_name}</small>}
                                    {showPartyDropdown && partyResults.length > 0 && (
                                        <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 150, overflowY: 'auto' }}>
                                            {partyResults.map(p => (
                                                <li key={p.id} className="list-group-item list-group-item-action py-1" style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                                                    onClick={() => selectParty(p)}>
                                                    {p.display_name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card form-card mb-3">
                            <div className="card-header"><h6 className="mb-0"><i className="fas fa-money-bill me-2"></i>Paiement</h6></div>
                            <div className="card-body">
                                <select className="form-select mb-3" value={form.payment_method}
                                    onChange={e => setForm(prev => ({ ...prev, payment_method: e.target.value }))}>
                                    <option value="cash">Espèces</option>
                                    <option value="mobile_money">Mobile Money</option>
                                    <option value="card">Carte</option>
                                    <option value="transfer">Virement</option>
                                    <option value="credit">Crédit</option>
                                </select>
                                <div className="text-center">
                                    <div className="fs-4 fw-bold text-primary">{formatAmount(total)} XAF</div>
                                    <small className="text-muted">Total à payer</small>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-success w-100 btn-lg" disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-check me-1"></i>Valider la vente</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RetailSaleForm;
