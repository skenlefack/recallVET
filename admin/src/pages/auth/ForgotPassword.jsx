import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await api.post('/auth/forgot-password', { email })
    setLoading(false)
    if (res.success) setSent(true)
    else setError(res.message || 'Erreur')
  }

  if (sent) {
    return (
      <div className="text-center">
        <i className="fas fa-envelope-open-text text-success fs-1 mb-3"></i>
        <h5>Email envoye !</h5>
        <p className="text-muted">Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.</p>
        <Link to="/login" className="btn btn-outline-success">Retour a la connexion</Link>
      </div>
    )
  }

  return (
    <>
      <h4 className="mb-3 text-center">Mot de passe oublie</h4>
      <p className="text-muted text-center small mb-3">Entrez votre email pour recevoir un lien de reinitialisation</p>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input type="email" className="form-control" placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <button type="submit" className="btn btn-rv-primary w-100 py-2" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          Envoyer le lien
        </button>
      </form>
      <div className="text-center mt-3">
        <Link to="/login" className="text-decoration-none small">Retour a la connexion</Link>
      </div>
    </>
  )
}
