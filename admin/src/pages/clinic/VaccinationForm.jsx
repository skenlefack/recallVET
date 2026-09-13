import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const VaccinationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        animal_id: '', product_name: '', manufacturer: '', lot_number: '',
        vaccination_date: new Date().toISOString().substring(0, 10), dose: '',
        route: 'subcutaneous', next_due_date: '', adverse_event: false, adverse_event_notes: ''
    });
    const [animalSearch, setAnimalSearch] = useState('');
    const [animalResults, setAnimalResults] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadVaccination();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadVaccination = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/vaccinations/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                animal_id: d.animal_id || '', product_name: d.product_name || '',
                manufacturer: d.manufacturer || '', lot_number: d.lot_number || '',
                vaccination_date: d.vaccination_date ? d.vaccination_date.substring(0, 10) : '',
                dose: d.dose || '', route: d.route || 'subcutaneous',
                next_due_date: d.next_due_date ? d.next_due_date.substring(0, 10) : '',
                adverse_event: d.adverse_event || false, adverse_event_notes: d.adverse_event_notes || ''
            });
            if (d.animal_name) {
                setSelectedAnimal({ id: d.animal_id, name: d.animal_name });
                setAnimalSearch(d.animal_name);
            }
        }
        setLoading(false);
    };

    const searchAnimals = (value) => {
        setAnimalSearch(value);
        setShowAnimalDropdown(true);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.length < 2) { setAnimalResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            const res = await api.get(`/v1/clinic/animals?search=${encodeURIComponent(value)}`, token);
            if (res.success) setAnimalResults(res.data || []);
        }, 300);
    };

    const selectAnimal = (animal) => {
        setSelectedAnimal(animal);
        setAnimalSearch(animal.name);
        setForm(prev => ({ ...prev, animal_id: animal.id }));
        setShowAnimalDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/clinic/vaccinations/${id}`, form, token)
            : await api.post('/v1/clinic/vaccinations', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Vaccination mise à jour' : 'Vaccination enregistrée' });
            setTimeout(() => navigate('/clinic/vaccinations'), 1000);
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
                <Link to="/clinic/vaccinations">Vaccinations</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-syringe me-2" />{isEdit ? 'Modifier la vaccination' : 'Nouvelle vaccination'}</h4>
                <div className="d-flex gap-2">
                    {isEdit && (
                        <a href={`/api/v1/clinic/exports/vaccinations/${id}/certificate`}
                           className="btn btn-outline-secondary btn-sm" target="_blank" rel="noreferrer">
                            <i className="fas fa-file-pdf me-1" />Certificat
                        </a>
                    )}
                    <Link to="/clinic/vaccinations" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1" />Retour à la liste
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-paw me-2"></i>Patient</h6></div>
                    <div className="card-body">
                        <div className="position-relative">
                            <label className="form-label">Rechercher l'animal *</label>
                            <input type="text" className="form-control" value={animalSearch}
                                onChange={e => searchAnimals(e.target.value)}
                                onFocus={() => animalResults.length > 0 && setShowAnimalDropdown(true)}
                                placeholder="Tapez le nom de l'animal..." required={!form.animal_id} />
                            {selectedAnimal && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedAnimal.name}</small>}
                            {showAnimalDropdown && animalResults.length > 0 && (
                                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                                    {animalResults.map(a => (
                                        <li key={a.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }}
                                            onClick={() => selectAnimal(a)}>
                                            {a.name} <small className="text-muted">({a.species_name || ''}) - {a.owner_name || ''}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-syringe me-2"></i>Vaccin</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nom du vaccin *</label>
                                <input type="text" className="form-control" name="product_name" value={form.product_name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Fabricant</label>
                                <input type="text" className="form-control" name="manufacturer" value={form.manufacturer} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">N° de lot</label>
                                <input type="text" className="form-control" name="lot_number" value={form.lot_number} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Date de vaccination *</label>
                                <input type="date" className="form-control" name="vaccination_date" value={form.vaccination_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Dose</label>
                                <input type="text" className="form-control" name="dose" value={form.dose} onChange={handleChange} placeholder="ex: 1ml" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Voie d'administration</label>
                                <select className="form-select" name="route" value={form.route} onChange={handleChange}>
                                    <option value="subcutaneous">Sous-cutanée</option>
                                    <option value="intramuscular">Intramusculaire</option>
                                    <option value="intranasal">Intranasale</option>
                                    <option value="oral">Orale</option>
                                    <option value="intravenous">Intraveineuse</option>
                                    <option value="topical">Topique</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Prochain rappel</label>
                                <input type="date" className="form-control" name="next_due_date" value={form.next_due_date} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>Effet indésirable</h6></div>
                    <div className="card-body">
                        <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" name="adverse_event" checked={form.adverse_event} onChange={handleChange} id="adverseEvent" />
                            <label className="form-check-label" htmlFor="adverseEvent">Effet indésirable observé</label>
                        </div>
                        {form.adverse_event && (
                            <div>
                                <label className="form-label">Description de l'effet indésirable</label>
                                <textarea className="form-control" name="adverse_event_notes" value={form.adverse_event_notes} onChange={handleChange} rows="3"></textarea>
                            </div>
                        )}
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/clinic/vaccinations" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default VaccinationForm;
