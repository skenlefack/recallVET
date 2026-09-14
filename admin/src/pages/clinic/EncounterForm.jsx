import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const EncounterForm = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        animal_id: '', party_id: '', appointment_id: searchParams.get('appointment_id') || '',
        encounter_date: new Date().toISOString().substring(0, 10), encounter_type: 'consultation',
        temperature: '', heart_rate: '', respiratory_rate: '', weight_kg: '',
        clinical_findings: '', diagnosis: '', plan: '',
        prescription_needed: false, hospitalization_needed: false, surgery_needed: false,
        case_status: 'open', follow_up_date: '', follow_up_notes: '', status: 'draft'
    });
    const [animalSearch, setAnimalSearch] = useState('');
    const [animalResults, setAnimalResults] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadEncounter();
        if (searchParams.get('appointment_id')) loadAppointment(searchParams.get('appointment_id'));
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadAppointment = async (aptId) => {
        const res = await api.get(`/v1/clinic/appointments/${aptId}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm(prev => ({ ...prev, animal_id: d.animal_id, party_id: d.party_id }));
            if (d.animal_name) {
                setSelectedAnimal({ id: d.animal_id, name: d.animal_name, owner_name: d.owner_name });
                setAnimalSearch(d.animal_name);
            }
        }
    };

    const loadEncounter = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/encounters/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                animal_id: d.animal_id || '', party_id: d.party_id || '', appointment_id: d.appointment_id || '',
                encounter_date: d.encounter_date ? d.encounter_date.substring(0, 10) : '',
                encounter_type: d.encounter_type || 'consultation',
                temperature: d.temperature_c || d.temperature || '', heart_rate: d.heart_rate_bpm || d.heart_rate || '',
                respiratory_rate: d.resp_rate_bpm || d.respiratory_rate || '', weight_kg: d.weight_kg || '',
                clinical_findings: d.clinical_findings || '', diagnosis: d.diagnostic_hypotheses || d.diagnosis || '',
                plan: d.clinical_plan || d.plan || '',
                visit_reason: d.visit_reason || '',
                prescription_needed: d.prescription_needed || false,
                hospitalization_needed: d.hospitalization_needed || false,
                surgery_needed: d.surgery_needed || false,
                case_status: d.case_status || 'open',
                follow_up_date: d.follow_up_date ? d.follow_up_date.substring(0, 10) : '',
                follow_up_notes: d.follow_up_notes || '', status: d.status || 'draft'
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
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e, sign = false) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            temperature_c: form.temperature || null,
            heart_rate_bpm: form.heart_rate || null,
            resp_rate_bpm: form.respiratory_rate || null,
            diagnostic_hypotheses: form.diagnosis || null,
            clinical_plan: form.plan || null,
            visit_reason: form.visit_reason || form.reason || null,
            history_presenting_complaint: form.history || null,
            owner_instructions: form.follow_up_notes || null,
        };
        // Remove frontend-only field names
        delete payload.temperature;
        delete payload.heart_rate;
        delete payload.respiratory_rate;
        delete payload.diagnosis;
        delete payload.plan;
        delete payload.history;
        if (sign) payload.status = 'signed';
        const res = isEdit
            ? await api.put(`/v1/clinic/encounters/${id}`, payload, token)
            : await api.post('/v1/clinic/encounters', payload, token);
        if (res.success) {
            setToast({ type: 'success', message: sign ? 'Consultation signée' : (isEdit ? 'Consultation mise à jour' : 'Consultation créée') });
            setTimeout(() => navigate('/clinic/encounters'), 1000);
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
                <Link to="/clinic/encounters">Consultations</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-notes-medical me-2" />{isEdit ? 'Modifier la consultation' : 'Nouvelle consultation'}</h4>
                <Link to="/clinic/encounters" className="btn btn-outline-secondary btn-sm">
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
                                <label className="form-label">Date *</label>
                                <input type="date" className="form-control" name="encounter_date" value={form.encounter_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Type</label>
                                <select className="form-select" name="encounter_type" value={form.encounter_type} onChange={handleChange}>
                                    <option value="consultation">Consultation</option>
                                    <option value="emergency">Urgence</option>
                                    <option value="follow_up">Suivi</option>
                                    <option value="surgery">Chirurgie</option>
                                    <option value="vaccination">Vaccination</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signes vitaux */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-heartbeat me-2"></i>Signes vitaux</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Température (°C)</label>
                                <input type="number" className="form-control" name="temperature" value={form.temperature} onChange={handleChange} step="0.1" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Fréq. cardiaque (bpm)</label>
                                <input type="number" className="form-control" name="heart_rate" value={form.heart_rate} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Fréq. respiratoire</label>
                                <input type="number" className="form-control" name="respiratory_rate" value={form.respiratory_rate} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Poids (kg)</label>
                                <input type="number" className="form-control" name="weight_kg" value={form.weight_kg} onChange={handleChange} step="0.1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Examen clinique */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-stethoscope me-2"></i>Examen clinique</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Constatations cliniques</label>
                                <textarea className="form-control" name="clinical_findings" value={form.clinical_findings} onChange={handleChange} rows="4"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Diagnostic</label>
                                <textarea className="form-control" name="diagnosis" value={form.diagnosis} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Plan de traitement</label>
                                <textarea className="form-control" name="plan" value={form.plan} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" name="prescription_needed" checked={form.prescription_needed} onChange={handleChange} id="prescNeeded" />
                                    <label className="form-check-label" htmlFor="prescNeeded">Ordonnance nécessaire</label>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" name="hospitalization_needed" checked={form.hospitalization_needed} onChange={handleChange} id="hospNeeded" />
                                    <label className="form-check-label" htmlFor="hospNeeded">Hospitalisation nécessaire</label>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" name="surgery_needed" checked={form.surgery_needed} onChange={handleChange} id="surgNeeded" />
                                    <label className="form-check-label" htmlFor="surgNeeded">Chirurgie nécessaire</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suivi */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-redo me-2"></i>Suivi</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Statut du cas</label>
                                <select className="form-select" name="case_status" value={form.case_status} onChange={handleChange}>
                                    <option value="open">Ouvert</option>
                                    <option value="resolved">Résolu</option>
                                    <option value="chronic">Chronique</option>
                                    <option value="referred">Référé</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Date de suivi</label>
                                <input type="date" className="form-control" name="follow_up_date" value={form.follow_up_date} onChange={handleChange} />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Notes de suivi</label>
                                <textarea className="form-control" name="follow_up_notes" value={form.follow_up_notes} onChange={handleChange} rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <button type="button" className="btn btn-success" disabled={saving} onClick={(e) => handleSubmit(e, true)}>
                        <i className="fas fa-signature me-1"></i>Signer
                    </button>
                    <Link to="/clinic/encounters" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default EncounterForm;
