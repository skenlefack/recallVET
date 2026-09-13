import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = getToken();
    const isEdit = !!id;

    const [form, setForm] = useState({
        name: '', generic_name: '', category: '', sku: '', barcode: '',
        unit: 'unit', unit_price: 0, vat_rate: 19.25,
        is_prescription_only: false, is_vaccine: false,
        storage_conditions: '', reorder_level: 10
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isEdit) loadProduct();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadProduct = async () => {
        setLoading(true);
        const res = await api.get(`/v1/pharmacy/products/${id}`, token);
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
            ? await api.put(`/v1/pharmacy/products/${id}`, form, token)
            : await api.post('/v1/pharmacy/products', form, token);
        if (res.success) {
            setToast({ type: 'success', message: isEdit ? 'Produit mis à jour' : 'Produit créé' });
            setTimeout(() => navigate('/pharmacy/products'), 1000);
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
                <Link to="/pharmacy/products">Produits</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-pills me-2" />{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h4>
                <Link to="/pharmacy/products" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1" />Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Informations</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nom du produit *</label>
                                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Nom générique</label>
                                <input type="text" className="form-control" name="generic_name" value={form.generic_name} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Catégorie *</label>
                                <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
                                    <option value="">-- Sélectionner --</option>
                                    <option value="medication">Médicament</option>
                                    <option value="vaccine">Vaccin</option>
                                    <option value="supplement">Complément</option>
                                    <option value="consumable">Consommable</option>
                                    <option value="equipment">Équipement</option>
                                    <option value="feed">Aliment</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">SKU</label>
                                <input type="text" className="form-control" name="sku" value={form.sku} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Code-barres</label>
                                <input type="text" className="form-control" name="barcode" value={form.barcode} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-money-bill me-2"></i>Tarification</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Unité</label>
                                <select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
                                    <option value="unit">Unité</option>
                                    <option value="box">Boîte</option>
                                    <option value="bottle">Flacon</option>
                                    <option value="vial">Fiole</option>
                                    <option value="sachet">Sachet</option>
                                    <option value="kg">Kg</option>
                                    <option value="liter">Litre</option>
                                    <option value="ml">mL</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Prix unitaire (XAF)</label>
                                <input type="number" className="form-control" name="unit_price" value={form.unit_price} onChange={handleChange} min="0" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">TVA (%)</label>
                                <input type="number" className="form-control" name="vat_rate" value={form.vat_rate} onChange={handleChange} min="0" step="0.01" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Seuil de réapprovisionnement</label>
                                <input type="number" className="form-control" name="reorder_level" value={form.reorder_level} onChange={handleChange} min="0" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card form-card mb-3">
                    <div className="card-header"><h6 className="mb-0"><i className="fas fa-cog me-2"></i>Propriétés</h6></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" name="is_prescription_only" checked={form.is_prescription_only} onChange={handleChange} id="prescOnly" />
                                    <label className="form-check-label" htmlFor="prescOnly">Sur ordonnance uniquement</label>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" name="is_vaccine" checked={form.is_vaccine} onChange={handleChange} id="isVaccine" />
                                    <label className="form-check-label" htmlFor="isVaccine">Est un vaccin</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Conditions de conservation</label>
                                <input type="text" className="form-control" name="storage_conditions" value={form.storage_conditions} onChange={handleChange}
                                    placeholder="Ex: Conserver entre 2°C et 8°C" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-rv-primary" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement...</> : <><i className="fas fa-save me-1"></i>Enregistrer</>}
                    </button>
                    <Link to="/pharmacy/products" className="btn btn-outline-secondary">Annuler</Link>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
