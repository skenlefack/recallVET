import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const emptyLine = () => ({ product_name: '', dosage: '', frequency: '', duration_days: '', quantity: '', route: 'oral', instructions: '' });

const PrescriptionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        animal_id: '', prescription_date: new Date().toISOString().substring(0, 10), valid_until: '',
        lines: [emptyLine()]
    });
    const [animalSearch, setAnimalSearch] = useState('');
    const [animalResults, setAnimalResults] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadPrescription();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadPrescription = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/prescriptions/${id}`, token);
        if (res.success && res.data) {
            const d = res.data;
            setForm({
                animal_id: d.animal_id || '',
                prescription_date: d.prescription_date ? d.prescription_date.substring(0, 10) : '',
                valid_until: d.valid_until ? d.valid_until.substring(0, 10) : '',
                lines: d.lines && d.lines.length > 0 ? d.lines : [emptyLine()]
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
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (index, field, value) => {
        setForm(prev => {
            const lines = [...prev.lines];
            lines[index] = { ...lines[index], [field]: value };
            return { ...prev, lines };
        });
    };

    const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, emptyLine()] }));

    const removeLine = (index) => {
        if (form.lines.length <= 1) return;
        setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/clinic/prescriptions/${id}`, form, token)
            : await api.post('/v1/clinic/prescriptions', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Ordonnance mise à jour' : 'Ordonnance créée' });
            setTimeout(() => navigate('/clinic/prescriptions'), 1000);
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
                <Link to="/clinic/prescriptions">Ordonnances</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-prescription me-2" />{isEdit ? 'Modifier l\'ordonnance' : 'Nouvelle ordonnance'}</h4>
                <Link to="/clinic/prescriptions" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-paw me-2"></i>Patient & Dates</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6 position-relative">
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
                            <div className="col-md-3">
                                <label className="form-label">Date de prescription *</label>
                                <input type="date" className="form-control" name="prescription_date" value={form.prescription_date} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Valide jusqu'au</label>
                                <input type="date" className="form-control" name="valid_until" value={form.valid_until} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><i className="fas fa-pills me-2"></i>Lignes de prescription</h6>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>
                            <i className="fas fa-plus me-1"></i>Ajouter une ligne
                        </button>
                    </div>
                    <div className="card-body">
                        {form.lines.map((line, idx) => (
                            <div key={idx} className="border rounded p-3 mb-3 position-relative">
                                <div className="d-flex justify-content-between mb-2">
                                    <strong>Ligne {idx + 1}</strong>
                                    {form.lines.length > 1 && (
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeLine(idx)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="row g-2">
                                    <div className="col-md-4">
                                        <input type="text" className="form-control" placeholder="Produit *" value={line.product_name}
                                            onChange={e => handleLineChange(idx, 'product_name', e.target.value)} required />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="text" className="form-control" placeholder="Dosage" value={line.dosage}
                                            onChange={e => handleLineChange(idx, 'dosage', e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="text" className="form-control" placeholder="Fréquence" value={line.frequency}
                                            onChange={e => handleLineChange(idx, 'frequency', e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="number" className="form-control" placeholder="Durée (j)" value={line.duration_days}
                                            onChange={e => handleLineChange(idx, 'duration_days', e.target.value)} />
                                    </div>
                                    <div className="col-md-2">
                                        <input type="number" className="form-control" placeholder="Quantité" value={line.quantity}
                                            onChange={e => handleLineChange(idx, 'quantity', e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <select className="form-select" value={line.route} onChange={e => handleLineChange(idx, 'route', e.target.value)}>
                                            <option value="oral">Oral</option>
                                            <option value="injectable">Injectable</option>
                                            <option value="topical">Topique</option>
                                            <option value="ophthalmic">Ophtalmique</option>
                                            <option value="otic">Auriculaire</option>
                                        </select>
                                    </div>
                                    <div className="col-md-9">
                                        <input type="text" className="form-control" placeholder="Instructions" value={line.instructions}
                                            onChange={e => handleLineChange(idx, 'instructions', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/clinic/prescriptions" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default PrescriptionForm;
