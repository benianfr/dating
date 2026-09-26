export default function Testimonials() {
  const testimonials = [
    {
      text: "Enfin une plateforme où je me sens respectée. Pas de messages déplacés, que des profils sérieux. Je recommande à toutes les sœurs !",
      initial: 'A',
      name: 'Aminata D., 27 ans',
      location: 'Dakar, Sénégal'
    },
    {
      text: "L'interface est claire, les profils sont vérifiés, et l'équipe répond vite. C'est exactement ce qu'il nous fallait au Sénégal.",
      initial: 'O',
      name: 'Ousmane S., 31 ans',
      location: 'Thiès, Sénégal'
    },
    {
      text: "J'avais peur de m'exposer en ligne. Ici, le mode anonyme me rassure. Je peux chercher sereinement, en toute discrétion.",
      initial: 'F',
      name: 'Fatou N., 25 ans',
      location: 'Saint-Louis, Sénégal'
    }
  ]

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <button className="testimonials-badge">
          <div className="heart-icon"></div>
          <span>Ils l'ont fait</span>
        </button>
        
        <h2 className="testimonials-title">Des histoires qui finissent bien</h2>
        <p className="testimonials-subtitle">Ils ont trouvé leur moitié sur Foi & Cœur. Et toi ?</p>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
                <div className="star"></div>
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-initial">{testimonial.initial}</div>
                <div className="author-info">
                  <span className="author-name">{testimonial.name}</span>
                  <span className="author-location">{testimonial.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
