'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import TinderCard from '../../components/TinderCard'
import MatchOverlay from '../../components/MatchOverlay'
import FilterPanel, { FilterState } from '../../components/FilterPanel'
import { userService } from '@/lib/firestore'
import { likeService } from '@/lib/firestore'
import { matchService } from '@/lib/firestore'
import { messageService } from '@/lib/firestore'
import { boostService } from '@/lib/firestore'
import { subscriptionService } from '@/lib/firestore'
import { compatibilityService } from '@/lib/compatibility'
import { User } from '@/types'

export default function DiscoverPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMatchOverlay, setShowMatchOverlay] = useState(false)
  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const [superLikesRemaining, setSuperLikesRemaining] = useState(0)
  const [hasActiveBoost, setHasActiveBoost] = useState(false)
  const [boosting, setBoosting] = useState(false)
  const [swipeHistory, setSwipeHistory] = useState<{profile: User, action: 'like' | 'pass' | 'superlike'}[]>([])
  const [rewindsRemaining, setRewindsRemaining] = useState(3)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    ageMin: 18,
    ageMax: 100,
    distance: 100,
    objective: undefined,
    faithImportance: undefined,
    wantsChildren: undefined
  })
  const [premiumFeatures, setPremiumFeatures] = useState({
    unlimitedLikes: false,
    unlimitedSuperLikes: false,
    unlimitedRewinds: false,
    seeWhoLikedYou: false,
    dailySuperLikes: 1,
    dailyRewinds: 3
  })
  const [userPlan, setUserPlan] = useState<'free' | 'gold' | 'platinum'>('free')

  useEffect(() => {
    loadProfiles()
    loadSuperLikesRemaining()
    loadBoostStatus()
    loadPremiumFeatures()
  }, [])

  const loadProfiles = async () => {
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

      const discoverUsers = await userService.getDiscoverUsers(userId, user.gender, {
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        objective: filters.objective,
        faithImportance: filters.faithImportance,
        maxDistance: filters.distance,
        currentLat: user.latitude,
        currentLon: user.longitude
      })
      
      // Apply client-side filtering for more complex filters
      let filteredUsers = discoverUsers
      
      if (filters.wantsChildren !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.wantsChildren === filters.wantsChildren)
      }
      
      setProfiles(filteredUsers)
      setCurrentIndex(0)
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSuperLikesRemaining = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const remaining = await boostService.getSuperLikeRemaining(userId)
      setSuperLikesRemaining(remaining.dailyRemaining)
    } catch (error) {
      console.error('Error loading super likes remaining:', error)
    }
  }

  const loadBoostStatus = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const hasBoost = await boostService.hasActiveBoost(userId)
      setHasActiveBoost(hasBoost)
    } catch (error) {
      console.error('Error loading boost status:', error)
    }
  }

  const loadPremiumFeatures = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const plan = await subscriptionService.getUserPlan(userId)
      setUserPlan(plan)
      
      const features = await subscriptionService.getPremiumFeatures(userId)
      setPremiumFeatures(features)
      
      // Update remaining counts based on premium status
      if (features.unlimitedSuperLikes) {
        setSuperLikesRemaining(999)
      }
      if (features.unlimitedRewinds) {
        setRewindsRemaining(999)
      }
    } catch (error) {
      console.error('Error loading premium features:', error)
    }
  }

  const handleLike = async (profileId: string) => {
    try {
      if (!currentUser) return
      
      // Track swipe history for rewind
      const profile = profiles.find(p => p.id === profileId)
      if (profile) {
        setSwipeHistory(prev => [...prev, { profile, action: 'like' }])
      }
      
      await likeService.createLike(currentUser.id, profileId)
      
      // Remove the profile from the list
      setProfiles(prev => prev.filter(p => p.id !== profileId))
      
      const isMutual = await likeService.isMutualLike(currentUser.id, profileId)
      if (isMutual) {
        // Check if match already exists
        const alreadyMatched = await matchService.areUsersMatched(currentUser.id, profileId)
        
        if (!alreadyMatched) {
          // Calculate dynamic compatibility score
          const profile = profiles.find(p => p.id === profileId)
          const compatibilityScore = profile 
            ? compatibilityService.calculateCompatibility(currentUser, profile)
            : 75 // fallback score
          
          await matchService.createMatch(currentUser.id, profileId, compatibilityScore)
          
          // Create conversation for the match
          await messageService.createConversation(currentUser.id, profileId)
        }
        
        // Show match overlay
        const matchedProfile = profiles.find(p => p.id === profileId)
        if (matchedProfile) {
          setMatchedUser(matchedProfile)
          setShowMatchOverlay(true)
        }
      }
    } catch (error) {
      console.error('Error liking profile:', error)
    }
  }

  const handlePass = (profileId: string) => {
    // Track swipe history for rewind
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setSwipeHistory(prev => [...prev, { profile, action: 'pass' }])
    }
    
    setProfiles(prev => prev.filter(p => p.id !== profileId))
  }

  const handleSuperLike = async (profileId: string) => {
    try {
      if (!currentUser) return
      
      // Check if user has super likes remaining (skip check for unlimited)
      if (!premiumFeatures.unlimitedSuperLikes) {
        const canSuperLike = await boostService.useSuperLike(currentUser.id)
        if (!canSuperLike) {
          alert('Vous avez utilisé votre Super Like gratuit pour aujourd\'hui. Passez à Gold pour plus de Super Likes!')
          return
        }
        
        // Update remaining count
        setSuperLikesRemaining(prev => Math.max(0, prev - 1))
      }
      
      // Track swipe history for rewind
      const profile = profiles.find(p => p.id === profileId)
      if (profile) {
        setSwipeHistory(prev => [...prev, { profile, action: 'superlike' }])
      }
      
      await likeService.createSuperLike(currentUser.id, profileId)
      
      // Remove the profile from the list
      setProfiles(prev => prev.filter(p => p.id !== profileId))
      
      const isMutual = await likeService.isMutualLike(currentUser.id, profileId)
      if (isMutual) {
        // Check if match already exists
        const alreadyMatched = await matchService.areUsersMatched(currentUser.id, profileId)
        
        if (!alreadyMatched) {
          // Calculate dynamic compatibility score with bonus for super like
          const profile = profiles.find(p => p.id === profileId)
          const compatibilityScore = profile 
            ? Math.min(100, compatibilityService.calculateCompatibility(currentUser, profile) + 10) // Add 10% bonus for super like
            : 85 // fallback score with bonus
          
          await matchService.createMatch(currentUser.id, profileId, compatibilityScore)
          
          // Create conversation for the match
          await messageService.createConversation(currentUser.id, profileId)
        }
        
        // Show match overlay with super like indicator
        const matchedProfile = profiles.find(p => p.id === profileId)
        if (matchedProfile) {
          setMatchedUser(matchedProfile)
          setShowMatchOverlay(true)
        }
      }
    } catch (error) {
      console.error('Error super liking profile:', error)
    }
  }

  const handleBoost = async () => {
    try {
      if (!currentUser) return
      
      if (hasActiveBoost) {
        alert('Vous avez déjà un Boost actif!')
        return
      }
      
      setBoosting(true)
      await boostService.createBoost(currentUser.id)
      setHasActiveBoost(true)
      alert('Boost activé! Votre profil sera mis en avant pendant 30 minutes.')
      
      // Reload profiles to see yourself boosted in discovery
      await loadProfiles()
    } catch (error) {
      console.error('Error activating boost:', error)
      alert('Erreur lors de l\'activation du Boost.')
    } finally {
      setBoosting(false)
    }
  }

  const handleRewind = async () => {
    if (!premiumFeatures.unlimitedRewinds && rewindsRemaining <= 0) {
      alert('Vous avez utilisé vos 3 Rewinds pour la journée. Passez à Gold pour plus de Rewinds!')
      return
    }

    if (swipeHistory.length === 0) {
      alert('Aucun swipe à annuler.')
      return
    }

    try {
      const lastSwipe = swipeHistory[swipeHistory.length - 1]
      
      // Remove the like/pass from database if it was a like
      if (lastSwipe.action === 'like' || lastSwipe.action === 'superlike') {
        await likeService.deleteLikeBetweenUsers(currentUser!.id, lastSwipe.profile.id)
      }
      
      // Add the profile back to the list
      setProfiles(prev => [lastSwipe.profile, ...prev])
      
      // Remove from history
      setSwipeHistory(prev => prev.slice(0, -1))
      
      // Decrease rewinds remaining (only if not unlimited)
      if (!premiumFeatures.unlimitedRewinds) {
        setRewindsRemaining(prev => prev - 1)
      }
      
      alert('Swipe annulé avec succès!')
    } catch (error) {
      console.error('Error rewinding swipe:', error)
      alert('Erreur lors de l\'annulation du swipe.')
    }
  }

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
    loadProfiles()
  }

  const handleViewProfile = (profileId: string) => {
    router.push(`/profile/${profileId}`)
  }

  const handleMatchMessage = () => {
    setShowMatchOverlay(false)
    if (matchedUser) {
      // Navigate to messages with this user
      router.push('/messages')
    }
  }

  const handleKeepSwiping = () => {
    setShowMatchOverlay(false)
    setMatchedUser(null)
  }

  if (loading) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="loading-state-modern">
          <div className="loading-spinner-modern"></div>
          <p>Découverte de profils en cours...</p>
        </div>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="empty-state-modern">
          <div className="empty-icon-modern">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h2>Aucun profil disponible</h2>
          <p>Nous n'avons pas trouvé de nouvelles suggestions pour le moment.</p>
          <button className="refresh-btn-modern" onClick={loadProfiles}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Rafraîchir
          </button>
        </div>
      </div>
    )
  }

  const currentProfile = profiles[0] // Always show the first profile

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
        <div className="discover-page-modern">
          <div className="discover-container-modern">
            <div className="discover-header-modern">
              <div className="header-left">
                <h1>Profils</h1>
                <span className="profile-count">{profiles.length} disponibles</span>
              </div>
              <div className="header-right">
                <button className="filter-chip" onClick={() => setShowFilterPanel(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Filtres
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state-modern">
                <div className="loading-spinner-modern"></div>
                <p>Chargement des profils...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="empty-state-modern">
                <div className="empty-icon-modern">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h2>Aucun profil disponible</h2>
                <p>Nous n'avons pas trouvé de nouvelles suggestions pour le moment.</p>
                <button className="refresh-btn-modern" onClick={loadProfiles}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6"/>
                    <path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  Rafraîchir
                </button>
              </div>
            ) : (
              <>
                <div className="tinder-card-container">
                  {currentProfile && (
                    <TinderCard
                      key={currentProfile.id}
                      user={currentProfile}
                      currentUser={currentUser}
                      onLike={() => handleLike(currentProfile.id)}
                      onPass={() => handlePass(currentProfile.id)}
                      onSuperLike={() => handleSuperLike(currentProfile.id)}
                      onViewProfile={() => handleViewProfile(currentProfile.id)}
                      isTop={true}
                    />
                  )}
                </div>

                <div className="tinder-actions">
                  <button 
                    className="tinder-action-btn tinder-rewind-btn"
                    onClick={handleRewind}
                    title={rewindsRemaining > 0 ? `Revenir en arrière (${rewindsRemaining} restants)` : "Revenir en arrière (0 restant)"}
                    disabled={rewindsRemaining === 0 || swipeHistory.length === 0}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 10h10a5 5 0 0 1 5 5v2"/>
                      <path d="M3 10l6-6"/>
                      <path d="M3 10l6 6"/>
                    </svg>
                    {rewindsRemaining > 0 && <span className="rewind-count">{rewindsRemaining}</span>}
                  </button>
                  
                  <button 
                    className="tinder-action-btn tinder-pass-btn"
                    onClick={() => currentProfile && handlePass(currentProfile.id)}
                    title="Passer"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  
                  <button 
                    className="tinder-action-btn tinder-super-like-btn"
                    onClick={() => currentProfile && handleSuperLike(currentProfile.id)}
                    title={superLikesRemaining > 0 ? "Super Like" : "Super Like (0 restant)"}
                    disabled={superLikesRemaining === 0}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    <path d="M12 2l-2 2h4l-2-2z"/>
                    <path d="M12 2v8"/>
                    <path d="M8 6l4-4 4 4"/>
                    </svg>
                  </button>
                  
                  <button 
                    className="tinder-action-btn tinder-like-btn"
                    onClick={() => currentProfile && handleLike(currentProfile.id)}
                    title="J'aime"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  
                  <button 
                    className={`tinder-action-btn tinder-boost-btn ${hasActiveBoost ? 'active' : ''}`}
                    onClick={handleBoost}
                    title={hasActiveBoost ? "Boost actif" : "Boost"}
                    disabled={boosting}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    {hasActiveBoost && <span className="boost-indicator">✓</span>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {showMatchOverlay && matchedUser && currentUser && (
          <MatchOverlay
            user1={currentUser}
            user2={matchedUser}
            onMessage={handleMatchMessage}
            onKeepSwiping={handleKeepSwiping}
            onClose={() => setShowMatchOverlay(false)}
          />
        )}

        <FilterPanel
          isOpen={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
        />
      </div>
    </RequireCompleteProfile>
  )
}