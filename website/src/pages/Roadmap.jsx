import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';

const columns = [
  {
    title: 'Fait',
    icon: 'fa-check-circle',
    color: '#1a8b3f',
    bg: '#e8f7ed',
    items: [
      { title: 'Gestion des dossiers patients', desc: 'Dossiers complets pour animaux de compagnie et bétail' },
      { title: 'Calendrier de rendez-vous', desc: 'Planification avec rappels automatiques SMS/email' },
      { title: 'Module élevage', desc: 'Gestion des troupeaux, reproduction et suivi sanitaire' },
      { title: 'Pharmacie & stocks', desc: 'Inventaire en temps réel avec alertes de seuil' },
      { title: 'Facturation intégrée', desc: 'Génération automatique de factures et devis' },
      { title: 'Paiement mobile', desc: 'MTN MoMo, Orange Money et autres opérateurs' },
      { title: 'Tableau de bord analytique', desc: 'Statistiques et graphiques interactifs' },
      { title: 'Support multilingue', desc: 'Interface en français et anglais' },
    ],
  },
  {
    title: 'En cours',
    icon: 'fa-spinner',
    color: '#f5a623',
    bg: '#fff8ec',
    items: [
      { title: 'Application mobile', desc: 'App native iOS et Android pour les vétérinaires en déplacement' },
      { title: 'Imagerie médicale', desc: 'Stockage et visualisation de radiographies et échographies' },
      { title: 'Laboratoire intégré', desc: 'Gestion des analyses et résultats de laboratoire' },
      { title: 'API publique', desc: 'API REST documentée pour intégrations tierces' },
    ],
  },
  {
    title: 'Planifié',
    icon: 'fa-lightbulb',
    color: '#6366f1',
    bg: '#eef2ff',
    items: [
      { title: 'Intelligence artificielle', desc: 'Aide au diagnostic basée sur l\'IA et analyse prédictive' },
      { title: 'Téléconsultation', desc: 'Consultations vidéo intégrées avec partage de dossier' },
      { title: 'Marketplace', desc: 'Place de marché pour produits et équipements vétérinaires' },
      { title: 'Mode hors-ligne', desc: 'Fonctionnement sans connexion internet avec synchronisation' },
      { title: 'Multi-cliniques', desc: 'Gestion centralisée de plusieurs établissements' },
      { title: 'Portail propriétaires', desc: 'Espace client pour les propriétaires d\'animaux' },
    ],
  },
];

export default function Roadmap() {
  return (
    <>
      <SEO
        title="Feuille de route"
        description="Découvrez les fonctionnalités à venir sur RecallVET : notre feuille de route publique pour la plateforme vétérinaire."
        url="/roadmap"
      />

      <div className="page-header page-header--legal">
        <div className="container">
          <h1>Feuille de route</h1>
          <p>Découvrez ce que nous construisons pour vous</p>
        </div>
      </div>

      <section style={{ padding: '3rem 0 4rem' }}>
        <div className="container">
          <div className="row g-4">
            {columns.map((col) => (
              <div key={col.title} className="col-lg-4">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: `3px solid ${col.color}`,
                }}>
                  <i className={`fas ${col.icon}`} style={{ color: col.color, fontSize: '1.1rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f1c2e' }}>
                    {col.title}
                  </h3>
                  <span style={{
                    marginLeft: 'auto',
                    background: col.bg,
                    color: col.color,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 12,
                  }}>
                    {col.items.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {col.items.map((item) => (
                    <div key={item.title} style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '1rem 1.25rem',
                      borderLeft: `3px solid ${col.color}`,
                      transition: 'box-shadow 0.2s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f1c2e', marginBottom: '0.3rem' }}>
                        {item.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#6c757d', lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '3rem',
            background: 'linear-gradient(135deg, #e8f7ed, #f0f7f4)',
            border: '1px solid #d4edda',
            borderRadius: 16,
            padding: '2rem',
            textAlign: 'center',
          }}>
            <i className="fas fa-lightbulb" style={{ fontSize: '1.5rem', color: '#f5a623', marginBottom: '0.75rem', display: 'block' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Une idée de fonctionnalité ?</h4>
            <p style={{ color: '#6c757d', maxWidth: 500, margin: '0 auto 1rem' }}>
              Nous construisons RecallVET avec et pour les vétérinaires africains. Partagez vos suggestions !
            </p>
            <Link to="/contact" className="btn-primary-brand" style={{ display: 'inline-flex' }}>
              <i className="fas fa-paper-plane" />
              Proposer une fonctionnalité
            </Link>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/" className="btn-outline-brand">
              <i className="fas fa-arrow-left" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
