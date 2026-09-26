'use client'

import { useState, useRef, useEffect } from 'react'
import { User } from '@/types'
import { calculateAge } from '@/lib/utils'
import { compatibilityService } from '@/lib/compatibility'
import { calculateDistance, formatDistance } from '@/lib/location'

interface TinderCardProps {
  user: User
  currentUser: User | null
  onLike: () => void
  onPass: () => void
  onSuperLike: () => void
  onViewProfile: () => void
  isTop: boolean
}

export default function TinderCard({ 
  user, 
  currentUser, 
  onLike, 
  onPass, 
  onSuperLike,
  onViewProfile,
  isTop 
}: TinderCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const compatibilityScore = currentUser && user 
    ? compatibilityService.calculateCompatibility(currentUser, user)
    : 75

  // Calculate distance if both users have location
  const distance = currentUser && currentUser.latitude && currentUser.longitude && 
                   user.latitude && user.longitude && user.locationEnabled
    ? calculateDistance(currentUser.latitude, currentUser.longitude, user.latitude, user.longitude)
    : null

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return
    setIsDragging(true)
    setStartX(e.clientX - position.x)
    setStartY(e.clientY - position.y)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return
    const newX = e.clientX - startX
    const newY = e.clientY - startY
    setPosition({ x: newX, y: newY })
    setRotation(newX * 0.1)
  }

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return
    setIsDragging(false)

    const threshold = 100
    const superLikeThreshold = -100 // Swipe up for super like
    
    if (position.y < superLikeThreshold) {
      onSuperLike()
    } else if (position.x > threshold) {
      onLike()
    } else if (position.x < -threshold) {
      onPass()
    } else {
      // Reset position
      setPosition({ x: 0, y: 0 })
      setRotation(0)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return
    setIsDragging(true)
    setStartX(e.touches[0].clientX - position.x)
    setStartY(e.touches[0].clientY - position.y)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTop) return
    const newX = e.touches[0].clientX - startX
    const newY = e.touches[0].clientY - startY
    setPosition({ x: newX, y: newY })
    setRotation(newX * 0.1)
  }

  const handleTouchEnd = () => {
    if (!isDragging || !isTop) return
    setIsDragging(false)

    const threshold = 100
    const superLikeThreshold = -100 // Swipe up for super like
    
    if (position.y < superLikeThreshold) {
      onSuperLike()
    } else if (position.x > threshold) {
      onLike()
    } else if (position.x < -threshold) {
      onPass()
    } else {
      setPosition({ x: 0, y: 0 })
      setRotation(0)
    }
  }

  const getOverlayOpacity = () => {
    const threshold = 100
    if (position.x > 0) {
      return Math.min(position.x / threshold, 1)
    } else if (position.x < 0) {
      return Math.min(Math.abs(position.x) / threshold, 1)
    }
    return 0
  }

  const getSuperLikeOpacity = () => {
    const threshold = 100
    if (position.y < 0) {
      return Math.min(Math.abs(position.y) / threshold, 1)
    }
    return 0
  }

  const likeOpacity = position.x > 0 ? getOverlayOpacity() : 0
  const passOpacity = position.x < 0 ? getOverlayOpacity() : 0
  const superLikeOpacity = position.y < 0 ? getSuperLikeOpacity() : 0

  return (
    <div
      ref={cardRef}
      className={`tinder-card ${isTop ? 'top-card' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        cursor: isTop ? 'grab' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Like overlay */}
      <div 
        className="tinder-overlay like-overlay"
        style={{ opacity: likeOpacity }}
      >
        <span className="overlay-text">LIKE</span>
      </div>

      {/* Pass overlay */}
      <div 
        className="tinder-overlay pass-overlay"
        style={{ opacity: passOpacity }}
      >
        <span className="overlay-text">NOPE</span>
      </div>

      {/* Super Like overlay */}
      <div 
        className="tinder-overlay super-like-overlay"
        style={{ opacity: superLikeOpacity }}
      >
        <span className="overlay-text">SUPER LIKE</span>
      </div>

      {/* Card content */}
      <div className="tinder-card-content">
        {user.mainPhoto ? (
          <img 
            src={user.mainPhoto} 
            alt={`${user.firstName} ${user.lastName}`}
            className="tinder-card-image"
          />
        ) : (
          <div className="tinder-card-placeholder">
            <span className="placeholder-initials">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
        )}

        <div className="tinder-card-gradient"></div>

        <div className="tinder-card-info">
          <div className="tinder-card-header">
            <h2 className="tinder-card-name">
              {user.firstName}, {user.age || calculateAge(user.birthDate)}
            </h2>
            <div className="tinder-compatibility-badge">
              {compatibilityScore}%
            </div>
          </div>

          <div className="tinder-card-details">
            <div className="tinder-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {user.city}, {user.country}
              {distance !== null && (
                <span className="tinder-distance"> • {formatDistance(distance)}</span>
              )}
            </div>

            {user.profession && (
              <div className="tinder-profession">{user.profession}</div>
            )}

            {user.values && user.values.length > 0 && (
              <div className="tinder-values">
                {user.values.slice(0, 3).map((value, index) => (
                  <span key={index} className="tinder-value-tag">{value}</span>
                ))}
              </div>
            )}

            {user.faithImportance && (
              <div className="tinder-faith">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L12 22"/>
                  <path d="M8 8L16 8"/>
                  <path d="M9 13L15 13"/>
                </svg>
                {user.faithImportance === 'very_important' ? 'Foi centrale' : 
                 user.faithImportance === 'important' ? 'Foi importante' : 
                 user.faithImportance === 'moderate' ? 'Foi moyenne' : 'Foi modérée'}
              </div>
            )}

            {user.community && (
              <div className="tinder-community">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {user.community}
              </div>
            )}
          </div>

          <button 
            className="tinder-view-profile-btn"
            onClick={(e) => {
              e.stopPropagation()
              onViewProfile()
            }}
          >
            Voir le profil complet
          </button>
        </div>
      </div>
    </div>
  )
}
