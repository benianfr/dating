export default function PricingSection() {
  return (
    <section className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-header-content">
          <h2 className="pricing-title">Choisis ton plan</h2>
          <p className="pricing-subtitle">Commence gratuitement ou passe Premium pour maximiser tes chances</p>
        </div>
        
        <div className="pricing-cards">
          {/* Free Plan */}
          <div className="pricing-card free">
            <div className="pricing-card-top">
              <div className="pricing-icon">
                <div className="icon-circle"></div>
              </div>
              <div className="pricing-header">
                <h3 className="pricing-plan">Gratuit</h3>
                <div className="pricing-price-wrapper">
                  <span className="pricing-price">0 FCFA</span>
                  <span className="pricing-period">pour toujours</span>
                </div>
              </div>
            </div>
            
            <div className="pricing-divider"></div>
            
            <div className="pricing-features">
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Création de profil complète</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>3 photos de profil</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>5 demandes de contact par jour</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>3 questions par jour au coach IA</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Répondre aux messages reçus</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Ice Breaker : idées de messages</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Accès à l'Académie du Mariage</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Support par email</span>
              </div>
            </div>
            
            <div className="pricing-card-footer">
              <button className="pricing-btn">Commencer gratuitement</button>
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className="pricing-card premium">
            <div className="pricing-badge">POPULAIRE</div>
            <div className="pricing-card-top">
              <div className="pricing-icon premium-icon">
                <div className="icon-circle"></div>
                <div className="crown-icon"></div>
              </div>
              <div className="pricing-header">
                <h3 className="pricing-plan">Premium</h3>
                <div className="pricing-price-wrapper">
                  <div className="discount-badge">
                    <span className="discount-text">-40%</span>
                  </div>
                  <div className="price-container">
                    <span className="original-price">9,900 FCFA</span>
                    <span className="pricing-price">5,900 FCFA</span>
                  </div>
                  <span className="pricing-period">par mois</span>
                </div>
              </div>
            </div>
            
            <div className="pricing-highlight">
              <div className="highlight-icon">⚡</div>
              <span>Maximise tes chances de trouver ta moitié</span>
            </div>
            
            <div className="pricing-divider"></div>
            
            <div className="pricing-features">
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Demandes de contact illimitées</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Questions illimitées au coach IA</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Voir qui t'a ajouté en favoris</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Voir qui a visité ton profil</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Jusqu'à 10 photos HD sur ton profil</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>100% messagerie illimitée</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Messages vocaux <span className="new-badge">NOUVEAU</span></span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Voir qui est connecté</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Ice Breaker personnalisé</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Message Flash : faire bonne impression</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Score de compatibilité IA détaillé</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Meilleur classement dans les résultats</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Filtres avancés (confession, église...)</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Boosts de profil inclus</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Badge Premium vérifié</span>
              </div>
              <div className="feature-item included">
                <div className="feature-icon"></div>
                <span>Support prioritaire 7j/7</span>
              </div>
            </div>
            
            <div className="pricing-card-footer">
              <button className="pricing-btn primary">Devenir Premium</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
