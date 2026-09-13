import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';

const COMPARISON = [
  { feature: 'Nombre d\'utilisateurs', starter: '1', pro: '5', enterprise: 'Illimité' },
  { feature: 'Patients / animaux', starter: '200', pro: 'Illimité', enterprise: 'Illimité' },
  { feature: 'Module Clinique', starter: true, pro: true, enterprise: true },
  { feature: 'Module Élevage', starter: false, pro: 'En option', enterprise: true },
  { feature: 'Module Pharmacie', starter: false, pro: true, enterprise: true },
  { feature: 'Facturation intégrée', starter: false, pro: true, enterprise: true },
  { feature: 'Rappels Email', starter: true, pro: true, enterprise: true },
  { feature: 'Rappels SMS', starter: false, pro: true, enterprise: true },
  { feature: 'Rapports de base', starter: true, pro: true, enterprise: true },
  { feature: 'Rapports avancés', starter: false, pro: true, enterprise: true },
  { feature: 'Export PDF / Excel', starter: false, pro: true, enterprise: true },
  { feature: 'Accès API', starter: false, pro: true, enterprise: true },
  { feature: 'Multi-sites', starter: false, pro: false, enterprise: true },
  { feature: 'White-label / personnalisation', starter: false, pro: false, enterprise: true },
  { feature: 'Support email', starter: true, pro: true, enterprise: true },
  { feature: 'Support prioritaire', starter: false, pro: true, enterprise: true },
  { feature: 'Account manager dédié', starter: false, pro: false, enterprise: true },
  { feature: 'Formation en ligne', starter: false, pro: true, enterprise: true },
  { feature: 'Formation sur site', starter: false, pro: false, enterprise: true },
  { feature: 'SLA garanti 99.9%', starter: false, pro: false, enterprise: true },
  { feature: 'Intégration sur mesure', starter: false, pro: false, enterprise: true },
];

function CompCell({ value }) {
  if (value === true) return <td className="text-center"><i className="fas fa-check-circle" style={{ color: '#1a8b3f', fontSize: '1.1rem' }} /></td>;
  if (value === false) return <td className="text-center"><i className="fas fa-minus" style={{ color: '#ccc' }} /></td>;
  return <td className="text-center" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#495057' }}>{value}</td>;
}

