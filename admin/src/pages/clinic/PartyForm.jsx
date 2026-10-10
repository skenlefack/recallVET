import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const PartyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [form, setForm] = useState({
        party_type: 'individual', display_name: '', first_name: '', last_name: '', legal_name: '',
        phone_primary: '', phone_secondary: '', whatsapp: '', email: '',
        country_code: 'CM', region: '', city: '',
        customer_segment: '', preferred_currency: 'XAF', credit_limit: 0,
        data_processing_consent: false
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadParty();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadParty = async () => {
        setLoading(true);
        const res = await api.get(`/v1/clinic/parties/${id}`, token);
        if (res.success && res.data) setForm(prev => ({ ...prev, ...res.data }));
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = isEdit
            ? await api.put(`/v1/clinic/parties/${id}`, form, token)
            : await api.post('/v1/clinic/parties', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Client mis à jour' : 'Client créé avec succès' });
            setTimeout(() => navigate('/clinic/parties'), 1000);
        } else {
            setToast({ type: 'danger', message: res.message || 'Erreur lors de la sauvegarde' });
        }
        setSaving(false);
    };

    const isIndividual = form.party_type === 'individual';

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
                <Link to="/clinic/parties">Clients</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-user-plus me-2" />{isEdit ? 'Modifier le client' : 'Nouveau client'}</h4>
                <Link to="/clinic/parties" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Identité */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-id-card me-2"></i>Identité</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Type de client *</label>
                                <select className="form-select" name="party_type" value={form.party_type} onChange={handleChange} required>
                                    <option value="individual">Individu</option>
                                    <option value="company">Entreprise</option>
                                    <option value="organization">Organisation</option>
                                    <option value="government">Gouvernement</option>
                                </select>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label">Nom d'affichage *</label>
                                <input type="text" className="form-control" name="display_name" value={form.display_name} onChange={handleChange} required />
                            </div>
                            {isIndividual ? (
                                <>
                                    <div className="col-md-6">
                                        <label className="form-label">Prénom</label>
                                        <input type="text" className="form-control" name="first_name" value={form.first_name} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nom de famille</label>
                                        <input type="text" className="form-control" name="last_name" value={form.last_name} onChange={handleChange} />
                                    </div>
                                </>
                            ) : (
                                <div className="col-md-12">
                                    <label className="form-label">Raison sociale</label>
                                    <input type="text" className="form-control" name="legal_name" value={form.legal_name} onChange={handleChange} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-phone me-2"></i>Contact</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Téléphone principal</label>
                                <input type="text" className="form-control" name="phone_primary" value={form.phone_primary} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Téléphone secondaire</label>
                                <input type="text" className="form-control" name="phone_secondary" value={form.phone_secondary} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">WhatsApp</label>
                                <input type="text" className="form-control" name="whatsapp" value={form.whatsapp} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Adresse */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-map-marker-alt me-2"></i>Adresse</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Pays</label>
                                <input type="text" className="form-control" name="country_code" value={form.country_code} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Région</label>
                                <input type="text" className="form-control" name="region" value={form.region} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Ville</label>
                                <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commercial */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-briefcase me-2"></i>Commercial</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Segment client</label>
                                <select className="form-select" name="customer_segment" value={form.customer_segment} onChange={handleChange}>
                                    <option value="">-- Sélectionner --</option>
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                    <option value="vip">VIP</option>
                                    <option value="wholesale">Grossiste</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Devise préférée</label>
                                <select className="form-select" name="preferred_currency" value={form.preferred_currency} onChange={handleChange}>
                                    <option value="XAF">XAF (FCFA)</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Limite de crédit</label>
                                <input type="number" className="form-control" name="credit_limit" value={form.credit_limit} onChange={handleChange} min="0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Consentement */}
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-shield-alt me-2"></i>Consentement au traitement des données personnelles</h6></div>
                    <div className="card-body">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="data_processing_consent"
                                name="data_processing_consent" checked={!!form.data_processing_consent} onChange={handleChange} />
                            <label className="form-check-label" htmlFor="data_processing_consent">
                                Le client consent au traitement de ses données personnelles conformément à notre politique de confidentialité
                            </label>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/clinic/parties" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default PartyForm;
