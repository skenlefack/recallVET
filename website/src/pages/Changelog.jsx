import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';

const releases = [
  {
    version: 'v1.2.0',
    date: '1er octobre 2026',
    tag: 'Dernière version',
    changes: [
      'Nouveau module de gestion de pharmacie avec suivi des stocks en temps réel',
      'Alertes SMS et WhatsApp pour les rappels de vaccination',
      'Tableau de bord analytique avec graphiques interactifs',
      'Export des données au format PDF et Excel',
      'Amélioration des performances de chargement (40% plus rapide)',
    ],
  },
  {
    version: 'v1.1.0',
    date: '15 juillet 2026',
    tag: null,
    changes: [
      'Module élevage : gestion des troupeaux et suivi de reproduction',
      'Système de facturation intégré avec génération automatique',
      'Support multilingue (français, anglais)',
      'Intégration du paiement mobile (MTN MoMo, Orange Money)',
      'Gestion des rôles et permissions (admin, vétérinaire, assistant)',
    ],
  },
  {
    version: 'v1.0.1',
    date: '20 mai 2026',
    tag: null,
    changes: [
      'Correction de bugs sur la gestion des rendez-vous',
      'Amélioration de la compatibilité mobile',
      'Optimisation des temps de réponse de l\'API',
      'Correction de l\'affichage des dates en fuseau horaire WAT',
    ],
  },
  {
    version: 'v1.0.0',
    date: '1er avril 2026',
    tag: 'Version initiale',
    changes: [
      'Lancement de RecallVET : plateforme SaaS vétérinaire',
      'Gestion des dossiers patients (animaux de compagnie et bétail)',
      'Calendrier de rendez-vous avec rappels automatiques',
      'Gestion des propriétaires et de leurs animaux',
      'Système d\'authentification sécurisé avec 2FA',
      'Interface responsive adaptée aux mobiles',
    ],
  },
];

export default function Changelog() {
  return (
    <>
      <SEO
        title="Journal des modifications"
        description="Suivez l'évolution de RecallVET : nouvelles fonctionnalités, améliorations et corrections de bugs."
        url="/changelog"
      />

      <div className="page-header page-header--legal">
        <div className="container">
          <h1>Journal des modifications</h1>
          <p>Suivez l'évolution de RecallVET version par version</p>
        </div>
      </div>

      <div className="container">
        <div className="legal-page">
          <div className="changelog-timeline">
            {releases.map((release, idx) => (
              <div key={release.version} className="changelog-entry" style={{
                position: 'relative',
                paddingLeft: '2rem',
                paddingBottom: idx < releases.length - 1 ? '2.5rem' : '0',
                borderLeft: idx < releases.length - 1 ? '2px solid #d4edda' : '2px solid transparent',
              }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  top: '4px',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: idx === 0 ? '#1a8b3f' : '#d4edda',
                  border: idx === 0 ? '3px solid #e8f7ed' : '3px solid #fff',
                }} />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.75rem',
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f1c2e' }}>
                    {release.version}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    <i className="fas fa-calendar-alt me-1" />
                    {release.date}
                  </span>
                  {release.tag && (
                    <span style={{
                      background: idx === 0 ? '#1a8b3f' : '#e8f7ed',
                      color: idx === 0 ? '#fff' : '#1a8b3f',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 20,
                    }}>
                      {release.tag}
                    </span>
                  )}
                </div>

                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {release.changes.map((change, i) => (
                    <li key={i} style={{ marginBottom: '0.4rem', lineHeight: 1.6, color: '#4a5568' }}>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3rem' }}>
            <Link to="/" className="btn-outline-brand">
              <i className="fas fa-arrow-left" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
