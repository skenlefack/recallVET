import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// FontAwesome CSS
import '@fortawesome/fontawesome-free/css/all.min.css';

// i18n (must be imported before App)
import './i18n';

// Custom styles
import './assets/scss/main.scss';

import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
