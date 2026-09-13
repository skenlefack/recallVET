import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/seo/SEO';
import { submitContact } from '../services/api';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await submitContact(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err.message || t('contact.form_error'));
    }
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Contactez l'équipe RecallVET. Nous répondons sous 24 heures du lundi au vendredi."
        url="/contact"
      />

      <div className="page-header page-header--contact">
        <div className="container">
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>
      </div>

      <section className="contact-section">
        <div className="container">
          <div className="row g-5">
            {/* Form */}
            <div className="col-lg-7">
              <div className="contact-form-card">
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
                  <i className="fas fa-paper-plane me-2" style={{ color: '#1a8b3f' }} />
                  Envoyer un message
                </h3>

                {status === 'success' && (
                  <div className="alert-success mb-4">
                    <i className="fas fa-check-circle" style={{ color: '#1a8b3f', fontSize: '1.2rem', flexShrink: 0 }} />
                    <span>{t('contact.form_success')}</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="alert-error mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="rv-form-group">
                        <label htmlFor="name">{t('contact.form_name')} *</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Dr. Aminata Diallo"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="rv-form-group">
                        <label htmlFor="email">{t('contact.form_email')} *</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="aminata@clinique.sn"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rv-form-group">
                    <label htmlFor="subject">{t('contact.form_subject')} *</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="Question sur le plan Pro"
                    />
                  </div>
                  <div className="rv-form-group">
                    <label htmlFor="message">{t('contact.form_message')} *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Décrivez votre demande..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary-brand"
                    disabled={status === 'sending'}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {status === 'sending' ? (
                      <><i className="fas fa-spinner fa-spin" /> {t('contact.form_sending')}</>
                    ) : (
                      <><i className="fas fa-paper-plane" /> {t('contact.form_submit')}</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Info sidebar */}
            <div className="col-lg-5">
              <div className="contact-info-card">
                <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
                  <i className="fas fa-address-card me-2" style={{ color: '#1a8b3f' }} />
                  Nos coordonnées
                </h3>

                <div className="info-item">
                  <div className="info-icon"><i className="fas fa-envelope" /></div>
                  <div className="info-text">
                    <div className="label">Email</div>
                    <div className="value">
                      <a href="mailto:contact@recallvet.com">contact@recallvet.com</a>
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><i className="fas fa-phone" /></div>
                  <div className="info-text">
                    <div className="label">Téléphone</div>
                    <div className="value">{t('contact.info_phone')}</div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><i className="fas fa-map-marker-alt" /></div>
                  <div className="info-text">
                    <div className="label">Adresse</div>
                    <div className="value">{t('contact.info_address')}</div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><i className="fas fa-clock" /></div>
                  <div className="info-text">
                    <div className="label">Horaires support</div>
                    <div className="value">{t('contact.info_hours')}</div>
                  </div>
                </div>

                <hr style={{ borderColor: '#e2e8f0', margin: '1.5rem 0' }} />

                <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>{t('contact.social_title')}</h5>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { icon: 'fa-facebook-f', href: '#', label: 'Facebook' },
                    { icon: 'fa-x-twitter', href: '#', label: 'Twitter/X' },
                    { icon: 'fa-linkedin-in', href: '#', label: 'LinkedIn' },
                    { icon: 'fa-instagram', href: '#', label: 'Instagram' },
                    { icon: 'fa-whatsapp', href: '#', label: 'WhatsApp' },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      style={{
                        width: 40, height: 40, background: '#e8f7ed', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#1a8b3f', textDecoration: 'none', transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#1a8b3f'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#e8f7ed'; e.currentTarget.style.color = '#1a8b3f'; }}
                    >
                      <i className={`fab ${s.icon}`} />
                    </a>
                  ))}
                </div>

                <div style={{ marginTop: '1.5rem', background: '#1a8b3f', borderRadius: 14, padding: '1.25rem', color: '#fff' }}>
                  <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>
                    <i className="fas fa-headset me-2" />
                    Support prioritaire
                  </p>
                  <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.85, lineHeight: 1.5 }}>
                    Les clients Pro et Enterprise bénéficient d'un support par chat en direct avec un délai de réponse garanti de 2 heures.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12">
              <div style={{
                background: 'linear-gradient(135deg, #e8f7ed, #f0f7f4)',
                border: '1px solid #d4edda',
                borderRadius: 20,
                padding: '3rem',
                textAlign: 'center'
              }}>
                <i className="fas fa-map-marked-alt" style={{ fontSize: '2.5rem', color: '#1a8b3f', marginBottom: '1rem', display: 'block' }} />
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Présence panafricaine</h4>
                <p style={{ color: '#6c757d', maxWidth: 500, margin: '0 auto' }}>
                  Siège à Yaoundé, Cameroun. Notre équipe distribuée opère depuis Dakar, Abidjan, Accra, Lagos et Nairobi pour vous servir au plus près.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  {['Yaoundé', 'Dakar', 'Abidjan', 'Accra', 'Lagos', 'Nairobi'].map(city => (
                    <span key={city} style={{
                      background: '#fff', border: '1px solid #d4edda', borderRadius: 50,
                      padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#0f1c2e'
                    }}>
                      <i className="fas fa-map-pin me-1" style={{ color: '#1a8b3f', fontSize: '0.75rem' }} />
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
