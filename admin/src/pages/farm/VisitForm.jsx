import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const VisitForm = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        farm_id: searchParams.get('farm_id') || '', visit_date: new Date().toISOString().substring(0, 10),
        visit_type: 'routine', findings: '', recommendations: '', follow_up_date: '', status: 'planned'
    });
    const [farmSearch, setFarmSearch] = useState('');
    const [farmResults, setFarmResults] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [showFarmDropdown, setShowFarmDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadVisit();
        if (searchParams.get('farm_id')) loadFarm(searchParams.get('farm_id'));
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadFarm = async (farmId) => {
        const res = await api.get(`/v1/farm/farms/${farmId}`, token);
        if (res.success && res.data) {
            setSelectedFarm(res.data);
            setFarmSearch(res.data.name);
        }
    };

    const loadVisit = async () => {
        setLoading(true);
        const res = await api.get(`/v1/farm/visits/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                farm_id: d.farm_id || '', visit_date: d.visit_date ? d.visit_date.substring(0, 10) : '',
                visit_type: d.visit_type || 'routine', findings: d.general_findings || d.findings || '',
                recommendations: d.recommendations || '',
                follow_up_date: d.follow_up_date ? d.follow_up_date.substring(0, 10) : '',
                status: d.status || 'planned'
            });
            if (d.farm_name) {
                setSelectedFarm({ id: d.farm_id, name: d.farm_name });
                setFarmSearch(d.farm_name);
            }
        }
        setLoading(false);
    };

    const searchFarms = (value) => {
        setFarmSearch(value);
        setShowFarmDropdown(true);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.length < 2) { setFarmResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            const res = await api.get(`/v1/farm/farms?search=${encodeURIComponent(value)}`, token);
            if (res.success) setFarmResults(res.data || []);
        }, 300);
    };

    const selectFarm = (farm) => {
        setSelectedFarm(farm);
        setFarmSearch(farm.name);
        setForm(prev => ({ ...prev, farm_id: farm.id }));
        setShowFarmDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form, general_findings: form.findings, follow_up_notes: form.follow_up_notes || null };
        delete payload.findings;
        const res = isEdit
            ? await api.put(`/v1/farm/visits/${id}`, payload, token)
            : await api.post('/v1/farm/visits', payload, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Visite mise à jour' : 'Visite enregistrée' });
            setTimeout(() => navigate(form.farm_id ? `/farm/farms/${form.farm_id}` : '/farm/farms'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur lors de la sauvegarde' });
        }
        setSaving(false);
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
                <Link to="/farm/farms">Visites</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-clipboard-check me-2" />{isEdit ? 'Modifier la visite' : 'Nouvelle visite'}</h4>
                <Link to="/farm/farms" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-tractor me-2"></i>Exploitation</h6></div>
                    <div className="card-body">
                        <div className="position-relative">
                            <label className="form-label">Rechercher l'exploitation *</label>
                            <input type="text" className="form-control" value={farmSearch}
                                onChange={e => searchFarms(e.target.value)}
                                onFocus={() => farmResults.length > 0 && setShowFarmDropdown(true)}
                                placeholder="Tapez le nom de l'exploitation..." required={!form.farm_id} />
                            {selectedFarm && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedFarm.name}</small>}
                            {showFarmDropdown && farmResults.length > 0 && (
                                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                                    {farmResults.map(f => (
                                        <li key={f.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }}
                                            onClick={() => selectFarm(f)}>
                                            {f.name} <small className="text-muted">({f.farm_type || ''}) - {f.region || ''}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Détails de la visite</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Date de visite *</label>
                                <input type="date" className="form-control" name="visit_date" value={form.visit_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Type de visite</label>
                                <select className="form-select" name="visit_type" value={form.visit_type} onChange={handleChange}>
                                    <option value="routine">Routine</option>
                                    <option value="emergency">Urgence</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="inspection">Inspection</option>
                                    <option value="follow_up">Suivi</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Statut</label>
                                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                    <option value="planned">Planifiée</option>
                                    <option value="in_progress">En cours</option>
                                    <option value="completed">Terminée</option>
                                    <option value="cancelled">Annulée</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date de suivi</label>
                                <input type="date" className="form-control" name="follow_up_date" value={form.follow_up_date} onChange={handleChange} />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Constatations</label>
                                <textarea className="form-control" name="findings" value={form.findings} onChange={handleChange} rows="4"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Recommandations</label>
                                <textarea className="form-control" name="recommendations" value={form.recommendations} onChange={handleChange} rows="4"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/farm/farms" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default VisitForm;
