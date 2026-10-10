import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken, API_URL } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const NOTIFICATION_TYPES = [
  { event_type: 'appointment_created', label: 'Rendez-vous cree' },
  { event_type: 'appointment_cancelled', label: 'Rendez-vous annule' },
  { event_type: 'encounter_signed', label: 'Consultation signee' },
  { event_type: 'stock_low', label: 'Stock bas' },
  { event_type: 'prescription_created', label: 'Ordonnance creee' }
]

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', preferred_language: 'fr' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({})
  const [notifLoading, setNotifLoading] = useState(false)

  useEffect(() => {
    loadProfile()
    loadNotifPreferences()
  }, [])

  const loadProfile = async () => {
    const token = getToken()
    const res = await api.get('/account/profile', token)
    if (res.success) {
      setForm(res.data)
      if (res.data.avatar_url) setAvatarUrl(res.data.avatar_url)
    }
  }

  const loadNotifPreferences = async () => {
    const token = getToken()
    const res = await api.get('/v1/notifications/preferences', token)
    if (res.success) {
      const map = {}
      for (const p of res.data) {
        map[p.event_type] = p.enabled
      }
      setNotifPrefs(map)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await api.put('/account/profile', form, getToken())
    setLoading(false)
    setToast({ type: res.success ? 'success' : 'danger', message: res.message })
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setToast({ type: 'danger', message: 'Les mots de passe ne correspondent pas' })
    }
    setLoading(true)
    const res = await api.put('/account/password', passwordForm, getToken())
    setLoading(false)
    setToast({ type: res.success ? 'success' : 'danger', message: res.message })
    if (res.success) setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
    uploadAvatar(file)
  }

  const uploadAvatar = async (file) => {
    setAvatarUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await api.upload('/account/avatar', formData, getToken())
    setAvatarUploading(false)
    if (res.success) {
      setAvatarUrl(res.data.avatar_url)
      setAvatarPreview(null)
      setToast({ type: 'success', message: 'Avatar mis a jour.' })
    } else {
      setAvatarPreview(null)
      setToast({ type: 'danger', message: res.message || 'Erreur lors du telechargement.' })
    }
  }

  const resolveAvatarSrc = () => {
    if (avatarPreview) return avatarPreview
    if (avatarUrl) {
      if (avatarUrl.startsWith('/')) {
        const base = API_URL.replace(/\/api$/, '')
        return `${base}${avatarUrl}`
      }
      return avatarUrl
    }
    return null
  }

  const getInitials = () => {
    const first = (form.first_name || '').charAt(0).toUpperCase()
    const last = (form.last_name || '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  const handleNotifToggle = (eventType) => {
    setNotifPrefs(prev => ({ ...prev, [eventType]: !prev[eventType] }))
  }

  const saveNotifPreferences = async () => {
    setNotifLoading(true)
    const preferences = NOTIFICATION_TYPES.map(nt => ({
      event_type: nt.event_type,
      channel: 'in_app',
      enabled: notifPrefs[nt.event_type] !== false // default to enabled
    }))
    const res = await api.put('/v1/notifications/preferences', { preferences }, getToken())
    setNotifLoading(false)
    setToast({ type: res.success ? 'success' : 'danger', message: res.success ? 'Preferences mises a jour.' : (res.message || 'Erreur') })
  }

  const avatarSrc = resolveAvatarSrc()

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/settings">Parametres</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Profil</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-user-cog me-2" />Profil</h4>
      </div>

      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible fade show rv-toast`}>
          {toast.message}
          <button className="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card form-card">
            <div className="card-header"><i className="fas fa-id-badge me-2"></i>Informations personnelles</div>
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar"
                      className="rounded-circle object-fit-cover"
                      style={{ width: 80, height: 80, cursor: 'pointer' }}
                      onClick={() => avatarInputRef.current?.click()} />
                  ) : (
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                      style={{ width: 80, height: 80, fontSize: '1.75rem', cursor: 'pointer' }}
                      onClick={() => avatarInputRef.current?.click()}>
                      {getInitials()}
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <div className="spinner-border spinner-border-sm text-white" />
                    </div>
                  )}
                  <button type="button"
                    className="btn btn-sm btn-outline-secondary rounded-circle position-absolute"
                    style={{ bottom: -4, right: -4, width: 28, height: 28, padding: 0 }}
                    onClick={() => avatarInputRef.current?.click()}
                    title="Changer l'avatar">
                    <i className="fas fa-camera" style={{ fontSize: '0.7rem' }} />
                  </button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png"
                  className="d-none" onChange={handleAvatarSelect} />
                <div className="mt-2 text-muted small">{form.email || ''}</div>
              </div>
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Prenom</label>
                  <input className="form-control" value={form.first_name || ''} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nom</label>
                  <input className="form-control" value={form.last_name || ''} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={form.email || ''} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">Telephone</label>
                  <input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Langue</label>
                  <select className="form-select" value={form.preferred_language || 'fr'} onChange={e => setForm({ ...form, preferred_language: e.target.value })}>
                    <option value="fr">Francais</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-rv-primary" disabled={loading}>
                  <i className="fas fa-save me-2"></i>Enregistrer
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card form-card">
            <div className="card-header"><i className="fas fa-shield-alt me-2"></i>Changer le mot de passe</div>
            <div className="card-body">
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Mot de passe actuel</label>
                  <input type="password" className="form-control" value={passwordForm.current_password}
                    onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nouveau mot de passe</label>
                  <input type="password" className="form-control" value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmer</label>
                  <input type="password" className="form-control" value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-outline-warning" disabled={loading}>
                  <i className="fas fa-key me-2"></i>Changer
                </button>
              </form>
            </div>
          </div>

          <div className="card form-card mt-4">
            <div className="card-header"><i className="fas fa-bell me-2"></i>Preferences de notifications</div>
            <div className="card-body">
              {NOTIFICATION_TYPES.map(nt => (
                <div key={nt.event_type} className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" role="switch"
                    id={`notif-${nt.event_type}`}
                    checked={notifPrefs[nt.event_type] !== false}
                    onChange={() => handleNotifToggle(nt.event_type)} />
                  <label className="form-check-label" htmlFor={`notif-${nt.event_type}`}>
                    {nt.label}
                  </label>
                </div>
              ))}
              <button type="button" className="btn btn-rv-primary" disabled={notifLoading}
                onClick={saveNotifPreferences}>
                <i className="fas fa-save me-2"></i>Enregistrer les preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
