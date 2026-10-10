import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';

export default function Privacy() {
  return (
    <>
      <SEO
        title="Politique de confidentialité"
        description="Politique de confidentialité de RecallVET – comment nous collectons, utilisons et protégeons vos données personnelles."
        url="/legal/confidentialite"
      />

      <div className="page-header page-header--legal">
        <div className="container">
          <h1>Politique de confidentialité</h1>
          <p>Dernière mise à jour : 1er septembre 2026</p>
        </div>
      </div>

      <div className="container">
        <div className="legal-page">
          <p>
            Chez RecallVET, la protection de vos données personnelles est une priorité absolue. Cette politique de confidentialité
            explique comment nous collectons, utilisons, stockons et protégeons les informations que vous nous confiez lors de
            l'utilisation de notre plateforme.
          </p>

          <h2>1. Responsable du traitement</h2>
          <p>
            RecallVET SAS, dont le siège social est situé à Yaoundé, Cameroun, est responsable du traitement de vos données personnelles.
            Pour toute question relative à vos données, vous pouvez nous contacter à : <a href="mailto:privacy@recallvet.com">privacy@recallvet.com</a>.
          </p>

          <h2>2. Données collectées</h2>
          <p>Nous collectons les catégories de données suivantes :</p>
          <ul>
            <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
            <li><strong>Données professionnelles :</strong> nom de la structure, type de pratique, pays</li>
            <li><strong>Données d'utilisation :</strong> logs de connexion, pages visitées, actions effectuées</li>
            <li><strong>Données vétérinaires :</strong> dossiers patients, historiques médicaux (stockés pour votre compte uniquement)</li>
            <li><strong>Données de paiement :</strong> traitées par nos prestataires certifiés (nous ne stockons pas les numéros de carte)</li>
          </ul>

          <h2>3. Finalités du traitement</h2>
          <p>Vos données sont traitées pour :</p>
          <ul>
            <li>La fourniture et l'amélioration de nos services</li>
            <li>La gestion de votre compte et de votre abonnement</li>
            <li>L'envoi de communications relatives à votre utilisation du service</li>
            <li>Le support client et la résolution de problèmes techniques</li>
            <li>La facturation et la gestion des paiements</li>
            <li>La conformité avec nos obligations légales</li>
          </ul>

          <h2>4. Sécurité des données</h2>
          <p>
            RecallVET met en œuvre des mesures de sécurité techniques et organisationnelles de niveau professionnel pour protéger vos données :
          </p>
          <ul>
            <li>Chiffrement SSL/TLS pour toutes les communications</li>
            <li>Chiffrement des données sensibles au repos (AES-256)</li>
            <li>Sauvegardes automatiques quotidiennes avec rétention 30 jours</li>
            <li>Accès aux données restreint par rôles et authentification à deux facteurs</li>
            <li>Audits de sécurité réguliers et tests de pénétration</li>
            <li>Hébergement sur des serveurs certifiés ISO 27001</li>
          </ul>

          <h2>5. Conservation des données</h2>
          <p>
            Vos données sont conservées pendant toute la durée de votre abonnement actif, plus une période de 60 jours après
            résiliation pour vous permettre de récupérer vos informations. Les données vétérinaires (dossiers patients) peuvent
            être soumises à des obligations de conservation plus longues selon la réglementation de votre pays.
          </p>

          <h2>6. Partage des données</h2>
          <p>
            Nous ne vendons jamais vos données personnelles à des tiers. Nous pouvons partager certaines données avec :
          </p>
          <ul>
            <li>Nos prestataires techniques (hébergement, paiement) sous contrats de sous-traitance stricts</li>
            <li>Les autorités compétentes si requis par la loi</li>
            <li>En cas de fusion ou acquisition, avec votre information préalable</li>
          </ul>

          <h2>7. Vos droits</h2>
          <p>Conformément aux lois applicables sur la protection des données, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@recallvet.com">privacy@recallvet.com</a>.
            Nous répondrons dans un délai de 30 jours.
          </p>

          <h2>8. Cookies</h2>
          <p>
            Notre site utilise des cookies essentiels au fonctionnement du service et des cookies analytiques anonymisés
            pour améliorer votre expérience. Vous pouvez désactiver les cookies non essentiels via les paramètres de votre navigateur.
          </p>

          <h2>9. Modifications de cette politique</h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité. En cas de changement significatif, nous vous
            notifierons par email et/ou via une notification sur la plateforme au moins 30 jours avant l'entrée en vigueur.
          </p>

          <h2>10. Contact</h2>
          <p>
            Pour toute question relative à cette politique ou à la protection de vos données :<br />
            <a href="mailto:privacy@recallvet.com">privacy@recallvet.com</a><br />
            RecallVET SAS – Yaoundé, Cameroun
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
