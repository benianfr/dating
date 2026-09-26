'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import { likeService } from '@/lib/firestore'
import { userService } from '@/lib/firestore'
import { matchService } from '@/lib/firestore'
import { User } from '@/types'

export default function LikesPage() {
  const router = useRouter()
  const [likers, setLikers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    loadLikers()
  }, [])

  const loadLikers = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }

      const user = await userService.getUserById(userId)
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUser(user)

      // Get users who liked the current user
      const receivedLikes = await likeService.getReceivedLikes(userId)
      
      // Load user data for each like
      const likerUsers: User[] = []
      for (const like of receivedLikes) {
        const liker = await userService.getUserById(like.fromUserId)
        if (liker && liker.isActive && liker.isComplete) {
          // Check if already matched
          const alreadyMatched = await matchService.areUsersMatched(userId, like.fromUserId)
          if (!alreadyMatched) {
            likerUsers.push(liker)
          }
        }
      }

      setLikers(likerUsers)
    } catch (error) {
      console.error('Error loading likers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (likerId: string) => {
    if (!currentUser) return

    try {
      await likeService.createLike(currentUser.id, likerId)
      
      // Check if it's a mutual like
      const isMutual = await likeService.isMutualLike(currentUser.id, likerId)
      if (isMutual) {
        // They already liked us, so this is a match!
        const { matchService } = await import('@/lib/firestore')
        const { messageService } = await import('@/lib/firestore')
        const { compatibilityService } = await import('@/lib/compatibility')
        
        const liker = likers.find(u => u.id === likerId)
        const compatibilityScore = liker 
          ? compatibilityService.calculateCompatibility(currentUser, liker)
          : 75
        
        await matchService.createMatch(currentUser.id, likerId, compatibilityScore)
        await messageService.createConversation(currentUser.id, likerId)
        
        alert('C\'est un match! Vous pouvez maintenant discuter.')
        router.push('/messages')
      }
      
      // Remove from list
      setLikers(prev => prev.filter(u => u.id !== likerId))
    } catch (error) {
      console.error('Error liking back:', error)
    }
  }

  const handlePass = (likerId: string) => {
    setLikers(prev => prev.filter(u => u.id !== likerId))
  }

  if (loading) {
    return (
      <RequireCompleteProfile>
        <div className="app-page">
          <AppHeader />
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement des likes...</p>
          </div>
        </div>
      </RequireCompleteProfile>
    )
  }

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
        <div className="likes-page">
          <div className="likes-container">
            <h1 className="page-title">Qui vous a liké</h1>
            
            {likers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h2>Aucun nouveau like</h2>
                <p>Continuez à découvrir des profils pour recevoir des likes!</p>
                <button className="btn-primary" onClick={() => router.push('/discover')}>Découvrir des profils</button>
              </div>
            ) : (
              <div className="likes-grid">
                {likers.map((liker) => (
                  <div key={liker.id} className="like-card">
                    <div className="like-photo">
                      {liker.mainPhoto ? (
                        <img src={liker.mainPhoto} alt={liker.firstName} className="like-photo-img" />
                      ) : (
                        <div className="photo-placeholder">
                          <span className="photo-initials">{liker.firstName?.[0]}{liker.lastName?.[0]}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="like-info">
                      <h3 className="like-name">
                        {liker.firstName}, {liker.age}
                      </h3>
                      <p className="like-location">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {liker.city}, {liker.country}
                      </p>
                      {liker.profession && (
                        <p className="like-profession">{liker.profession}</p>
                      )}
                    </div>
                    
                    <div className="like-actions">
                      <button 
                        className="like-action-btn pass-btn"
                        onClick={() => handlePass(liker.id)}
                      >
                        Passer
                      </button>
                      <button 
                        className="like-action-btn like-btn"
                        onClick={() => handleLike(liker.id)}
                      >
                        Like
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireCompleteProfile>
  )
}