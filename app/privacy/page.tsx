import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link href="/" className="back-link">← Retour à l'accueil</Link>
        
        <h1 className="legal-title">Politique de confidentialité</h1>
        <p className="legal-date">Dernière mise à jour : 17 Septembre 2026</p>
        
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Collecte des données</h2>
            <p>Foi & Cœur collecte les informations personnelles que vous nous fournissez lors de votre inscription, notamment votre nom, email, photos et préférences de recherche.</p>
          </section>
          
          <section className="legal-section">
            <h2>2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Fournir et améliorer notre service</li>
              <li>Faciliter les connexions entre membres</li>
              <li>Assurer la sécurité et prévenir les abus</li>
              <li>Communiquer avec vous concernant votre compte</li>
              <li>Personnaliser votre expérience</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>3. Protection des données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre l'accès non autorisé, la modification, la divulgation ou la destruction.</p>
          </section>
          
          <section className="legal-section">
            <h2>4. Partage des données</h2>
            <p>Nous ne partageons pas vos données personnelles avec des tiers sans votre consentement, sauf dans les cas suivants :</p>
            <ul>
              <li>Si requis par la loi</li>
              <li>Pour protéger nos droits ou notre sécurité</li>
              <li>Avec des fournisseurs de services qui nous aident à exploiter notre service</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>5. Vos droits</h2>
            <p>Vous avez le droit de :</p>
            <ul>
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier des données inexactes</li>
              <li>Supprimer vos données personnelles</li>
              <li>Vous opposer au traitement de vos données</li>
              <li>Porter plainte auprès d'une autorité de contrôle</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>6. Cookies</h2>
            <p>Nous utilisons des cookies pour améliorer votre expérience, analyser l'utilisation de notre service et personnaliser le contenu. Vous pouvez configurer votre navigateur pour refuser les cookies.</p>
          </section>
          
          <section className="legal-section">
            <h2>7. Modifications</h2>
            <p>Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons des modifications importantes par email ou via notre service.</p>
          </section>
          
          <section className="legal-section">
            <h2>8. Contact</h2>
            <p>Pour toute question concernant votre vie privée, contactez-nous à : privacy@foi-coeur.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}