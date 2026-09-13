import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const SupplierForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [form, setForm] = useState({
        name: '', contact_person: '', email: '', phone: '', address: '',
        city: '', country: 'Cameroun', tax_id: '', payment_terms_days: 30, notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadSupplier();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadSupplier = async () => {
        setLoading(true);
        const res = await api.get(`/v1/pharmacy/suppliers/${id}`, token);
        if (res.success && res.data) setForm(prev => ({ ...prev, ...res.data }));
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
            ? await api.put(`/v1/pharmacy/suppliers/${id}`, form, token)
            : await api.post('/v1/pharmacy/suppliers', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Fournisseur mis à jour' : 'Fournisseur créé' });
            setTimeout(() => navigate('/pharmacy/suppliers'), 1000);
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
                <Link to="/pharmacy/suppliers">Fournisseurs</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-truck me-2" />{isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h4>
                <Link to="/pharmacy/suppliers" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Informations</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nom *</label>
                                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Personne de contact</label>
                                <input type="text" className="form-control" name="contact_person" value={form.contact_person} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Téléphone</label>
                                <input type="text" className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">N° fiscal</label>
                                <input type="text" className="form-control" name="tax_id" value={form.tax_id} onChange={handleChange} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label">Adresse</label>
                                <input type="text" className="form-control" name="address" value={form.address} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Ville</label>
                                <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Pays</label>
                                <input type="text" className="form-control" name="country" value={form.country} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Délai de paiement (jours)</label>
                                <input type="number" className="form-control" name="payment_terms_days" value={form.payment_terms_days} onChange={handleChange} min="0" />
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
                    <Link to="/pharmacy/suppliers" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default SupplierForm;
