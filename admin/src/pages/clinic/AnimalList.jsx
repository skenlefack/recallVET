import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const AnimalList = () => {
    const token = getToken();
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [species, setSpecies] = useState('');
    const [speciesList, setSpeciesList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchSpecies();
    }, []);

    useEffect(() => {
        fetchAnimals();
    }, [search, species, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSpecies = async () => {
        const res = await api.get('/v1/clinic/ref/species', token);
        if (res.success) setSpeciesList(res.data || []);
    };

    const fetchAnimals = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/animals?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        if (species) endpoint += `&species=${species}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setAnimals(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Clinique</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Animaux</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-paw" />Animaux <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <div className="d-flex gap-2">
                    <a href={`${import.meta.env.VITE_API_URL || '/api'}/v1/exports/animals`}
                       className="btn btn-outline-secondary btn-sm" target="_blank" rel="noreferrer">
                        <i className="fas fa-download me-1" />Exporter
                    </a>
                    <Link to="/clinic/animals/new" className="btn btn-rv-primary">
                        <i className="fas fa-plus me-1"></i>Nouveau
                    </Link>
                </div>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Rechercher par nom, code, puce..."
                            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={species} onChange={e => { setSpecies(e.target.value); setCurrentPage(1); }}>
                            <option value="">Toutes les espèces</option>
                            {speciesList.map(s => <option key={s.id || s.code} value={s.code || s.id}>{s.name_fr || s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : animals.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-paw empty-icon" />
                            <p>Aucun animal trouvé</p>
                            <Link to="/clinic/animals/new" className="btn btn-rv-primary btn-sm">
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
                                        <th>Espèce</th>
                                        <th>Race</th>
                                        <th>Sexe</th>
                                        <th>Propriétaire</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {animals.map(a => (
                                        <tr key={a.id}>
                                            <td><code>{a.animal_code}</code></td>
                                            <td><strong>{a.name}</strong></td>
                                            <td>{a.species_name || a.species || '-'}</td>
                                            <td>{a.breed_name || a.breed || '-'}</td>
                                            <td>{a.sex === 'M' ? 'Mâle' : a.sex === 'F' ? 'Femelle' : '-'}</td>
                                            <td>{a.owner_name || '-'}</td>
                                            <td>
                                                <Link to={`/clinic/animals/${a.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/clinic/animals/${a.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="animaux" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimalList;
