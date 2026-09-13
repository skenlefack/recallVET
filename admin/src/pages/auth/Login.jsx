import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.message || 'Echec de connexion')
    }
  }

  return (
    <>
      <h4 className="mb-4 text-center">Connexion</h4>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="mb-3">
          <label className="form-label">Mot de passe</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/forgot-password" className="text-decoration-none small">Mot de passe oublie ?</Link>
        </div>
        <button type="submit" className="btn btn-rv-primary w-100 py-2" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fas fa-sign-in-alt me-2" />}
          Se connecter
        </button>
      </form>
      <div className="text-center mt-3">
        <small>Pas encore de compte ? <Link to="/register" className="text-decoration-none fw-bold" style={{ color: 'var(--rv-primary)' }}>S'inscrire</Link></small>
      </div>
    </>
  )
}
