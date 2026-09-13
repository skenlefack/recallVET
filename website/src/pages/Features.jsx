import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';

const CLINIC_FEATURES = [
  { icon: 'fa-users', label: 'Gestion des propriétaires (personnes physiques et morales)' },
  { icon: 'fa-paw', label: "Dossiers patients complets avec historique médical" },
  { icon: 'fa-calendar-check', label: 'Prise de rendez-vous en ligne avec confirmation automatique' },
  { icon: 'fa-stethoscope', label: 'Consultations : anamnèse, examen clinique, diagnostic' },
  { icon: 'fa-prescription', label: 'Ordonnances électroniques et prescriptions médicales' },
  { icon: 'fa-syringe', label: 'Suivi des vaccinations et rappels automatiques' },
  { icon: 'fa-procedures', label: 'Gestion des hospitalisations et soins continus' },
  { icon: 'fa-scalpel', label: 'Suivi des actes chirurgicaux et anesthésies' },
  { icon: 'fa-microscope', label: 'Résultats de laboratoire et examens complémentaires' },
  { icon: 'fa-x-ray', label: 'Imagerie médicale : radiographies, échographies' },
  { icon: 'fa-file-medical', label: 'Certificats vétérinaires et documents officiels' },
  { icon: 'fa-share-alt', label: 'Partage de dossiers entre praticiens' },
];

const FARM_FEATURES = [
  { icon: 'fa-map', label: 'Gestion des fermes, parcelles et installations' },
  { icon: 'fa-horse', label: 'Suivi des troupeaux : bovins, ovins, caprins, volailles, porcins' },
  { icon: 'fa-map-marker-alt', label: 'Visites terrain avec géolocalisation GPS' },
  { icon: 'fa-virus', label: "Détection et gestion des épidémies et maladies" },
  { icon: 'fa-shield-virus', label: 'Programmes de prophylaxie et protocoles sanitaires' },
  { icon: 'fa-tag', label: 'Marquage individuel : boucles, puces, tatouages' },
  { icon: 'fa-baby', label: 'Suivi de la reproduction et des gestations' },
  { icon: 'fa-chart-line', label: 'Performances zootechniques : GMQ, taux de mortalité' },
  { icon: 'fa-seedling', label: "Gestion de l'alimentation et des rations" },
  { icon: 'fa-temperature-high', label: 'Surveillance sanitaire et alertes automatiques' },
  { icon: 'fa-file-chart-line', label: "Rapports d'élevage et export réglementaire" },
  { icon: 'fa-network-wired', label: 'Accès multi-fermes depuis un seul tableau de bord' },
];

const PHARMACY_FEATURES = [
  { icon: 'fa-pills', label: 'Catalogue complet de médicaments vétérinaires' },
  { icon: 'fa-boxes', label: 'Gestion des stocks en temps réel par emplacement' },
  { icon: 'fa-clock', label: 'Alertes de péremption J-30, J-15, J-7' },
  { icon: 'fa-truck', label: 'Gestion des fournisseurs et catalogues tarifaires' },
  { icon: 'fa-file-contract', label: 'Bons de commande et réceptions fournisseurs' },
  { icon: 'fa-qrcode', label: 'Traçabilité lot par lot avec numéros de série' },
  { icon: 'fa-prescription-bottle', label: 'Dispensation sur ordonnance sécurisée' },
  { icon: 'fa-cash-register', label: 'Point de vente : ventes comptoir et factures' },
  { icon: 'fa-chart-pie', label: 'Analyse des ventes par produit, catégorie, période' },
  { icon: 'fa-exclamation-triangle', label: 'Alertes de rupture de stock avec seuil configurable' },
  { icon: 'fa-sync', label: 'Synchronisation automatique avec le module clinique' },
  { icon: 'fa-file-export', label: 'Export des registres vers les autorités vétérinaires' },
];

const BILLING_FEATURES = [
  { icon: 'fa-file-invoice', label: 'Devis personnalisés avec actes et produits' },
  { icon: 'fa-receipt', label: 'Factures automatiques après consultation' },
  { icon: 'fa-credit-card', label: 'Paiement Mobile Money, carte et espèces' },
  { icon: 'fa-history', label: 'Historique des paiements et relances automatiques' },
  { icon: 'fa-chart-bar', label: 'Rapports financiers mensuels et annuels' },
  { icon: 'fa-percentage', label: 'Gestion des remises et programmes de fidélité' },
];

