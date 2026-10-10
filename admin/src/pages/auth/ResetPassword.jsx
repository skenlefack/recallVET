import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    const res = await api.post('/auth/reset-password', { token, password })
    setLoading(false)

    if (res.success) setSuccess(true)
    else setError(res.message || 'Erreur lors de la reinitialisation')
  }

  if (!token) {
    return (
      <div className="text-center">
        <i className="fas fa-exclamation-triangle text-warning fs-1 mb-3"></i>
        <h5>Lien invalide</h5>
        <p className="text-muted">Le lien de reinitialisation est invalide ou a expire.</p>
        <Link to="/forgot-password" className="btn btn-outline-success">Demander un nouveau lien</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <i className="fas fa-check-circle text-success fs-1 mb-3"></i>
        <h5>Mot de passe reinitialise !</h5>
        <p className="text-muted">Votre mot de passe a ete modifie avec succes. Vous pouvez maintenant vous connecter.</p>
        <Link to="/login" className="btn btn-outline-success">Se connecter</Link>
      </div>
    )
  }

  return (
    <>
      <h4 className="mb-3 text-center">Nouveau mot de passe</h4>
      <p className="text-muted text-center small mb-3">Entrez votre nouveau mot de passe</p>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input type="password" className="form-control" placeholder="Nouveau mot de passe" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
        </div>
        <div className="mb-3">
          <input type="password" className="form-control" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-rv-primary w-100 py-2" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          Reinitialiser le mot de passe
        </button>
      </form>
      <div className="text-center mt-3">
        <Link to="/login" className="text-decoration-none small">Retour a la connexion</Link>
      </div>
    </>
  )
}
