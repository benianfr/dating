'use client'

import { User } from '@/types'

interface MatchOverlayProps {
  user1: User
  user2: User
  onMessage: () => void
  onKeepSwiping: () => void
  onClose: () => void
}

export default function MatchOverlay({ 
  user1, 
  user2, 
  onMessage, 
  onKeepSwiping,
  onClose 
}: MatchOverlayProps) {
  return (
    <div className="tinder-match-overlay" onClick={onClose}>
      <div className="tinder-match-content" onClick={(e) => e.stopPropagation()}>
        <div className="tinder-match-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h1 className="tinder-match-title">C'est un Match!</h1>
        <p className="tinder-match-subtitle">
          {user1.firstName} et {user2.firstName} s'apprécient mutuellement
        </p>
        <p className="tinder-match-verse">
          "Car là où deux ou trois sont réunis en mon nom, je suis au milieu d'eux." - Matthieu 18:20
        </p>
        
        <div className="tinder-match-photos">
          <div className="tinder-match-photo-container">
            {user1.mainPhoto ? (
              <img 
                src={user1.mainPhoto} 
                alt={user1.firstName}
                className="tinder-match-photo"
              />
            ) : (
              <div className="tinder-match-photo-placeholder">
                {user1.firstName?.[0]}{user1.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="tinder-match-photo-container">
            {user2.mainPhoto ? (
              <img 
                src={user2.mainPhoto} 
                alt={user2.firstName}
                className="tinder-match-photo"
              />
            ) : (
              <div className="tinder-match-photo-placeholder">
                {user2.firstName?.[0]}{user2.lastName?.[0]}
              </div>
            )}
          </div>
        </div>
        
        <div className="tinder-match-actions">
          <button className="tinder-match-btn" onClick={onMessage}>
            Envoyer un message
          </button>
          <button className="tinder-match-btn secondary" onClick={onKeepSwiping}>
            Continuer à swiper
          </button>
        </div>
      </div>
    </div>
  )
}
