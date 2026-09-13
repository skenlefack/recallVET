import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const AnimalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        owner_id: '', name: '', species_id: '', breed_id: '', sex: '', date_of_birth: '',
        color_markings: '', weight_kg: '', microchip_number: '', notes: ''
    });
    const [ownerSearch, setOwnerSearch] = useState('');
    const [ownerResults, setOwnerResults] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
    const [speciesList, setSpeciesList] = useState([]);
    const [breedList, setBreedList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchSpecies();
        if (isEdit) loadAnimal();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (form.species_id) fetchBreeds(form.species_id);
        else setBreedList([]);
    }, [form.species_id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSpecies = async () => {
        const res = await api.get('/v1/clinic/ref/species', token);
        if (res.success) setSpeciesList(res.data || []);
    };

    const fetchBreeds = async (speciesId) => {
        const res = await api.get(`/v1/clinic/ref/breeds?species_id=${speciesId}`, token);
        if (res.success) setBreedList(res.data || []);
    };

    const loadAnimal = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/animals/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                owner_id: d.owner_id || '', name: d.name || '', species_id: d.species_id || '',
                breed_id: d.breed_id || '', sex: d.sex || '', date_of_birth: d.date_of_birth ? d.date_of_birth.substring(0, 10) : '',
                color_markings: d.color_markings || '', weight_kg: d.weight_kg || '',
                microchip_number: d.microchip_number || '', notes: d.notes || ''
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
            ? await api.put(`/v1/clinic/animals/${id}`, form, token)
            : await api.post('/v1/clinic/animals', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Animal mis à jour' : 'Animal créé avec succès' });
            setTimeout(() => navigate('/clinic/animals'), 1000);
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
                <Link to="/clinic/animals">Animaux</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-paw me-2" />{isEdit ? 'Modifier l\'animal' : 'Nouvel animal'}</h4>
                <Link to="/clinic/animals" className="btn btn-outline-secondary btn-sm">
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
                                placeholder="Tapez pour rechercher un client..." required={!form.owner_id} />
                            {selectedOwner && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedOwner.display_name}</small>}
                            {showOwnerDropdown && ownerResults.length > 0 && (
                                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                                    {ownerResults.map(o => (
                                        <li key={o.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }}
                                            onClick={() => selectOwner(o)}>
                                            {o.display_name} <small className="text-muted">- {o.phone_primary || o.email || ''}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-paw me-2"></i>Informations</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nom *</label>
                                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Espèce *</label>
                                <select className="form-select" name="species_id" value={form.species_id} onChange={handleChange} required>
                                    <option value="">-- Sélectionner --</option>
                                    {speciesList.map(s => <option key={s.id} value={s.id}>{s.name_fr || s.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Race</label>
                                <select className="form-select" name="breed_id" value={form.breed_id} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    {breedList.map(b => <option key={b.id} value={b.id}>{b.name_fr || b.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Sexe</label>
                                <select className="form-select" name="sex" value={form.sex} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    <option value="M">Mâle</option>
                                    <option value="F">Femelle</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date de naissance</label>
                                <input type="date" className="form-control" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Poids (kg)</label>
                                <input type="number" className="form-control" name="weight_kg" value={form.weight_kg} onChange={handleChange} step="0.1" min="0" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Couleur / Marques</label>
                                <input type="text" className="form-control" name="color_markings" value={form.color_markings} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">N° puce électronique</label>
                                <input type="text" className="form-control" name="microchip_number" value={form.microchip_number} onChange={handleChange} />
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
                    <Link to="/clinic/animals" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default AnimalForm;
