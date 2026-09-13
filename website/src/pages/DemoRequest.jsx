import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';
import { submitDemoRequest } from '../services/api';

const AFRICAN_COUNTRIES = [
  'Cameroun', 'Côte d\'Ivoire', 'Sénégal', 'Ghana', 'Nigeria', 'Kenya',
  'Éthiopie', 'Tanzanie', 'Ouganda', 'Mali', 'Burkina Faso', 'Niger',
  'Guinée', 'Bénin', 'Togo', 'Rwanda', 'Mozambique', 'Angola',
  'Zambie', 'Zimbabwe', 'Botswana', 'Afrique du Sud', 'Maroc', 'Tunisie',
  'Algérie', 'Égypte', 'Autre',
];

export default function DemoRequest() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    practice_name: '',
    practice_type: '',
    country_code: '',
    message: '',
  });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await submitDemoRequest(form);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const types = t('demo.types', { returnObjects: true });
  const benefits = t('demo.benefits', { returnObjects: true });

  return (
    <>
      <SEO
        title="Demander une démo"
        description="Réservez votre démonstration gratuite et personnalisée de RecallVET. Notre équipe vous montrera comment RecallVET peut transformer votre pratique."
        url="/demo"
      />

      <div className="page-header page-header--demo">
        <div className="container">
          <span className="badge-green mb-3" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            {t('demo.badge')}
          </span>
          <h1>{t('demo.title')}</h1>
          <p>{t('demo.subtitle')}</p>
        </div>
      </div>

      <section className="demo-page">
        <div className="container">
          <div className="row g-5 align-items-start">
            {/* Form */}
            <div className="col-lg-7">
              {status === 'success' ? (
                <div className="demo-success">
                  <div className="success-icon">
                    <i className="fas fa-calendar-check" />
                  </div>
                  <h3>{t('demo.form_success_title')}</h3>
                  <p>{t('demo.form_success_msg')}</p>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="/" className="btn-primary-brand">
                      <i className="fas fa-home" />
                      Retour à l'accueil
                    </a>
                  </div>
                </div>
              ) : (
                <div className="contact-form-card">
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                    <i className="fas fa-calendar-alt me-2" style={{ color: '#1a8b3f' }} />
                    Réserver ma démo
                  </h3>
                  <p style={{ color: '#6c757d', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                    Remplissez ce formulaire et nous vous contacterons dans les 24 heures.
                  </p>

                  {status === 'error' && (
                    <div className="alert-error mb-4">{error}</div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="rv-form-group">
                          <label>{t('demo.form_fullname')} *</label>
                          <input
                            name="full_name"
                            type="text"
                            value={form.full_name}
                            onChange={handleChange}
                            required
                            placeholder="Dr. Kwame Asante"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="rv-form-group">
                          <label>{t('demo.form_email')} *</label>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="kwame@vetclinic.gh"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="rv-form-group">
                          <label>{t('demo.form_phone')}</label>
                          <input
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+233 5X XXX XXXX"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="rv-form-group">
                          <label>{t('demo.form_practice')} *</label>
                          <input
                            name="practice_name"
                            type="text"
                            value={form.practice_name}
                            onChange={handleChange}
                            required
                            placeholder="VetPlus Clinic"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="rv-form-group">
                          <label>{t('demo.form_type')} *</label>
                          <select
                            name="practice_type"
                            value={form.practice_type}
                            onChange={handleChange}
                            required
                          >
                            <option value="">-- Choisir --</option>
                            {Object.entries(types).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="rv-form-group">
                          <label>{t('demo.form_country')} *</label>
                          <select
                            name="country_code"
                            value={form.country_code}
                            onChange={handleChange}
                            required
                          >
                            <option value="">-- Pays --</option>
                            {AFRICAN_COUNTRIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="rv-form-group">
                          <label>{t('demo.form_message')}</label>
                          <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Ex: J'ai une clinique de 3 vétérinaires et je cherche à gérer les rendez-vous et les stocks..."
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-primary-brand"
                      disabled={status === 'sending'}
                      style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                    >
                      {status === 'sending' ? (
                        <><i className="fas fa-spinner fa-spin" /> {t('demo.form_sending')}</>
                      ) : (
                        <><i className="fas fa-calendar-check" /> {t('demo.form_submit')}</>
                      )}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6c757d', marginTop: '1rem' }}>
                      <i className="fas fa-lock me-1" />
                      Vos données sont 100% confidentielles et ne seront jamais partagées.
                    </p>
                  </form>
                </div>
              )}
            </div>

            {/* Benefits sidebar */}
            <div className="col-lg-5">
              <div className="demo-benefits">
                <h3>
                  <i className="fas fa-star me-2" />
                  Ce que vous allez découvrir
                </h3>
                {Array.isArray(benefits) && benefits.map((b, i) => (
                  <div key={i} className="benefit-item">
                    <i className="fas fa-check-circle" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', background: '#f8fafb', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>
                  <i className="fas fa-clock me-2" style={{ color: '#1a8b3f' }} />
                  Comment ça se passe ?
                </h5>
                {[
                  { num: 1, text: 'Vous soumettez ce formulaire' },
                  { num: 2, text: 'Notre équipe vous contacte sous 24h' },
                  { num: 3, text: 'Vous choisissez une date et un créneau' },
                  { num: 4, text: 'Démo de 30 min via Zoom ou Google Meet' },
                ].map((s) => (
                  <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#1a8b3f,#2db85a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                    }}>
                      {s.num}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#0f1c2e', paddingTop: '0.15rem' }}>{s.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#856404' }}>
                  <i className="fas fa-info-circle me-2" />
                  <strong>Démo personnalisée :</strong> Nous adaptons la démonstration à votre type de structure
                  (clinique, élevage, pharmacie ou mixte) pour que vous voyiez exactement ce qui compte pour vous.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
