import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const PartyList = () => {
    const token = getToken();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [partyType, setPartyType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchParties();
    }, [search, partyType, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchParties = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/parties?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        if (partyType) endpoint += `&party_type=${partyType}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setParties(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const typeBadge = (type) => {
        const colors = { individual: 'info', company: 'primary', organization: 'warning', government: 'secondary' };
        const labels = { individual: 'Individu', company: 'Entreprise', organization: 'Organisation', government: 'Gouvernement' };
        return <span className={`badge bg-${colors[type] || 'secondary'}`}>{labels[type] || type}</span>;
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Clinique</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Clients</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-users" />Clients & Parties <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/clinic/parties/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Rechercher par nom, email, téléphone..."
                            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={partyType} onChange={e => { setPartyType(e.target.value); setCurrentPage(1); }}>
                            <option value="">Tous les types</option>
                            <option value="individual">Individu</option>
                            <option value="company">Entreprise</option>
                            <option value="organization">Organisation</option>
                            <option value="government">Gouvernement</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : parties.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-users empty-icon" />
                            <p>Aucun client trouvé</p>
                            <Link to="/clinic/parties/new" className="btn btn-rv-primary btn-sm">
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
                                        <th>Téléphone</th>
                                        <th>Email</th>
                                        <th>Ville</th>
                                        <th>Animaux</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parties.map(p => (
                                        <tr key={p.id}>
                                            <td><code>{p.party_code}</code></td>
                                            <td><strong>{p.display_name}</strong></td>
                                            <td>{typeBadge(p.party_type)}</td>
                                            <td>{p.phone_primary || '-'}</td>
                                            <td>{p.email || '-'}</td>
                                            <td>{p.city || '-'}</td>
                                            <td><span className="badge bg-light text-dark">{p.animal_count || 0}</span></td>
                                            <td>
                                                <Link to={`/clinic/parties/${p.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/clinic/parties/${p.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
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
                            itemName="clients" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyList;
