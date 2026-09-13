import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const HerdForm = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [form, setForm] = useState({
        farm_id: searchParams.get('farm_id') || '', name: '', species_id: '', breed_id: '',
        purpose: '', head_count: '', housing_type: '', notes: ''
    });
    const [farms, setFarms] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [breedList, setBreedList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchFarms();
        fetchSpecies();
        if (isEdit) loadHerd();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (form.species_id) fetchBreeds(form.species_id);
        else setBreedList([]);
    }, [form.species_id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchFarms = async () => {
        const res = await api.get('/v1/farm/farms?limit=1000', token);
        if (res.success) setFarms(res.data || []);
    };

    const fetchSpecies = async () => {
        const res = await api.get('/v1/clinic/ref/species', token);
        if (res.success) setSpeciesList(res.data || []);
    };

    const fetchBreeds = async (speciesId) => {
        const res = await api.get(`/v1/clinic/ref/breeds?species_id=${speciesId}`, token);
        if (res.success) setBreedList(res.data || []);
    };

    const loadHerd = async () => {
        setLoading(true);
        const res = await api.get(`/v1/farm/herds/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                farm_id: d.farm_id || '', name: d.name || '', species_id: d.species_id || '',
                breed_id: d.breed_id || '', purpose: d.purpose || '', head_count: d.head_count || '',
                housing_type: d.housing_type || '', notes: d.notes || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/farm/herds/${id}`, form, token)
            : await api.post('/v1/farm/herds', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Troupeau mis à jour' : 'Troupeau créé' });
            setTimeout(() => navigate(form.farm_id ? `/farm/farms/${form.farm_id}` : '/farm/farms'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur lors de la sauvegarde' });
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
                <Link to="/farm/farms">Troupeaux</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-horse me-2" />{isEdit ? 'Modifier le troupeau' : 'Nouveau troupeau'}</h4>
                <Link to="/farm/farms" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Informations</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Exploitation *</label>
                                <select className="form-select" name="farm_id" value={form.farm_id} onChange={handleChange} required>
                                    <option value="">-- Sélectionner --</option>
                                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Nom du troupeau *</label>
                                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Espèce *</label>
                                <select className="form-select" name="species_id" value={form.species_id} onChange={handleChange} required>
                                    <option value="">-- Sélectionner --</option>
                                    {speciesList.map(s => <option key={s.id} value={s.id}>{s.name_fr || s.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Race</label>
                                <select className="form-select" name="breed_id" value={form.breed_id} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    {breedList.map(b => <option key={b.id} value={b.id}>{b.name_fr || b.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Usage</label>
                                <select className="form-select" name="purpose" value={form.purpose} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    <option value="dairy">Lait</option>
                                    <option value="meat">Viande</option>
                                    <option value="breeding">Reproduction</option>
                                    <option value="eggs">Oeufs</option>
                                    <option value="wool">Laine</option>
                                    <option value="mixed">Mixte</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Effectif</label>
                                <input type="number" className="form-control" name="head_count" value={form.head_count} onChange={handleChange} min="0" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Type d'hébergement</label>
                                <select className="form-select" name="housing_type" value={form.housing_type} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    <option value="open_range">Plein air</option>
                                    <option value="semi_intensive">Semi-intensif</option>
                                    <option value="intensive">Intensif</option>
                                    <option value="stable">Étable</option>
                                    <option value="barn">Bâtiment</option>
                                </select>
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

export default HerdForm;
