'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulation d'envoi
    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Link href="/login" className="back-link">
              ← Retour
            </Link>
            <h1 className="login-title">Mot de passe oublié ?</h1>
            <p className="login-subtitle">
              {submitted 
                ? "Un email de réinitialisation a été envoyé" 
                : "Entrez votre email pour réinitialiser votre mot de passe"
              }
            </p>
          </div>

          {!submitted && (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}

          {submitted && (
            <div className="success-message">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p>Consultez votre boîte mail pour suivre les instructions de réinitialisation.</p>
              <button 
                className="login-btn" 
                onClick={() => setSubmitted(false)}
              >
                Renvoyer l'email
              </button>
            </div>
          )}

          <div className="login-footer">
            <p>
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link href="/login" className="register-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}