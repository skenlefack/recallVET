// Dependencies for full map support (install when ready):
//   npm install leaflet react-leaflet
// For now, this component uses a list-based "map view" with proximity search.

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../services/api';

const PartyMap = () => {
    const token = getToken();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLat, setSearchLat] = useState('');
    const [searchLng, setSearchLng] = useState('');
    const [radiusKm, setRadiusKm] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [geoActive, setGeoActive] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');

    const fetchParties = useCallback(async () => {
        setLoading(true);
        setError('');
        let endpoint = '/v1/clinic/parties?limit=100';
        if (searchText) endpoint += `&search=${encodeURIComponent(searchText)}`;

        if (geoActive && searchLat && searchLng) {
            endpoint += `&near_lat=${searchLat}&near_lng=${searchLng}&radius_km=${radiusKm}`;
        }

        const res = await api.get(endpoint, token);
        if (res.success) {
            setParties(res.data || []);
        } else {
            setError('Erreur lors du chargement des clients.');
        }
        setLoading(false);
    }, [token, searchText, geoActive, searchLat, searchLng, radiusKm]);

    useEffect(() => {
        fetchParties();
    }, [fetchParties]);

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setError('La geolocalisation n\'est pas supportee par votre navigateur.');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setSearchLat(pos.coords.latitude.toFixed(6));
                setSearchLng(pos.coords.longitude.toFixed(6));
                setGeoActive(true);
                setLocating(false);
            },
            (err) => {
                setError('Impossible d\'obtenir votre position. Verifiez les permissions.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const clearGeo = () => {
        setSearchLat('');
        setSearchLng('');
        setGeoActive(false);
    };

    const handleGeoSearch = (e) => {
        e.preventDefault();
        if (searchLat && searchLng) {
            setGeoActive(true);
        }
    };

    const directionBearing = (lat1, lng1, lat2, lng2) => {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
        const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
                  Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;
        if (bearing >= 337.5 || bearing < 22.5) return 'N';
        if (bearing < 67.5) return 'NE';
        if (bearing < 112.5) return 'E';
        if (bearing < 157.5) return 'SE';
        if (bearing < 202.5) return 'S';
        if (bearing < 247.5) return 'SO';
        if (bearing < 292.5) return 'O';
        return 'NO';
    };

    return (
        <div className="container-fluid">
            <div className="rv-breadcrumb">
                <Link to="/dashboard">Accueil</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Clinique</span>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <Link to="/clinic/parties">Clients</Link>
                <span className="separator"><i className="fas fa-chevron-right" /></span>
                <span>Carte</span>
            </div>

            <div className="page-title-bar">
                <h2><i className="fas fa-map-marker-alt me-2" />Carte clients - Recherche par proximite</h2>
            </div>

            {/* Search controls */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleGeoSearch}>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="form-control"
                                    placeholder="ex: 4.0511"
                                    value={searchLat}
                                    onChange={(e) => setSearchLat(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="form-control"
                                    placeholder="ex: 9.7679"
                                    value={searchLng}
                                    onChange={(e) => setSearchLng(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Rayon (km)</label>
                                <select
                                    className="form-select"
                                    value={radiusKm}
                                    onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                >
                                    <option value={5}>5 km</option>
                                    <option value={10}>10 km</option>
                                    <option value={25}>25 km</option>
                                    <option value={50}>50 km</option>
                                    <option value={100}>100 km</option>
                                </select>
                            </div>
                            <div className="col-md-4 d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={!searchLat || !searchLng}>
                                    <i className="fas fa-search me-1" />Rechercher
                                </button>
                                <button type="button" className="btn btn-outline-secondary" onClick={useMyLocation} disabled={locating}>
                                    <i className={`fas ${locating ? 'fa-spinner fa-spin' : 'fa-crosshairs'} me-1`} />
                                    Ma position
                                </button>
                                {geoActive && (
                                    <button type="button" className="btn btn-outline-danger" onClick={clearGeo}>
                                        <i className="fas fa-times me-1" />Effacer
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="row mt-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text"><i className="fas fa-search" /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filtrer par nom, telephone, email..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 d-flex align-items-center">
                            {geoActive && (
                                <span className="badge bg-info fs-6">
                                    <i className="fas fa-map-pin me-1" />
                                    Recherche autour de ({searchLat}, {searchLng}) - rayon {radiusKm} km
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Results */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>
                        <i className="fas fa-list me-2" />
                        {parties.length} client{parties.length !== 1 ? 's' : ''} trouve{parties.length !== 1 ? 's' : ''}
                    </span>
                    <Link to="/clinic/parties" className="btn btn-sm btn-outline-secondary">
                        <i className="fas fa-table me-1" />Vue liste
                    </Link>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : parties.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-map-marker-alt fa-3x mb-3 d-block" />
                            {geoActive
                                ? 'Aucun client trouve dans ce rayon. Essayez un rayon plus grand.'
                                : 'Aucun client avec coordonnees GPS. Ajoutez les coordonnees dans les fiches clients.'}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Client</th>
                                        <th>Type</th>
                                        <th>Ville</th>
                                        <th>Telephone</th>
                                        <th>Coordonnees</th>
                                        {geoActive && <th>Distance</th>}
                                        {geoActive && <th>Direction</th>}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parties.map((party) => (
                                        <tr key={party.id}>
                                            <td>
                                                <strong>{party.display_name}</strong>
                                                <br />
                                                <small className="text-muted">{party.client_code}</small>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${party.party_type === 'individual' ? 'info' : 'primary'}`}>
                                                    {party.party_type === 'individual' ? 'Individu' : party.party_type === 'company' ? 'Entreprise' : party.party_type}
                                                </span>
                                            </td>
                                            <td>{party.city || '-'}</td>
                                            <td>{party.phone_primary || '-'}</td>
                                            <td>
                                                {party.geo_lat && party.geo_lng ? (
                                                    <small className="text-muted">
                                                        {parseFloat(party.geo_lat).toFixed(4)}, {parseFloat(party.geo_lng).toFixed(4)}
                                                    </small>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            {geoActive && (
                                                <td>
                                                    <span className="badge bg-success">
                                                        {party.distance != null ? `${party.distance} km` : '-'}
                                                    </span>
                                                </td>
                                            )}
                                            {geoActive && (
                                                <td>
                                                    {party.geo_lat && party.geo_lng && searchLat && searchLng ? (
                                                        <span className="badge bg-secondary">
                                                            <i className="fas fa-compass me-1" />
                                                            {directionBearing(
                                                                parseFloat(searchLat), parseFloat(searchLng),
                                                                parseFloat(party.geo_lat), parseFloat(party.geo_lng)
                                                            )}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            )}
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <Link to={`/clinic/parties/${party.id}`} className="btn btn-outline-primary" title="Modifier">
                                                        <i className="fas fa-edit" />
                                                    </Link>
                                                    {party.geo_lat && party.geo_lng && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${party.geo_lat},${party.geo_lng}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline-success"
                                                            title="Voir sur Google Maps"
                                                        >
                                                            <i className="fas fa-external-link-alt" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartyMap;
