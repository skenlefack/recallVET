import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Form, Card, Row, Col, Button, Alert, Spinner, Image, Badge, ListGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { api, getToken, API_URL } from '../../services/api'
import CountrySelect from '../../components/CountrySelect'

const STRUCTURE_TYPES = [
  { value: 'clinic', label: 'Clinique' },
  { value: 'pharmacy', label: 'Pharmacie' },
  { value: 'farm_practice', label: 'Cabinet rural' },
  { value: 'mixed', label: 'Mixte' }
]

const CURRENCIES = ['XAF', 'XOF', 'USD', 'EUR', 'GBP']
const LANGUAGES = [
  { value: 'fr', label: 'Fran\u00e7ais' },
  { value: 'en', label: 'English' }
]
const TIMEZONES = [
  'Africa/Douala',
  'Africa/Lagos',
  'Africa/Kinshasa',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Casablanca',
  'Africa/Abidjan',
  'Africa/Dakar',
  'Africa/Accra',
  'Africa/Cairo',
  'Africa/Tunis',
  'Africa/Algiers',
  'Europe/Paris',
  'UTC'
]

export default function TenantSettings() {
  const { t } = useTranslation()
  const fileInputRef = useRef()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address_line: '',
    city: '',
    region: '',
    country_code: '',
    default_currency: 'XAF',
    default_language: 'fr',
    timezone: 'Africa/Douala'
  })
  const [logoUrl, setLogoUrl] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  // Structures & Sites state
  const [structures, setStructures] = useState([])
  const [sites, setSites] = useState([])
  const [structureForm, setStructureForm] = useState({ name: '', type: 'mixed', address: '', phone: '', email: '' })
  const [editingStructureId, setEditingStructureId] = useState(null)
  const [siteForm, setSiteForm] = useState({ name: '', structure_id: '', address: '', phone: '' })
  const [editingSiteId, setEditingSiteId] = useState(null)
  const [savingStructure, setSavingStructure] = useState(false)
  const [savingSite, setSavingSite] = useState(false)

  useEffect(() => {
    loadSettings()
    loadStructuresAndSites()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const token = getToken()
    const res = await api.get('/v1/tenant', token)
    if (res.success && res.data) {
      const d = res.data
      setForm({
        name: d.name || '',
        phone: d.phone || '',
        address_line: d.address_line || '',
        city: d.city || '',
        region: d.region || '',
        country_code: d.country_code || '',
        default_currency: d.default_currency || 'XAF',
        default_language: d.default_language || 'fr',
        timezone: d.timezone || 'Africa/Douala'
      })
      if (d.logo_url) {
        setLogoUrl(d.logo_url)
      }
    } else {
      setToast({ type: 'danger', message: res.message || t('tenantSettings.loadError') })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCountryChange = (code) => {
    setForm(prev => ({ ...prev, country_code: code }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const token = getToken()
    const res = await api.put('/v1/tenant', form, token)
    setSaving(false)
    setToast({
      type: res.success ? 'success' : 'danger',
      message: res.success ? t('tenantSettings.saved') : (res.message || t('tenantSettings.saveError'))
    })
  }

  const handleLogoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Upload
    uploadLogo(file)
  }

  const uploadLogo = async (file) => {
    setUploading(true)
    const token = getToken()
    const formData = new FormData()
    formData.append('logo', file)
    const res = await api.upload('/v1/tenant/logo', formData, token)
    setUploading(false)
    if (res.success) {
      setLogoUrl(res.data.logo_url)
      setLogoPreview(null)
      setToast({ type: 'success', message: t('tenantSettings.logoUploaded') })
    } else {
      setLogoPreview(null)
      setToast({ type: 'danger', message: res.message || t('tenantSettings.logoError') })
    }
  }

  // ── Structures & Sites ──
  const loadStructuresAndSites = async () => {
    const token = getToken()
    const [structRes, siteRes] = await Promise.all([
      api.get('/v1/tenant/structures', token),
      api.get('/v1/tenant/sites', token)
    ])
    if (structRes.success) setStructures(structRes.data || [])
    if (siteRes.success) setSites(siteRes.data || [])
  }

  const handleStructureSubmit = async (e) => {
    e.preventDefault()
    setSavingStructure(true)
    const token = getToken()
    let res
    if (editingStructureId) {
      res = await api.put(`/v1/tenant/structures/${editingStructureId}`, structureForm, token)
    } else {
      res = await api.post('/v1/tenant/structures', structureForm, token)
    }
    setSavingStructure(false)
    if (res.success) {
      setStructureForm({ name: '', type: 'mixed', address: '', phone: '', email: '' })
      setEditingStructureId(null)
      loadStructuresAndSites()
      setToast({ type: 'success', message: editingStructureId ? 'Structure mise à jour.' : 'Structure créée.' })
    } else {
      setToast({ type: 'danger', message: res.message || 'Erreur.' })
    }
  }

  const startEditStructure = (s) => {
    setEditingStructureId(s.id)
    setStructureForm({ name: s.name, type: s.type || 'mixed', address: s.address || '', phone: s.phone || '', email: s.email || '' })
  }

  const cancelEditStructure = () => {
    setEditingStructureId(null)
    setStructureForm({ name: '', type: 'mixed', address: '', phone: '', email: '' })
  }

  const handleSiteSubmit = async (e) => {
    e.preventDefault()
    setSavingSite(true)
    const token = getToken()
    let res
    if (editingSiteId) {
      res = await api.put(`/v1/tenant/sites/${editingSiteId}`, siteForm, token)
    } else {
      res = await api.post('/v1/tenant/sites', siteForm, token)
    }
    setSavingSite(false)
    if (res.success) {
      setSiteForm({ name: '', structure_id: '', address: '', phone: '' })
      setEditingSiteId(null)
      loadStructuresAndSites()
      setToast({ type: 'success', message: editingSiteId ? 'Site mis à jour.' : 'Site créé.' })
    } else {
      setToast({ type: 'danger', message: res.message || 'Erreur.' })
    }
  }

  const startEditSite = (s) => {
    setEditingSiteId(s.id)
    setSiteForm({ name: s.name, structure_id: s.structure_id, address: s.address || '', phone: s.phone || '' })
  }

  const cancelEditSite = () => {
    setEditingSiteId(null)
    setSiteForm({ name: '', structure_id: '', address: '', phone: '' })
  }

  const resolveLogoSrc = () => {
    if (logoPreview) return logoPreview
    if (logoUrl) {
      // If the URL starts with / it's relative to the API
      if (logoUrl.startsWith('/')) {
        const base = API_URL.replace(/\/api$/, '')
        return `${base}${logoUrl}`
      }
      return logoUrl
    }
    return null
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="success" />
      </div>
    )
  }

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/settings">Paramètres</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Établissement</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-building me-2" />{t('tenantSettings.title')}</h4>
      </div>

      {toast && (
        <Alert variant={toast.type} dismissible onClose={() => setToast(null)}>
          {toast.message}
        </Alert>
      )}

      <Row className="g-4">
        {/* Logo */}
        <Col lg={4}>
          <Card>
            <Card.Header>{t('tenantSettings.logo')}</Card.Header>
            <Card.Body className="text-center">
              {resolveLogoSrc() ? (
                <Image
                  src={resolveLogoSrc()}
                  alt="Logo"
                  rounded
                  style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'contain' }}
                  className="mb-3"
                />
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center rounded mb-3"
                     style={{ width: '180px', height: '180px', margin: '0 auto' }}>
                  <i className="fas fa-image fa-3x text-muted"></i>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png"
                className="d-none"
                onChange={handleLogoSelect}
              />
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <><Spinner size="sm" className="me-1" />{t('common.loading')}</>
                ) : (
                  <><i className="fas fa-upload me-1"></i>{t('tenantSettings.uploadLogo')}</>
                )}
              </Button>
              <div className="text-muted small mt-2">{t('tenantSettings.logoHint')}</div>
            </Card.Body>
          </Card>
        </Col>

        {/* Settings form */}
        <Col lg={8}>
          <Card>
            <Card.Header>{t('tenantSettings.generalInfo')}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('tenantSettings.name')}</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('tenantSettings.phone')}</Form.Label>
                  <Form.Control
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('tenantSettings.address')}</Form.Label>
                  <Form.Control
                    name="address_line"
                    value={form.address_line}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('tenantSettings.city')}</Form.Label>
                      <Form.Control
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('tenantSettings.region')}</Form.Label>
                      <Form.Control
                        name="region"
                        value={form.region}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>{t('tenantSettings.country')}</Form.Label>
                  <CountrySelect
                    value={form.country_code}
                    onChange={handleCountryChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('tenantSettings.currency')}</Form.Label>
                      <Form.Select name="default_currency" value={form.default_currency} onChange={handleChange}>
                        {CURRENCIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('tenantSettings.language')}</Form.Label>
                      <Form.Select name="default_language" value={form.default_language} onChange={handleChange}>
                        {LANGUAGES.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('tenantSettings.timezone')}</Form.Label>
                      <Form.Select name="timezone" value={form.timezone} onChange={handleChange}>
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end">
                  <Button type="submit" variant="success" disabled={saving}>
                    {saving ? (
                      <><Spinner size="sm" className="me-1" />{t('common.loading')}</>
                    ) : (
                      <><i className="fas fa-save me-1"></i>{t('common.save')}</>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Structures & Sites ── */}
      <hr className="my-4" />
      <h5 className="mb-3"><i className="fas fa-sitemap me-2" />Structures & Sites</h5>
      <Row className="g-4">
        {/* Structures */}
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span><i className="fas fa-building me-1" />Structures</span>
              <Badge bg="secondary">{structures.length}</Badge>
            </Card.Header>
            <Card.Body>
              {structures.length > 0 && (
                <ListGroup variant="flush" className="mb-3">
                  {structures.map(s => (
                    <ListGroup.Item key={s.id} className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{s.name}</strong>
                        <div className="text-muted small">
                          {STRUCTURE_TYPES.find(t => t.value === s.type)?.label || s.type}
                          {s.address && <> &mdash; {s.address}</>}
                        </div>
                        {/* Sites under this structure */}
                        {sites.filter(si => si.structure_id === s.id).length > 0 && (
                          <div className="mt-1">
                            {sites.filter(si => si.structure_id === s.id).map(si => (
                              <span key={si.id} className="me-2">
                                <Badge bg="light" text="dark" className="me-1">
                                  <i className="fas fa-map-marker-alt me-1" />{si.name}
                                </Badge>
                                <button className="btn btn-sm btn-link p-0 text-primary" onClick={() => startEditSite(si)} title="Modifier">
                                  <i className="fas fa-pen fa-xs" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline-primary" size="sm" onClick={() => startEditStructure(s)}>
                        <i className="fas fa-pen" />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              <Form onSubmit={handleStructureSubmit}>
                <div className="small fw-bold mb-2">
                  {editingStructureId ? 'Modifier la structure' : 'Ajouter une structure'}
                </div>
                <Form.Group className="mb-2">
                  <Form.Control size="sm" placeholder="Nom *" value={structureForm.name}
                    onChange={e => setStructureForm(p => ({ ...p, name: e.target.value }))} required />
                </Form.Group>
                <Row className="g-2 mb-2">
                  <Col>
                    <Form.Select size="sm" value={structureForm.type}
                      onChange={e => setStructureForm(p => ({ ...p, type: e.target.value }))}>
                      {STRUCTURE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Form.Select>
                  </Col>
                  <Col>
                    <Form.Control size="sm" placeholder="Adresse" value={structureForm.address}
                      onChange={e => setStructureForm(p => ({ ...p, address: e.target.value }))} />
                  </Col>
                </Row>
                <Row className="g-2 mb-2">
                  <Col>
                    <Form.Control size="sm" placeholder="Téléphone" value={structureForm.phone}
                      onChange={e => setStructureForm(p => ({ ...p, phone: e.target.value }))} />
                  </Col>
                  <Col>
                    <Form.Control size="sm" type="email" placeholder="Email" value={structureForm.email}
                      onChange={e => setStructureForm(p => ({ ...p, email: e.target.value }))} />
                  </Col>
                </Row>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="success" size="sm" disabled={savingStructure}>
                    {savingStructure ? <Spinner size="sm" /> : <><i className="fas fa-save me-1" />{editingStructureId ? 'Modifier' : 'Ajouter'}</>}
                  </Button>
                  {editingStructureId && (
                    <Button variant="outline-secondary" size="sm" onClick={cancelEditStructure}>Annuler</Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Sites */}
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span><i className="fas fa-map-marker-alt me-1" />Sites</span>
              <Badge bg="secondary">{sites.length}</Badge>
            </Card.Header>
            <Card.Body>
              {sites.length > 0 && (
                <ListGroup variant="flush" className="mb-3">
                  {sites.map(s => (
                    <ListGroup.Item key={s.id} className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{s.name}</strong>
                        <div className="text-muted small">
                          {s.structure_name && <><i className="fas fa-building me-1" />{s.structure_name}</>}
                          {s.address && <> &mdash; {s.address}</>}
                        </div>
                      </div>
                      <Button variant="outline-primary" size="sm" onClick={() => startEditSite(s)}>
                        <i className="fas fa-pen" />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              {structures.length === 0 ? (
                <Alert variant="info" className="mb-0">Créez d'abord une structure pour pouvoir ajouter des sites.</Alert>
              ) : (
                <Form onSubmit={handleSiteSubmit}>
                  <div className="small fw-bold mb-2">
                    {editingSiteId ? 'Modifier le site' : 'Ajouter un site'}
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Control size="sm" placeholder="Nom du site *" value={siteForm.name}
                      onChange={e => setSiteForm(p => ({ ...p, name: e.target.value }))} required />
                  </Form.Group>
                  <Row className="g-2 mb-2">
                    <Col>
                      <Form.Select size="sm" value={siteForm.structure_id}
                        onChange={e => setSiteForm(p => ({ ...p, structure_id: e.target.value }))} required>
                        <option value="">-- Structure --</option>
                        {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </Form.Select>
                    </Col>
                    <Col>
                      <Form.Control size="sm" placeholder="Adresse" value={siteForm.address}
                        onChange={e => setSiteForm(p => ({ ...p, address: e.target.value }))} />
                    </Col>
                  </Row>
                  <Form.Group className="mb-2">
                    <Form.Control size="sm" placeholder="Téléphone" value={siteForm.phone}
                      onChange={e => setSiteForm(p => ({ ...p, phone: e.target.value }))} />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="success" size="sm" disabled={savingSite}>
                      {savingSite ? <Spinner size="sm" /> : <><i className="fas fa-save me-1" />{editingSiteId ? 'Modifier' : 'Ajouter'}</>}
                    </Button>
                    {editingSiteId && (
                      <Button variant="outline-secondary" size="sm" onClick={cancelEditSite}>Annuler</Button>
                    )}
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
