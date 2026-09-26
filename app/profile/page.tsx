'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import { userService } from '@/lib/firestore'
import { cloudinaryService } from '@/lib/cloudinary'
import { matchRecalculator } from '@/lib/matchRecalculator'
import { User } from '@/types'
import { calculateAge, formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([])
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }

      const userData = await userService.getUserById(userId)
      if (!userData) {
        router.push('/login')
        return
      }
      console.log('User data loaded:', userData)
      console.log('Birth date from database:', userData.birthDate, 'Type:', typeof userData.birthDate)
      setUser(userData)
      
      // Load additional photos (excluding main photo)
      if (userData.photos && userData.photos.length > 0) {
        const mainPhoto = userData.mainPhoto
        const additional = userData.photos.filter(photo => photo !== mainPhoto).slice(0, 5) // Limit to 5 additional photos
        setAdditionalPhotos(additional)
        console.log('Additional photos loaded:', additional)
      } else {
        setAdditionalPhotos([])
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user) return

    // Check if adding photos would exceed the limit (5 additional photos)
    const currentAdditionalCount = additionalPhotos.length
    const newPhotoCount = currentAdditionalCount + files.length
    
    if (newPhotoCount > 5) {
      alert(`Vous pouvez ajouter jusqu'à 5 photos supplémentaires. Vous avez actuellement ${currentAdditionalCount} photo(s) supplémentaire(s).`)
      return
    }

    try {
      setUploadingPhoto(true)
      
      // Upload each photo to Cloudinary via API route
      const photoUrls = await cloudinaryService.uploadMultipleImages(Array.from(files))
      
      // Update local state
      setAdditionalPhotos(prev => [...prev, ...photoUrls])
      
      // Update user data in Firestore
      const updatedPhotos = [user.mainPhoto, ...additionalPhotos, ...photoUrls].filter((photo): photo is string => Boolean(photo)) as string[]
      await userService.updateUser(user.id, { photos: updatedPhotos })
      // Note: Photo changes don't affect compatibility, so no need to recalculate matches
      
      // Reload user data
      await loadUserProfile()
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Erreur lors du téléchargement des photos')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user || files.length === 0) return

    try {
      setUploadingPhoto(true)
      
      // Upload the new main photo
      const photoUrls = await cloudinaryService.uploadMultipleImages([files[0]])
      
      if (photoUrls.length > 0) {
        // Update user data in Firestore
        await userService.updateUser(user.id, { mainPhoto: photoUrls[0] })
        
        // Reload user data
        await loadUserProfile()
      }
    } catch (error) {
      console.error('Error changing main photo:', error)
      alert('Erreur lors du changement de photo de profil')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removeAdditionalPhoto = async (index: number) => {
    if (!user) return

    try {
      console.log('Removing photo at index:', index)
      const newAdditionalPhotos = additionalPhotos.filter((_, i) => i !== index)
      console.log('New additional photos:', newAdditionalPhotos)
      setAdditionalPhotos(newAdditionalPhotos)
      
      // Update user data in Firestore
      const updatedPhotos = [user.mainPhoto, ...newAdditionalPhotos].filter((photo): photo is string => Boolean(photo)) as string[]
      console.log('Updated photos array:', updatedPhotos)
      await userService.updateUser(user.id, { photos: updatedPhotos })
      
      // Reload user data
      await loadUserProfile()
    } catch (error) {
      console.error('Error removing photo:', error)
      alert('Erreur lors de la suppression de la photo')
    }
  }

  const handleViewPhoto = (photoUrl: string) => {
    setViewingPhoto(photoUrl)
  }

  const handleClosePhotoView = () => {
    setViewingPhoto(null)
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleEditSection = (section: string) => {
    setEditingSection(section)
  }

  const handleCloseEdit = () => {
    setEditingSection(null)
  }

  const handleSaveSection = async (section: string, data: any) => {
    if (!user) return
    
    try {
      setSaving(true)
      await userService.updateUser(user.id, data)
      
      // Recalculate matches if compatibility-affecting fields changed
      const compatibilityFields = ['faithImportance', 'faithRelation', 'community', 'values', 'wantsMarriage', 'wantsChildren']
      const hasCompatibilityChange = Object.keys(data).some(key => compatibilityFields.includes(key))
      
      if (hasCompatibilityChange) {
        await matchRecalculator.recalculateUserMatches(user.id)
      }
      
      await loadUserProfile()
      showNotification('success', 'Modifications enregistrées avec succès')
      handleCloseEdit()
    } catch (error) {
      console.error('Error saving section:', error)
      showNotification('error', 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
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
          <button className="btn-primary" onClick={() => router.push('/login')}>Se connecter</button>
        </div>
      </div>
    )
  }

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
        {/* Notification Toast */}
        {notification && (
          <div className={`notification-toast ${notification.type}`}>
            <div className="notification-content">
              {notification.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      
        <div className="profile-page">
          <div className="profile-container">
            {/* Profile Header with Photo and Basic Info */}
            <div className="profile-header-section">
              <div className="profile-photo-wrapper">
                <div className="profile-photo-large">
                  {user.mainPhoto ? (
                    <img src={user.mainPhoto} alt="Photo de profil" className="profile-photo-img" />
                  ) : (
                    <div className="photo-placeholder">
                      <span className="photo-initials">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="main-photo-change"
                    accept="image/*"
                    onChange={handleMainPhotoChange}
                    disabled={uploadingPhoto}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="main-photo-change" 
                    className="change-photo-btn"
                    style={{ cursor: uploadingPhoto ? 'not-allowed' : 'pointer' }}
                  >
                    {uploadingPhoto ? 'Chargement...' : 'Changer'}
                  </label>
                </div>
              </div>
              
              <div className="profile-basic-info">
                <div className="profile-name-section">
                  <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                  <div className="profile-age-location">
                    <span className="profile-age">
                      {user.age ? `${user.age} ans` : user.birthDate ? `${calculateAge(user.birthDate)} ans` : 'Âge non renseigné'}
                    </span>
                    <span className="separator">•</span>
                    <span className="profile-location">
                      {user.city || 'Ville non renseignée'}, {user.country || 'Pays non renseigné'}
                    </span>
                  </div>
                </div>
                
                <div className="profile-profession-section">
                  <div className="profession-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    {user.profession || 'Profession non renseignée'}
                  </div>
                  {user.education && (
                    <div className="education-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10-5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                      {user.education}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion Banner */}
            <div className="profile-completion-banner">
              <div className="completion-content">
                <div className="completion-info">
                  <div className="completion-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div className="completion-text">
                    <h3>Profil complété à {user.profileCompletion}%</h3>
                    <p>Un profil complet augmente vos chances de trouver un match</p>
                  </div>
                </div>
                <button 
                  className="complete-profile-btn"
                  onClick={() => router.push('/onboarding')}
                >
                  {user.profileCompletion < 100 ? 'Compléter' : 'Profil complet ✓'}
                </button>
              </div>
              <div className="progress-bar-compact">
                <div 
                  className="progress-fill"
                  style={{ width: `${user.profileCompletion}%` }}
                ></div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="profile-content-grid">
              {/* Left Column - Photos */}
              <div className="profile-photos-column">
                <div className="profile-card photos-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      Mes photos
                    </h3>
                    <span className="photo-counter">{additionalPhotos.length + 1}/6</span>
                  </div>
                  
                  <div className="photos-grid">
                    <div className="main-photo-item main-photo">
                      {user.mainPhoto ? (
                        <img src={user.mainPhoto} alt="Photo principale" onClick={() => user.mainPhoto && handleViewPhoto(user.mainPhoto)} />
                      ) : (
                        <div className="photo-placeholder-small">
                          <span className="photo-initials-small">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                        </div>
                      )}
                      <div className="photo-badge">Principal</div>
                    </div>
                    
                    {additionalPhotos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <img 
                          src={photo} 
                          alt={`Photo ${index + 1}`} 
                          onClick={() => handleViewPhoto(photo)}
                        />
                        <button 
                          className="photo-remove-mini"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeAdditionalPhoto(index)
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {additionalPhotos.length < 5 && (
                      <div className="add-photo-item">
                        <input
                          type="file"
                          id="additional-photo-upload"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="additional-photo-upload" className="add-photo-label">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          <span>Ajouter</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Information Cards */}
              <div className="profile-info-column">
                {/* Personal Info Card */}
                <div className="profile-card info-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Informations personnelles
                    </h3>
                    <button 
                      className="edit-mini-btn"
                      onClick={() => handleEditSection('personal')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-item-label">Sexe</span>
                      <span className="info-item-value">
                        {user.gender === 'male' ? 'Homme' : user.gender === 'female' ? 'Femme' : 'Non renseigné'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-item-label">Date de naissance</span>
                      <span className="info-item-value">
                        {user.birthDate ? formatDate(user.birthDate) : 'Non renseignée'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-item-label">Ville</span>
                      <span className="info-item-value">{user.city || 'Non renseignée'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-item-label">Pays</span>
                      <span className="info-item-value">{user.country || 'Non renseigné'}</span>
                    </div>
                    {user.languages && user.languages.length > 0 && (
                      <div className="info-item full-width">
                        <span className="info-item-label">Langues</span>
                        <div className="info-item-value tags">
                          {user.languages.map((lang, i) => (
                            <span key={i} className="mini-tag">{lang}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Faith Card */}
                <div className="profile-card faith-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L12 22"/>
                        <path d="M8 8L16 8"/>
                        <path d="M9 13L15 13"/>
                      </svg>
                      Ma foi
                    </h3>
                    <button 
                      className="edit-mini-btn"
                      onClick={() => handleEditSection('faith')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="faith-grid">
                    <div className="faith-badge-item">
                      <span className="faith-badge-label">Importance</span>
                      <span className="faith-badge-value">
                        {user.faithImportance === 'very_important' ? 'Très importante' : 
                         user.faithImportance === 'important' ? 'Importante' : 
                         user.faithImportance === 'moderate' ? 'Moyenne' : 'Peu importante'}
                      </span>
                    </div>
                    {user.community && (
                      <div className="faith-badge-item">
                        <span className="faith-badge-label">Communauté</span>
                        <span className="faith-badge-value">{user.community}</span>
                      </div>
                    )}
                  </div>
                  
                  {user.faithRelation && (
                    <div className="faith-quote">
                      <p>"{user.faithRelation}"</p>
                    </div>
                  )}
                </div>

                {/* Values Card */}
                <div className="profile-card values-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Mes valeurs
                    </h3>
                    <button 
                      className="edit-mini-btn"
                      onClick={() => handleEditSection('values')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="values-display">
                    {user.values && user.values.length > 0 ? (
                      <div className="values-list">
                        {user.values.map((value, index) => (
                          <span key={index} className="value-card-tag">{value}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-values">
                        <p>Aucune valeur renseignée</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests Card */}
                <div className="profile-card interests-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="16.24 7.76 14.12 14.12 7.76 7.76 14.12 14.12 7.76 16.24"/>
                      </svg>
                      Centres d'intérêt
                    </h3>
                    <button 
                      className="edit-mini-btn"
                      onClick={() => handleEditSection('interests')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="interests-display">
                    {user.interests && user.interests.length > 0 ? (
                      <div className="interests-list">
                        {user.interests.map((interest, index) => (
                          <span key={index} className="interest-card-tag">{interest}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-interests">
                        <p>Aucun centre d'intérêt renseigné</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vision Card */}
                <div className="profile-card vision-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Ma vision du couple
                    </h3>
                    <button 
                      className="edit-mini-btn"
                      onClick={() => handleEditSection('vision')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="vision-options">
                    <div className="vision-option">
                      <div className={`vision-option-icon ${user.wantsMarriage ? 'active' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      <span>Mariage</span>
                    </div>
                    <div className="vision-option">
                      <div className={`vision-option-icon ${user.wantsChildren ? 'active' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </div>
                      <span>Enfants</span>
                    </div>
                  </div>
                  
                  {user.whyHere && (
                    <div className="vision-description">
                      <p>{user.whyHere}</p>
                    </div>
                  )}
                </div>

                {/* Preferences Card */}
                <div className="profile-card preferences-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      Préférences de recherche
                    </h3>
                    <button 
                      className="edit-mini-btn"
                      onClick={() => handleEditSection('preferences')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="preferences-display">
                    <div className="preference-item">
                      <span className="preference-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 12 12"/>
                          <polyline points="12 12 12 12 12 12"/>
                        </svg>
                      </span>
                      <span className="preference-text">
                        {user.prefAgeMin}-{user.prefAgeMax} ans
                      </span>
                    </div>
                    <div className="preference-item">
                      <span className="preference-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </span>
                      <span className="preference-text">
                        {user.prefObjective === 'marriage' ? 'Mariage' : 'Relation sérieuse'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewingPhoto && (
        <div className="photo-viewer-overlay" onClick={handleClosePhotoView}>
          <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="photo-viewer-close"
              onClick={handleClosePhotoView}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img src={viewingPhoto} alt="Photo en grand" className="photo-viewer-image" />
          </div>
        </div>
      )}

      {/* Edit Modals */}
      {editingSection === 'personal' && (
        <EditPersonalInfoModal 
          user={user}
          onClose={handleCloseEdit}
          onSave={handleSaveSection}
          saving={saving}
        />
      )}

      {editingSection === 'faith' && (
        <EditFaithModal 
          user={user}
          onClose={handleCloseEdit}
          onSave={handleSaveSection}
          saving={saving}
        />
      )}

      {editingSection === 'values' && (
        <EditValuesModal 
          user={user}
          onClose={handleCloseEdit}
          onSave={handleSaveSection}
          saving={saving}
        />
      )}

      {editingSection === 'vision' && (
        <EditVisionModal 
          user={user}
          onClose={handleCloseEdit}
          onSave={handleSaveSection}
          saving={saving}
        />
      )}

      {editingSection === 'interests' && (
        <EditInterestsModal 
          user={user}
          onClose={handleCloseEdit}
          onSave={handleSaveSection}
          saving={saving}
        />
      )}

      {editingSection === 'preferences' && (
        <EditPreferencesModal 
          user={user}
          onClose={handleCloseEdit}
          onSave={handleSaveSection}
          saving={saving}
        />
      )}
    </RequireCompleteProfile>
  )
}

// Modal Components
function EditPersonalInfoModal({ user, onClose, onSave, saving }: any) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    gender: user?.gender || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    city: user?.city || '',
    country: user?.country || '',
    profession: user?.profession || '',
    education: user?.education || '',
    languages: user?.languages?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave('personal', {
      ...formData,
      languages: formData.languages.split(',').map((l: string) => l.trim()).filter((l: string) => Boolean(l))
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier mes informations</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Sexe</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              required
            >
              <option value="">Sélectionner</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date de naissance</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Pays</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Profession</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({...formData, profession: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Études</label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Langues (séparées par des virgules)</label>
            <input
              type="text"
              value={formData.languages}
              onChange={(e) => setFormData({...formData, languages: e.target.value})}
              placeholder="Français, Anglais, Espagnol"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditFaithModal({ user, onClose, onSave, saving }: any) {
  const [formData, setFormData] = useState({
    faithRelation: user?.faithRelation || '',
    faithImportance: user?.faithImportance || '',
    community: user?.community || '',
    faithInRelationship: user?.faithInRelationship || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave('faith', formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier ma foi</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Relation avec Dieu</label>
            <input
              type="text"
              value={formData.faithRelation}
              onChange={(e) => setFormData({...formData, faithRelation: e.target.value})}
              placeholder="Ma relation avec Dieu est..."
            />
          </div>
          <div className="form-group">
            <label>Importance de la foi</label>
            <select
              value={formData.faithImportance}
              onChange={(e) => setFormData({...formData, faithImportance: e.target.value})}
            >
              <option value="">Sélectionner</option>
              <option value="very_important">Très importante</option>
              <option value="important">Importante</option>
              <option value="moderate">Moyenne</option>
              <option value="low">Peu importante</option>
            </select>
          </div>
          <div className="form-group">
            <label>Communauté</label>
            <input
              type="text"
              value={formData.community}
              onChange={(e) => setFormData({...formData, community: e.target.value})}
              placeholder="Église, paroisse, etc."
            />
          </div>
          <div className="form-group">
            <label>Foi dans le couple</label>
            <input
              type="text"
              value={formData.faithInRelationship}
              onChange={(e) => setFormData({...formData, faithInRelationship: e.target.value})}
              placeholder="La place de la foi dans mon couple..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditValuesModal({ user, onClose, onSave, saving }: any) {
  const [values, setValues] = useState<string[]>(user?.values || [])
  const [newValue, setNewValue] = useState('')

  const availableValues = [
    'Famille', 'Fidélité', 'Honnêteté', 'Respect', 'Communication',
    'Partage', 'Confiance', 'Humilité', 'Patience', 'Pardon',
    'Service', 'Gratitude', 'Sagesse', 'Courage', 'Générosité'
  ]

  const addValue = (value: string) => {
    if (!values.includes(value) && values.length < 10) {
      setValues([...values, value])
    }
  }

  const removeValue = (value: string) => {
    setValues(values.filter(v => v !== value))
  }

  const addCustomValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim()) && values.length < 10) {
      setValues([...values, newValue.trim()])
      setNewValue('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave('values', { values })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier mes valeurs</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Valeurs sélectionnées ({values.length}/10)</label>
            <div className="values-editor">
              {values.map((value, index) => (
                <span key={index} className="value-tag-editable">
                  {value}
                  <button 
                    type="button"
                    onClick={() => removeValue(value)}
                    className="value-remove"
                  >×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Valeurs suggérées</label>
            <div className="suggested-values">
              {availableValues.map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => addValue(value)}
                  disabled={values.includes(value) || values.length >= 10}
                  className="suggested-value-btn"
                >
                  {values.includes(value) ? '✓ ' : '+ '}{value}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Ajouter une valeur personnalisée</label>
            <div className="custom-value-input">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Votre valeur..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomValue())}
              />
              <button type="button" onClick={addCustomValue} disabled={!newValue.trim()}>
                Ajouter
              </button>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditVisionModal({ user, onClose, onSave, saving }: any) {
  const [formData, setFormData] = useState({
    whyHere: user?.whyHere || '',
    seriousRelationship: user?.seriousRelationship || '',
    faithInCouple: user?.faithInCouple || '',
    wantsMarriage: user?.wantsMarriage || false,
    wantsChildren: user?.wantsChildren || false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave('vision', formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier ma vision du couple</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Pourquoi suis-je ici ?</label>
            <textarea
              value={formData.whyHere}
              onChange={(e) => setFormData({...formData, whyHere: e.target.value})}
              rows={3}
              placeholder="Je cherche..."
            />
          </div>
          <div className="form-group">
            <label>Relation sérieuse</label>
            <textarea
              value={formData.seriousRelationship}
              onChange={(e) => setFormData({...formData, seriousRelationship: e.target.value})}
              rows={3}
              placeholder="Ma vision d'une relation sérieuse..."
            />
          </div>
          <div className="form-group">
            <label>Place de la foi</label>
            <textarea
              value={formData.faithInCouple}
              onChange={(e) => setFormData({...formData, faithInCouple: e.target.value})}
              rows={3}
              placeholder="La foi dans mon couple..."
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.wantsMarriage}
                onChange={(e) => setFormData({...formData, wantsMarriage: e.target.checked})}
              />
              Je souhaite me marier
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.wantsChildren}
                onChange={(e) => setFormData({...formData, wantsChildren: e.target.checked})}
              />
              Je souhaite avoir des enfants
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditInterestsModal({ user, onClose, onSave, saving }: any) {
  const [interests, setInterests] = useState<string[]>(user?.interests || [])
  const [newInterest, setNewInterest] = useState('')

  const availableInterests = [
    'Voyage', 'Sport', 'Musique', 'Cinéma', 'Lecture',
    'Cuisine', 'Nature', 'Art', 'Technologie', 'Bénévolat',
    'Photographie', 'Danse', 'Jardinage', 'Jeux', 'Randonnée'
  ]

  const addInterest = (interest: string) => {
    if (!interests.includes(interest) && interests.length < 10) {
      setInterests([...interests, interest])
    }
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest))
  }

  const addCustomInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave('interests', { interests })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier mes centres d'intérêt</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Centres d'intérêt sélectionnés ({interests.length}/10)</label>
            <div className="values-editor">
              {interests.map((interest, index) => (
                <span key={index} className="value-tag-editable">
                  {interest}
                  <button 
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="value-remove"
                  >×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Intérêts suggérés</label>
            <div className="suggested-values">
              {availableInterests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => addInterest(interest)}
                  disabled={interests.includes(interest) || interests.length >= 10}
                  className="suggested-value-btn"
                >
                  {interests.includes(interest) ? '✓ ' : '+ '}{interest}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Ajouter un intérêt personnalisé</label>
            <div className="custom-value-input">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Votre intérêt..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
              />
              <button type="button" onClick={addCustomInterest} disabled={!newInterest.trim()}>
                Ajouter
              </button>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditPreferencesModal({ user, onClose, onSave, saving }: any) {
  const [formData, setFormData] = useState({
    prefAgeMin: user?.prefAgeMin || 18,
    prefAgeMax: user?.prefAgeMax || 100,
    prefObjective: user?.prefObjective || 'serious',
    prefFaithImportance: user?.prefFaithImportance || '',
    prefWantsChildren: user?.prefWantsChildren
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave('preferences', formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier mes préférences</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Âge minimum</label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.prefAgeMin}
                onChange={(e) => setFormData({...formData, prefAgeMin: parseInt(e.target.value) || 18})}
              />
            </div>
            <div className="form-group">
              <label>Âge maximum</label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.prefAgeMax}
                onChange={(e) => setFormData({...formData, prefAgeMax: parseInt(e.target.value) || 100})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Objectif</label>
            <select
              value={formData.prefObjective}
              onChange={(e) => setFormData({...formData, prefObjective: e.target.value})}
            >
              <option value="serious">Relation sérieuse</option>
              <option value="marriage">Mariage</option>
            </select>
          </div>
          <div className="form-group">
            <label>Importance de la foi recherchée</label>
            <select
              value={formData.prefFaithImportance}
              onChange={(e) => setFormData({...formData, prefFaithImportance: e.target.value})}
            >
              <option value="">Peu importe</option>
              <option value="very_important">Très importante</option>
              <option value="important">Importante</option>
              <option value="moderate">Moyenne</option>
            </select>
          </div>
          <div className="form-group">
            <label>Enfants</label>
            <select
              value={formData.prefWantsChildren === undefined ? '' : formData.prefWantsChildren.toString()}
              onChange={(e) => setFormData({...formData, prefWantsChildren: e.target.value === '' ? undefined : e.target.value === 'true'})}
            >
              <option value="">Peu importe</option>
              <option value="true">Veut des enfants</option>
              <option value="false">Ne veut pas d'enfants</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
