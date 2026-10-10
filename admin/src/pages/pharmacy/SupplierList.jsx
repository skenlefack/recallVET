import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const SupplierList = () => {
    const token = getToken();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, [search, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSuppliers = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/suppliers?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setSuppliers(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Pharmacie</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Fournisseurs</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-truck" />Fournisseurs <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/pharmacy/suppliers/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau fournisseur
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Rechercher par nom, contact..."
                            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : suppliers.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-truck empty-icon" />
                            <p>Aucun fournisseur trouvé</p>
                            <Link to="/pharmacy/suppliers/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nom</th>
                                        <th>Contact</th>
                                        <th>Téléphone</th>
                                        <th>Email</th>
                                        <th>Ville</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map(s => (
                                        <tr key={s.id}>
                                            <td><strong>{s.name}</strong></td>
                                            <td>{s.contact_person || '-'}</td>
                                            <td>{s.phone || '-'}</td>
                                            <td>{s.email || '-'}</td>
                                            <td>{s.city || '-'}</td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(s.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/pharmacy/suppliers/${s.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="fournisseurs" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="supplier"
                entityId={detailId}
                editUrl={detailId ? `/pharmacy/suppliers/${detailId}` : null}
            />
        </div>
    );
};

export default SupplierList;
