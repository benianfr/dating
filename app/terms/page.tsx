import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link href="/" className="back-link">← Retour à l'accueil</Link>
        
        <h1 className="legal-title">Conditions d'utilisation</h1>
        <p className="legal-date">Dernière mise à jour : 17 Septembre 2026</p>
        
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Acceptation des conditions</h2>
            <p>En utilisant Foi & Cœur, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
          </section>
          
          <section className="legal-section">
            <h2>2. Description du service</h2>
            <p>Foi & Cœur est une plateforme de rencontres chrétiennes dédiée aux personnes cherchant le mariage selon leurs valeurs religieuses. Notre service permet aux utilisateurs de créer des profils, de rechercher d'autres membres et de communiquer entre eux.</p>
          </section>
          
          <section className="legal-section">
            <h2>3. Compte utilisateur</h2>
            <p>Pour utiliser notre service, vous devez créer un compte et fournir des informations exactes et complètes. Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités qui se produisent sous votre compte.</p>
          </section>
          
          <section className="legal-section">
            <h2>4. Comportement utilisateur</h2>
            <p>Vous vous engagez à :</p>
            <ul>
              <li>Fournir des informations véridiques et à jour</li>
              <li>Respecter les autres membres de la communauté</li>
              <li>Ne pas publier de contenu inapproprié ou offensant</li>
              <li>Ne pas utiliser le service à des fins illégales</li>
              <li>Respecter les valeurs chrétiennes et les principes de notre communauté</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>5. Confidentialité</h2>
            <p>Vos données personnelles sont protégées conformément à notre politique de confidentialité. Nous nous engageons à protéger votre vie privée et à ne pas partager vos informations sans votre consentement.</p>
          </section>
          
          <section className="legal-section">
            <h2>6. Propriété intellectuelle</h2>
            <p>Tout le contenu de Foi & Cœur, y compris les textes, images, logos et logiciels, est protégé par les lois sur la propriété intellectuelle.</p>
          </section>
          
          <section className="legal-section">
            <h2>7. Résiliation</h2>
            <p>Nous nous réservons le droit de résilier ou suspendre votre compte à tout moment en cas de violation des présentes conditions.</p>
          </section>
          
          <section className="legal-section">
            <h2>8. Contact</h2>
            <p>Pour toute question concernant ces conditions, contactez-nous à : contact@foi-coeur.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}