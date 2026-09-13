import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Form, Card, Row, Col, Button, Alert, Spinner, Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { api, getToken, API_URL } from '../../services/api'
import CountrySelect from '../../components/CountrySelect'

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

  useEffect(() => {
    loadSettings()
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
    </div>
  )
}
