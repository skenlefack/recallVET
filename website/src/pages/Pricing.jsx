import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';
import { getPlans } from '../services/api';

const COMPARISON_KEYS = [
  'users', 'patients', 'clinic_module', 'farm_module', 'pharmacy_module',
  'billing', 'email_reminders', 'sms_reminders', 'basic_reports', 'advanced_reports',
  'export_pdf_excel', 'api_access', 'multi_site', 'white_label', 'email_support',
  'priority_support', 'account_manager', 'online_training', 'onsite_training',
  'sla', 'custom_integration',
];

const COMPARISON_VALUES = [
  { starter: '1', pro: '5', enterprise: 'unlimited' },
  { starter: '200', pro: 'unlimited', enterprise: 'unlimited' },
  { starter: true, pro: true, enterprise: true },
  { starter: false, pro: 'option', enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: true, pro: true, enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: true, pro: true, enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: false, pro: false, enterprise: true },
  { starter: false, pro: false, enterprise: true },
  { starter: true, pro: true, enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: false, pro: false, enterprise: true },
  { starter: false, pro: true, enterprise: true },
  { starter: false, pro: false, enterprise: true },
  { starter: false, pro: false, enterprise: true },
  { starter: false, pro: false, enterprise: true },
];

function CompCell({ value, t }) {
  if (value === true) return <td className="text-center"><i className="fas fa-check-circle" style={{ color: '#1a8b3f', fontSize: '1.1rem' }} /></td>;
  if (value === false) return <td className="text-center"><i className="fas fa-minus" style={{ color: '#ccc' }} /></td>;
  if (value === 'unlimited') return <td className="text-center" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#495057' }}>{t('pricing_page.comparison_unlimited')}</td>;
  if (value === 'option') return <td className="text-center" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#495057' }}>{t('pricing_page.comparison_option')}</td>;
  return <td className="text-center" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#495057' }}>{value}</td>;
}

