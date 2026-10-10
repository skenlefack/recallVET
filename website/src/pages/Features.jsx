import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';

function useScrollReveal() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, revealed];
}

const CLINIC_ICONS = [
  'fa-users', 'fa-paw', 'fa-calendar-check', 'fa-stethoscope',
  'fa-prescription', 'fa-syringe', 'fa-procedures', 'fa-scalpel',
  'fa-microscope', 'fa-x-ray', 'fa-file-medical', 'fa-share-alt',
];

const FARM_ICONS = [
  'fa-map', 'fa-horse', 'fa-map-marker-alt', 'fa-virus',
  'fa-shield-virus', 'fa-tag', 'fa-baby', 'fa-chart-line',
  'fa-seedling', 'fa-temperature-high', 'fa-file-chart-line', 'fa-network-wired',
];

const PHARMACY_ICONS = [
  'fa-pills', 'fa-boxes', 'fa-clock', 'fa-truck',
  'fa-file-contract', 'fa-qrcode', 'fa-prescription-bottle', 'fa-cash-register',
  'fa-chart-pie', 'fa-exclamation-triangle', 'fa-sync', 'fa-file-export',
];

const BILLING_ICONS = [
  'fa-file-invoice', 'fa-receipt', 'fa-credit-card',
  'fa-history', 'fa-chart-bar', 'fa-percentage',
];

function FeatureBlock({ title, subtitle, headerIcon, icons, features, reverse, color, t }) {
  const [ref, revealed] = useScrollReveal();
  return (
    <div className={`feature-detail-block reveal-section ${revealed ? 'revealed' : ''}${reverse ? ' reverse' : ''}`} ref={ref}>
      <div className="row align-items-start g-5">
        <div className={`col-lg-4${reverse ? ' order-lg-2' : ''}`}>
          <div className="module-header">
            <div className="module-icon-lg" style={color ? { background: color } : {}}>
              <i className={`fas ${headerIcon}`} />
            </div>
            <div>
              <h2 className="section-title text-start" style={{ fontSize: '1.8rem' }}>{title}</h2>
            </div>
          </div>
          <p style={{ color: '#6c757d', lineHeight: '1.7', marginBottom: '1rem' }}>{subtitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              background: color || '#e8f7ed', borderRadius: 10, padding: '0.5rem 1rem',
              fontWeight: 800, fontSize: '1.5rem', color: color ? 'white' : '#1a8b3f'
            }}>
              {features.length}
            </div>
            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{t('common.features_included')}</span>
          </div>
          <a
            href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary-brand"
          >
            <i className="fas fa-rocket" />
            {t('common.try_free')}
          </a>
        </div>
        <div className={`col-lg-8${reverse ? ' order-lg-1' : ''}`}>
          <div className="feature-list">
            {features.map((label, i) => (
              <div key={i} className="fl-item">
                <i className={`fas ${icons[i]}`} style={color ? { color } : {}} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const { t } = useTranslation();

  const clinicFeatures = t('features_page.clinic_features', { returnObjects: true });
  const farmFeatures = t('features_page.farm_features', { returnObjects: true });
  const pharmacyFeatures = t('features_page.pharmacy_features', { returnObjects: true });
  const billingFeatures = t('features_page.billing_features', { returnObjects: true });

  return (
    <>
      <SEO
        title={t('features_page.seo_title')}
        description={t('features_page.seo_description')}
        url="/fonctionnalites"
        keywords="fonctionnalités vétérinaires, dossier médical animal, gestion troupeaux, pharmacie vétérinaire logiciel"
      />

      <div className="page-header page-header--features">
        <div className="container">
          <span className="badge-green mb-3" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <i className="fas fa-cubes me-2" />
            {t('features_page.badge')}
          </span>
          <h1>{t('features_page.title')}</h1>
          <p>{t('features_page.subtitle')}</p>
        </div>
      </div>

      <div className="features-detail">
        <div className="container">
          <FeatureBlock
            title={t('features_page.clinic_title')}
            subtitle={t('features_page.clinic_subtitle')}
            headerIcon="fa-hospital-user"
            icons={CLINIC_ICONS}
            features={Array.isArray(clinicFeatures) ? clinicFeatures : []}
            color="#1a8b3f"
            t={t}
          />

          <hr style={{ border: 'none', borderTop: '2px solid #e8f7ed', margin: '0 0 4rem' }} />

          <FeatureBlock
            title={t('features_page.farm_title')}
            subtitle={t('features_page.farm_subtitle')}
            headerIcon="fa-tractor"
            icons={FARM_ICONS}
            features={Array.isArray(farmFeatures) ? farmFeatures : []}
            reverse
            color="#c17817"
            t={t}
          />

          <hr style={{ border: 'none', borderTop: '2px solid #e8f7ed', margin: '0 0 4rem' }} />

          <FeatureBlock
            title={t('features_page.pharmacy_title')}
            subtitle={t('features_page.pharmacy_subtitle')}
            headerIcon="fa-prescription-bottle-medical"
            icons={PHARMACY_ICONS}
            features={Array.isArray(pharmacyFeatures) ? pharmacyFeatures : []}
            color="#2563eb"
            t={t}
          />

          <hr style={{ border: 'none', borderTop: '2px solid #e8f7ed', margin: '0 0 4rem' }} />

          <FeatureBlock
            title={t('features_page.billing_title')}
            subtitle={t('features_page.billing_subtitle')}
            headerIcon="fa-file-invoice-dollar"
            icons={BILLING_ICONS}
            features={Array.isArray(billingFeatures) ? billingFeatures : []}
            reverse
            color="#9C27B0"
            t={t}
          />

          <div className="text-center" style={{ marginTop: '4rem', padding: '3rem', background: '#f8fafb', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>{t('features_page.cta_title')}</h3>
            <p style={{ color: '#6c757d', maxWidth: 500, margin: '0 auto 1.5rem' }}>
              {t('features_page.cta_subtitle')}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`} className="btn-primary-brand">
                <i className="fas fa-rocket" /> {t('common.free_trial_14')}
              </a>
              <Link to="/demo" className="btn-outline-brand">
                <i className="fas fa-play-circle" /> {t('common.request_demo')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>{t('features_page.cta_banner_title')}</h2>
          <p>{t('features_page.cta_banner_subtitle')}</p>
          <div className="cta-buttons">
            <a
              href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary-brand"
              style={{ background: 'linear-gradient(135deg,#f5a623,#e8870f)', boxShadow: '0 4px 18px rgba(245,166,35,0.4)' }}
            >
              <i className="fas fa-rocket" />
              {t('common.start_free_trial')}
            </a>
            <Link to="/demo" className="btn-white-outline">
              <i className="fas fa-play-circle" />
              {t('common.see_demo')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
