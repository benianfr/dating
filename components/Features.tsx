export default function Features() {
  return (
    <section className="features">
      <div className="features-container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3 className="feature-title">Profils vérifiés</h3>
            <p className="feature-description">Chaque profil est vérifié pour garantir des rencontres authentiques et sérieuses.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3 className="feature-title">Valeurs chrétiennes</h3>
            <p className="feature-description">Une communauté dédiée aux chrétiens cherchant le mariage selon leurs valeurs.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3 className="feature-title">Matching intelligent</h3>
            <p className="feature-description">Notre algorithme connecte les profils basés sur la foi et les valeurs communes.</p>
          </div>
        </div>
      </div>
    </section>
  )
}