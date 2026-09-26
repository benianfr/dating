'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import { subscriptionService } from '@/lib/firestore'
import { userService } from '@/lib/firestore'

export default function PremiumPage() {
  const router = useRouter()
  const [userPlan, setUserPlan] = useState<'free' | 'gold' | 'platinum'>('free')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    loadUserPlan()
  }, [])

  const loadUserPlan = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }

      const plan = await subscriptionService.getUserPlan(userId)
      setUserPlan(plan)
    } catch (error) {
      console.error('Error loading user plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: 'gold' | 'platinum') => {
    try {
      setUpgrading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) return

      await subscriptionService.createSubscription(userId, plan)
      setUserPlan(plan)
      alert(`Félicitations! Vous êtes maintenant passé au plan ${plan === 'gold' ? 'Gold' : 'Platinum'}!`)
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Erreur lors de la mise à niveau de l\'abonnement.')
    } finally {
      setUpgrading(false)
    }
  }

  const handleDowngrade = async () => {
    try {
      setUpgrading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const activeSubscription = await subscriptionService.getActiveSubscription(userId)
      if (activeSubscription) {
        await subscriptionService.deactivateSubscription(activeSubscription.id)
      }
      setUserPlan('free')
      alert('Vous êtes revenu au plan gratuit.')
    } catch (error) {
      console.error('Error downgrading subscription:', error)
      alert('Erreur lors de l\'annulation de l\'abonnement.')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <RequireCompleteProfile>
        <div className="app-page">
          <AppHeader />
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </RequireCompleteProfile>
    )
  }

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
        <div className="premium-page">
          <div className="premium-container">
            <h1 className="premium-title">Passez à Premium</h1>
            <p className="premium-subtitle">Débloquez toutes les fonctionnalités pour trouver votre âme sœur plus rapidement</p>
            
            <div className="premium-plans">
              <div className={`premium-plan ${userPlan === 'free' ? 'current' : ''}`}>
                <div className="plan-header">
                  <h2>Gratuit</h2>
                  <div className="plan-price">0€</div>
                  <div className="plan-period">pour toujours</div>
                </div>
                <ul className="plan-features">
                  <li>Profils illimités</li>
                  <li>1 Super Like par jour</li>
                  <li>3 Rewinds par jour</li>
                  <li>Filtres de base</li>
                  <li className="unavailable">Voir qui vous a liké</li>
                  <li className="unavailable">Passport (voyage)</li>
                  <li className="unavailable">Profil boost</li>
                </ul>
                <button
                  className="plan-btn"
                  onClick={handleDowngrade}
                  disabled={upgrading || userPlan === 'free'}
                >
                  {upgrading ? 'Traitement...' : userPlan === 'free' ? 'Plan actuel' : 'Revenir'}
                </button>
              </div>

              <div className={`premium-plan gold ${userPlan === 'gold' ? 'current' : ''}`}>
                <div className="plan-badge">Populaire</div>
                <div className="plan-header">
                  <h2>Gold</h2>
                  <div className="plan-price">9.99€</div>
                  <div className="plan-period">par mois</div>
                </div>
                <ul className="plan-features">
                  <li>Tout du plan gratuit</li>
                  <li>5 Super Likes par jour</li>
                  <li>5 Rewinds par jour</li>
                  <li>Voir qui vous a liké</li>
                  <li>Filtres avancés</li>
                  <li>1 Profil boost par mois</li>
                  <li>Sans publicité</li>
                </ul>
                <button 
                  className="plan-btn gold-btn"
                  onClick={() => handleUpgrade('gold')}
                  disabled={upgrading || userPlan === 'gold'}
                >
                  {upgrading ? 'Traitement...' : userPlan === 'gold' ? 'Plan actuel' : 'Passer Gold'}
                </button>
              </div>

              <div className={`premium-plan platinum ${userPlan === 'platinum' ? 'current' : ''}`}>
                <div className="plan-badge">Premium</div>
                <div className="plan-header">
                  <h2>Platinum</h2>
                  <div className="plan-price">19.99€</div>
                  <div className="plan-period">par mois</div>
                </div>
                <ul className="plan-features">
                  <li>Tout du plan Gold</li>
                  <li>Super Likes illimités</li>
                  <li>Rewinds illimités</li>
                  <li>Passport (voyage)</li>
                  <li>5 Profil boosts par mois</li>
                  <li>Priorité dans les résultats</li>
                  <li>Support prioritaire</li>
                </ul>
                <button 
                  className="plan-btn platinum-btn"
                  onClick={() => handleUpgrade('platinum')}
                  disabled={upgrading || userPlan === 'platinum'}
                >
                  {upgrading ? 'Traitement...' : userPlan === 'platinum' ? 'Plan actuel' : 'Passer Platinum'}
                </button>
              </div>
            </div>

            <div className="premium-features">
              <h2>Fonctionnalités Premium</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">+</div>
                  <h3>Super Likes</h3>
                  <p>Montrez votre intérêt avec des Super Likes pour plus de chances de match</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">↩</div>
                  <h3>Rewind</h3>
                  <p>Annulez vos swipes accidentels avec la fonction Rewind</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">?</div>
                  <h3>Voir qui vous a liké</h3>
                  <p>Découvrez en avant-première qui a déjà liké votre profil</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">★</div>
                  <h3>Passport</h3>
                  <p>Rencontrez des personnes dans le monde entier avec le mode voyage</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">↑</div>
                  <h3>Boost</h3>
                  <p>Mettez votre profil en avant pour 30 minutes et obtenez plus de vues</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">▸</div>
                  <h3>Filtres avancés</h3>
                  <p>Affinez votre recherche avec des filtres personnalisés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireCompleteProfile>
  )
}