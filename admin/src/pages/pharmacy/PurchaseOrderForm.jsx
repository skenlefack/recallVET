import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const emptyLine = () => ({ product_id: '', product_name: '', quantity: 1, unit_cost: 0 });

const PurchaseOrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [form, setForm] = useState({
        supplier_id: '', order_date: new Date().toISOString().substring(0, 10),
        expected_date: '', notes: '', lines: [emptyLine()]
    });
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
        if (isEdit) loadOrder();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSuppliers = async () => {
        const res = await api.get('/v1/pharmacy/suppliers?limit=1000', token);
        if (res.success) setSuppliers(res.data || []);
    };

    const fetchProducts = async () => {
        const res = await api.get('/v1/pharmacy/products?limit=1000', token);
        if (res.success) setProducts(res.data || []);
    };

    const loadOrder = async () => {
        setLoading(true);
        const res = await api.get(`/v1/pharmacy/purchase-orders/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                supplier_id: d.supplier_id || '', order_date: d.order_date ? d.order_date.substring(0, 10) : '',
                expected_date: d.expected_date ? d.expected_date.substring(0, 10) : '',
                notes: d.notes || '', lines: d.lines && d.lines.length > 0 ? d.lines : [emptyLine()]
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (index, field, value) => {
        setForm(prev => {
            const lines = [...prev.lines];
            if (field === 'product_id') {
                const prod = products.find(p => p.id === parseInt(value));
                lines[index] = { ...lines[index], product_id: value, product_name: prod ? prod.name : '' };
            } else {
                lines[index] = { ...lines[index], [field]: field === 'product_name' ? value : parseFloat(value) || 0 };
            }
            return { ...prev, lines };
        });
    };

    const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
    const removeLine = (index) => {
        if (form.lines.length <= 1) return;
        setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    };

    const total = form.lines.reduce((sum, l) => sum + l.quantity * l.unit_cost, 0);
    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(Math.round(amount));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/pharmacy/purchase-orders/${id}`, form, token)
            : await api.post('/v1/pharmacy/purchase-orders', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'BC mis à jour' : 'BC créé' });
            setTimeout(() => navigate('/pharmacy/purchase-orders'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSaving(false);
    };

    const handleApprove = async () => {
        if (!id) return;
        const res = await api.put(`/v1/pharmacy/purchase-orders/${id}/approve`, {}, token);
        if (res.success) {
            setToast({ type: 'success', message: 'BC approuvé' });
            setTimeout(() => navigate('/pharmacy/purchase-orders'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

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
                <Link to="/pharmacy/purchase-orders">Commandes</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-file-alt me-2" />{isEdit ? 'Modifier le BC' : 'Nouveau bon de commande'}</h4>
                <Link to="/pharmacy/purchase-orders" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-truck me-2"></i>Fournisseur & Dates</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Fournisseur *</label>
                                <select className="form-select" name="supplier_id" value={form.supplier_id} onChange={handleChange} required>
                                    <option value="">-- Sélectionner --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date de commande *</label>
                                <input type="date" className="form-control" name="order_date" value={form.order_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date prévue livraison</label>
                                <input type="date" className="form-control" name="expected_date" value={form.expected_date} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><i className="fas fa-list me-2"></i>Lignes</h6>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>
                            <i className="fas fa-plus me-1"></i>Ajouter
                        </button>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ minWidth: 250 }}>Produit</th>
                                        <th style={{ width: 100 }}>Quantité</th>
                                        <th style={{ width: 130 }}>Coût unit.</th>
                                        <th style={{ width: 130 }}>Total</th>
                                        <th style={{ width: 50 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.lines.map((line, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <select className="form-select form-select-sm" value={line.product_id}
                                                    onChange={e => handleLineChange(idx, 'product_id', e.target.value)}>
                                                    <option value="">-- Sélectionner --</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                                </select>
                                            </td>
                                            <td><input type="number" className="form-control form-control-sm" value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', e.target.value)} min="1" /></td>
                                            <td><input type="number" className="form-control form-control-sm" value={line.unit_cost} onChange={e => handleLineChange(idx, 'unit_cost', e.target.value)} min="0" /></td>
                                            <td className="text-end fw-bold">{formatAmount(line.quantity * line.unit_cost)}</td>
                                            <td>
                                                {form.lines.length > 1 && (
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeLine(idx)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr><td colSpan="3" className="text-end fs-5">Total</td><td className="text-end fs-5 fw-bold">{formatAmount(total)} XAF</td><td></td></tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-body">
                        <label className="form-label">Notes</label>
                        <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="2"></textarea>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    {isEdit && (
                        <button type="button" className="btn btn-success" onClick={handleApprove}>
                            <i className="fas fa-check me-1"></i>Approuver
                        </button>
                    )}
                    <Link to="/pharmacy/purchase-orders" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default PurchaseOrderForm;
