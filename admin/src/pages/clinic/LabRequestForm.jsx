import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const testTypes = [
    { value: 'Hématologie', label: 'Hématologie' },
    { value: 'Biochimie', label: 'Biochimie' },
    { value: 'Parasitologie', label: 'Parasitologie' },
    { value: 'Microbiologie', label: 'Microbiologie' },
    { value: 'Imagerie', label: 'Imagerie' },
    { value: 'Autre', label: 'Autre' }
];

const LabRequestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        animal_id: '', test_type: 'Hématologie', test_name: '', priority: 'routine', notes: '', status: 'requested'
    });
    const [animalSearch, setAnimalSearch] = useState('');
    const [animalResults, setAnimalResults] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadRequest();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadRequest = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/lab/requests/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                animal_id: d.animal_id || '', test_type: d.test_type || 'Hématologie',
                test_name: d.test_name || '', priority: d.priority || 'routine',
                notes: d.notes || '', status: d.status || 'requested'
            });
            if (d.animal_name) {
                setSelectedAnimal({ id: d.animal_id, name: d.animal_name });
                setAnimalSearch(d.animal_name);
            }
            if (d.results) setResults(d.results);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = isEdit ? { test_type: form.test_type, test_name: form.test_name, priority: form.priority, notes: form.notes, status: form.status } : form;
        const res = isEdit
            ? await api.put(`/v1/clinic/lab/requests/${id}`, payload, token)
            : await api.post('/v1/clinic/lab/requests', payload, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Demande mise à jour' : 'Demande créée' });
            setTimeout(() => navigate('/clinic/lab'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur lors de la sauvegarde' });
        }
        setSaving(false);
    };

    // --- Results management ---
    const [newResult, setNewResult] = useState({ parameter_name: '', result_value: '', unit: '', reference_range: '', is_abnormal: false });
    const [savingResult, setSavingResult] = useState(false);

    const handleResultChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewResult(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const addResult = async () => {
        if (!newResult.parameter_name) return;
        setSavingResult(true);
        const res = await api.post(`/v1/clinic/lab/requests/${id}/results`, { results: [newResult] }, token);
        if (res.success) {
            setNewResult({ parameter_name: '', result_value: '', unit: '', reference_range: '', is_abnormal: false });
            // Reload results
            const rr = await api.get(`/v1/clinic/lab/requests/${id}/results`, token);
            if (rr.success) setResults(rr.data || []);
            setToast({ type: 'success', message: 'Résultat ajouté' });
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSavingResult(false);
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
                <Link to="/clinic/lab">Laboratoire</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle demande'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-flask me-2" />{isEdit ? 'Modifier la demande' : 'Nouvelle demande de labo'}</h4>
                <Link to="/clinic/lab" className="btn btn-outline-secondary btn-sm">
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
                                placeholder="Tapez le nom de l'animal..." required={!form.animal_id}
                                disabled={isEdit} />
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
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-vial me-2"></i>Analyse</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Type d'analyse *</label>
                                <select className="form-select" name="test_type" value={form.test_type} onChange={handleChange} required>
                                    {testTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Nom du test *</label>
                                <input type="text" className="form-control" name="test_name" value={form.test_name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Priorité</label>
                                <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                                    <option value="routine">Routine</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            {isEdit && (
                                <div className="col-md-4">
                                    <label className="form-label">Statut</label>
                                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                        <option value="requested">Demandé</option>
                                        <option value="in_progress">En cours</option>
                                        <option value="completed">Terminé</option>
                                        <option value="cancelled">Annulé</option>
                                    </select>
                                </div>
                            )}
                            <div className="col-12">
                                <label className="form-label">Notes</label>
                                <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2 mb-3">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/clinic/lab" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>

            {isEdit && (
                <div className="card form-card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><i className="fas fa-poll me-2"></i>Résultats</h6>
                    </div>
                    <div className="card-body">
                        {results.length > 0 && (
                            <div className="table-responsive mb-3">
                                <table className="table table-sm table-bordered mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Paramètre</th>
                                            <th>Valeur</th>
                                            <th>Unité</th>
                                            <th>Réf.</th>
                                            <th>Anormal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map(r => (
                                            <tr key={r.id} className={r.is_abnormal ? 'table-danger' : ''}>
                                                <td>{r.parameter_name}</td>
                                                <td><strong>{r.result_value || '-'}</strong></td>
                                                <td>{r.unit || '-'}</td>
                                                <td>{r.reference_range || '-'}</td>
                                                <td>{r.is_abnormal ? <i className="fas fa-exclamation-triangle text-danger"></i> : <i className="fas fa-check text-success"></i>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <h6 className="mt-3 mb-2">Ajouter un résultat</h6>
                        <div className="row g-2 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label">Paramètre *</label>
                                <input type="text" className="form-control form-control-sm" name="parameter_name" value={newResult.parameter_name} onChange={handleResultChange} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Valeur</label>
                                <input type="text" className="form-control form-control-sm" name="result_value" value={newResult.result_value} onChange={handleResultChange} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Unité</label>
                                <input type="text" className="form-control form-control-sm" name="unit" value={newResult.unit} onChange={handleResultChange} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Réf.</label>
                                <input type="text" className="form-control form-control-sm" name="reference_range" value={newResult.reference_range} onChange={handleResultChange} />
                            </div>
                            <div className="col-md-1">
                                <div className="form-check mt-4">
                                    <input className="form-check-input" type="checkbox" name="is_abnormal" checked={newResult.is_abnormal} onChange={handleResultChange} id="isAbnormal" />
                                    <label className="form-check-label" htmlFor="isAbnormal">Anormal</label>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <button type="button" className="btn btn-sm btn-rv-primary w-100" onClick={addResult} disabled={savingResult || !newResult.parameter_name}>
                                    {savingResult ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-plus me-1"></i>Ajouter</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabRequestForm;
