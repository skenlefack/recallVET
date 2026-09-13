import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const StockMovementForm = () => {
    const navigate = useNavigate();
    const token = getToken();

    const [form, setForm] = useState({
        movement_type: 'adjustment', product_id: '', lot_id: '',
        from_location: '', to_location: '', quantity: 1, reason: ''
    });
    const [products, setProducts] = useState([]);
    const [lots, setLots] = useState([]);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (form.product_id) fetchLots(form.product_id);
        else setLots([]);
    }, [form.product_id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchProducts = async () => {
        const res = await api.get('/v1/pharmacy/products?limit=1000', token);
        if (res.success) setProducts(res.data || []);
    };

    const fetchLots = async (productId) => {
        const res = await api.get(`/v1/pharmacy/stock/lots?product_id=${productId}`, token);
        if (res.success) setLots(res.data || []);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await api.post('/v1/pharmacy/stock/movements', form, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Mouvement enregistré' });
            setTimeout(() => navigate('/pharmacy/stock'), 1000);
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
                <Link to="/pharmacy/stock">Pharmacie</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <Link to="/pharmacy/stock">Stock</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Mouvement</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-exchange-alt me-2" />Mouvement de stock</h4>
                <Link to="/pharmacy/stock" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Détails du mouvement</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Type de mouvement *</label>
                                <select className="form-select" name="movement_type" value={form.movement_type} onChange={handleChange} required>
                                    <option value="adjustment">Ajustement</option>
                                    <option value="transfer">Transfert</option>
                                    <option value="damage">Dommage / Perte</option>
                                    <option value="return">Retour</option>
                                    <option value="expired">Périmé</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Produit *</label>
                                <select className="form-select" name="product_id" value={form.product_id} onChange={handleChange} required>
                                    <option value="">-- Sélectionner --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Lot</label>
                                <select className="form-select" name="lot_id" value={form.lot_id} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    {lots.map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.lot_number || 'N/A'} - Qté: {l.quantity} {l.expiry_date ? `- Exp: ${new Date(l.expiry_date).toLocaleDateString('fr-FR')}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {form.movement_type === 'transfer' && (
                                <>
                                    <div className="col-md-4">
                                        <label className="form-label">Emplacement source</label>
                                        <input type="text" className="form-control" name="from_location" value={form.from_location} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Emplacement destination</label>
                                        <input type="text" className="form-control" name="to_location" value={form.to_location} onChange={handleChange} />
                                    </div>
                                </>
                            )}
                            <div className="col-md-3">
                                <label className="form-label">Quantité *</label>
                                <input type="number" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} min="1" required />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Motif *</label>
                                <textarea className="form-control" name="reason" value={form.reason} onChange={handleChange} rows="3" required></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/pharmacy/stock" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default StockMovementForm;
