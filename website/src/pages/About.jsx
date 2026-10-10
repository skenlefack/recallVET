import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';

const VALUE_ICONS = ['fa-lightbulb', 'fa-shield-halved', 'fa-handshake', 'fa-earth-africa'];

const TEAM = [
  { initial: 'KT', name: 'Kenfack Tchinda', roleKey: 'ceo', bg: 'linear-gradient(135deg,#1a8b3f,#2db85a)' },
  { initial: 'AF', name: 'Amara Fofana', roleKey: 'cto', bg: 'linear-gradient(135deg,#354e84,#4a6ab8)' },
  { initial: 'EA', name: 'Estelle Akoua', roleKey: 'product', bg: 'linear-gradient(135deg,#f5a623,#e8870f)' },
  { initial: 'BN', name: 'Boubacar Ndiaye', roleKey: 'vet', bg: 'linear-gradient(135deg,#6c3483,#9b59b6)' },
  { initial: 'OA', name: 'Oluwaseun Adeyemi', roleKey: 'bizdev', bg: 'linear-gradient(135deg,#1a5276,#2980b9)' },
  { initial: 'MK', name: 'Marie Kouassi', roleKey: 'success', bg: 'linear-gradient(135deg,#922b21,#e74c3c)' },
];

export default function About() {
  const { t } = useTranslation();
  const values = t('about.values', { returnObjects: true });
  const keyNumbers = t('about_page.key_numbers', { returnObjects: true });
  const keyNumberIcons = t('about_page.key_numbers_icons', { returnObjects: true });
  const countriesList = t('about_page.countries_list', { returnObjects: true });
  const timeline = t('about_page.timeline', { returnObjects: true });

  return (
    <>
      <SEO
        title={t('about_page.seo_title')}
        description={t('about_page.seo_description')}
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
                {t('about_page.mission_badge')}
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
                  "{t('about_page.quote')}"
                </p>
                <div style={{ marginTop: '1.25rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  {t('about_page.quote_author')}
                </div>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="row g-5 align-items-center mb-5" style={{ marginTop: '2rem' }}>
            <div className="col-lg-6 order-lg-2">
              <span className="badge-green mb-3">
                <i className="fas fa-eye me-2" />
                {t('about_page.vision_badge')}
              </span>
              <h2 className="section-title text-start">{t('about.vision_title')}</h2>
              <p style={{ color: '#6c757d', lineHeight: 1.8 }}>{t('about.vision_text')}</p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a8b3f' }}>2030</div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{t('about_page.vision_2030')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a8b3f' }}>50</div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{t('about_page.vision_countries')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a8b3f' }}>10K+</div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{t('about_page.vision_clinics')}</div>
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
                {Array.isArray(countriesList) && countriesList.map((c) => (
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
            {Array.isArray(keyNumbers) && keyNumbers.map((s, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-2">
                <div style={{
                  padding: '1.5rem 0.5rem',
                  borderRadius: 16,
                  transition: 'all 0.3s',
                }}>
                  <i className={`fas ${Array.isArray(keyNumberIcons) ? keyNumberIcons[i] : 'fa-star'}`} style={{ fontSize: '1.5rem', color: '#1a8b3f', marginBottom: '0.75rem', display: 'block' }} />
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
              {t('about_page.values_badge')}
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

      {/* Team */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge-green mb-3">
              <i className="fas fa-users me-2" />
              {t('about_page.team_title')}
            </span>
            <h2 className="section-title">{t('about_page.team_title')}</h2>
            <p className="section-subtitle">{t('about_page.team_subtitle')}</p>
          </div>
          <div className="row g-4 justify-content-center">
            {TEAM.map((member) => (
              <div key={member.initial} className="col-6 col-md-4 col-lg-2">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: member.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    margin: '0 auto 1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  }}>
                    {member.initial}
                  </div>
                  <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#0f1c2e' }}>
                    {member.name}
                  </h5>
                  <p style={{ fontSize: '0.82rem', color: '#6c757d', margin: 0 }}>
                    {t(`about_page.team_roles.${member.roleKey}`)}
                  </p>
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
              {t('about_page.timeline_badge')}
            </span>
            <h2 className="section-title">{t('about_page.timeline_title')}</h2>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom,#1a8b3f,#2db85a)', opacity: 0.3 }} />
            {Array.isArray(timeline) && timeline.map((event, i) => (
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
          <h2>{t('common.join_adventure')}</h2>
          <p>{t('common.join_adventure_desc')}</p>
          <div className="cta-buttons">
            <a
              href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary-brand"
              style={{ background: 'linear-gradient(135deg,#f5a623,#e8870f)', boxShadow: '0 4px 18px rgba(245,166,35,0.4)' }}
            >
              <i className="fas fa-rocket" />
              {t('common.start_free')}
            </a>
            <Link to="/contact" className="btn-white-outline">
              <i className="fas fa-envelope" />
              {t('common.contact_us_link')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
