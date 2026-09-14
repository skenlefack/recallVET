import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const FarmList = () => {
    const token = getToken();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchFarms();
    }, [search, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchFarms = async () => {
        setLoading(true);
        let endpoint = `/v1/farm/farms?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setFarms(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Élevage</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Exploitations</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-tractor" />Exploitations <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/farm/farms/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle exploitation
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Rechercher par nom, code, propriétaire..."
                            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : farms.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-tractor empty-icon" />
                            <p>Aucune exploitation trouvée</p>
                            <Link to="/farm/farms/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom</th>
                                        <th>Type</th>
                                        <th>Propriétaire</th>
                                        <th>Région</th>
                                        <th>Troupeaux</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {farms.map(f => (
                                        <tr key={f.id}>
                                            <td><code>{f.farm_code}</code></td>
                                            <td><strong>{f.name}</strong></td>
                                            <td>{f.farm_type || '-'}</td>
                                            <td>{f.owner_name || '-'}</td>
                                            <td>{f.region || '-'}</td>
                                            <td><span className="badge bg-light text-dark">{f.herd_count || 0}</span></td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <Link to={`/farm/farms/${f.id}`} className="btn btn-sm btn-outline-info" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/farm/farms/${f.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="exploitations" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmList;
