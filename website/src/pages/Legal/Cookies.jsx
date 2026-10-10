import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';

export default function Cookies() {
  return (
    <>
      <SEO
        title="Politique de cookies"
        description="Politique de cookies de RecallVET – quels cookies nous utilisons, pourquoi, et comment les gérer."
        url="/legal/cookies"
      />

      <div className="page-header page-header--legal">
        <div className="container">
          <h1>Politique de cookies</h1>
          <p>Dernière mise à jour : 1er septembre 2026</p>
        </div>
      </div>

      <div className="container">
        <div className="legal-page">
          <p>
            Cette politique de cookies explique ce que sont les cookies, comment RecallVET les utilise sur son site web
            et sa plateforme, quels types de cookies nous utilisons, et comment vous pouvez gérer vos préférences en
            matière de cookies.
          </p>

          <h2>1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque
            vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et préférences (langue,
            taille d'affichage, etc.) pendant une durée déterminée, afin que vous n'ayez pas à les ressaisir à chaque
            visite ou navigation d'une page à l'autre.
          </p>

          <h2>2. Types de cookies utilisés</h2>

          <h3>Cookies essentiels</h3>
          <p>
            Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés. Ils incluent
            notamment :
          </p>
          <ul>
            <li>Cookie de session pour maintenir votre connexion</li>
            <li>Cookie de sécurité CSRF pour protéger contre les attaques</li>
            <li>Cookie de préférence de langue</li>
            <li>Cookie de consentement pour mémoriser votre choix concernant les cookies</li>
          </ul>

          <h3>Cookies analytiques</h3>
          <p>
            Ces cookies nous permettent de comprendre comment les visiteurs utilisent notre site, en collectant des
            informations anonymisées. Ils nous aident à améliorer le fonctionnement et le contenu de notre plateforme.
          </p>
          <ul>
            <li>Nombre de visiteurs et pages consultées</li>
            <li>Durée moyenne des sessions</li>
            <li>Sources de trafic (d'où viennent nos visiteurs)</li>
            <li>Taux de rebond et parcours de navigation</li>
          </ul>

          <h3>Cookies de préférences</h3>
          <p>
            Ces cookies permettent à notre site de mémoriser vos choix et préférences pour vous offrir une expérience
            plus personnalisée :
          </p>
          <ul>
            <li>Langue préférée</li>
            <li>Fuseau horaire</li>
            <li>Préférences d'affichage (thème, densité)</li>
          </ul>

          <h2>3. Comment gérer les cookies</h2>
          <p>
            Vous pouvez contrôler et/ou supprimer les cookies à tout moment. Voici comment procéder selon votre
            navigateur :
          </p>
          <ul>
            <li><strong>Google Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies et autres données de site</li>
            <li><strong>Mozilla Firefox :</strong> Options &gt; Vie privée et sécurité &gt; Cookies et données de sites</li>
            <li><strong>Safari :</strong> Préférences &gt; Confidentialité &gt; Gérer les données de site web</li>
            <li><strong>Microsoft Edge :</strong> Paramètres &gt; Cookies et autorisations de site</li>
          </ul>
          <p>
            <strong>Attention :</strong> la désactivation de certains cookies peut affecter le fonctionnement de notre
            plateforme. Les cookies essentiels ne peuvent pas être désactivés sans compromettre l'utilisation du service.
          </p>

          <h2>4. Cookies tiers</h2>
          <p>
            Certains cookies peuvent être déposés par des services tiers que nous utilisons pour améliorer votre
            expérience :
          </p>
          <ul>
            <li><strong>Analytiques :</strong> pour mesurer l'audience de notre site de manière anonyme</li>
            <li><strong>Support client :</strong> pour le fonctionnement de notre widget de chat en direct</li>
            <li><strong>Paiement :</strong> pour sécuriser les transactions via nos prestataires de paiement</li>
          </ul>
          <p>
            Nous veillons à ce que tous nos partenaires tiers respectent les réglementations en vigueur en matière de
            protection des données.
          </p>

          <h2>5. Mises à jour de cette politique</h2>
          <p>
            Nous pouvons mettre à jour cette politique de cookies pour refléter des changements dans notre utilisation
            des cookies ou pour des raisons réglementaires. Toute modification sera publiée sur cette page avec une
            date de mise à jour révisée. Nous vous encourageons à consulter cette page régulièrement.
          </p>

          <h2>6. Contact</h2>
          <p>
            Pour toute question concernant notre utilisation des cookies :<br />
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
