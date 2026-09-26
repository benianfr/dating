export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Inscris-toi en 5 minutes',
      description: 'Pseudo, email, quelques infos. C\'est rapide et 100% gratuit.'
    },
    {
      number: '02',
      title: 'Découvre des profils compatibles',
      description: 'Notre IA analyse tes critères et te propose des personnes qui te correspondent vraiment.'
    },
    {
      number: '03',
      title: 'Échange en toute sagesse',
      description: 'Messages modérés par IA, Ice Breakers pour bien démarrer. Pas de dérive, juste l\'essentiel.'
    },
    {
      number: '04',
      title: 'Rencontre ta moitié',
      description: 'Que Dieu facilite ta recherche et bénisse ton union. Amen.'
    },
    {
      number: '05',
      title: 'Construis ton foyer',
      description: 'Avec l\'approbation des familles et la bénédiction de Dieu, commencez votre vie commune.'
    }
  ]

  return (
    <section className="how-it-works">
      <div className="section-container">
        <h2 className="section-title">De l'inscription au mariage</h2>
        <p className="section-subtitle">
          Simple, rapide, efficace. Ton futur époux ou ta future épouse est peut-être à quelques clics.
        </p>
        
        <div className="steps">
          {steps.map((step, index) => (
            <div key={index} className="step" style={{ transitionDelay: `${index * 100}ms` }}>
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
