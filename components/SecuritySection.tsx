export default function SecuritySection() {
  return (
    <section className="security-section">
      <div className="security-container">
        <h2 className="security-title">Ta sécurité n'est pas négociable</h2>
        <p className="security-subtitle">
          On gère les faux profils, les arnaques, etc. pour que tu puisses te concentrer sur ta recherche.
        </p>
        
        <div className="security-cards">
          <div className="security-card">
            <div className="security-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 className="security-card-title">Vérification manuelle</h3>
            <p className="security-card-description">
              Pas de bot, pas de faux profil. Chaque inscription passe par notre équipe avant d'être validée.
            </p>
          </div>
          
          <div className="security-card">
            <div className="security-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
                <path d="M2 12h20"/>
              </svg>
            </div>
            <h3 className="security-card-title">Modération intelligente</h3>
            <p className="security-card-description">
              Notre IA scanne chaque message. Contenu inapproprié ? Bloqué instantanément. Pas de place pour les comportements irrespectueux.
            </p>
          </div>
          
          <div className="security-card">
            <div className="security-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="security-card-title">Contrôle total</h3>
            <p className="security-card-description">
              Mode anonyme, photos floues... Tu décides qui voit quoi. Tes données restent les tiennes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
