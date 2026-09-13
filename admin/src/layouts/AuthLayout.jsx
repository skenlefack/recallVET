import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-success" /></div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="auth-page d-flex min-vh-100">
      {/* Left branded panel */}
      <div className="auth-brand-panel d-none d-lg-flex">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <i className="fas fa-paw" />
            <span>RecallVET</span>
          </div>
          <h2>La plateforme vétérinaire #1 en Afrique</h2>
          <p>Gérez votre clinique, élevage et pharmacie depuis un seul outil moderne et intuitif.</p>
          <div className="auth-brand-features">
            <div className="auth-feature"><i className="fas fa-check-circle" /> Clinique & dossiers patients</div>
            <div className="auth-feature"><i className="fas fa-check-circle" /> Pharmacie & gestion stock</div>
            <div className="auth-feature"><i className="fas fa-check-circle" /> Élevage & suivi sanitaire</div>
            <div className="auth-feature"><i className="fas fa-check-circle" /> Facturation & rapports</div>
          </div>
          <div className="auth-brand-stats">
            <div><strong>500+</strong><span>Cliniques</span></div>
            <div><strong>15</strong><span>Pays</span></div>
            <div><strong>99.9%</strong><span>Uptime</span></div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel d-flex align-items-center justify-content-center flex-grow-1">
        <div className="auth-form-container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