export default function Pricing() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [apiPlans, setApiPlans] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const faqs = t('pricing.faq', { returnObjects: true });

  const isAnnual = billingCycle === 'yearly';

  useEffect(() => {
    getPlans()
      .then((res) => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setApiPlans(data);
        }
      })
      .catch(() => {
        // Fall back to hardcoded i18n plans
      })
      .finally(() => setPlansLoading(false));
  }, []);

  const formatPrice = (monthlyPrice) => {
    const str = String(monthlyPrice);
    const num = parseInt(str.replace(/\s/g, ''), 10);
    if (isNaN(num)) return str;
    const annual = Math.round(num * 12 * 0.83);
    return annual.toLocaleString('fr-FR');
  };

  // Map API plan names to the keys used in i18n / comparison table
  const planKeyMap = { starter: 'starter', pro: 'pro', enterprise: 'enterprise' };

  const fallbackPlans = [
    { key: 'starter', popular: false },
    { key: 'pro', popular: true },
    { key: 'enterprise', popular: false },
  ];

  const plans = apiPlans
    ? apiPlans.map((ap) => {
        const key = (ap.slug || ap.name || '').toLowerCase();
        const mapped = planKeyMap[key] || key;
        return {
          key: mapped,
          popular: mapped === 'pro',
          apiData: ap,
        };
      })
    : fallbackPlans;

  return (
    <>
      <SEO
        title={t('pricing_page.seo_title')}
        description={t('pricing_page.seo_description')}
        url="/tarifs"
        keywords="tarif logiciel vétérinaire, prix RecallVET, abonnement vétérinaire Afrique, SaaS vétérinaire prix"
      />

      <div className="page-header page-header--pricing">
        <div className="container">
          <span className="badge-green mb-3" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <i className="fas fa-tags me-2" />
            {t('pricing_page.badge')}
          </span>
          <h1>{t('pricing.title')}</h1>
          <p>{t('pricing.subtitle')}</p>
        </div>
      </div>

      <div className="text-center mb-4" style={{ paddingTop: '2rem' }}>
        <div className="billing-toggle">
          <button className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}>
            {t('pricing_page.billing_monthly')}
          </button>
          <button className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}>
            {t('pricing_page.billing_yearly')}
            <span className="savings-badge">{t('pricing_page.yearly_savings')}</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <section className="pricing-section" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <div className="row g-4 justify-content-center">
            {plans.map((p) => {
              const api = p.apiData;
              const name = api?.name || t(`pricing.${p.key}_name`);
              const currency = api?.currency || t(`pricing.${p.key}_currency`);
              const monthlyPrice = api ? String(api.price) : t(`pricing.${p.key}_price`);
              const displayPrice = isAnnual ? formatPrice(monthlyPrice) : monthlyPrice;
              const desc = api?.description || t(`pricing.${p.key}_desc`);
              const feats = (api?.features && Array.isArray(api.features) && api.features.length > 0)
                ? api.features
                : t(`pricing.${p.key}_features`, { returnObjects: true });
              return (
                <div key={p.key} className="col-md-4">
                  <div className={`pricing-card${p.popular ? ' popular' : ''}`}>
                    {p.popular && (
                      <div className="popular-badge">
                        <i className="fas fa-fire" />
                        {t('pricing.popular')}
                      </div>
                    )}
                    <div className="plan-name">{name}</div>
                    <div className="plan-price">
                      <span className="currency">{currency}</span>
                      {displayPrice}
                      <span className="period"> /{isAnnual ? t('pricing_page.per_year') : t('pricing.monthly')}</span>
                    </div>
                    <p className="plan-desc">{desc}</p>
                    <ul className="plan-features">
                      {Array.isArray(feats) && feats.map((f, i) => (
                        <li key={i}>
                          <i className="fas fa-check-circle" />
                          {typeof f === 'string' ? f : f.label || f.name || String(f)}
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
            {t('pricing_page.payment_methods_title')}
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
            <h2 className="section-title">{t('pricing_page.comparison_title')}</h2>
            <p className="section-subtitle">{t('pricing_page.comparison_subtitle')}</p>
          </div>
          <div className="table-responsive">
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafb' }}>
                  <th style={{ padding: '1rem', fontWeight: 700, color: '#0f1c2e', width: '40%', borderBottom: '2px solid #e2e8f0' }}>
                    {t('pricing_page.comparison_feature_header')}
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
                {COMPARISON_KEYS.map((key, i) => {
                  const row = COMPARISON_VALUES[i];
                  return (
                    <tr key={key} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafb' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#0f1c2e', borderBottom: '1px solid #f0f4f8' }}>
                        {t(`pricing_page.comparison.${key}`)}
                      </td>
                      <CompCell value={row.starter} t={t} />
                      <td className="text-center" style={{ background: 'rgba(26,139,63,0.04)', borderBottom: '1px solid #f0f4f8' }}>
                        {row.pro === true ? (
                          <i className="fas fa-check-circle" style={{ color: '#1a8b3f', fontSize: '1.1rem' }} />
                        ) : row.pro === false ? (
                          <i className="fas fa-minus" style={{ color: '#ccc' }} />
                        ) : row.pro === 'unlimited' ? (
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1a8b3f' }}>{t('pricing_page.comparison_unlimited')}</span>
                        ) : row.pro === 'option' ? (
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1a8b3f' }}>{t('pricing_page.comparison_option')}</span>
                        ) : (
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1a8b3f' }}>{row.pro}</span>
                        )}
                      </td>
                      <CompCell value={row.enterprise} t={t} />
                    </tr>
                  );
                })}
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
          <h2>{t('pricing_page.cta_title')}</h2>
          <p>{t('pricing_page.cta_subtitle')}</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn-primary-brand" style={{ background: 'linear-gradient(135deg,#f5a623,#e8870f)', boxShadow: '0 4px 18px rgba(245,166,35,0.4)' }}>
              <i className="fas fa-comments" />
              {t('pricing_page.cta_advisor')}
            </Link>
            <a href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`} target="_blank" rel="noreferrer" className="btn-white-outline">
              <i className="fas fa-rocket" />
              {t('common.start_free_trial')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
