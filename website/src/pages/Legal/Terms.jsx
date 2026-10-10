import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';

export default function Terms() {
  return (
    <>
      <SEO
        title="Conditions d'utilisation"
        description="Conditions générales d'utilisation de RecallVET. Lisez attentivement avant d'utiliser notre service."
        url="/legal/conditions"
      />

      <div className="page-header page-header--legal">
        <div className="container">
          <h1>Conditions d'utilisation</h1>
          <p>Dernière mise à jour : 1er septembre 2026</p>
        </div>
      </div>

      <div className="container">
        <div className="legal-page">
          <p>
            Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la plateforme
            RecallVET, accessible via l'adresse <strong>recallvet.com</strong> et ses sous-domaines. En utilisant RecallVET,
            vous acceptez sans réserve les présentes conditions.
          </p>

          <h2>1. Définitions</h2>
          <ul>
            <li><strong>« Plateforme »</strong> : l'ensemble des services RecallVET accessibles en ligne</li>
            <li><strong>« Utilisateur »</strong> : toute personne physique ou morale accédant à la Plateforme</li>
            <li><strong>« Compte »</strong> : l'espace personnel créé lors de l'inscription</li>
            <li><strong>« Abonnement »</strong> : le contrat de service souscrit par l'Utilisateur</li>
            <li><strong>« Données »</strong> : toutes informations saisies ou générées via la Plateforme</li>
          </ul>

          <h2>2. Accès au service</h2>
          <p>
            RecallVET est un service SaaS (Software as a Service) accessible via internet. Vous êtes responsable de
            la connexion internet nécessaire à l'utilisation du service. Un essai gratuit de 30 jours est offert sans
            engagement ni carte bancaire requise.
          </p>

          <h2>3. Création de compte</h2>
          <p>
            L'accès à la Plateforme nécessite la création d'un compte. Vous vous engagez à fournir des informations
            exactes et à les maintenir à jour. Vous êtes responsable de la confidentialité de vos identifiants et
            de toutes les actions effectuées depuis votre compte.
          </p>
          <p>
            RecallVET se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU,
            d'utilisation abusive, ou de non-paiement.
          </p>

          <h2>4. Abonnement et facturation</h2>
          <ul>
            <li>Les abonnements sont mensuels ou annuels selon le plan choisi</li>
            <li>Le paiement est dû en avance pour la période choisie</li>
            <li>En cas de résiliation, l'abonnement reste actif jusqu'à la fin de la période payée</li>
            <li>Aucun remboursement prorata pour les périodes non utilisées, sauf en cas de faute de RecallVET</li>
            <li>Les tarifs peuvent évoluer avec un préavis de 30 jours</li>
            <li>La TVA et taxes locales applicables sont ajoutées selon votre pays</li>
          </ul>

          <h2>5. Propriété des données</h2>
          <p>
            <strong>Vos données vous appartiennent.</strong> RecallVET n'acquiert aucun droit de propriété sur les
            données que vous saisissez dans la Plateforme. Nous traitons ces données uniquement pour vous fournir le service.
            Vous pouvez exporter l'intégralité de vos données à tout moment via les fonctions d'export de la Plateforme.
          </p>

          <h2>6. Propriété intellectuelle</h2>
          <p>
            RecallVET et l'ensemble de ses composants (code, design, marques, logos, contenus) sont protégés par les
            droits de propriété intellectuelle. Toute reproduction, modification ou utilisation non autorisée est strictement interdite.
          </p>

          <h2>7. Disponibilité du service</h2>
          <p>
            RecallVET s'engage à maintenir une disponibilité de service de 99.9% sur base mensuelle (hors maintenances
            planifiées communiquées 48h à l'avance). En cas d'interruption dépassant ce seuil sur un mois, un crédit
            de service proportionnel sera accordé sur la prochaine facturation.
          </p>

          <h2>8. Responsabilités et garanties</h2>
          <p>
            RecallVET fournit la Plateforme "en l'état" et ne peut garantir qu'elle sera exempte d'erreurs.
            RecallVET ne saurait être tenu responsable des décisions médicales ou vétérinaires prises sur la base
            des informations gérées dans la Plateforme. L'Utilisateur reste seul responsable de l'exercice de son activité professionnelle.
          </p>
          <p>
            La responsabilité de RecallVET est limitée au montant des sommes versées par l'Utilisateur au cours des
            12 derniers mois précédant le dommage allégué.
          </p>

          <h2>9. Utilisation acceptable</h2>
          <p>Il est interdit d'utiliser RecallVET pour :</p>
          <ul>
            <li>Des activités illégales ou contraires à l'ordre public</li>
            <li>L'envoi de spam ou communications non sollicitées</li>
            <li>Tenter d'accéder à des données d'autres utilisateurs</li>
            <li>Surcharger ou compromettre l'infrastructure de la Plateforme</li>
            <li>Revendre ou sous-licencier l'accès à la Plateforme sans autorisation</li>
          </ul>

          <h2>10. Résiliation</h2>
          <p>
            Vous pouvez résilier votre abonnement à tout moment depuis votre espace de gestion de compte.
            En cas de résiliation, vos données restent accessibles en lecture pendant 60 jours, puis sont définitivement supprimées.
            RecallVET peut résilier votre accès sans préavis en cas de violation grave des présentes CGU.
          </p>

          <h2>11. Modifications des CGU</h2>
          <p>
            RecallVET se réserve le droit de modifier les présentes CGU. Les modifications entrent en vigueur
            30 jours après notification par email. La poursuite de l'utilisation du service après cette période
            vaut acceptation des nouvelles conditions.
          </p>

          <h2>12. Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont soumises au droit camerounais. En cas de litige, les parties s'engagent à
            rechercher une solution amiable avant tout recours judiciaire. À défaut, les tribunaux compétents
            de Yaoundé (Cameroun) seront seuls compétents.
          </p>

          <h2>13. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU :<br />
            <a href="mailto:legal@recallvet.com">legal@recallvet.com</a><br />
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
