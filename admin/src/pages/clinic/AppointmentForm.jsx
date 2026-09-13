import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const AppointmentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        animal_id: '', party_id: '', vet_id: '', appointment_date: '', start_time: '', end_time: '',
        appointment_type: 'consultation', urgency: 'normal', reason: '', notes: ''
    });
    const [animalSearch, setAnimalSearch] = useState('');
    const [animalResults, setAnimalResults] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [vets, setVets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchVets();
        if (isEdit) loadAppointment();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchVets = async () => {
        const res = await api.get('/v1/clinic/staff?role=veterinarian', token);
        if (res.success) setVets(res.data || []);
    };

    const loadAppointment = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/appointments/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                animal_id: d.animal_id || '', party_id: d.party_id || '', vet_id: d.vet_id || '',
                appointment_date: d.appointment_date ? d.appointment_date.substring(0, 10) : '',
                start_time: d.start_time || '', end_time: d.end_time || '',
                appointment_type: d.appointment_type || 'consultation', urgency: d.urgency || 'normal',
                reason: d.reason || '', notes: d.notes || ''
            });
            if (d.animal_name) {
                setSelectedAnimal({ id: d.animal_id, name: d.animal_name, owner_name: d.owner_name });
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
        setForm(prev => ({ ...prev, animal_id: animal.id, party_id: animal.owner_id || '' }));
        setShowAnimalDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/clinic/appointments/${id}`, form, token)
            : await api.post('/v1/clinic/appointments', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'RDV mis à jour' : 'RDV créé avec succès' });
            setTimeout(() => navigate('/clinic/appointments'), 1000);
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
                <Link to="/clinic/appointments">Rendez-vous</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-calendar-plus me-2" />{isEdit ? 'Modifier le RDV' : 'Nouveau rendez-vous'}</h4>
                <Link to="/clinic/appointments" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
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
                            {selectedAnimal && <small className="text-success"><i className="fas fa-check me-1"></i>{selectedAnimal.name} - Propriétaire: {selectedAnimal.owner_name || 'N/A'}</small>}
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
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-clock me-2"></i>Planification</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Vétérinaire</label>
                                <select className="form-select" name="vet_id" value={form.vet_id} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    {vets.map(v => <option key={v.id} value={v.id}>{v.display_name || v.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date *</label>
                                <input type="date" className="form-control" name="appointment_date" value={form.appointment_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Heure début</label>
                                <input type="time" className="form-control" name="start_time" value={form.start_time} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Heure fin</label>
                                <input type="time" className="form-control" name="end_time" value={form.end_time} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Type de RDV</label>
                                <select className="form-select" name="appointment_type" value={form.appointment_type} onChange={handleChange}>
                                    <option value="consultation">Consultation</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="surgery">Chirurgie</option>
                                    <option value="follow_up">Suivi</option>
                                    <option value="emergency">Urgence</option>
                                    <option value="grooming">Toilettage</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Urgence</label>
                                <select className="form-select" name="urgency" value={form.urgency} onChange={handleChange}>
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="emergency">Urgence vitale</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Motif</label>
                                <textarea className="form-control" name="reason" value={form.reason} onChange={handleChange} rows="2"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Notes</label>
                                <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/clinic/appointments" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
