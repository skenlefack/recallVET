import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import DemoRequest from './pages/DemoRequest';
import About from './pages/About';
import Privacy from './pages/Legal/Privacy';
import Terms from './pages/Legal/Terms';
import Cookies from './pages/Legal/Cookies';
import Security from './pages/Legal/Security';
import Changelog from './pages/Changelog';
import Roadmap from './pages/Roadmap';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function ScrollTopButton() {
  useEffect(() => {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      id="scrollTopBtn"
      className="scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Retour en haut"
    >
      <i className="fas fa-chevron-up" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fonctionnalites" element={<Features />} />
          <Route path="/tarifs" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/demo" element={<DemoRequest />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/legal/confidentialite" element={<Privacy />} />
          <Route path="/legal/conditions" element={<Terms />} />
          <Route path="/legal/cookies" element={<Cookies />} />
          <Route path="/legal/securite" element={<Security />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/roadmap" element={<Roadmap />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ScrollTopButton />
    </>
  );
}
