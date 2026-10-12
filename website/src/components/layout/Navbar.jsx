import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', label: 'Fran\u00e7ais', short: 'FR' },
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'English', short: 'EN' },
  { code: 'pt', flag: '\u{1F1E7}\u{1F1F7}', label: 'Portugu\u00eas', short: 'PT' },
  { code: 'ar', flag: '\u{1F1F8}\u{1F1E6}', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', short: 'AR' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', label: 'Espa\u00f1ol', short: 'ES' },
  { code: 'sw', flag: '\u{1F1F0}\u{1F1EA}', label: 'Kiswahili', short: 'SW' },
];

function LanguageDropdown({ currentLang, onSwitch, fullWidth }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className={`lang-dropdown${fullWidth ? ' lang-dropdown--full' : ''}`} ref={ref}>
      <button
        className="lang-dropdown__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="lang-dropdown__flag">{active.flag}</span>
        <span className="lang-dropdown__code">{active.short}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} lang-dropdown__arrow`} />
      </button>
      {open && (
        <ul className="lang-dropdown__menu" role="listbox">
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === currentLang}
              className={`lang-dropdown__item${lang.code === currentLang ? ' lang-dropdown__item--active' : ''}`}
              onClick={() => { onSwitch(lang.code); setOpen(false); }}
            >
              <span className="lang-dropdown__flag">{lang.flag}</span>
              <span className="lang-dropdown__label">{lang.label}</span>
              {lang.code === currentLang && <i className="fas fa-check lang-dropdown__check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
              <LanguageDropdown currentLang={i18n.language} onSwitch={switchLang} />
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
          <LanguageDropdown currentLang={i18n.language} onSwitch={switchLang} fullWidth />
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
