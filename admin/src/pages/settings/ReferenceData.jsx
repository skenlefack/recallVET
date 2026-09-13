import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import Pagination from '../../components/Pagination'

const TABS = [
  { key: 'species', label: 'Espèces', icon: 'fas fa-dna', endpoint: '/v1/reference/species' },
  { key: 'breeds', label: 'Races', icon: 'fas fa-paw', endpoint: '/v1/reference/breeds' },
  { key: 'diseases', label: 'Maladies', icon: 'fas fa-virus', endpoint: '/v1/reference/diseases' },
  { key: 'signs', label: 'Signes cliniques', icon: 'fas fa-heartbeat', endpoint: '/v1/reference/clinical-signs' },
  { key: 'vaccines', label: 'Types vaccins', icon: 'fas fa-syringe', endpoint: '/v1/reference/vaccine-types' },
  { key: 'diagnoses', label: 'Codes diagnostic', icon: 'fas fa-notes-medical', endpoint: '/v1/reference/diagnosis-codes' },
  { key: 'units', label: 'Unités', icon: 'fas fa-ruler', endpoint: '/v1/reference/units' },
]

export default function ReferenceData() {
  const [activeTab, setActiveTab] = useState('species')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [toast, setToast] = useState(null)
  const token = getToken()

  // Species list for breed filter
  const [speciesList, setSpeciesList] = useState([])
  const [breedSpeciesFilter, setBreedSpeciesFilter] = useState('')

  useEffect(() => {
    loadTab(activeTab)
    if (activeTab === 'breeds') loadSpecies()
  }, [activeTab])

  const loadSpecies = async () => {
    const res = await api.get('/v1/reference/species', token)
    if (res.success) setSpeciesList(res.data || [])
  }

  const loadTab = async (tab) => {
    const tabDef = TABS.find(t => t.key === tab)
    if (!tabDef) return
    setLoading(prev => ({ ...prev, [tab]: true }))
    const res = await api.get(tabDef.endpoint, token)
    if (res.success) setData(prev => ({ ...prev, [tab]: res.data || [] }))
    setLoading(prev => ({ ...prev, [tab]: false }))
  }

  const handleDelete = async (tab, id) => {
    if (!window.confirm('Supprimer cet élément ?')) return
    const tabDef = TABS.find(t => t.key === tab)
    const res = await api.delete(`${tabDef.endpoint}/${id}`, token)
    if (res.success) {
      setToast({ type: 'success', msg: 'Supprimé' })
      loadTab(tab)
    } else {
      setToast({ type: 'danger', msg: res.message || 'Erreur' })
    }
  }

  const handleSave = async (tab, formData) => {
    const tabDef = TABS.find(t => t.key === tab)
    let res
    if (editItem) {
      res = await api.put(`${tabDef.endpoint}/${editItem.id}`, formData, token)
    } else {
      res = await api.post(tabDef.endpoint, formData, token)
    }
    if (res.success) {
      setToast({ type: 'success', msg: editItem ? 'Modifié' : 'Ajouté' })
      setShowForm(false)
      setEditItem(null)
      loadTab(tab)
    } else {
      setToast({ type: 'danger', msg: res.message || 'Erreur' })
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Reset page when tab changes
  useEffect(() => { setCurrentPage(1) }, [activeTab])

  const currentData = data[activeTab] || []
  const currentLoading = loading[activeTab]

  // Client-side pagination
  const filteredData = activeTab === 'breeds' && breedSpeciesFilter
    ? currentData.filter(d => String(d.species_id) === breedSpeciesFilter)
    : currentData
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible fade show position-fixed`}
          style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Paramètres</span>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Données de référence</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-database" />Données de référence</h4>
        <button className="btn btn-rv-primary" onClick={() => { setShowForm(true); setEditItem(null); }}>
          <i className="fas fa-plus me-1" />Ajouter
        </button>
      </div>

      <p className="text-muted mb-3" style={{ fontSize: '0.88rem' }}>
        <i className="fas fa-info-circle me-1" />
        Les données globales <span className="badge bg-light text-dark">Système</span> sont partagées avec tous les utilisateurs.
        Vos données personnalisées <span className="badge-status trialing">Personnalisé</span> ne sont visibles que par votre établissement.
      </p>

      {/* Tabs */}
      <div className="rv-tabs">
        {TABS.map(tab => (
          <button key={tab.key}
            className={`rv-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setShowForm(false); setEditItem(null); }}>
            <i className={tab.icon} />
            {tab.label}
            <span className="tab-count">{(data[tab.key] || []).length}</span>
          </button>
        ))}
      </div>

      {/* Add/Edit Form (inline) */}
      {showForm && (
        <div className="card form-card mb-3">
          <div className="card-header">
            <i className="fas fa-edit me-2" />
            {editItem ? 'Modifier' : 'Ajouter'} — {TABS.find(t => t.key === activeTab)?.label}
          </div>
          <div className="card-body">
            <RefForm
              tab={activeTab}
              item={editItem}
              speciesList={speciesList}
              onSave={(formData) => handleSave(activeTab, formData)}
              onCancel={() => { setShowForm(false); setEditItem(null); }}
            />
          </div>
        </div>
      )}

      {/* Data table */}
      <div className="card form-card">
        <div className="card-body p-0">
          {currentLoading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <i className={`${TABS.find(t => t.key === activeTab)?.icon} empty-icon`} />
              <p>Aucune donnée</p>
              <button className="btn btn-rv-primary btn-sm" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus me-1" />Ajouter
              </button>
            </div>
          ) : (
            <RefTable
              tab={activeTab}
              data={paginatedData}
              speciesFilter={breedSpeciesFilter}
              onSpeciesFilterChange={(v) => { setBreedSpeciesFilter(v); setCurrentPage(1); }}
              speciesList={speciesList}
              onEdit={(item) => { setEditItem(item); setShowForm(true); }}
              onDelete={(id) => handleDelete(activeTab, id)}
            />
          )}
        </div>
        {totalItems > 0 && (
          <div className="card-footer">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
              itemName={TABS.find(t => t.key === activeTab)?.label.toLowerCase() || 'éléments'}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dynamic form by tab type ──
function RefForm({ tab, item, speciesList, onSave, onCancel }) {
  const [form, setForm] = useState(item || {})

  useEffect(() => { setForm(item || {}) }, [item])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const fields = {
    species: (
      <div className="row g-3">
        <div className="col-md-3"><label className="form-label">Code *</label><input className="form-control" name="code" value={form.code || ''} onChange={handleChange} required /></div>
        <div className="col-md-4"><label className="form-label">Nom (FR) *</label><input className="form-control" name="name_fr" value={form.name_fr || ''} onChange={handleChange} required /></div>
        <div className="col-md-3"><label className="form-label">Nom (EN)</label><input className="form-control" name="name_en" value={form.name_en || ''} onChange={handleChange} /></div>
        <div className="col-md-2"><label className="form-label">Catégorie</label>
          <select className="form-select" name="category" value={form.category || ''} onChange={handleChange}>
            <option value="companion">Compagnie</option><option value="livestock">Élevage</option>
            <option value="equine">Équin</option><option value="exotic">Exotique</option>
            <option value="poultry">Volaille</option><option value="aquatic">Aquatique</option>
          </select>
        </div>
      </div>
    ),
    breeds: (
      <div className="row g-3">
        <div className="col-md-3"><label className="form-label">Espèce *</label>
          <select className="form-select" name="species_id" value={form.species_id || ''} onChange={handleChange} required>
            <option value="">--</option>
            {speciesList.map(s => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
          </select>
        </div>
        <div className="col-md-3"><label className="form-label">Code *</label><input className="form-control" name="code" value={form.code || ''} onChange={handleChange} required /></div>
        <div className="col-md-3"><label className="form-label">Nom (FR) *</label><input className="form-control" name="name_fr" value={form.name_fr || ''} onChange={handleChange} required /></div>
        <div className="col-md-3"><label className="form-label">Nom (EN)</label><input className="form-control" name="name_en" value={form.name_en || ''} onChange={handleChange} /></div>
      </div>
    ),
    diseases: (
      <div className="row g-3">
        <div className="col-md-2"><label className="form-label">Code *</label><input className="form-control" name="code" value={form.code || ''} onChange={handleChange} required /></div>
        <div className="col-md-3"><label className="form-label">Nom (FR) *</label><input className="form-control" name="name_fr" value={form.name_fr || ''} onChange={handleChange} required /></div>
        <div className="col-md-3"><label className="form-label">Nom (EN)</label><input className="form-control" name="name_en" value={form.name_en || ''} onChange={handleChange} /></div>
        <div className="col-md-2"><label className="form-label">Catégorie</label>
          <select className="form-select" name="category" value={form.category || ''} onChange={handleChange}>
            <option value="infectious">Infectieuse</option><option value="parasitic">Parasitaire</option>
            <option value="metabolic">Métabolique</option><option value="genetic">Génétique</option>
            <option value="traumatic">Traumatique</option><option value="neoplastic">Néoplasique</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <div className="form-check"><input type="checkbox" className="form-check-input" name="is_notifiable" checked={!!form.is_notifiable} onChange={handleChange} /><label className="form-check-label">À déclaration obligatoire</label></div>
        </div>
      </div>
    ),
    signs: (
      <div className="row g-3">
        <div className="col-md-4"><label className="form-label">Nom (FR) *</label><input className="form-control" name="name_fr" value={form.name_fr || ''} onChange={handleChange} required /></div>
        <div className="col-md-4"><label className="form-label">Nom (EN)</label><input className="form-control" name="name_en" value={form.name_en || ''} onChange={handleChange} /></div>
        <div className="col-md-4"><label className="form-label">Catégorie</label>
          <select className="form-select" name="category" value={form.category || ''} onChange={handleChange}>
            <option value="general">Général</option><option value="digestive">Digestif</option>
            <option value="respiratory">Respiratoire</option><option value="cardiovascular">Cardiovasculaire</option>
            <option value="neurological">Neurologique</option><option value="dermatological">Dermatologique</option>
            <option value="musculoskeletal">Musculosquelettique</option><option value="urogenital">Urogénital</option>
            <option value="ophthalmic">Ophtalmique</option><option value="other">Autre</option>
          </select>
        </div>
      </div>
    ),
    vaccines: (
      <div className="row g-3">
        <div className="col-md-5"><label className="form-label">Nom (FR) *</label><input className="form-control" name="name_fr" value={form.name_fr || ''} onChange={handleChange} required /></div>
        <div className="col-md-5"><label className="form-label">Nom (EN)</label><input className="form-control" name="name_en" value={form.name_en || ''} onChange={handleChange} /></div>
        <div className="col-md-2"><label className="form-label">Protocole</label><input className="form-control" name="protocol" value={form.protocol || ''} onChange={handleChange} placeholder="Ex: 2 doses" /></div>
      </div>
    ),
    diagnoses: (
      <div className="row g-3">
        <div className="col-md-2"><label className="form-label">Code *</label><input className="form-control" name="code" value={form.code || ''} onChange={handleChange} required /></div>
        <div className="col-md-4"><label className="form-label">Nom (FR) *</label><input className="form-control" name="name_fr" value={form.name_fr || ''} onChange={handleChange} required /></div>
        <div className="col-md-4"><label className="form-label">Nom (EN)</label><input className="form-control" name="name_en" value={form.name_en || ''} onChange={handleChange} /></div>
        <div className="col-md-2"><label className="form-label">Catégorie</label><input className="form-control" name="category" value={form.category || ''} onChange={handleChange} placeholder="Ex: digestive" /></div>
      </div>
    ),
    units: (
      <div className="row g-3">
        <div className="col-md-2"><label className="form-label">Code *</label><input className="form-control" name="code" value={form.code || ''} onChange={handleChange} required /></div>
        <div className="col-md-3"><label className="form-label">Nom (FR) *</label><input className="form-control" name="name_fr" value={form.name_fr || ''} onChange={handleChange} required /></div>
        <div className="col-md-3"><label className="form-label">Nom (EN)</label><input className="form-control" name="name_en" value={form.name_en || ''} onChange={handleChange} /></div>
        <div className="col-md-2"><label className="form-label">Catégorie</label>
          <select className="form-select" name="category" value={form.category || ''} onChange={handleChange}>
            <option value="weight">Poids</option><option value="volume">Volume</option>
            <option value="length">Longueur</option><option value="count">Comptage</option>
            <option value="time">Temps</option><option value="concentration">Concentration</option>
          </select>
        </div>
      </div>
    ),
  }

  return (
    <form onSubmit={handleSubmit}>
      {fields[tab] || <p>Formulaire non disponible</p>}
      <div className="d-flex gap-2 mt-3">
        <button type="submit" className="btn btn-rv-primary btn-sm"><i className="fas fa-save me-1" />Enregistrer</button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  )
}

// ── Dynamic table by tab type ──
function RefTable({ tab, data, speciesFilter, onSpeciesFilterChange, speciesList, onEdit, onDelete }) {
  const categoryLabels = {
    companion: 'Compagnie', livestock: 'Élevage', equine: 'Équin', exotic: 'Exotique', poultry: 'Volaille', aquatic: 'Aquatique',
    infectious: 'Infectieuse', parasitic: 'Parasitaire', metabolic: 'Métabolique', genetic: 'Génétique', traumatic: 'Traumatique', neoplastic: 'Néoplasique',
    general: 'Général', digestive: 'Digestif', respiratory: 'Respiratoire', cardiovascular: 'Cardiovasculaire', neurological: 'Neurologique',
    dermatological: 'Dermatologique', musculoskeletal: 'Musculosquelettique', urogenital: 'Urogénital', ophthalmic: 'Ophtalmique',
    weight: 'Poids', volume: 'Volume', length: 'Longueur', count: 'Comptage', time: 'Temps', concentration: 'Concentration',
    other: 'Autre'
  }

  // data is already filtered and paginated by parent
  const isGlobal = (item) => item.tenant_id === null || item.tenant_id === undefined

  return (
    <>
      {tab === 'breeds' && (
        <div className="p-2 border-bottom" style={{ background: '#f8fafb' }}>
          <select className="form-select form-select-sm" style={{ maxWidth: 250 }}
            value={speciesFilter} onChange={e => onSpeciesFilterChange(e.target.value)}>
            <option value="">Toutes les espèces</option>
            {speciesList.map(s => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
          </select>
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {tab === 'species' && <><th>Code</th><th>Nom</th><th>Catégorie</th><th>Source</th><th>Actions</th></>}
              {tab === 'breeds' && <><th>Code</th><th>Nom</th><th>Espèce</th><th>Source</th><th>Actions</th></>}
              {tab === 'diseases' && <><th>Code</th><th>Nom</th><th>Catégorie</th><th>Décl. oblig.</th><th>Source</th><th>Actions</th></>}
              {tab === 'signs' && <><th>Nom</th><th>Catégorie</th><th>Source</th><th>Actions</th></>}
              {tab === 'vaccines' && <><th>Nom</th><th>Espèces</th><th>Source</th><th>Actions</th></>}
              {tab === 'diagnoses' && <><th>Code</th><th>Nom</th><th>Catégorie</th><th>Source</th><th>Actions</th></>}
              {tab === 'units' && <><th>Code</th><th>Nom</th><th>Catégorie</th><th>Source</th><th>Actions</th></>}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                {/* Species */}
                {tab === 'species' && <>
                  <td><code>{item.code}</code></td>
                  <td><strong>{item.name_fr}</strong>{item.name_en && <small className="text-muted ms-1">({item.name_en})</small>}</td>
                  <td><span className="badge bg-light text-dark">{categoryLabels[item.category] || item.category}</span></td>
                </>}
                {/* Breeds */}
                {tab === 'breeds' && <>
                  <td><code>{item.code}</code></td>
                  <td><strong>{item.name_fr}</strong>{item.name_en && <small className="text-muted ms-1">({item.name_en})</small>}</td>
                  <td>{speciesList.find(s => s.id === item.species_id)?.name_fr || '-'}</td>
                </>}
                {/* Diseases */}
                {tab === 'diseases' && <>
                  <td><code>{item.code}</code></td>
                  <td><strong>{item.name_fr}</strong></td>
                  <td><span className="badge bg-light text-dark">{categoryLabels[item.category] || item.category}</span></td>
                  <td>{item.is_notifiable ? <i className="fas fa-exclamation-triangle text-warning" title="Déclaration obligatoire" /> : '-'}</td>
                </>}
                {/* Signs */}
                {tab === 'signs' && <>
                  <td><strong>{item.name_fr}</strong>{item.name_en && <small className="text-muted ms-1">({item.name_en})</small>}</td>
                  <td><span className="badge bg-light text-dark">{categoryLabels[item.category] || item.category}</span></td>
                </>}
                {/* Vaccines */}
                {tab === 'vaccines' && <>
                  <td><strong>{item.name_fr}</strong></td>
                  <td><small className="text-muted">{item.species_applicable ? (typeof item.species_applicable === 'string' ? JSON.parse(item.species_applicable) : item.species_applicable).join(', ') : 'Toutes'}</small></td>
                </>}
                {/* Diagnoses */}
                {tab === 'diagnoses' && <>
                  <td><code>{item.code}</code></td>
                  <td><strong>{item.name_fr}</strong></td>
                  <td><span className="badge bg-light text-dark">{categoryLabels[item.category] || item.category || '-'}</span></td>
                </>}
                {/* Units */}
                {tab === 'units' && <>
                  <td><code>{item.code}</code></td>
                  <td><strong>{item.name_fr}</strong></td>
                  <td><span className="badge bg-light text-dark">{categoryLabels[item.category] || item.category}</span></td>
                </>}

                {/* Source badge — same for all tabs */}
                <td>
                  {isGlobal(item)
                    ? <span className="badge bg-light text-dark"><i className="fas fa-globe me-1" />Système</span>
                    : <span className="badge-status trialing"><i className="fas fa-user me-1" />Personnalisé</span>
                  }
                </td>

                {/* Actions — same for all tabs */}
                <td>
                  {!isGlobal(item) ? (
                    <div className="btn-group-actions">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(item)} title="Modifier">
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(item.id)} title="Supprimer">
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}><i className="fas fa-lock me-1" />Protégé</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
