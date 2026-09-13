import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const DispenseForm = () => {
    const navigate = useNavigate();
    const token = getToken();
    const searchTimeout = useRef(null);

    const [prescriptionSearch, setPrescriptionSearch] = useState('');
    const [prescriptionResults, setPrescriptionResults] = useState([]);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [lines, setLines] = useState([]);
    const [lotsMap, setLotsMap] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const searchPrescriptions = (value) => {
        setPrescriptionSearch(value);
        setShowDropdown(true);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.length < 2) { setPrescriptionResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            const res = await api.get(`/v1/clinic/prescriptions?search=${encodeURIComponent(value)}&status=active`, token);
            if (res.success) setPrescriptionResults(res.data || []);
        }, 300);
    };

    const selectPrescription = async (presc) => {
        setSelectedPrescription(presc);
        setPrescriptionSearch(presc.prescription_number || `#${presc.id} - ${presc.animal_name}`);
        setShowDropdown(false);

        const res = await api.get(`/v1/clinic/prescriptions/${presc.id}`, token);
        if (res.success && res.data && res.data.lines) {
            const prescLines = res.data.lines.map(l => ({
                prescription_line_id: l.id,
                product_name: l.product_name,
                product_id: l.product_id || '',
                quantity: l.quantity || 1,
                lot_id: '',
                dispensed: false
            }));
            setLines(prescLines);

            // Fetch lots for each product
            const lotsData = {};
            for (const l of prescLines) {
                if (l.product_id) {
                    const lotRes = await api.get(`/v1/pharmacy/stock/lots?product_id=${l.product_id}`, token);
                    if (lotRes.success) lotsData[l.product_id] = lotRes.data || [];
                }
            }
            setLotsMap(lotsData);
        }
    };

    const handleLineChange = (index, field, value) => {
        setLines(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPrescription) return;
        setSaving(true);
        const payload = {
            prescription_id: selectedPrescription.id,
            lines: lines.map(l => ({
                prescription_line_id: l.prescription_line_id,
                product_id: l.product_id,
                lot_id: l.lot_id,
                quantity: l.quantity
            }))
        };
        const res = await api.post('/v1/pharmacy/dispense', payload, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Délivrance enregistrée' });
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
                <Link to="/pharmacy/sales">Dispensation</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Nouvelle</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-prescription-bottle-alt me-2" />Délivrance sur ordonnance</h4>
                <Link to="/pharmacy/sales" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-prescription me-2"></i>Ordonnance</h6></div>
                    <div className="card-body">
                        <div className="position-relative">
                            <label className="form-label">Rechercher une ordonnance *</label>
                            <input type="text" className="form-control" value={prescriptionSearch}
                                onChange={e => searchPrescriptions(e.target.value)}
                                onFocus={() => prescriptionResults.length > 0 && setShowDropdown(true)}
                                placeholder="N° ordonnance ou nom du patient..." required={!selectedPrescription} />
                            {selectedPrescription && (
                                <small className="text-success">
                                    <i className="fas fa-check me-1"></i>
                                    Ordonnance #{selectedPrescription.id} - {selectedPrescription.animal_name || 'N/A'}
                                </small>
                            )}
                            {showDropdown && prescriptionResults.length > 0 && (
                                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                                    {prescriptionResults.map(p => (
                                        <li key={p.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }}
                                            onClick={() => selectPrescription(p)}>
                                            #{p.prescription_number || p.id} - {p.animal_name || 'N/A'}
                                            <small className="text-muted ms-2">{p.prescription_date ? new Date(p.prescription_date).toLocaleDateString('fr-FR') : ''}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {lines.length > 0 && (
                    <div className="card form-card mb-3">
                        <div className="card-header"><h6 className="mb-0"><i className="fas fa-pills me-2"></i>Lignes à délivrer</h6></div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Produit</th>
                                            <th style={{ width: 100 }}>Quantité</th>
                                            <th style={{ minWidth: 250 }}>Lot</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((line, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{line.product_name}</strong></td>
                                                <td>
                                                    <input type="number" className="form-control form-control-sm" value={line.quantity}
                                                        onChange={e => handleLineChange(idx, 'quantity', parseInt(e.target.value) || 0)} min="0" />
                                                </td>
                                                <td>
                                                    <select className="form-select form-select-sm" value={line.lot_id}
                                                        onChange={e => handleLineChange(idx, 'lot_id', e.target.value)}>
                                                        <option value="">-- Sélectionner un lot --</option>
                                                        {(lotsMap[line.product_id] || []).map(lot => (
                                                            <option key={lot.id} value={lot.id}>
                                                                {lot.lot_number || 'N/A'} - Qté: {lot.quantity} {lot.expiry_date ? `- Exp: ${new Date(lot.expiry_date).toLocaleDateString('fr-FR')}` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success" disabled={saving || lines.length === 0}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Délivrance...</> : <><i className="fas fa-check me-1"></i>Délivrer</>}
                    </button>
                    <Link to="/pharmacy/sales" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default DispenseForm;
