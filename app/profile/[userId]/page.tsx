'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppHeader from '../../../components/AppHeader'
import RequireCompleteProfile from '../../../components/RequireCompleteProfile'
import { userService } from '@/lib/firestore'
import { User } from '@/types'
import { calculateAge, formatDate } from '@/lib/utils'

export default function PublicProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    loadUserProfile()
  }, [params.userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const userId = params.userId as string
      
      if (!userId) {
        router.push('/discover')
        return
      }

      const userData = await userService.getUserById(userId)
      if (!userData) {
        router.push('/discover')
        return
      }
      
      setUser(userData)
    } catch (error) {
      console.error('Error loading profile:', error)
      router.push('/discover')
    } finally {
      setLoading(false)
    }
  }

  const handleViewPhoto = (photoUrl: string) => {
    setViewingPhoto(photoUrl)
  }

  const handleClosePhotoView = () => {
    setViewingPhoto(null)
  }

  const handleNextPhoto = () => {
    if (!user) return
    const allPhotos = user.photos || []
    if (allPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length)
    }
  }

  const handlePreviousPhoto = () => {
    if (!user) return
    const allPhotos = user.photos || []
    if (allPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)
    }
  }

  if (loading) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2>Profil non trouvé</h2>
          <button className="btn-primary" onClick={() => router.push('/discover')}>Retour à la découverte</button>
        </div>
      </div>
    )
  }

  const allPhotos = user.photos || []
  const currentPhoto = allPhotos[currentPhotoIndex] || user.mainPhoto

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
        <div className="profile-page">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-photo-section">
                <div className="profile-photo-large">
                  {currentPhoto ? (
                    <img src={currentPhoto} alt="Photo de profil" className="profile-photo-img" />
                  ) : (
                    <div className="photo-placeholder">
                      <span className="photo-initials">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    </div>
                  )}
                  
                  {allPhotos.length > 1 && (
                    <div className="photo-navigation">
                      <button 
                        className="photo-nav-btn prev"
                        onClick={handlePreviousPhoto}
                        disabled={allPhotos.length <= 1}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6"/>
                        </svg>
                      </button>
                      <span className="photo-counter">{currentPhotoIndex + 1}/{allPhotos.length}</span>
                      <button 
                        className="photo-nav-btn next"
                        onClick={handleNextPhoto}
                        disabled={allPhotos.length <= 1}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="profile-summary">
                <h1 className="profile-name">{user.firstName}</h1>
                <p className="profile-details">
                  {user.age ? `${user.age} ans` : user.birthDate ? `${calculateAge(user.birthDate)} ans` : 'Âge non renseigné'} · 
                  {user.city || 'Ville non renseignée'}, {user.country || 'Pays non renseigné'}
                </p>
                <p className="profile-profession">{user.profession || 'Profession non renseignée'}</p>
              </div>
            </div>

            <div className="profile-sections">
              <div className="profile-section">
                <div className="section-header">
                  <h3>Informations essentielles</h3>
                </div>
                <div className="section-content">
                  <div className="info-row">
                    <span className="info-label">Sexe</span>
                    <span className="info-value">{user.gender === 'male' ? 'Homme' : user.gender === 'female' ? 'Femme' : ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Âge</span>
                    <span className="info-value">{user.age ? `${user.age} ans` : user.birthDate ? `${calculateAge(user.birthDate)} ans` : 'Non renseigné'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ville</span>
                    <span className="info-value">{user.city}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Pays</span>
                    <span className="info-value">{user.country}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Profession</span>
                    <span className="info-value">{user.profession}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Ma foi</h3>
                </div>
                <div className="section-content">
                  <div className="faith-item">
                    <span className="faith-label">Importance de la foi</span>
                    <span className="faith-value">
                      {user.faithImportance === 'very_important' ? 'Très importante' : 
                       user.faithImportance === 'important' ? 'Importante' : 
                       user.faithImportance === 'moderate' ? 'Moyenne' : 'Peu importante'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Mes valeurs</h3>
                </div>
                <div className="section-content">
                  <div className="values-list">
                    {user.values?.slice(0, 5).map((value, index) => (
                      <span key={index} className="value-tag">{value}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Ma vision du couple</h3>
                </div>
                <div className="section-content">
                  <div className="vision-item">
                    <span className="vision-label">Pourquoi suis-je ici ?</span>
                    <p className="vision-text">{user.whyHere}</p>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Mariage</span>
                    <p className="vision-text">{user.wantsMarriage ? 'Oui, je souhaite me marier' : 'Non pour le moment'}</p>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Enfants</span>
                    <p className="vision-text">{user.wantsChildren ? 'Oui, je souhaite avoir des enfants' : 'Non pour le moment'}</p>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Centres d'intérêt</h3>
                </div>
                <div className="section-content">
                  <div className="interests-list">
                    {user.interests?.slice(0, 5).map((interest, index) => (
                      <span key={index} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Préférences de recherche</h3>
                </div>
                <div className="section-content">
                  <div className="preference-row">
                    <span className="preference-label">Âge recherché</span>
                    <span className="preference-value">{user.prefAgeMin}-{user.prefAgeMax} ans</span>
                  </div>

                  <div className="preference-row">
                    <span className="preference-label">Objectif</span>
                    <span className="preference-value">
                      {user.prefObjective === 'marriage' ? 'Mariage' : 'Relation sérieuse'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-secondary" onClick={() => router.push('/discover')}>
                Retour à la découverte
              </button>
            </div>
          </div>
        </div>

        {viewingPhoto && (
          <div className="photo-viewer-overlay" onClick={handleClosePhotoView}>
            <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-photo-viewer" onClick={handleClosePhotoView}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <img src={viewingPhoto} alt="Photo agrandie" />
            </div>
          </div>
        )}
      </div>
    </RequireCompleteProfile>
  )
}