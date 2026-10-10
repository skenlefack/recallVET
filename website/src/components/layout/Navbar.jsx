import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/fonctionnalites', label: t('nav.features') },
    { to: '/tarifs', label: t('nav.pricing') },
    { to: '/a-propos', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <nav className={`rv-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link to="/" className="rv-logo">
              <div className="logo-icon">
                <i className="fas fa-paw" />
              </div>
              <span className="logo-text">
                Recall<span>VET</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <ul className="rv-nav-links">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Desktop actions */}
            <div className="rv-nav-actions">
              {[
                { code: 'fr', label: 'Fran\u00e7ais' },
                { code: 'en', label: 'English' },
                { code: 'pt', label: 'Portugu\u00eas' },
                { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
                { code: 'es', label: 'Espa\u00f1ol' },
                { code: 'sw', label: 'Kiswahili' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-btn${i18n.language === lang.code ? ' active' : ''}`}
                  onClick={() => switchLang(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
              <a
                href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/login`}
                target="_blank"
                rel="noreferrer"
                className="btn-login"
              >
                {t('nav.login')}
              </a>
              <a
                href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
                target="_blank"
                rel="noreferrer"
                className="btn-trial"
              >
                {t('nav.free_trial')}
              </a>
            </div>

            {/* Hamburger */}
            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`rv-mobile-menu${menuOpen ? ' open' : ''}`}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mobile-actions">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { code: 'fr', label: 'Fran\u00e7ais' },
              { code: 'en', label: 'English' },
              { code: 'pt', label: 'Portugu\u00eas' },
              { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
              { code: 'es', label: 'Espa\u00f1ol' },
              { code: 'sw', label: 'Kiswahili' },
            ].map((lang) => (
              <button
                key={lang.code}
                className={`lang-btn${i18n.language === lang.code ? ' active' : ''}`}
                onClick={() => switchLang(lang.code)}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <a
            href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/login`}
            target="_blank"
            rel="noreferrer"
            className="btn-login"
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.login')}
          </a>
          <a
            href={`${import.meta.env.VITE_ADMIN_URL || 'http://localhost:3011'}/register`}
            target="_blank"
            rel="noreferrer"
            className="btn-trial"
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.free_trial')}
          </a>
        </div>
      </div>
    </>
  );
}
