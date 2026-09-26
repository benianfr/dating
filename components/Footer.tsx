export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon"></div>
              <span className="logo-text">Foi & Cœur</span>
            </div>
            <p className="footer-tagline">La plateforme de rencontres chrétiennes sérieuses pour le mariage</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-title">Navigation</h4>
              <a href="#" className="footer-link">Accueil</a>
              <a href="#" className="footer-link">Comment ça marche</a>
              <a href="#" className="footer-link">Tarifs</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">FAQ</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-title">Rencontre</h4>
              <a href="#" className="footer-link">Rencontre Abidjan</a>
              <a href="#" className="footer-link">Rencontre Dakar</a>
              <a href="#" className="footer-link">Rencontre Sénégal</a>
              <a href="#" className="footer-link">Rencontre Côte d'Ivoire</a>
              <a href="#" className="footer-link">Rencontre Mali</a>
              <a href="#" className="footer-link">Rencontre Burkina</a>
              <a href="#" className="footer-link">Rencontre Chrétienne</a>
              <a href="#" className="footer-link">Rencontre Gratuite</a>
              <a href="#" className="footer-link">Mariage Chrétien</a>
              <a href="#" className="footer-link">Femme Chrétienne</a>
              <a href="#" className="footer-link">Homme Chrétien</a>
              <a href="#" className="footer-link">Toutes les villes</a>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-title">Légal</h4>
              <a href="#" className="footer-link">Règlement</a>
              <a href="#" className="footer-link">Confidentialité</a>
              <a href="#" className="footer-link">Mentions légales</a>
              <a href="#" className="footer-link">CGV</a>
              <a href="#" className="footer-link">Accord de traitement (DPA)</a>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-title">Contact</h4>
              <a href="mailto:contact@foi-coeur.com" className="footer-link">contact@foi-coeur.com</a>
              <span className="footer-link">Abidjan, Côte d'Ivoire</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <button className="footer-cta">Rejoindre Foi & Cœur →</button>
            <div className="compliance-badge">RGPD 100% Conforme</div>
          </div>
          <p>&copy; 2026 Foi & Cœur. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
