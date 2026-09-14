import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';
import Pagination from '../../components/Pagination';

const VaccinationList = () => {
    const token = getToken();
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animalFilter, setAnimalFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchVaccinations();
    }, [animalFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchVaccinations = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/vaccinations?page=${currentPage}&limit=${itemsPerPage}`;
        if (animalFilter) endpoint += `&animal_search=${encodeURIComponent(animalFilter)}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setVaccinations(res.data || []);
            setTotalItems(res.pagination?.total || res.total || (res.data || []).length);
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
                <span>Vaccinations</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-syringe" />Vaccinations <span className="badge bg-light text-dark ms-2" style={{fontSize:'0.75rem'}}>{totalItems}</span></h4>
                <Link to="/clinic/vaccinations/new" className="btn btn-rv-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle vaccination
                </Link>
            </div>

            <div className="filter-bar">
                <div className="row g-2">
                    <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Filtrer par animal..."
                            value={animalFilter} onChange={e => { setAnimalFilter(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="loading-container"><div className="spinner-border text-success" /><p>Chargement...</p></div>
                    ) : vaccinations.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-syringe empty-icon" />
                            <p>Aucune vaccination trouvée</p>
                            <Link to="/clinic/vaccinations/new" className="btn btn-rv-primary btn-sm">
                                <i className="fas fa-plus me-1" />Créer le premier
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Vaccin</th>
                                        <th>Lot</th>
                                        <th>Dose</th>
                                        <th>Prochain rappel</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vaccinations.map(v => (
                                        <tr key={v.id}>
                                            <td>{v.vaccination_date ? new Date(v.vaccination_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{v.animal_name || '-'}</strong></td>
                                            <td>{v.product_name || '-'}</td>
                                            <td><code>{v.lot_number || '-'}</code></td>
                                            <td>{v.dose || '-'}</td>
                                            <td>
                                                {v.next_due_date ? (
                                                    <span className={new Date(v.next_due_date) < new Date() ? 'text-danger fw-bold' : ''}>
                                                        {new Date(v.next_due_date).toLocaleDateString('fr-FR')}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <div className="btn-group-actions">
                                                <Link to={`/clinic/vaccinations/${v.id}`} className="btn btn-sm btn-outline-info" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/clinic/vaccinations/${v.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="vaccinations" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaccinationList;