export default function Pricing() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = t('pricing.faq', { returnObjects: true });

  const plans = [
    { key: 'starter', popular: false },
    { key: 'pro', popular: true },
    { key: 'enterprise', popular: false },
  ];

  return (
    <>
      <SEO
        title="Tarifs"
        description="Découvrez les tarifs transparents de RecallVET. Plans Starter, Pro et Enterprise adaptés à toutes les tailles de structure vétérinaire en Afrique."
        url="/tarifs"
        keywords="tarif logiciel vétérinaire, prix RecallVET, abonnement vétérinaire Afrique, SaaS vétérinaire prix"
      />

      <div className="page-header page-header--pricing">
        <div className="container">
          <span className="badge-green mb-3" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <i className="fas fa-tags me-2" />
            Tarifs simples et transparents
          </span>
          <h1>{t('pricing.title')}</h1>
          <p>{t('pricing.subtitle')}</p>
        </div>
      </div>

      {/* Plan cards */}
      <section className="pricing-section" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <div className="row g-4 justify-content-center">
            {plans.map((p) => {
              const feats = t(`pricing.${p.key}_features`, { returnObjects: true });
              return (
                <div key={p.key} className="col-md-4">
                  <div className={`pricing-card${p.popular ? ' popular' : ''}`}>
                    {p.popular && (
                      <div className="popular-badge">
                        <i className="fas fa-fire" />
                        {t('pricing.popular')}
                      </div>
                    )}
                    <div className="plan-name">{t(`pricing.${p.key}_name`)}</div>
                    <div className="plan-price">
                      <span className="currency">{t(`pricing.${p.key}_currency`)}</span>
                      {t(`pricing.${p.key}_price`)}
                      <span className="period"> /{t('pricing.monthly')}</span>
                    </div>
                    <p className="plan-desc">{t(`pricing.${p.key}_desc`)}</p>
                    <ul className="plan-features">
                      {Array.isArray(feats) && feats.map((f, i) => (
                        <li key={i}>
                          <i className="fas fa-check-circle" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="plan-cta">
                      {p.key === 'enterprise' ? (
                        <Link to="/contact" className="btn-outline-brand w-100 justify-content-center">
                          {t('pricing.cta_enterprise')}
                        </Link>
                      ) : (
                        <a
                          href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
                          target="_blank"
                          rel="noreferrer"
                          className={`${p.popular ? 'btn-primary-brand' : 'btn-outline-brand'} w-100 justify-content-center`}
                        >
                          <i className="fas fa-rocket" />
                          {t('pricing.cta')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="trial-note">
            <i className="fas fa-gift" />
            {t('pricing.trial_note')}
          </p>
        </div>
      </section>

      {/* Payment methods */}
      <section style={{ padding: '2rem 0 3rem', background: '#f8fafb', borderTop: '1px solid #e2e8f0' }}>
        <div className="container text-center">
          <p style={{ color: '#6c757d', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '1.5rem' }}>
            Modes de paiement acceptés
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {['Orange Money', 'MTN Mobile Money', 'Wave', 'Airtel Money', 'Visa', 'Mastercard', 'Virement bancaire'].map((m) => (
              <span key={m} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#495057' }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">Comparaison détaillée</h2>
            <p className="section-subtitle">Toutes les fonctionnalités, plan par plan</p>
          </div>
          <div className="table-responsive">
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafb' }}>
                  <th style={{ padding: '1rem', fontWeight: 700, color: '#0f1c2e', width: '40%', borderBottom: '2px solid #e2e8f0' }}>
                    Fonctionnalité
                  </th>
                  <th className="text-center" style={{ padding: '1rem', fontWeight: 700, color: '#0f1c2e', borderBottom: '2px solid #e2e8f0' }}>
                    Starter
                  </th>
                  <th className="text-center" style={{ padding: '1rem', fontWeight: 700, color: '#1a8b3f', borderBottom: '3px solid #1a8b3f', background: '#e8f7ed' }}>
                    Pro ⭐
                  </th>
                  <th className="text-center" style={{ padding: '1rem', fontWeight: 700, color: '#0f1c2e', borderBottom: '2px solid #e2e8f0' }}>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafb' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#0f1c2e', borderBottom: '1px solid #f0f4f8' }}>
                      {row.feature}
                    </td>
                    <CompCell value={row.starter} />
                    <td className="text-center" style={{ background: 'rgba(26,139,63,0.04)', borderBottom: '1px solid #f0f4f8' }}>
                      {row.pro === true ? (
                        <i className="fas fa-check-circle" style={{ color: '#1a8b3f', fontSize: '1.1rem' }} />
                      ) : row.pro === false ? (
                        <i className="fas fa-minus" style={{ color: '#ccc' }} />
                      ) : (
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1a8b3f' }}>{row.pro}</span>
                      )}
                    </td>
                    <CompCell value={row.enterprise} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pricing-faq">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">{t('pricing.faq_title')}</h2>
          </div>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {Array.isArray(faqs) && faqs.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <i className={`fas fa-chevron-down faq-icon`} />
                </div>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>Des questions sur nos tarifs ?</h2>
          <p>Notre équipe est là pour vous aider à choisir le plan qui correspond à votre structure.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn-primary-brand" style={{ background: 'linear-gradient(135deg,#f5a623,#e8870f)', boxShadow: '0 4px 18px rgba(245,166,35,0.4)' }}>
              <i className="fas fa-comments" />
              Parler à un conseiller
            </Link>
            <a href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`} target="_blank" rel="noreferrer" className="btn-white-outline">
              <i className="fas fa-rocket" />
              Commencer l'essai gratuit
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
