import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirm_password: '', first_name: '', last_name: '', phone: '', practice_name: '', practice_type: 'mixed', country_code: 'CM' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) return setError('Les mots de passe ne correspondent pas')
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caracteres')
    setLoading(true)
    const res = await register(form)
    setLoading(false)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.message || "Echec de l'inscription")
    }
  }

  return (
    <>
      <h4 className="mb-3 text-center">Creer un compte</h4>
      <p className="text-muted text-center small mb-3">Essai gratuit de 14 jours - Toutes fonctionnalites</p>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6 mb-2">
            <input type="text" className="form-control form-control-sm" name="first_name" placeholder="Prenom *" value={form.first_name} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-2">
            <input type="text" className="form-control form-control-sm" name="last_name" placeholder="Nom *" value={form.last_name} onChange={handleChange} required />
          </div>
        </div>
        <div className="mb-2">
          <input type="email" className="form-control form-control-sm" name="email" placeholder="Email *" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <input type="tel" className="form-control form-control-sm" name="phone" placeholder="Telephone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <input type="text" className="form-control form-control-sm" name="practice_name" placeholder="Nom du cabinet / clinique" value={form.practice_name} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <select className="form-select form-select-sm" name="practice_type" value={form.practice_type} onChange={handleChange}>
            <option value="clinic">Clinique veterinaire</option>
            <option value="pharmacy">Pharmacie veterinaire</option>
            <option value="farm_practice">Cabinet rural / Elevage</option>
            <option value="mixed">Mixte</option>
          </select>
        </div>
        <div className="row mb-2">
          <div className="col-6">
            <input type="password" className="form-control form-control-sm" name="password" placeholder="Mot de passe *" value={form.password} onChange={handleChange} required />
          </div>
          <div className="col-6">
            <input type="password" className="form-control form-control-sm" name="confirm_password" placeholder="Confirmer *" value={form.confirm_password} onChange={handleChange} required />
          </div>
        </div>
        <button type="submit" className="btn btn-rv-primary w-100 py-2 mt-2" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fas fa-rocket me-2" />}
          Demarrer l'essai gratuit
        </button>
      </form>
      <div className="text-center mt-3">
        <small>Deja un compte ? <Link to="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--rv-primary)' }}>Se connecter</Link></small>
      </div>
    </>
  )
}
