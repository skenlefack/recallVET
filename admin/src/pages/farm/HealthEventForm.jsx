import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const HealthEventForm = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        farm_id: searchParams.get('farm_id') || '', herd_id: '',
        event_date: new Date().toISOString().substring(0, 10), event_type: 'disease_outbreak',
        disease_suspected: '', animals_affected: '', animals_dead: '',
        symptoms: '', actions_taken: '', reported: false, status: 'active'
    });
    const [farmSearch, setFarmSearch] = useState('');
    const [farmResults, setFarmResults] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [showFarmDropdown, setShowFarmDropdown] = useState(false);
    const [herds, setHerds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadEvent();
        if (searchParams.get('farm_id')) {
            loadFarm(searchParams.get('farm_id'));
            fetchHerds(searchParams.get('farm_id'));
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (form.farm_id) fetchHerds(form.farm_id);
        else setHerds([]);
    }, [form.farm_id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadFarm = async (farmId) => {
        const res = await api.get(`/v1/farm/farms/${farmId}`, token);
        if (res.success && res.data) {
            setSelectedFarm(res.data);
            setFarmSearch(res.data.name);
        }
    };

    const fetchHerds = async (farmId) => {
        const res = await api.get(`/v1/farm/farms/${farmId}/herds`, token);
        if (res.success) setHerds(res.data || []);
    };

    const loadEvent = async () => {
        setLoading(true);
        const res = await api.get(`/v1/farm/health-events/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                farm_id: d.farm_id || '', herd_id: d.herd_id || '',
                event_date: d.event_date ? d.event_date.substring(0, 10) : '',
                event_type: d.event_type || 'disease_outbreak',
                disease_suspected: d.disease_suspected || '',
                animals_affected: d.animals_affected || '', animals_dead: d.animals_dead || '',
                symptoms: d.symptoms || '', actions_taken: d.actions_taken || '',
                reported: d.reported || false, status: d.status || 'active'
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
        setForm(prev => ({ ...prev, farm_id: farm.id, herd_id: '' }));
        setShowFarmDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/farm/health-events/${id}`, form, token)
            : await api.post('/v1/farm/health-events', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Événement mis à jour' : 'Événement enregistré' });
            setTimeout(() => navigate(form.farm_id ? `/farm/farms/${form.farm_id}` : '/farm/health-events'), 1000);
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
                <Link to="/farm/health-events">Événements</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-exclamation-triangle me-2" />{isEdit ? 'Modifier l\'événement' : 'Nouvel événement sanitaire'}</h4>
                <Link to="/farm/health-events" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-tractor me-2"></i>Exploitation & Troupeau</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6 position-relative">
                                <label className="form-label">Exploitation *</label>
                                <input type="text" className="form-control" value={farmSearch}
                                    onChange={e => searchFarms(e.target.value)}
                                    onFocus={() => farmResults.length > 0 && setShowFarmDropdown(true)}
                                    placeholder="Rechercher une exploitation..." required={!form.farm_id} />
                                {selectedFarm && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedFarm.name}</small>}
                                {showFarmDropdown && farmResults.length > 0 && (
                                    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                                        {farmResults.map(f => (
                                            <li key={f.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }}
                                                onClick={() => selectFarm(f)}>
                                                {f.name} <small className="text-muted">- {f.region || ''}</small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Troupeau</label>
                                <select className="form-select" name="herd_id" value={form.herd_id} onChange={handleChange}>
                                    <option value="">-- Tous / Non spécifié --</option>
                                    {herds.map(h => <option key={h.id} value={h.id}>{h.name} ({h.head_count || 0} têtes)</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Détails de l'événement</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Date *</label>
                                <input type="date" className="form-control" name="event_date" value={form.event_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Type d'événement</label>
                                <select className="form-select" name="event_type" value={form.event_type} onChange={handleChange}>
                                    <option value="disease_outbreak">Foyer de maladie</option>
                                    <option value="mortality">Mortalité</option>
                                    <option value="poisoning">Intoxication</option>
                                    <option value="parasitism">Parasitisme</option>
                                    <option value="reproductive">Reproductif</option>
                                    <option value="nutritional">Nutritionnel</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Maladie suspectée</label>
                                <input type="text" className="form-control" name="disease_suspected" value={form.disease_suspected} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Animaux affectés</label>
                                <input type="number" className="form-control" name="animals_affected" value={form.animals_affected} onChange={handleChange} min="0" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Animaux morts</label>
                                <input type="number" className="form-control" name="animals_dead" value={form.animals_dead} onChange={handleChange} min="0" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Statut</label>
                                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                    <option value="active">Actif</option>
                                    <option value="monitoring">Surveillance</option>
                                    <option value="escalated">Escaladé</option>
                                    <option value="resolved">Résolu</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <div className="form-check mt-4">
                                    <input className="form-check-input" type="checkbox" name="reported" checked={form.reported} onChange={handleChange} id="reportedCheck" />
                                    <label className="form-check-label" htmlFor="reportedCheck">Déclaré aux autorités</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Symptômes observés</label>
                                <textarea className="form-control" name="symptoms" value={form.symptoms} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Actions prises</label>
                                <textarea className="form-control" name="actions_taken" value={form.actions_taken} onChange={handleChange} rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/farm/health-events" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default HealthEventForm;