function FeatureBlock({ title, subtitle, icon, features, reverse }) {
  return (
    <div className={`feature-detail-block${reverse ? ' reverse' : ''}`}>
      <div className="row align-items-start g-5">
        <div className={`col-lg-4${reverse ? ' order-lg-2' : ''}`}>
          <div className="module-header">
            <div className="module-icon-lg">
              <i className={`fas ${icon}`} />
            </div>
            <div>
              <h2 className="section-title text-start" style={{ fontSize: '1.8rem' }}>{title}</h2>
            </div>
          </div>
          <p style={{ color: '#6c757d', lineHeight: '1.7', marginBottom: '1.5rem' }}>{subtitle}</p>
          <a
            href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary-brand"
          >
            <i className="fas fa-rocket" />
            Essayer gratuitement
          </a>
        </div>
        <div className={`col-lg-8${reverse ? ' order-lg-1' : ''}`}>
          <div className="feature-list">
            {features.map((f, i) => (
              <div key={i} className="fl-item">
                <i className={`fas ${f.icon}`} />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <>
      <SEO
        title="Fonctionnalités"
        description="Découvrez toutes les fonctionnalités de RecallVET : gestion clinique, suivi élevage, pharmacie vétérinaire, facturation et rapports avancés."
        url="/fonctionnalites"
        keywords="fonctionnalités vétérinaires, dossier médical animal, gestion troupeaux, pharmacie vétérinaire logiciel"
      />

      <div className="page-header page-header--features">
        <div className="container">
          <span className="badge-green mb-3" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <i className="fas fa-cubes me-2" />
            Tout ce que vous pouvez faire
          </span>
          <h1>Fonctionnalités complètes</h1>
          <p>Une plateforme pensée pour chaque aspect de votre pratique vétérinaire en Afrique</p>
        </div>
      </div>

      <div className="features-detail">
        <div className="container">
          <FeatureBlock
            title="Module Clinique"
            subtitle="Gérez l'intégralité de votre cabinet vétérinaire depuis un seul écran. Des dossiers patients aux résultats d'examens, en passant par les prescriptions et les rappels de vaccination."
            icon="fa-hospital-user"
            features={CLINIC_FEATURES}
          />

          <hr style={{ border: 'none', borderTop: '2px solid #e8f7ed', margin: '0 0 4rem' }} />

          <FeatureBlock
            title="Module Élevage"
            subtitle="Accompagnez vos clients éleveurs avec un outil de terrain puissant. Visites, événements sanitaires, performances zootechniques et programmes prophylactiques."
            icon="fa-tractor"
            features={FARM_FEATURES}
            reverse
          />

          <hr style={{ border: 'none', borderTop: '2px solid #e8f7ed', margin: '0 0 4rem' }} />

          <FeatureBlock
            title="Module Pharmacie"
            subtitle="La gestion intelligente de votre stock de médicaments vétérinaires. Zéro rupture, traçabilité parfaite, commandes fournisseurs automatisées."
            icon="fa-prescription-bottle-medical"
            features={PHARMACY_FEATURES}
          />

          <hr style={{ border: 'none', borderTop: '2px solid #e8f7ed', margin: '0 0 4rem' }} />

          <FeatureBlock
            title="Facturation & Finance"
            subtitle="De la rédaction du devis au suivi des paiements, RecallVET automatise votre cycle de facturation et vous donne une vision claire de votre performance financière."
            icon="fa-file-invoice-dollar"
            features={BILLING_FEATURES}
            reverse
          />

          <div className="text-center" style={{ marginTop: '4rem', padding: '3rem', background: '#f8fafb', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Prêt à tout gérer depuis un seul outil ?</h3>
            <p style={{ color: '#6c757d', maxWidth: 500, margin: '0 auto 1.5rem' }}>
              Rejoignez les 500+ cliniques qui font confiance à RecallVET pour simplifier leur quotidien.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`} className="btn-primary-brand">
                <i className="fas fa-rocket" /> Essai gratuit 14 jours
              </a>
              <Link to="/demo" className="btn-outline-brand">
                <i className="fas fa-play-circle" /> Demander une démo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>Prêt à tester toutes ces fonctionnalités ?</h2>
          <p>30 jours d'essai gratuit, sans engagement, sans carte bancaire.</p>
          <div className="cta-buttons">
            <a
              href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary-brand"
              style={{ background: 'linear-gradient(135deg,#f5a623,#e8870f)', boxShadow: '0 4px 18px rgba(245,166,35,0.4)' }}
            >
              <i className="fas fa-rocket" />
              Commencer l'essai gratuit
            </a>
            <Link to="/demo" className="btn-white-outline">
              <i className="fas fa-play-circle" />
              Voir la démo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
