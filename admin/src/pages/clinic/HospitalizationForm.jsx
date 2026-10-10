import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const HospitalizationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        animal_id: '', encounter_id: '', cage_number: '',
        admission_date: new Date().toISOString().substring(0, 10),
        reason: '', diet_instructions: '', medications: '',
        daily_notes: [], status: 'admitted'
    });
    const [animalSearch, setAnimalSearch] = useState('');
    const [animalResults, setAnimalResults] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const statusLabels = { admitted: 'Admis', discharged: 'Sorti', transferred: 'Transféré', deceased: 'Décédé' };

    useEffect(() => {
        if (isEdit) loadItem();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadItem = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/hospitalizations/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            let notes = [];
            try { notes = d.daily_notes ? (typeof d.daily_notes === 'string' ? JSON.parse(d.daily_notes) : d.daily_notes) : []; } catch (_) {}
            setForm({
                animal_id: d.animal_id || '', encounter_id: d.encounter_id || '',
                cage_number: d.cage_number || '',
                admission_date: d.admission_date ? d.admission_date.substring(0, 10) : '',
                reason: d.reason || '', diet_instructions: d.diet_instructions || '',
                medications: d.medications || '', daily_notes: notes,
                status: d.status || 'admitted'
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
        setForm(prev => ({ ...prev, animal_id: animal.id }));
        setShowAnimalDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const addDailyNote = () => {
        if (!newNote.trim()) return;
        const note = { date: new Date().toISOString(), text: newNote.trim() };
        setForm(prev => ({ ...prev, daily_notes: [...prev.daily_notes, note] }));
        setNewNote('');
    };

    const handleDischarge = async () => {
        if (!window.confirm('Confirmer la sortie du patient ?')) return;
        setSaving(true);
        const res = await api.post(`/v1/clinic/hospitalizations/${id}/discharge`, {}, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Patient sorti avec succès' });
            setTimeout(() => navigate('/clinic/hospitalizations'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSaving(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form };
        const res = isEdit
            ? await api.put(`/v1/clinic/hospitalizations/${id}`, payload, token)
            : await api.post('/v1/clinic/hospitalizations', payload, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Hospitalisation mise à jour' : 'Hospitalisation créée' });
            setTimeout(() => navigate('/clinic/hospitalizations'), 1000);
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
                <Link to="/clinic/hospitalizations">Hospitalisations</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-procedures me-2" />{isEdit ? 'Modifier l\'hospitalisation' : 'Nouvelle hospitalisation'}</h4>
                <Link to="/clinic/hospitalizations" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Patient */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-paw me-2"></i>Patient</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6 position-relative">
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
                            <div className="col-md-3">
                                <label className="form-label">Date d'admission *</label>
                                <input type="date" className="form-control" name="admission_date" value={form.admission_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Numéro de cage</label>
                                <input type="text" className="form-control" name="cage_number" value={form.cage_number} onChange={handleChange} placeholder="Ex: C-12" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Détails */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-clipboard me-2"></i>Détails</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Motif d'hospitalisation *</label>
                                <textarea className="form-control" name="reason" value={form.reason} onChange={handleChange} rows="3" required></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Instructions diététiques</label>
                                <textarea className="form-control" name="diet_instructions" value={form.diet_instructions} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Médicaments</label>
                                <textarea className="form-control" name="medications" value={form.medications} onChange={handleChange} rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes journalières */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-list-alt me-2"></i>Notes journalières</h6></div>
                    <div className="card-body">
                        {form.daily_notes && form.daily_notes.length > 0 && (
                            <div className="mb-3">
                                {form.daily_notes.map((note, idx) => (
                                    <div key={idx} className="border-start border-3 border-success ps-3 mb-2">
                                        <small className="text-muted">{note.date ? new Date(note.date).toLocaleString('fr-FR') : ''}</small>
                                        <p className="mb-0">{note.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="input-group">
                            <input type="text" className="form-control" value={newNote} onChange={e => setNewNote(e.target.value)}
                                placeholder="Ajouter une note..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDailyNote())} />
                            <button type="button" className="btn btn-outline-success" onClick={addDailyNote}>
                                <i className="fas fa-plus me-1"></i>Ajouter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    {isEdit && form.status === 'admitted' && (
                        <button type="button" className="btn btn-success" disabled={saving} onClick={handleDischarge}>
                            <i className="fas fa-sign-out-alt me-1"></i>Donner congé
                        </button>
                    )}
                    <Link to="/clinic/hospitalizations" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default HospitalizationForm;
