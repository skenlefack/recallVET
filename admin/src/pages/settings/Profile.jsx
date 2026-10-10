import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', preferred_language: 'fr' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const token = getToken()
    const res = await api.get('/account/profile', token)
    if (res.success) setForm(res.data)
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

  const getInitials = () => {
    const first = (form.first_name || '').charAt(0).toUpperCase()
    const last = (form.last_name || '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  return (
    <div>
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/settings">Paramètres</Link>
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
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                  style={{ width: 80, height: 80, fontSize: '1.75rem' }}>
                  {getInitials()}
                </div>
                <div className="mt-2 text-muted small">{form.email || ''}</div>
              </div>
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Prénom</label>
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
                  <label className="form-label">Téléphone</label>
                  <input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Langue</label>
                  <select className="form-select" value={form.preferred_language || 'fr'} onChange={e => setForm({ ...form, preferred_language: e.target.value })}>
                    <option value="fr">Français</option>
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
        </div>
      </div>
    </div>
  )
}
