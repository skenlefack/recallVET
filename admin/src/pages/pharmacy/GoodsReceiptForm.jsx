import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const emptyLine = () => ({ product_id: '', lot_number: '', batch: '', expiry_date: '', quantity: 1, unit_cost: 0, location: '' });

const GoodsReceiptForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [form, setForm] = useState({
        po_id: '', supplier_id: '', receipt_date: new Date().toISOString().substring(0, 10),
        notes: '', lines: [emptyLine()]
    });
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchPOs();
        fetchSuppliers();
        fetchProducts();
        if (isEdit) loadReceipt();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPOs = async () => {
        const res = await api.get('/v1/pharmacy/purchase-orders?status=approved&limit=100', token);
        if (res.success) setPurchaseOrders(res.data || []);
    };

    const fetchSuppliers = async () => {
        const res = await api.get('/v1/pharmacy/suppliers?limit=1000', token);
        if (res.success) setSuppliers(res.data || []);
    };

    const fetchProducts = async () => {
        const res = await api.get('/v1/pharmacy/products?limit=1000', token);
        if (res.success) setProducts(res.data || []);
    };

    const loadReceipt = async () => {
        setLoading(true);
        const res = await api.get(`/v1/pharmacy/goods-receipts/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                po_id: d.po_id || '', supplier_id: d.supplier_id || '',
                receipt_date: d.receipt_date ? d.receipt_date.substring(0, 10) : '',
                notes: d.notes || '', lines: d.lines && d.lines.length > 0 ? d.lines.map(l => ({
                    ...l, expiry_date: l.expiry_date ? l.expiry_date.substring(0, 10) : ''
                })) : [emptyLine()]
            });
        }
        setLoading(false);
    };

    const handlePOChange = async (poId) => {
        setForm(prev => ({ ...prev, po_id: poId }));
        if (!poId) return;
        const res = await api.get(`/v1/pharmacy/purchase-orders/${poId}`, token);
        if (res.success && res.data) {
            const po = res.data;
            setForm(prev => ({
                ...prev,
                supplier_id: po.supplier_id || '',
                lines: (po.lines || []).map(l => ({
                    product_id: l.product_id || '', lot_number: '', batch: '', expiry_date: '',
                    quantity: l.quantity || 1, unit_cost: l.unit_cost || 0, location: ''
                }))
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (index, field, value) => {
        setForm(prev => {
            const lines = [...prev.lines];
            lines[index] = { ...lines[index], [field]: value };
            return { ...prev, lines };
        });
    };

    const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
    const removeLine = (index) => {
        if (form.lines.length <= 1) return;
        setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/pharmacy/goods-receipts/${id}`, form, token)
            : await api.post('/v1/pharmacy/goods-receipts', form, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Réception enregistrée' });
            setTimeout(() => navigate('/pharmacy/stock'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSaving(false);
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
                <Link to="/pharmacy/stock">Pharmacie</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <Link to="/pharmacy/stock">Réception</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Nouvelle</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-box-open me-2" />{isEdit ? 'Modifier la réception' : 'Réception de marchandises'}</h4>
                <Link to="/pharmacy/stock" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-file-alt me-2"></i>Référence</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Bon de commande (optionnel)</label>
                                <select className="form-select" value={form.po_id} onChange={e => handlePOChange(e.target.value)}>
                                    <option value="">-- Sans BC --</option>
                                    {purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.po_number || po.id} - {po.supplier_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Fournisseur *</label>
                                <select className="form-select" name="supplier_id" value={form.supplier_id} onChange={handleChange} required>
                                    <option value="">-- Sélectionner --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Date de réception *</label>
                                <input type="date" className="form-control" name="receipt_date" value={form.receipt_date} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><i className="fas fa-list me-2"></i>Lignes de réception</h6>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>
                            <i className="fas fa-plus me-1"></i>Ajouter
                        </button>
                    </div>
                    <div className="card-body">
                        {form.lines.map((line, idx) => (
                            <div key={idx} className="border rounded p-3 mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <strong>Ligne {idx + 1}</strong>
                                    {form.lines.length > 1 && (
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeLine(idx)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="row g-2">
                                    <div className="col-md-4">
                                        <select className="form-select form-select-sm" value={line.product_id}
                                            onChange={e => handleLineChange(idx, 'product_id', e.target.value)} required>
                                            <option value="">Produit *</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <input type="text" className="form-control form-control-sm" placeholder="N° lot" value={line.lot_number}
                                            onChange={e => handleLineChange(idx, 'lot_number', e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="text" className="form-control form-control-sm" placeholder="Batch" value={line.batch}
                                            onChange={e => handleLineChange(idx, 'batch', e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="date" className="form-control form-control-sm" placeholder="Expiration" value={line.expiry_date}
                                            onChange={e => handleLineChange(idx, 'expiry_date', e.target.value)} title="Date d'expiration" />
                                    </div>
                                    <div className="col-md-1">
                                        <input type="number" className="form-control form-control-sm" placeholder="Qté" value={line.quantity}
                                            onChange={e => handleLineChange(idx, 'quantity', e.target.value)} min="1" />
                                    </div>
                                    <div className="col-md-1">
                                        <input type="number" className="form-control form-control-sm" placeholder="Coût" value={line.unit_cost}
                                            onChange={e => handleLineChange(idx, 'unit_cost', e.target.value)} min="0" />
                                    </div>
                                    <div className="col-md-3">
                                        <input type="text" className="form-control form-control-sm" placeholder="Emplacement" value={line.location}
                                            onChange={e => handleLineChange(idx, 'location', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
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
                    <Link to="/pharmacy/stock" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default GoodsReceiptForm;
