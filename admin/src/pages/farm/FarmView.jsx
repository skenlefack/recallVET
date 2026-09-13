import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const FarmView = () => {
    const { id } = useParams();
    const token = getToken();
    const [farm, setFarm] = useState(null);
    const [herds, setHerds] = useState([]);
    const [visits, setVisits] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('herds');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAll();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadAll = async () => {
        setLoading(true);
        const [farmRes, herdsRes, visitsRes, eventsRes] = await Promise.all([
            api.get(`/v1/farm/farms/${id}`, token),
            api.get(`/v1/farm/farms/${id}/herds`, token),
            api.get(`/v1/farm/farms/${id}/visits`, token),
            api.get(`/v1/farm/farms/${id}/health-events`, token)
        ]);
        if (farmRes.success) setFarm(farmRes.data);
        if (herdsRes.success) setHerds(herdsRes.data || []);
        if (visitsRes.success) setVisits(visitsRes.data || []);
        if (eventsRes.success) setEvents(eventsRes.data || []);
        setLoading(false);
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!farm) return <div className="text-center py-5 text-muted">Exploitation non trouvée</div>;

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <Link to="/farm/farms">Élevage</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Exploitation</span>
            </div>
            <div className="page-title-bar">
                <h4><i className="fas fa-tractor me-2" />{farm.name}</h4>
                <div>
                    <Link to={`/farm/farms/${id}/edit`} className="btn btn-outline-primary me-2">
                        <i className="fas fa-edit me-1"></i>Modifier
                    </Link>
                    <Link to="/farm/farms" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1" />Retour
                    </Link>
                </div>
            </div>

            {/* Info Card */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3"><strong>Code:</strong> <code>{farm.farm_code}</code></div>
                        <div className="col-md-3"><strong>Type:</strong> {farm.farm_type || '-'}</div>
                        <div className="col-md-3"><strong>Propriétaire:</strong> {farm.owner_name || '-'}</div>
                        <div className="col-md-3"><strong>Superficie:</strong> {farm.total_area_ha ? `${farm.total_area_ha} ha` : '-'}</div>
                        <div className="col-md-3 mt-2"><strong>Région:</strong> {farm.region || '-'}</div>
                        <div className="col-md-3 mt-2"><strong>N° enregistrement:</strong> {farm.registration_number || '-'}</div>
                        <div className="col-md-6 mt-2"><strong>Adresse:</strong> {farm.address || '-'}</div>
                    </div>
                    {farm.notes && <div className="mt-2"><strong>Notes:</strong> {farm.notes}</div>}
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'herds' ? 'active' : ''}`} onClick={() => setActiveTab('herds')}>
                        <i className="fas fa-horse me-1"></i>Troupeaux ({herds.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'visits' ? 'active' : ''}`} onClick={() => setActiveTab('visits')}>
                        <i className="fas fa-clipboard-check me-1"></i>Visites ({visits.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                        <i className="fas fa-exclamation-triangle me-1"></i>Événements sanitaires ({events.length})
                    </button>
                </li>
            </ul>

            {/* Herds Tab */}
            {activeTab === 'herds' && (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Troupeaux</h6>
                        <Link to={`/farm/herds/new?farm_id=${id}`} className="btn btn-sm btn-primary">
                            <i className="fas fa-plus me-1"></i>Ajouter
                        </Link>
                    </div>
                    <div className="card-body p-0">
                        {herds.length === 0 ? (
                            <div className="text-center py-4 text-muted">Aucun troupeau enregistré</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr><th>Nom</th><th>Espèce</th><th>Race</th><th>Effectif</th><th>Usage</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {herds.map(h => (
                                            <tr key={h.id}>
                                                <td><strong>{h.name}</strong></td>
                                                <td>{h.species_name || '-'}</td>
                                                <td>{h.breed_name || '-'}</td>
                                                <td>{h.head_count || 0}</td>
                                                <td>{h.purpose || '-'}</td>
                                                <td>
                                                    <Link to={`/farm/herds/${h.id}/edit`} className="btn btn-sm btn-outline-primary">
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
                </div>
            )}

            {/* Visits Tab */}
            {activeTab === 'visits' && (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Visites</h6>
                        <Link to={`/farm/visits/new?farm_id=${id}`} className="btn btn-sm btn-primary">
                            <i className="fas fa-plus me-1"></i>Ajouter
                        </Link>
                    </div>
                    <div className="card-body p-0">
                        {visits.length === 0 ? (
                            <div className="text-center py-4 text-muted">Aucune visite enregistrée</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr><th>Date</th><th>Type</th><th>Statut</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {visits.map(v => (
                                            <tr key={v.id}>
                                                <td>{v.visit_date ? new Date(v.visit_date).toLocaleDateString('fr-FR') : '-'}</td>
                                                <td>{v.visit_type || '-'}</td>
                                                <td><span className={`badge bg-${v.status === 'completed' ? 'success' : 'secondary'}`}>{v.status || '-'}</span></td>
                                                <td>
                                                    <Link to={`/farm/visits/${v.id}/edit`} className="btn btn-sm btn-outline-primary">
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
                </div>
            )}

            {/* Health Events Tab */}
            {activeTab === 'events' && (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Événements sanitaires</h6>
                        <Link to={`/farm/health-events/new?farm_id=${id}`} className="btn btn-sm btn-primary">
                            <i className="fas fa-plus me-1"></i>Ajouter
                        </Link>
                    </div>
                    <div className="card-body p-0">
                        {events.length === 0 ? (
                            <div className="text-center py-4 text-muted">Aucun événement sanitaire</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr><th>Date</th><th>Type</th><th>Maladie suspectée</th><th>Affectés</th><th>Morts</th><th>Statut</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {events.map(ev => (
                                            <tr key={ev.id}>
                                                <td>{ev.event_date ? new Date(ev.event_date).toLocaleDateString('fr-FR') : '-'}</td>
                                                <td>{ev.event_type || '-'}</td>
                                                <td>{ev.disease_suspected || '-'}</td>
                                                <td>{ev.animals_affected || 0}</td>
                                                <td className={ev.animals_dead > 0 ? 'text-danger fw-bold' : ''}>{ev.animals_dead || 0}</td>
                                                <td><span className={`badge bg-${ev.status === 'resolved' ? 'success' : ev.status === 'escalated' ? 'danger' : 'warning'}`}>{ev.status || '-'}</span></td>
                                                <td>
                                                    <Link to={`/farm/health-events/${ev.id}/edit`} className="btn btn-sm btn-outline-primary">
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
                </div>
            )}
        </div>
    );
};

export default FarmView;
