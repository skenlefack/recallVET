import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';

export default function Security() {
  return (
    <>
      <SEO
        title="Sécurité"
        description="Découvrez comment RecallVET protège vos données : chiffrement, infrastructure sécurisée, contrôles d'accès et conformité."
        url="/legal/securite"
      />

      <div className="page-header page-header--legal">
        <div className="container">
          <h1>Sécurité</h1>
          <p>La protection de vos données est notre priorité absolue</p>
        </div>
      </div>

      <div className="container">
        <div className="legal-page">
          <p>
            Chez RecallVET, nous comprenons que vos données vétérinaires sont sensibles et critiques pour votre
            activité. C'est pourquoi nous avons mis en place des mesures de sécurité de niveau professionnel à
            chaque couche de notre infrastructure.
          </p>

          <h2>1. Chiffrement des données</h2>
          <p>
            Toutes les données sont protégées par un chiffrement de qualité bancaire :
          </p>
          <ul>
            <li><strong>En transit :</strong> chiffrement TLS 1.3 pour toutes les communications entre votre navigateur et nos serveurs</li>
            <li><strong>Au repos :</strong> chiffrement AES-256 pour les données stockées dans nos bases de données</li>
            <li><strong>Sauvegardes :</strong> toutes les sauvegardes sont chiffrées avec des clés gérées de manière sécurisée</li>
            <li><strong>Mots de passe :</strong> hachage bcrypt avec salt unique par utilisateur</li>
          </ul>

          <h2>2. Communication HTTPS</h2>
          <p>
            L'ensemble de notre plateforme est accessible exclusivement via HTTPS. Nous appliquons les en-têtes de
            sécurité suivants :
          </p>
          <ul>
            <li><strong>HSTS :</strong> HTTP Strict Transport Security pour forcer les connexions sécurisées</li>
            <li><strong>CSP :</strong> Content Security Policy pour prévenir les attaques XSS</li>
            <li><strong>X-Frame-Options :</strong> protection contre le clickjacking</li>
            <li><strong>X-Content-Type-Options :</strong> prévention du MIME sniffing</li>
          </ul>

          <h2>3. Sécurité de l'infrastructure</h2>
          <p>
            Notre infrastructure est conçue pour garantir la disponibilité et la sécurité de vos données :
          </p>
          <ul>
            <li>Hébergement sur des serveurs certifiés ISO 27001 et SOC 2</li>
            <li>Réseau privé isolé avec pare-feu multicouche</li>
            <li>Surveillance 24/7 avec détection automatique d'intrusion</li>
            <li>Mises à jour de sécurité appliquées dans les 24 heures suivant leur publication</li>
            <li>Architecture redondante avec basculement automatique</li>
          </ul>

          <h2>4. Contrôles d'accès</h2>
          <p>
            Nous appliquons le principe du moindre privilège à tous les niveaux :
          </p>
          <ul>
            <li><strong>Authentification à deux facteurs (2FA) :</strong> disponible pour tous les comptes utilisateurs</li>
            <li><strong>Gestion des rôles :</strong> contrôle granulaire des permissions par rôle (admin, vétérinaire, assistant)</li>
            <li><strong>Sessions sécurisées :</strong> expiration automatique et détection de sessions suspectes</li>
            <li><strong>Journalisation :</strong> traçabilité complète de toutes les actions sensibles</li>
            <li><strong>Accès interne :</strong> l'équipe RecallVET accède à l'infrastructure uniquement via VPN avec authentification forte</li>
          </ul>

          <h2>5. Sauvegardes et reprise d'activité</h2>
          <p>
            Vos données sont protégées contre la perte grâce à notre stratégie de sauvegarde robuste :
          </p>
          <ul>
            <li>Sauvegardes automatiques toutes les 6 heures</li>
            <li>Rétention des sauvegardes pendant 30 jours</li>
            <li>Réplication géographique sur des centres de données distincts</li>
            <li>Tests de restauration réguliers pour garantir l'intégrité des sauvegardes</li>
            <li>Objectif de temps de reprise (RTO) inférieur à 4 heures</li>
            <li>Objectif de point de reprise (RPO) inférieur à 6 heures</li>
          </ul>

          <h2>6. Réponse aux incidents</h2>
          <p>
            En cas d'incident de sécurité, notre processus de réponse structuré garantit une gestion rapide et
            transparente :
          </p>
          <ul>
            <li><strong>Détection :</strong> surveillance automatisée avec alertes en temps réel</li>
            <li><strong>Confinement :</strong> isolation immédiate des systèmes affectés</li>
            <li><strong>Notification :</strong> information des utilisateurs concernés dans les 72 heures conformément aux réglementations</li>
            <li><strong>Analyse :</strong> investigation approfondie et rapport post-incident</li>
            <li><strong>Correction :</strong> mise en place de mesures correctives et préventives</li>
          </ul>

          <h2>7. Signaler une vulnérabilité</h2>
          <p>
            Si vous découvrez une vulnérabilité de sécurité, nous vous encourageons à nous la signaler de manière
            responsable. Contactez notre équipe sécurité à{' '}
            <a href="mailto:security@recallvet.com">security@recallvet.com</a>. Nous nous engageons à accuser
            réception dans les 24 heures et à traiter le signalement en priorité.
          </p>

          <div style={{ marginTop: '3rem' }}>
            <Link to="/" className="btn-outline-brand">
              <i className="fas fa-arrow-left" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
