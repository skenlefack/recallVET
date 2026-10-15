import { useState, useEffect } from 'react';
import { subscribe, syncAll } from '../services/syncEngine';

export default function OfflineIndicator() {
  const [state, setState] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0
  });

  useEffect(() => {
    return subscribe(setState);
  }, []);

  // Online with nothing pending — don't render anything
  if (state.isOnline && state.pendingCount === 0 && !state.isSyncing) {
    return null;
  }

  // Syncing
  if (state.isSyncing) {
    return (
      <div className="rv-offline-indicator syncing" title="Synchronisation en cours...">
        <i className="fas fa-sync fa-spin" />
        <span className="d-none d-md-inline ms-1">Sync...</span>
      </div>
    );
  }

  // Online with pending mutations
  if (state.isOnline && state.pendingCount > 0) {
    return (
      <div
        className="rv-offline-indicator pending"
        title={`${state.pendingCount} modification(s) en attente de sync`}
        onClick={() => syncAll()}
        role="button"
      >
        <i className="fas fa-cloud-arrow-up" />
        <span className="rv-offline-badge">{state.pendingCount}</span>
      </div>
    );
  }

  // Offline
  return (
    <div className="rv-offline-indicator offline" title="Vous êtes hors-ligne — les données sont sauvegardées localement">
      <i className="fas fa-wifi-slash" />
      <span className="d-none d-md-inline ms-1">Hors-ligne</span>
      {state.pendingCount > 0 && (
        <span className="rv-offline-badge">{state.pendingCount}</span>
      )}
    </div>
  );
}
