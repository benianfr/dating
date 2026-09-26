'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import { matchService } from '@/lib/firestore'
import { userService } from '@/lib/firestore'
import { messageService } from '@/lib/firestore'
import { Match, User } from '@/types'

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<{ [key: string]: User }>({})
  const [conversations, setConversations] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }

      const userMatches = await matchService.getUserMatches(userId)
      setMatches(userMatches)

      // Load users and conversations for each match
      const usersData: { [key: string]: User } = {}
      const conversationsData: { [key: string]: string } = {}
      
      for (const match of userMatches) {
        const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1
        const user = await userService.getUserById(otherUserId)
        if (user) {
          usersData[otherUserId] = user
        }
        
        // Get or create conversation
        const conversation = await messageService.getConversation(userId, otherUserId)
        if (conversation) {
          conversationsData[otherUserId] = conversation.id
        } else {
          // Create conversation if it doesn't exist
          const conversationId = await messageService.createConversation(userId, otherUserId)
          conversationsData[otherUserId] = conversationId
        }
      }
      setUsers(usersData)
      setConversations(conversationsData)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <RequireCompleteProfile>
        <div className="app-page">
          <AppHeader />
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement des matchs...</p>
          </div>
        </div>
      </RequireCompleteProfile>
    )
  }

  if (matches.length === 0) {
    return (
      <RequireCompleteProfile>
        <div className="app-page">
          <AppHeader />
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h2>Aucun match pour le moment</h2>
            <p>Continuez à découvrir des profils pour trouver votre âme sœur.</p>
            <button className="btn-primary" onClick={() => router.push('/discover')}>Découvrir des profils</button>
          </div>
        </div>
      </RequireCompleteProfile>
    )
  }

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
      <div className="matches-page">
        <div className="matches-container">
          <h1 className="page-title">Mes Matchs</h1>
          
          <div className="matches-grid">
            {matches.map((match) => {
              const userId = match.userId1 === localStorage.getItem('userId') ? match.userId2 : match.userId1
              const user = users[userId]
              
              if (!user) return null
              
              const matchDate = new Date(match.matchedAt)
              const timeAgo = getTimeAgo(matchDate)
              
              return (
                <div key={match.id} className="match-card">
                  <div className="match-photo">
                    {user.mainPhoto ? (
                      <img src={user.mainPhoto} alt={user.firstName} className="match-photo-img" />
                    ) : (
                      <div className="photo-placeholder">
                        <span className="photo-initials">{user.firstName?.[0] || '?'}</span>
                      </div>
                    )}
                    <div className="match-compatibility">
                      <span className="compatibility-score">{match.compatibilityScore}%</span>
                    </div>
                  </div>
                  
                  <div className="match-info">
                    <h3 className="match-name">
                      {user.firstName}, {user.age}
                    </h3>
                    <p className="match-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {user.city}, {user.country}
                    </p>
                    <p className="match-date">{timeAgo}</p>
                  </div>
                  
                  <button 
                    className="message-btn"
                    onClick={() => {
                      const conversationId = conversations[userId]
                      if (conversationId) {
                        router.push(`/messages?conversation=${conversationId}`)
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: 'inline', verticalAlign: 'middle', marginRight: '6px'}}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Envoyer un message
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
    </RequireCompleteProfile>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Il y a quelques secondes'
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  return `Il y a ${Math.floor(diffInSeconds / 604800)} sem`
}