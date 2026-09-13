import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="rv-footer">
      <div className="container">
        <div className="row g-5">
          {/* Brand column */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <i className="fas fa-paw" />
              </div>
              <span className="logo-text">
                Recall<span>VET</span>
              </span>
            </Link>
            <p className="footer-desc">{t('footer.description')}</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <i className="fab fa-x-twitter" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <i className="fab fa-youtube" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="footer-col-title">{t('footer.product_title')}</h5>
            <ul className="footer-links">
              <li><Link to="/fonctionnalites">{t('footer.product_links.features')}</Link></li>
              <li><Link to="/tarifs">{t('footer.product_links.pricing')}</Link></li>
              <li><Link to="/demo">{t('footer.product_links.demo')}</Link></li>
              <li><a href="#">{t('footer.product_links.changelog')}</a></li>
              <li><a href="#">{t('footer.product_links.roadmap')}</a></li>
            </ul>
          </div>

          {/* Company links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="footer-col-title">{t('footer.company_title')}</h5>
            <ul className="footer-links">
              <li><Link to="/a-propos">{t('footer.company_links.about')}</Link></li>
              <li><a href="#">{t('footer.company_links.blog')}</a></li>
              <li><a href="#">{t('footer.company_links.careers')}</a></li>
              <li><a href="#">{t('footer.company_links.press')}</a></li>
              <li><a href="#">{t('footer.company_links.partners')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-6">
            <h5 className="footer-col-title">{t('footer.contact_title')}</h5>
            <div className="footer-contact-item">
              <i className="fas fa-envelope" />
              <a href="mailto:contact@recallvet.com" style={{ color: 'rgba(255,255,255,0.65)' }}>
                contact@recallvet.com
              </a>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone" />
              <span>+237 6XX XXX XXX</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-map-marker-alt" />
              <span>Yaoundé, Cameroun</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-clock" />
              <span>Lun–Ven · 8h–18h (WAT)</span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h5 className="footer-col-title">{t('footer.legal_title')}</h5>
              <ul className="footer-links" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <li><Link to="/legal/confidentialite">{t('footer.legal_links.privacy')}</Link></li>
                <li><Link to="/legal/conditions">{t('footer.legal_links.terms')}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <h5><i className="fas fa-envelope-open-text me-2" />Restez informé</h5>
              <p>Recevez nos actualités, mises à jour produit et conseils vétérinaires.</p>
            </div>
            <div className="col-lg-7">
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); }}>
                <input type="email" placeholder="Votre adresse email" required />
                <button type="submit"><i className="fas fa-paper-plane me-2" />S'abonner</button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t('footer.copyright', { year })}</span>
          <span className="made-with">{t('footer.made_with')}</span>
        </div>
      </div>
    </footer>
  );
}
