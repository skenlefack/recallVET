import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';
import DetailOffcanvas from '../../components/DetailOffcanvas';

const HerdList = () => {
    const token = getToken();
    const [herds, setHerds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [farmId, setFarmId] = useState('');
    const [farms, setFarms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [detailId, setDetailId] = useState(null);

    useEffect(() => {
        fetchFarms();
    }, []);

    useEffect(() => {
        fetchHerds();
    }, [search, farmId, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchFarms = async () => {
        const res = await api.get('/v1/farm/farms?limit=200', token);
        if (res.success) setFarms(res.data || []);
    };

    const fetchHerds = async () => {
        setLoading(true);
        let endpoint = `/v1/farm/herds?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        if (farmId) endpoint += `&farm_id=${farmId}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setHerds(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Elevage</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Troupeaux</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-horse" />Troupeaux <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/farm/herds/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Rechercher par nom de ferme..."
                            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={farmId} onChange={e => { setFarmId(e.target.value); setCurrentPage(1); }}>
                            <option value="">Toutes les fermes</option>
                            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : herds.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-horse empty-icon" />
                            <p>Aucun troupeau trouve</p>
                            <Link to="/farm/herds/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Creer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nom</th>
                                        <th>Ferme</th>
                                        <th>Espece</th>
                                        <th>Race</th>
                                        <th>Effectif</th>
                                        <th>Objectif</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {herds.map(h => (
                                        <tr key={h.id}>
                                            <td><strong>{h.name}</strong></td>
                                            <td>{h.farm_name || '-'}</td>
                                            <td>{h.species_name || h.species || '-'}</td>
                                            <td>{h.breed_name || h.breed || '-'}</td>
                                            <td><span className="badge bg-light text-dark">{h.head_count || 0}</span></td>
                                            <td>{h.purpose || '-'}</td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <button className="btn btn-sm btn-outline-info" title="Voir" onClick={() => setDetailId(h.id)}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <Link to={`/farm/herds/${h.id}`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="troupeaux" />
                    </div>
                )}
            </div>
            <DetailOffcanvas
                show={!!detailId}
                onClose={() => setDetailId(null)}
                entityType="herd"
                entityId={detailId}
                editUrl={detailId ? `/farm/herds/${detailId}` : null}
            />
        </div>
    );
};

export default HerdList;
