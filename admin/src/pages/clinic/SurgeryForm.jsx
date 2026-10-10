import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const SurgeryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        animal_id: '', encounter_id: '', procedure_name: '', anesthesia_type: '',
        pre_op_notes: '', post_op_notes: '', complications: '',
        surgeon_id: '', assistant_id: '',
        scheduled_date: '', start_time: '', end_time: '',
        status: 'planned'
    });
    const [animalSearch, setAnimalSearch] = useState('');
    const [animalResults, setAnimalResults] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const statusLabels = { planned: 'Planifiée', in_progress: 'En cours', completed: 'Terminée', cancelled: 'Annulée' };

    useEffect(() => {
        loadTeam();
        if (isEdit) loadItem();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadTeam = async () => {
        const res = await api.get('/v1/settings/team', token);
        if (res.success) setTeamMembers(res.data || []);
    };

    const loadItem = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/surgeries/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                animal_id: d.animal_id || '', encounter_id: d.encounter_id || '',
                procedure_name: d.procedure_name || '', anesthesia_type: d.anesthesia_type || '',
                pre_op_notes: d.pre_op_notes || '', post_op_notes: d.post_op_notes || '',
                complications: d.complications || '',
                surgeon_id: d.surgeon_id || '', assistant_id: d.assistant_id || '',
                scheduled_date: d.scheduled_date ? d.scheduled_date.substring(0, 16) : '',
                start_time: d.start_time ? d.start_time.substring(0, 16) : '',
                end_time: d.end_time ? d.end_time.substring(0, 16) : '',
                status: d.status || 'planned'
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

    const handleComplete = async () => {
        if (!window.confirm('Confirmer la fin de la chirurgie ?')) return;
        setSaving(true);
        const res = await api.post(`/v1/clinic/surgeries/${id}/complete`, {}, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Chirurgie terminée' });
            setTimeout(() => navigate('/clinic/surgeries'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSaving(false);
    };

    const handleCancel = async () => {
        if (!window.confirm('Confirmer l\'annulation de la chirurgie ?')) return;
        setSaving(true);
        const res = await api.post(`/v1/clinic/surgeries/${id}/cancel`, {}, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Chirurgie annulée' });
            setTimeout(() => navigate('/clinic/surgeries'), 1000);
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
            ? await api.put(`/v1/clinic/surgeries/${id}`, payload, token)
            : await api.post('/v1/clinic/surgeries', payload, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Chirurgie mise à jour' : 'Chirurgie créée' });
            setTimeout(() => navigate('/clinic/surgeries'), 1000);
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
                <Link to="/clinic/surgeries">Chirurgies</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-cut me-2" />{isEdit ? 'Modifier la chirurgie' : 'Nouvelle chirurgie'}</h4>
                <Link to="/clinic/surgeries" className="btn btn-outline-secondary btn-sm">
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
                            <div className="col-md-6">
                                <label className="form-label">Nom de la procédure *</label>
                                <input type="text" className="form-control" name="procedure_name" value={form.procedure_name} onChange={handleChange} required placeholder="Ex: Ovariectomie" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Equipe et planification */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-user-md me-2"></i>Equipe et planification</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Chirurgien</label>
                                <select className="form-select" name="surgeon_id" value={form.surgeon_id} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Assistant</label>
                                <select className="form-select" name="assistant_id" value={form.assistant_id} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Type d'anesthésie</label>
                                <input type="text" className="form-control" name="anesthesia_type" value={form.anesthesia_type} onChange={handleChange} placeholder="Ex: Générale" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Date prévue</label>
                                <input type="datetime-local" className="form-control" name="scheduled_date" value={form.scheduled_date} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Heure de début</label>
                                <input type="datetime-local" className="form-control" name="start_time" value={form.start_time} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Heure de fin</label>
                                <input type="datetime-local" className="form-control" name="end_time" value={form.end_time} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Statut</label>
                                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-clipboard me-2"></i>Notes opératoires</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Notes pré-opératoires</label>
                                <textarea className="form-control" name="pre_op_notes" value={form.pre_op_notes} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Notes post-opératoires</label>
                                <textarea className="form-control" name="post_op_notes" value={form.post_op_notes} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Complications</label>
                                <textarea className="form-control" name="complications" value={form.complications} onChange={handleChange} rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    {isEdit && (form.status === 'planned' || form.status === 'in_progress') && (
                        <button type="button" className="btn btn-success" disabled={saving} onClick={handleComplete}>
                            <i className="fas fa-check me-1"></i>Terminer
                        </button>
                    )}
                    {isEdit && (form.status === 'planned' || form.status === 'in_progress') && (
                        <button type="button" className="btn btn-danger" disabled={saving} onClick={handleCancel}>
                            <i className="fas fa-times me-1"></i>Annuler chirurgie
                        </button>
                    )}
                    <Link to="/clinic/surgeries" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default SurgeryForm;
