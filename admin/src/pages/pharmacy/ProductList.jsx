import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const ProductList = () => {
    const token = getToken();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    const categories = [
        { value: 'medication', label: 'Médicament' },
        { value: 'vaccine', label: 'Vaccin' },
        { value: 'supplement', label: 'Complément' },
        { value: 'consumable', label: 'Consommable' },
        { value: 'equipment', label: 'Équipement' },
        { value: 'feed', label: 'Aliment' }
    ];

    useEffect(() => {
        fetchProducts();
    }, [search, category, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchProducts = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/products?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        if (category) endpoint += `&category=${category}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setProducts(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price || 0);

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Pharmacie</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Produits</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-pills" />Produits <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/pharmacy/products/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau produit
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Rechercher par nom, SKU..."
                            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setCurrentPage(1); }}>
                            <option value="">Toutes les catégories</option>
                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-pills empty-icon" />
                            <p>Aucun produit trouvé</p>
                            <Link to="/pharmacy/products/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>SKU</th>
                                        <th>Nom</th>
                                        <th>Catégorie</th>
                                        <th>Unité</th>
                                        <th>Prix</th>
                                        <th>Stock</th>
                                        <th>Ordonnance?</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td><code>{p.sku}</code></td>
                                            <td><strong>{p.name}</strong>{p.generic_name && <><br /><small className="text-muted">{p.generic_name}</small></>}</td>
                                            <td>{categories.find(c => c.value === p.category)?.label || p.category || '-'}</td>
                                            <td>{p.unit || '-'}</td>
                                            <td>{formatPrice(p.unit_price)} XAF</td>
                                            <td>
                                                <span className={`badge ${(p.stock_qty || 0) <= (p.reorder_level || 0) ? 'bg-danger' : 'bg-success'}`}>
                                                    {p.stock_qty || 0}
                                                </span>
                                            </td>
                                            <td>
                                                {p.is_prescription_only ? <span className="badge bg-warning">Oui</span> : <span className="badge bg-light text-dark">Non</span>}
                                            </td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(p.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/pharmacy/products/${p.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
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
                            itemName="produits" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="product"
                entityId={detailId}
                editUrl={detailId ? `/pharmacy/products/${detailId}` : null}
            />
        </div>
    );
};

export default ProductList;
