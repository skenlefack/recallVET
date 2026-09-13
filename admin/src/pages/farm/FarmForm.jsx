import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const FarmForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        owner_id: '', name: '', farm_type: '', total_area_ha: '', address: '',
        region: '', registration_number: '', notes: ''
    });
    const [ownerSearch, setOwnerSearch] = useState('');
    const [ownerResults, setOwnerResults] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadFarm();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadFarm = async () => {
        setLoading(true);
        const res = await api.get(`/v1/farm/farms/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                owner_id: d.owner_id || '', name: d.name || '', farm_type: d.farm_type || '',
                total_area_ha: d.total_area_ha || '', address: d.address || '',
                region: d.region || '', registration_number: d.registration_number || '', notes: d.notes || ''
            });
            if (d.owner_name) {
                setSelectedOwner({ id: d.owner_id, display_name: d.owner_name });
                setOwnerSearch(d.owner_name);
            }
        }
        setLoading(false);
    };

    const searchOwners = (value) => {
        setOwnerSearch(value);
        setShowOwnerDropdown(true);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.length < 2) { setOwnerResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            const res = await api.get(`/v1/clinic/parties?search=${encodeURIComponent(value)}`, token);
            if (res.success) setOwnerResults(res.data || []);
        }, 300);
    };

    const selectOwner = (owner) => {
        setSelectedOwner(owner);
        setOwnerSearch(owner.display_name);
        setForm(prev => ({ ...prev, owner_id: owner.id }));
        setShowOwnerDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/farm/farms/${id}`, form, token)
            : await api.post('/v1/farm/farms', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Exploitation mise à jour' : 'Exploitation créée' });
            setTimeout(() => navigate('/farm/farms'), 1000);
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
                <Link to="/farm/farms">Exploitations</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-tractor me-2" />{isEdit ? 'Modifier l\'exploitation' : 'Nouvelle exploitation'}</h4>
                <Link to="/farm/farms" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-user me-2"></i>Propriétaire</h6></div>
                    <div className="card-body">
                        <div className="position-relative">
                            <label className="form-label">Rechercher le propriétaire *</label>
                            <input type="text" className="form-control" value={ownerSearch}
                                onChange={e => searchOwners(e.target.value)}
                                onFocus={() => ownerResults.length > 0 && setShowOwnerDropdown(true)}
                                placeholder="Tapez pour rechercher..." required={!form.owner_id} />
                            {selectedOwner && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedOwner.display_name}</small>}
                            {showOwnerDropdown && ownerResults.length > 0 && (
                                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                                    {ownerResults.map(o => (
                                        <li key={o.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }}
                                            onClick={() => selectOwner(o)}>
                                            {o.display_name} <small className="text-muted">- {o.phone_primary || ''}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Informations</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nom de l'exploitation *</label>
                                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Type d'exploitation</label>
                                <select className="form-select" name="farm_type" value={form.farm_type} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    <option value="livestock">Élevage</option>
                                    <option value="poultry">Aviculture</option>
                                    <option value="dairy">Laitier</option>
                                    <option value="mixed">Mixte</option>
                                    <option value="aquaculture">Aquaculture</option>
                                    <option value="apiculture">Apiculture</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Superficie (ha)</label>
                                <input type="number" className="form-control" name="total_area_ha" value={form.total_area_ha} onChange={handleChange} step="0.1" min="0" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Adresse</label>
                                <input type="text" className="form-control" name="address" value={form.address} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Région</label>
                                <input type="text" className="form-control" name="region" value={form.region} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">N° d'enregistrement</label>
                                <input type="text" className="form-control" name="registration_number" value={form.registration_number} onChange={handleChange} />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Notes</label>
                                <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
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

export default FarmForm;
