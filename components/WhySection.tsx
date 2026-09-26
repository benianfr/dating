export default function WhySection() {
  return (
    <section className="why-section">
      <div className="why-container">
        <button className="why-badge">Pourquoi Foi & Cœur</button>
        
        <h2 className="why-title">Pas une app de rencontre. Une app de mariage.</h2>
        <p className="why-subtitle">
          Une plateforme sérieuse, 100% chrétienne, pour ceux qui cherchent le mariage selon leurs valeurs.
        </p>
        
        <div className="why-cards">
          <div className="why-card">
            <div className="why-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h3 className="why-card-title">Zéro faux profil</h3>
            <p className="why-card-description">
              Chaque inscription est vérifiée à la main. Ici, tu parles à de vraies personnes.
            </p>
          </div>
          
          <div className="why-card">
            <div className="why-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                <path d="M12 2L12 22"/>
                <path d="M8 8L16 8"/>
                <path d="M9 13L15 13"/>
              </svg>
            </div>
            <h3 className="why-card-title">Les valeurs chrétiennes, sans compromis</h3>
            <p className="why-card-description">
              Pas de drague superficielle, pas de photos inappropriées. Juste des gens sérieux qui veulent se marier selon la foi.
            </p>
          </div>
          
          <div className="why-card">
            <div className="why-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
              </svg>
            </div>
            <h3 className="why-card-title">Ta vie privée, notre priorité</h3>
            <p className="why-card-description">
              Mode anonyme, photos floues... C'est toi qui décides qui te voit et quand.
            </p>
          </div>
          
          <div className="why-card">
            <div className="why-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="8" y2="16"/>
                <line x1="16" y1="16" x2="16" y2="16"/>
              </svg>
            </div>
            <h3 className="why-card-title">Coach IA personnel</h3>
            <p className="why-card-description">
              Pierre, ton coach IA, te guide 24h/24. Conseils personnalisés et Ice Breakers pour bien démarrer tes conversations.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
