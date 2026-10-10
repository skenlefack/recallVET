import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page introuvable"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        url="/404"
      />

      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1rem',
      }}>
        <div>
          <div style={{ fontSize: '5rem', fontWeight: 800, color: '#1a8b3f', lineHeight: 1, marginBottom: '1rem' }}>
            404
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f1c2e', marginBottom: '0.75rem' }}>
            Page introuvable
          </h1>
          <p style={{ color: '#6c757d', fontSize: '1.05rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link to="/" className="btn-primary-brand">
            <i className="fas fa-home me-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
}
