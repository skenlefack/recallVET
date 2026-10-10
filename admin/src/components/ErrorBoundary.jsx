import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
          <div className="text-center p-5" style={{ maxWidth: 600 }}>
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="mb-3">Une erreur est survenue</h2>
            <p className="text-muted mb-4">
              Quelque chose s'est mal passe. Veuillez recharger la page ou retourner au tableau de bord.
            </p>
            <div className="d-flex gap-3 justify-content-center mb-4">
              <button className="btn btn-success" onClick={this.handleReload}>
                <i className="fas fa-sync-alt me-2"></i>Recharger la page
              </button>
              <Link to="/dashboard" className="btn btn-outline-secondary" onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}>
                <i className="fas fa-home me-2"></i>Retour au tableau de bord
              </Link>
            </div>
            <div className="mt-3">
              <button className="btn btn-sm btn-link text-muted" onClick={this.toggleDetails}>
                <i className={`fas fa-chevron-${this.state.showDetails ? 'up' : 'down'} me-1`}></i>
                Details techniques
              </button>
              {this.state.showDetails && (
                <div className="mt-2 text-start">
                  <pre className="bg-dark text-light p-3 rounded" style={{ fontSize: '0.8rem', maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
