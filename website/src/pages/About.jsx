import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';

const VALUE_ICONS = ['fa-lightbulb', 'fa-shield-halved', 'fa-handshake', 'fa-earth-africa'];

const TEAM = [
  { initial: 'KT', name: 'Kenfack Tchinda', role: 'CEO & Co-fondateur', bg: 'linear-gradient(135deg,#1a8b3f,#2db85a)' },
  { initial: 'AF', name: 'Amara Fofana', role: 'CTO & Co-fondateur', bg: 'linear-gradient(135deg,#354e84,#4a6ab8)' },
  { initial: 'EA', name: 'Estelle Akoua', role: 'Head of Product', bg: 'linear-gradient(135deg,#f5a623,#e8870f)' },
  { initial: 'BN', name: 'Boubacar Ndiaye', role: 'Lead Vétérinaire', bg: 'linear-gradient(135deg,#6c3483,#9b59b6)' },
  { initial: 'OA', name: 'Oluwaseun Adeyemi', role: 'Business Development', bg: 'linear-gradient(135deg,#1a5276,#2980b9)' },
  { initial: 'MK', name: 'Marie Kouassi', role: 'Customer Success', bg: 'linear-gradient(135deg,#922b21,#e74c3c)' },
];

export default function About() {
  const { t } = useTranslation();
  const values = t('about.values', { returnObjects: true });

  return (
    <>
      <SEO
        title="À propos"
        description="Découvrez l'histoire, la mission et l'équipe derrière RecallVET – la plateforme vétérinaire conçue pour l'Afrique."
        url="/a-propos"
      />

      <div className="page-header page-header--about">
        <div className="container">
          <h1>{t('about.title')}</h1>
          <p>{t('about.subtitle')}</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="about-section">
        <div className="container">
          <div className="row g-5 align-items-center mb-6">
            <div className="col-lg-6">
              <span className="badge-green mb-3">
                <i className="fas fa-bullseye me-2" />
                Mission
              </span>
              <h2 className="section-title text-start">{t('about.mission_title')}</h2>
              <p style={{ color: '#6c757d', lineHeight: 1.8, fontSize: '1rem' }}>{t('about.mission_text')}</p>
            </div>
            <div className="col-lg-6">
              <div style={{
                background: 'linear-gradient(135deg,#0d4f2b,#1a8b3f)',
                borderRadius: 20,
                padding: '2.5rem',
                color: '#fff',
              }}>
                <i className="fas fa-quote-left" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '1rem', display: 'block' }} />
                <p style={{ fontSize: '1.1rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                  "Chaque vétérinaire africain mérite les mêmes outils que ses confrères des pays développés. RecallVET comble ce fossé numérique."
                </p>
                <div style={{ marginTop: '1.25rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  — Kenfack Tchinda, CEO RecallVET
                </div>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="row g-5 align-items-center mb-5" style={{ marginTop: '2rem' }}>
            <div className="col-lg-6 order-lg-2">
              <span className="badge-green mb-3">
                <i className="fas fa-eye me-2" />
                Vision
              </span>
              <h2 className="section-title text-start">{t('about.vision_title')}</h2>
              <p style={{ color: '#6c757d', lineHeight: 1.8 }}>{t('about.vision_text')}</p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a8b3f' }}>2030</div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Objectif continental</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a8b3f' }}>50</div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Pays cibles</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a8b3f' }}>10K+</div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Cliniques visées</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div style={{
                background: '#f8fafb',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                {['Cameroun', 'Sénégal', 'Côte d\'Ivoire', 'Ghana', 'Nigeria', 'Kenya', 'Tanzanie', 'Rwanda'].map((c) => (
                  <div key={c} style={{
                    background: '#fff',
                    border: '1px solid #e8f7ed',
                    borderRadius: 10,
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0f1c2e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <i className="fas fa-map-pin" style={{ color: '#1a8b3f', fontSize: '0.75rem' }} />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section style={{ padding: '3rem 0', background: '#fff' }}>
        <div className="container">
          <div className="row g-4 text-center">
            {[
              { value: '2022', label: 'Année de création', icon: 'fa-calendar' },
              { value: '500+', label: 'Cliniques actives', icon: 'fa-hospital' },
              { value: '50K+', label: 'Animaux suivis', icon: 'fa-paw' },
              { value: '15', label: 'Pays en Afrique', icon: 'fa-earth-africa' },
              { value: '99.9%', label: 'Disponibilité', icon: 'fa-shield-halved' },
              { value: '24h', label: 'Temps de réponse', icon: 'fa-headset' }
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-2">
                <div style={{
                  padding: '1.5rem 0.5rem',
                  borderRadius: 16,
                  transition: 'all 0.3s',
                }}>
                  <i className={`fas ${s.icon}`} style={{ fontSize: '1.5rem', color: '#1a8b3f', marginBottom: '0.75rem', display: 'block' }} />
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f1c2e', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.82rem', color: '#6c757d', marginTop: '0.3rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '4rem 0', background: '#f8fafb' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge-green mb-3">
              <i className="fas fa-heart me-2" />
              Ce qui nous guide
            </span>
            <h2 className="section-title">{t('about.values_title')}</h2>
          </div>
          <div className="row g-4">
            {Array.isArray(values) && values.map((v, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="value-card">
                  <div className="value-icon">
                    <i className={`fas ${VALUE_ICONS[i] || 'fa-star'}`} />
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '4rem 0', background: '#f8fafb' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge-green mb-3">
              <i className="fas fa-history me-2" />
              Notre parcours
            </span>
            <h2 className="section-title">L'histoire RecallVET</h2>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom,#1a8b3f,#2db85a)', opacity: 0.3 }} />
            {[
              { year: '2022', title: 'L\'idée', desc: 'Un vétérinaire camerounais frustré par les dossiers papier partage son vécu avec un développeur. L\'idée de RecallVET est née.' },
              { year: '2023 T1', title: 'Le prototype', desc: 'Première version du module clinique testée dans 3 cabinets vétérinaires à Yaoundé. 94% de satisfaction.' },
              { year: '2023 T3', title: 'Lancement bêta', desc: 'Ouverture du bêta à 50 cliniques dans 5 pays (Cameroun, Sénégal, CI, Ghana, Nigeria).' },
              { year: '2024 T1', title: 'Version 1.0', desc: 'Lancement officiel avec les 3 modules complets. 150 cliniques actives dès le premier mois.' },
              { year: '2025', title: 'Expansion', desc: '500+ cliniques, 15 pays, nouvelle levée de fonds pour accélérer le développement mobile.' },
              { year: '2026', title: 'Version 2.0', desc: 'Intelligence artificielle, app mobile hors-ligne, intégration labs partenaires et API publique.' },
            ].map((event, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', paddingLeft: '2.5rem', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: '0.25rem',
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1a8b3f,#2db85a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                  zIndex: 1,
                }}>
                  {event.year}
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.25rem', flex: 1 }}>
                  <h5 style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#0f1c2e' }}>{event.title}</h5>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', lineHeight: 1.6 }}>{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>Rejoignez l'aventure RecallVET</h2>
          <p>Faites partie des pionniers qui transforment la médecine vétérinaire africaine.</p>
          <div className="cta-buttons">
            <a
              href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary-brand"
              style={{ background: 'linear-gradient(135deg,#f5a623,#e8870f)', boxShadow: '0 4px 18px rgba(245,166,35,0.4)' }}
            >
              <i className="fas fa-rocket" />
              Commencer gratuitement
            </a>
            <Link to="/contact" className="btn-white-outline">
              <i className="fas fa-envelope" />
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
