import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';

// ── Scroll reveal hook ──────────────────────────────────────
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

// ── Animated counter hook ────────────────────────────────────
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Stats Counter ────────────────────────────────────────────
function StatsSection() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const clinics = useCountUp(500, 2000, visible);
  const animals = useCountUp(50000, 2200, visible);
  const countries = useCountUp(15, 1500, visible);

  const [revealRef, revealed] = useScrollReveal();

  return (
    <section className={`stats-section reveal-section ${revealed ? 'revealed' : ''}`} ref={(el) => { ref.current = el; revealRef.current = el; }}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-chart-pie me-2" />
            {t('stats.title')}
          </span>
          <h2 className="section-title">{t('stats.title')}</h2>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-6 col-md-3">
            <div className="stat-block">
              <div className="stat-icon"><i className="fas fa-hospital" /></div>
              <div className="stat-number">{clinics}<span className="stat-suffix">+</span></div>
              <div className="stat-desc">{t('stats.clinics')}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-block">
              <div className="stat-icon"><i className="fas fa-paw" /></div>
              <div className="stat-number">{animals.toLocaleString()}<span className="stat-suffix">+</span></div>
              <div className="stat-desc">{t('stats.animals')}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-block">
              <div className="stat-icon"><i className="fas fa-earth-africa" /></div>
              <div className="stat-number">{countries}</div>
              <div className="stat-desc">{t('stats.countries')}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-block">
              <div className="stat-icon"><i className="fas fa-shield-halved" /></div>
              <div className="stat-number">99.9<span className="stat-suffix">%</span></div>
              <div className="stat-desc">{t('stats.uptime')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Hero Image Showcase (slideshow) ─────────────────────────
function HeroImageShowcase() {
  const [current, setCurrent] = useState(0);
  const images = [
    '/images/header-1.jpg',
    '/images/header-2.jpg',
    '/images/header-3.jpg',
    '/images/header-4.jpg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-showcase">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`RecallVET en action ${i + 1}`}
          className={`hero-showcase-img ${i === current ? 'active' : ''}`}
        />
      ))}
      <div className="hero-showcase-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`showcase-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Hero Section ─────────────────────────────────────────────
function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center gy-5">
          <div className="col-lg-6">
            <div className="hero-badge">
              <span className="badge-dot" />
              {t('hero.badge')}
            </div>
            <h1 className="hero-headline">
              {t('hero.headline')}
              <span className="accent-line">{t('hero.headline_accent')}</span>
            </h1>
            <p className="hero-subtext">{t('hero.subtext')}</p>
            <div className="hero-ctas">
              <a
                href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary-brand"
                style={{ background: 'linear-gradient(135deg, #f5a623 0%, #e8870f 100%)', boxShadow: '0 4px 18px rgba(245,166,35,0.45)' }}
              >
                <i className="fas fa-rocket" />
                {t('hero.cta_primary')}
              </a>
              <Link to="/demo" className="btn-white-outline">
                <i className="fas fa-play-circle" />
                {t('hero.cta_secondary')}
              </Link>
            </div>
            <p className="hero-no-card">
              <i className="fas fa-shield-alt" />
              {t('hero.no_card')}
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">{t('hero.stat_clinics')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">50K+</span>
                <span className="stat-label">{t('hero.stat_animals')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">15</span>
                <span className="stat-label">{t('hero.stat_countries')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">99.9%</span>
                <span className="stat-label">{t('hero.stat_uptime')}</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <HeroImageShowcase />
          </div>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <span>{t('common.discover')}</span>
        <i className="fas fa-chevron-down" />
      </div>
    </section>
  );
}

// ── FAQ Section ─────────────────────────────────────────────
function FAQSection() {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState(null);
  const [ref, revealed] = useScrollReveal();

  const faqData = t('faq.questions', { returnObjects: true });
  const faqs = Array.isArray(faqData) ? faqData.map(f => ({ q: f.question, a: f.answer })) : [];

  return (
    <section className={`faq-home-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-question-circle me-2" />
            {t('faq.badge')}
          </span>
          <h2 className="section-title">{t('faq.title')}</h2>
          <p className="section-subtitle">{t('faq.subtitle')}</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openIdx === i ? 'open' : ''}`}>
              <div className="faq-question" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span>{faq.q}</span>
                <i className={`fas fa-chevron-${openIdx === i ? 'up' : 'down'} faq-icon`} />
              </div>
              <div className="faq-answer">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Trusted By ───────────────────────────────────────────────
function TrustedBy() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  const logos = [
    'VetClinic Dakar', 'AfriVet Group', 'FarmHealth CI',
    'PanaVet Ghana', 'KenyaVet Pro', 'SahelStock CM',
    'MaliVet Plus', 'TropicVet Togo', 'NigerVet Solutions',
    'ChadVet Services', 'BurkinaVet Pro', 'GuinéeVet Lab',
  ];
  return (
    <section className={`trusted-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <p className="trusted-title">{t('trusted.title')}</p>
        <div className="trusted-logos">
          <div className="trusted-logos-track">
            {[...logos, ...logos].map((l, i) => (
              <div key={`${l}-${i}`} className="logo-placeholder">
                <i className="fas fa-paw" style={{ marginRight: '0.4rem', color: '#1a8b3f' }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Problem Section ──────────────────────────────────────────
function ProblemSection() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  const problems = [
    { icon: 'fa-folder-open', key: 'p1' },
    { icon: 'fa-boxes-stacked', key: 'p2' },
    { icon: 'fa-bell-slash', key: 'p3' },
  ];
  return (
    <section className={`problems-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-exclamation-triangle me-2" />
            {t('problems.badge')}
          </span>
          <h2 className="section-title">{t('problems.title')}</h2>
          <p className="section-subtitle">{t('problems.subtitle')}</p>
        </div>
        <div className="row g-4">
          {problems.map((p, idx) => (
            <div key={p.key} className="col-md-4">
              <div className="problem-card">
                <span className="problem-number">{String(idx + 1).padStart(2, '0')}</span>
                <div className="problem-icon">
                  <i className={`fas ${p.icon}`} />
                </div>
                <h3>{t(`problems.${p.key}_title`)}</h3>
                <p>{t(`problems.${p.key}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-5">
          <i className="fas fa-arrow-down fa-2x" style={{ color: '#1a8b3f', opacity: 0.4 }} />
        </div>
      </div>
    </section>
  );
}

// ── Features Grid ────────────────────────────────────────────
function FeaturesGrid() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  const features = [
    { icon: 'fa-stethoscope', key: 'f1' },
    { icon: 'fa-tractor', key: 'f2' },
    { icon: 'fa-pills', key: 'f3' },
    { icon: 'fa-file-invoice-dollar', key: 'f4' },
    { icon: 'fa-bell', key: 'f5' },
    { icon: 'fa-chart-bar', key: 'f6' },
  ];
  return (
    <section className={`features-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-star me-2" />
            {t('nav.features')}
          </span>
          <h2 className="section-title">{t('features.title')}</h2>
          <p className="section-subtitle">{t('features.subtitle')}</p>
        </div>
        <div className="row g-4">
          {features.map((f, idx) => (
            <div key={f.key} className="col-md-6 col-lg-4">
              <div className="feature-card">
                <span className="feature-number">{String(idx + 1).padStart(2, '0')}</span>
                <div className="feature-icon">
                  <i className={`fas ${f.icon}`} />
                </div>
                <h3>{t(`features.${f.key}_title`)}</h3>
                <p>{t(`features.${f.key}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-5">
          <Link to="/fonctionnalites" className="btn-outline-brand">
            <i className="fas fa-arrow-right" />
            {t('common.see_all_features')}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────
function HowItWorks() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  const steps = ['s1', 's2', 's3'];
  const icons = ['fa-user-plus', 'fa-sliders', 'fa-chart-line'];
  return (
    <section className={`how-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-map-signs me-2" />
            {t('how.badge')}
          </span>
          <h2 className="section-title">{t('how.title')}</h2>
          <p className="section-subtitle">{t('how.subtitle')}</p>
        </div>
        <div className="row g-4 position-relative">
          {steps.map((s, i) => (
            <div key={s} className="col-md-4">
              <div className="step-item">
                <div className="step-number">
                  <i className={`fas ${icons[i]}`} />
                </div>
                <h3>{t(`how.${s}_title`)}</h3>
                <p>{t(`how.${s}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Modules Showcase ─────────────────────────────────────────
function ModulesShowcase() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  const modules = [
    { key: 'clinic', icon: 'fa-hospital-user', featKey: 'clinic_features', colorClass: 'module-clinic' },
    { key: 'farm', icon: 'fa-tractor', featKey: 'farm_features', colorClass: 'module-farm' },
    { key: 'pharmacy', icon: 'fa-prescription-bottle-medical', featKey: 'pharmacy_features', colorClass: 'module-pharmacy' },
  ];
  return (
    <section className={`modules-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-cubes me-2" />
            {t('modules.badge')}
          </span>
          <h2 className="section-title">{t('modules.title')}</h2>
          <p className="section-subtitle">{t('modules.subtitle')}</p>
        </div>
        <div className="row g-4">
          {modules.map((m) => {
            const feats = t(`modules.${m.featKey}`, { returnObjects: true });
            return (
              <div key={m.key} className="col-lg-4 col-md-6">
                <div className={`module-card ${m.colorClass}`}>
                  <div className="module-icon">
                    <i className={`fas ${m.icon}`} />
                  </div>
                  <h3>{t(`modules.${m.key}_title`)}</h3>
                  <p className="module-desc">{t(`modules.${m.key}_desc`)}</p>
                  <ul className="module-features">
                    {Array.isArray(feats) && feats.map((feat, idx) => (
                      <li key={idx}>
                        <i className="fas fa-check-circle" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Preview ──────────────────────────────────────────
function PricingPreview() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  const plans = [
    { key: 'starter', popular: false },
    { key: 'pro', popular: true },
    { key: 'enterprise', popular: false },
  ];
  return (
    <section className={`pricing-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-tags me-2" />
            {t('nav.pricing')}
          </span>
          <h2 className="section-title">{t('pricing.title')}</h2>
          <p className="section-subtitle">{t('pricing.subtitle')}</p>
        </div>
        <div className="row g-4 justify-content-center">
          {plans.map((p) => {
            const feats = t(`pricing.${p.key}_features`, { returnObjects: true });
            return (
              <div key={p.key} className="col-md-4">
                <div className={`pricing-card${p.popular ? ' popular' : ''}`}>
                  {p.popular && (
                    <div className="popular-badge">
                      <i className="fas fa-star" />
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
                      <Link
                        to="/contact"
                        className={`btn-outline-brand w-100 justify-content-center`}
                      >
                        {t('pricing.cta_enterprise')}
                      </Link>
                    ) : (
                      <a
                        href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
                        target="_blank"
                        rel="noreferrer"
                        className={`${p.popular ? 'btn-primary-brand' : 'btn-outline-brand'} w-100 justify-content-center`}
                      >
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
        <div className="text-center mt-4">
          <Link to="/tarifs" className="btn-outline-brand">
            <i className="fas fa-table-list" />
            {t('common.see_detailed_comparison')}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────
function TestimonialsSection() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  const testimonials = ['t1', 't2', 't3'];
  const initials = ['AD', 'KA', 'EK'];
  return (
    <section className={`testimonials-section reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge-green mb-3">
            <i className="fas fa-quote-left me-2" />
            {t('testimonials.badge')}
          </span>
          <h2 className="section-title">{t('testimonials.title')}</h2>
          <p className="section-subtitle">{t('testimonials.subtitle')}</p>
        </div>
        <div className="row g-4">
          {testimonials.map((t_key, idx) => (
            <div key={t_key} className="col-lg-4">
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star" />
                  ))}
                </div>
                <div className="quote-mark">"</div>
                <p className="quote-text">{t(`testimonials.${t_key}_quote`)}</p>
                <div className="reviewer">
                  <div className="avatar">{initials[idx]}</div>
                  <div className="reviewer-info">
                    <div className="name">{t(`testimonials.${t_key}_name`)}</div>
                    <div className="role">{t(`testimonials.${t_key}_title`)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ───────────────────────────────────────────────
function CTABanner() {
  const { t } = useTranslation();
  const [ref, revealed] = useScrollReveal();
  return (
    <section className={`cta-banner reveal-section ${revealed ? 'revealed' : ''}`} ref={ref}>
      <div className="container">
        <h2>{t('cta_banner.title')}</h2>
        <p>{t('cta_banner.subtitle')}</p>
        <div className="cta-buttons">
          <a
            href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary-brand"
            style={{ background: 'linear-gradient(135deg, #f5a623 0%, #e8870f 100%)', boxShadow: '0 4px 18px rgba(245,166,35,0.4)' }}
          >
            <i className="fas fa-rocket" />
            {t('cta_banner.btn_primary')}
          </a>
          <Link to="/demo" className="btn-white-outline">
            <i className="fas fa-calendar-check" />
            {t('cta_banner.btn_secondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Main Home Page ───────────────────────────────────────────
export default function Home() {
  return (
    <>
      <SEO
        description="RecallVET est la plateforme SaaS vétérinaire #1 en Afrique. Gérez votre clinique, élevage et pharmacie en un seul outil. Essai gratuit 30 jours."
        keywords="logiciel vétérinaire, gestion clinique vétérinaire, SaaS vétérinaire Afrique, pharmacie vétérinaire, RecallVET"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              name: 'RecallVET',
              url: 'https://recallvet.com',
              logo: 'https://recallvet.com/favicon.svg',
              description: 'La plateforme SaaS veterinaire #1 en Afrique',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Yaounde',
                addressCountry: 'CM',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@recallvet.com',
                contactType: 'customer service',
                availableLanguage: ['French', 'English'],
              },
              sameAs: [
                'https://facebook.com/recallvet',
                'https://x.com/recallvet',
                'https://linkedin.com/company/recallvet',
                'https://instagram.com/recallvet',
              ],
            },
            {
              '@type': 'SoftwareApplication',
              name: 'RecallVET',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              url: 'https://recallvet.com',
              description: 'Plateforme SaaS de gestion veterinaire pour cliniques, elevages et pharmacies en Afrique.',
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'XAF',
                lowPrice: '0',
                offerCount: '3',
              },
            },
          ],
        }}
      />
      <HeroSection />
      <ProblemSection />
      <FeaturesGrid />
      <HowItWorks />
      <ModulesShowcase />
      <PricingPreview />
      <TestimonialsSection />
      <StatsSection />
      <FAQSection />
      <CTABanner />
    </>
  );
}
