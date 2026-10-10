import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const ProtocolList = () => {
    const token = getToken();
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [species, setSpecies] = useState([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', species_id: '', vaccine_type_id: '', dose_number: 1, interval_days: 0, age_start_weeks: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchProtocols();
        fetchSpecies();
    }, [currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchProtocols = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/protocols?page=${currentPage}&limit=${itemsPerPage}`, token);
        if (res.success) {
            setProtocols(res.data || []);
            setTotalItems(res.pagination?.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const fetchSpecies = async () => {
        const res = await api.get('/v1/clinic/ref/species', token);
        if (res.success) setSpecies(res.data || []);
    };

    const openModal = (protocol = null) => {
        if (protocol) {
            setEditId(protocol.id);
            setForm({
                name: protocol.name || '', species_id: protocol.species_id || '',
                vaccine_type_id: protocol.vaccine_type_id || '', dose_number: protocol.dose_number || 1,
                interval_days: protocol.interval_days || 0, age_start_weeks: protocol.age_start_weeks || '',
                notes: protocol.notes || ''
            });
        } else {
            setEditId(null);
            setForm({ name: '', species_id: '', vaccine_type_id: '', dose_number: 1, interval_days: 0, age_start_weeks: '', notes: '' });
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form, species_id: form.species_id || null, vaccine_type_id: form.vaccine_type_id || null, age_start_weeks: form.age_start_weeks || null };
        const res = editId
            ? await api.put(`/v1/clinic/protocols/${editId}`, payload, token)
            : await api.post('/v1/clinic/protocols', payload, token);
        if (res.success) {
            setToast({ type: 'success', message: editId ? 'Protocole mis à jour' : 'Protocole créé' });
            setShowModal(false);
            fetchProtocols();
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce protocole ?')) return;
        const res = await api.delete(`/v1/clinic/protocols/${id}`, token);
        if (res.success) {
            setToast({ type: 'success', message: 'Protocole supprimé' });
            fetchProtocols();
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur' });
        }
    };

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
                <span>Clinique</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Protocoles vaccinaux</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-clipboard-list" />Protocoles vaccinaux <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <button className="btn btn-rv-primary" onClick={() => openModal()}>
                    <i className="fas fa-plus me-1"></i>Nouveau protocole
                </button>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : protocols.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-clipboard-list empty-icon" />
                            <p>Aucun protocole vaccinal trouvé</p>
                            <button className="btn btn-rv-primary btn-sm" onClick={() => openModal()}>
                                <i className="fas fa-plus me-1" />Créer le premier
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nom</th>
                                        <th>Espèce</th>
                                        <th>Vaccin</th>
                                        <th>Dose</th>
                                        <th>Intervalle (jours)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {protocols.map(p => (
                                        <tr key={p.id}>
                                            <td><strong>{p.name}</strong></td>
                                            <td>{p.species_name || '-'}</td>
                                            <td>{p.vaccine_type_id || '-'}</td>
                                            <td>{p.dose_number}</td>
                                            <td>{p.interval_days}</td>
                                            <td>
                                                <div className="btn-group-actions">
                                                    <button className="btn btn-sm btn-outline-primary" title="Modifier" onClick={() => openModal(p)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" title="Supprimer" onClick={() => handleDelete(p.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {totalItems > 0 && (
                    <div className="card-footer">
                        <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)}
                            totalItems={totalItems} itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage} onItemsPerPageChange={v => { setItemsPerPage(v); setCurrentPage(1); }}
                            itemName="protocoles" />
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{editId ? 'Modifier le protocole' : 'Nouveau protocole'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nom *</label>
                                        <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Espèce</label>
                                        <select className="form-select" name="species_id" value={form.species_id} onChange={handleChange}>
                                            <option value="">-- Toutes --</option>
                                            {species.map(s => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
                                        </select>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Dose N°</label>
                                            <input type="number" className="form-control" name="dose_number" value={form.dose_number} onChange={handleChange} min="1" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Intervalle (jours)</label>
                                            <input type="number" className="form-control" name="interval_days" value={form.interval_days} onChange={handleChange} min="0" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Age début (sem.)</label>
                                            <input type="number" className="form-control" name="age_start_weeks" value={form.age_start_weeks} onChange={handleChange} min="0" />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="form-label">Notes</label>
                                        <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="2"></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                                        {saving ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProtocolList;
