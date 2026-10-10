import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const emptyLine = () => ({ description: '', quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 19.25 });

const InvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        party_id: '', animal_id: '', invoice_date: new Date().toISOString().substring(0, 10),
        due_date: '', currency: 'XAF', notes: '',
        lines: [emptyLine()]
    });
    const [partySearch, setPartySearch] = useState('');
    const [partyResults, setPartyResults] = useState([]);
    const [selectedParty, setSelectedParty] = useState(null);
    const [showPartyDropdown, setShowPartyDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadInvoice();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadInvoice = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/invoices/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                party_id: d.party_id || '', animal_id: d.animal_id || '',
                invoice_date: d.invoice_date ? d.invoice_date.substring(0, 10) : '',
                due_date: d.due_date ? d.due_date.substring(0, 10) : '',
                currency: d.currency || 'XAF', notes: d.notes || '',
                lines: d.lines && d.lines.length > 0 ? d.lines : [emptyLine()]
            });
            if (d.party_name) {
                setSelectedParty({ id: d.party_id, display_name: d.party_name });
                setPartySearch(d.party_name);
            }
        }
        setLoading(false);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (index, field, value) => {
        setForm(prev => {
            const lines = [...prev.lines];
            lines[index] = { ...lines[index], [field]: field === 'description' ? value : parseFloat(value) || 0 };
            return { ...prev, lines };
        });
    };

    const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, emptyLine()] }));

    const removeLine = (index) => {
        if (form.lines.length <= 1) return;
        setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    };

    const calcLineTotal = (line) => {
        const subtotal = line.quantity * line.unit_price;
        const discounted = subtotal * (1 - (line.discount_percent || 0) / 100);
        return discounted * (1 + (line.tax_rate || 0) / 100);
    };

    const subtotal = form.lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
    const totalDiscount = form.lines.reduce((sum, l) => sum + l.quantity * l.unit_price * (l.discount_percent || 0) / 100, 0);
    const totalTax = form.lines.reduce((sum, l) => {
        const after = l.quantity * l.unit_price * (1 - (l.discount_percent || 0) / 100);
        return sum + after * (l.tax_rate || 0) / 100;
    }, 0);
    const grandTotal = subtotal - totalDiscount + totalTax;

    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(Math.round(amount));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/clinic/invoices/${id}`, form, token)
            : await api.post('/v1/clinic/invoices', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Facture mise à jour' : 'Facture créée' });
            setTimeout(() => navigate('/clinic/invoices'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur lors de la sauvegarde' });
        }
        setSaving(false);
    };

    const handlePay = async () => {
        if (!id) return;
        const res = await api.put(`/v1/clinic/invoices/${id}/pay`, {}, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Paiement enregistré' });
            setTimeout(() => navigate('/clinic/invoices'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>;

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
                <Link to="/clinic/invoices">Factures</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-file-invoice me-2" />{isEdit ? 'Modifier la facture' : 'Nouvelle facture'}</h4>
                <div className="d-flex gap-2">
                    {isEdit && (
                        <a href={`/api/v1/clinic/exports/invoices/${id}/pdf`}
                           className="btn btn-outline-secondary btn-sm" target="_blank" rel="noreferrer">
                            <i className="fas fa-file-pdf me-1" />PDF
                        </a>
                    )}
                    <Link to="/clinic/invoices" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1" />Retour à la liste
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-user me-2"></i>Client & Dates</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-5 position-relative">
                                <label className="form-label">Client *</label>
                                <input type="text" className="form-control" value={partySearch}
                                    onChange={e => searchParties(e.target.value)}
                                    onFocus={() => partyResults.length > 0 && setShowPartyDropdown(true)}
                                    placeholder="Rechercher un client..." required={!form.party_id} />
                                {selectedParty && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedParty.display_name}</small>}
                                {showPartyDropdown && partyResults.length > 0 && (
                                    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                                        {partyResults.map(p => (
                                            <li key={p.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }}
                                                onClick={() => selectParty(p)}>
                                                {p.display_name} <small className="text-muted">- {p.phone_primary || ''}</small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Animal (réf.)</label>
                                <input type="text" className="form-control" name="animal_id" value={form.animal_id} onChange={handleChange} placeholder="ID" />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Date facture *</label>
                                <input type="date" className="form-control" name="invoice_date" value={form.invoice_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Échéance</label>
                                <input type="date" className="form-control" name="due_date" value={form.due_date} onChange={handleChange} />
                            </div>
                            <div className="col-md-1">
                                <label className="form-label">Devise</label>
                                <select className="form-select" name="currency" value={form.currency} onChange={handleChange}>
                                    <option value="XAF">XAF</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                </select>
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
                                        <th style={{ minWidth: 200 }}>Description</th>
                                        <th style={{ width: 90 }}>Qté</th>
                                        <th style={{ width: 120 }}>Prix unit.</th>
                                        <th style={{ width: 90 }}>Remise %</th>
                                        <th style={{ width: 90 }}>TVA %</th>
                                        <th style={{ width: 120 }}>Total</th>
                                        <th style={{ width: 50 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.lines.map((line, idx) => (
                                        <tr key={idx}>
                                            <td><input type="text" className="form-control form-control-sm" value={line.description} onChange={e => handleLineChange(idx, 'description', e.target.value)} required /></td>
                                            <td><input type="number" className="form-control form-control-sm" value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', e.target.value)} min="1" /></td>
                                            <td><input type="number" className="form-control form-control-sm" value={line.unit_price} onChange={e => handleLineChange(idx, 'unit_price', e.target.value)} min="0" /></td>
                                            <td><input type="number" className="form-control form-control-sm" value={line.discount_percent} onChange={e => handleLineChange(idx, 'discount_percent', e.target.value)} min="0" max="100" /></td>
                                            <td><input type="number" className="form-control form-control-sm" value={line.tax_rate} onChange={e => handleLineChange(idx, 'tax_rate', e.target.value)} min="0" /></td>
                                            <td className="fw-bold text-end">{formatAmount(calcLineTotal(line))}</td>
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
                                    <tr><td colSpan="5" className="text-end">Sous-total</td><td className="text-end fw-bold">{formatAmount(subtotal)}</td><td></td></tr>
                                    <tr><td colSpan="5" className="text-end">Remise</td><td className="text-end text-danger">-{formatAmount(totalDiscount)}</td><td></td></tr>
                                    <tr><td colSpan="5" className="text-end">TVA</td><td className="text-end">{formatAmount(totalTax)}</td><td></td></tr>
                                    <tr><td colSpan="5" className="text-end fs-5">Total TTC</td><td className="text-end fs-5 fw-bold">{formatAmount(grandTotal)} {form.currency}</td><td></td></tr>
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
                        <button type="button" className="btn btn-success" onClick={handlePay}>
                            <i className="fas fa-money-bill-wave me-1"></i>Marquer payée
                        </button>
                    )}
                    <Link to="/clinic/invoices" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;
