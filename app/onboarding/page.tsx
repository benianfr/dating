'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import { userService } from '@/lib/firestore'
import { cloudinaryService } from '@/lib/cloudinary'
import { matchRecalculator } from '@/lib/matchRecalculator'
import { getCurrentLocation } from '@/lib/location'
import { User } from '@/types'
import { calculateAge, isAtLeast18 } from '@/lib/utils'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [locationDetected, setLocationDetected] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([])
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0)
  const [formData, setFormData] = useState({
    // Informations personnelles
    gender: '',
    birthDate: '',
    address: '',
    city: '',
    country: '',
    profession: '',
    education: '',
    languages: [] as string[],
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    locationEnabled: false,
    
    // Foi
    faithRelation: '',
    faithImportance: 'important',
    community: '',
    
    // Valeurs
    values: [] as string[],
    
    // Vision du couple
    whyHere: '',
    seriousRelationship: '',
    faithInCouple: '',
    wantsMarriage: false,
    wantsChildren: false,
    
    // Centres d'intérêt
    interests: [] as string[],
    
    // Préférences de recherche
    prefAgeMin: '',
    prefAgeMax: '',
    prefObjective: 'serious',
    prefFaithImportance: 'important'
  })

  const allValues = ['Foi', 'Famille', 'Fidélité', 'Respect', 'Honnêteté', 'Communication', 'Générosité', 'Responsabilité', 'Engagement', 'Humilité']
  const allInterests = ['Musique', 'Lecture', 'Sport', 'Voyages', 'Cuisine', 'Cinéma', 'Art', 'Nature', 'Bénévolat', 'Écriture']
  const allLanguages = ['Français', 'Anglais']
  const countries = ['Côte d\'Ivoire', 'Sénégal', 'Bénin', 'Togo', 'Cameroun', 'RDC', 'Gabon', 'Burkina Faso', 'Guinée', 'France', 'Belgique', 'Canada']
  const professions = ['Médecin', 'Ingénieur', 'Enseignant', 'Avocat', 'Comptable', 'Entrepreneur', 'Développeur', 'Infirmier', 'Commercial', 'Architecte', 'Journaliste', 'Designer', 'Chef de projet', 'Consultant', 'Autre']
  const educations = ['Sans diplôme', 'Brevet', 'Baccalauréat', 'BTS/DUT', 'Licence', 'Master', 'Doctorat']
  const faithRelations = ['Je prie quotidiennement', 'Je vais à l\'église régulièrement', 'Je lis la Bible souvent', 'Ma foi est importante', 'Je suis en chemin']
  const communities = ['Église protestante', 'Église catholique', 'Église évangélique', 'Assemblée de Dieu', 'Autre']
  const whyHereOptions = ['Trouver un partenaire chrétien', 'Faire des rencontres sérieuses', 'Préparer le mariage', 'Agrandir mon cercle chrétien']
  const seriousRelationshipOptions = ['Une relation basée sur la confiance', 'Un engagement durable', 'Un partenaire pour la vie', 'Une relation avec des valeurs communes']
  const faithInCoupleOptions = ['Prier ensemble', 'Aller à l\'église ensemble', 'Lire la Bible ensemble', 'Partager la même foi', 'Élever les enfants dans la foi']
  const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18) // 18 to 100

  useEffect(() => {
    loadUser()
    detectLocation()
    
    // Prevent navigation away from onboarding via browser back/refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Vous devez compléter votre profil avant de quitter cette page.'
      return 'Vous devez compléter votre profil avant de quitter cette page.'
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const detectCountryByIP = async () => {
    try {
      // Use free IP geolocation API
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.country_name) {
        const country = data.country_name
        const city = data.city || ''
        
        // Auto-fill country and city if empty
        setFormData(prev => ({
          ...prev,
          country: prev.country || country,
          city: prev.city || city
        }))
        setLocationDetected(true)
      }
    } catch (error) {
      console.error('Error detecting country by IP:', error)
    }
  }

  const detectLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Store coordinates in form data
            setFormData(prev => ({
              ...prev,
              latitude,
              longitude,
              locationEnabled: true
            }))
            
            // Use reverse geocoding to get full address
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              )
              const data = await response.json()
              
              if (data.address) {
                const address = data.address.road || data.address.street || ''
                const houseNumber = data.address.house_number || ''
                const postcode = data.address.postcode || ''
                const city = data.address.city || data.address.town || data.address.village || data.address.municipality || ''
                const country = data.address.country || ''
                
                // Build full address
                const fullAddress = houseNumber ? `${houseNumber} ${address}` : address
                const addressWithPostcode = postcode ? `${fullAddress}, ${postcode}` : fullAddress
                
                // Auto-fill if fields are empty and mark as detected
                setFormData(prev => ({
                  ...prev,
                  address: prev.address || addressWithPostcode,
                  city: prev.city || city,
                  country: prev.country || country
                }))
                setLocationDetected(true)
              }
            } catch (error) {
              console.error('Error getting location name:', error)
            }
          },
          (error) => {
            console.log('Geolocation permission denied or error:', error)
            // Fallback to IP-based detection
            detectCountryByIP()
          }
        )
      } else {
        // Fallback to IP-based detection if geolocation not available
        detectCountryByIP()
      }
    } catch (error) {
      console.error('Error detecting location:', error)
      // Fallback to IP-based detection
      detectCountryByIP()
    }
  }

  const loadUser = async () => {
    try {
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

      setUser(userData)

      // Si le profil est déjà complet, rediriger vers discover
      if (userData.profileCompletion >= 100) {
        router.push('/discover')
        return
      }

      // Pré-remplir les données existantes
      setFormData({
        gender: userData.gender || '',
        birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
        address: userData.address || '',
        city: userData.city || '',
        country: userData.country || '',
        profession: userData.profession || '',
        education: userData.education || '',
        languages: userData.languages || [],
        faithRelation: userData.faithRelation || '',
        faithImportance: userData.faithImportance || 'important',
        community: userData.community || '',
        values: userData.values || [],
        whyHere: userData.whyHere || '',
        seriousRelationship: userData.seriousRelationship || '',
        faithInCouple: userData.faithInCouple || '',
        wantsMarriage: userData.wantsMarriage || false,
        wantsChildren: userData.wantsChildren || false,
        interests: userData.interests || [],
        prefAgeMin: userData.prefAgeMin?.toString() || '',
        prefAgeMax: userData.prefAgeMax?.toString() || '',
        prefObjective: userData.prefObjective || 'serious',
        prefFaithImportance: userData.prefFaithImportance || 'important',
        latitude: userData.latitude,
        longitude: userData.longitude,
        locationEnabled: userData.locationEnabled || false
      })
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)
    setFormData(prev => ({
      ...prev,
      languages: selectedOptions
    }))
  }

  const toggleValue = (value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.includes(value) 
        ? prev.values.filter(v => v !== value)
        : [...prev.values, value]
    }))
  }

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language) 
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }))
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleNext = () => {
    // Validate age requirement on step 1
    if (step === 1 && formData.birthDate && !isAtLeast18(formData.birthDate)) {
      alert('Vous devez avoir au moins 18 ans pour utiliser cette application.')
      return
    }
    
    if (step < 6) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    // Validate photos
    if (previewPhotos.length === 0) {
      alert('Veuillez ajouter une photo de profil.')
      return
    }

    // Validate birth date
    if (formData.birthDate && !isAtLeast18(formData.birthDate)) {
      alert('Vous devez avoir au moins 18 ans pour utiliser cette application.')
      return
    }

    try {
      setLoading(true)

      const birthDate = formData.birthDate ? new Date(formData.birthDate) : undefined
      const calculatedAge = birthDate ? calculateAge(birthDate) : undefined

      console.log('Birth date being saved:', birthDate, 'Type:', typeof birthDate)

      const updatedUser: Partial<User> = {
        gender: formData.gender as 'male' | 'female' | undefined,
        birthDate: birthDate,
        age: calculatedAge,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        profession: formData.profession || undefined,
        education: formData.education || undefined,
        languages: formData.languages.length > 0 ? formData.languages : undefined,
        faithRelation: formData.faithRelation || undefined,
        faithImportance: formData.faithImportance as any,
        community: formData.community || undefined,
        values: formData.values.length > 0 ? formData.values : undefined,
        whyHere: formData.whyHere || undefined,
        seriousRelationship: formData.seriousRelationship || undefined,
        faithInCouple: formData.faithInCouple || undefined,
        wantsMarriage: formData.wantsMarriage,
        wantsChildren: formData.wantsChildren,
        interests: formData.interests.length > 0 ? formData.interests : undefined,
        photos: previewPhotos,
        mainPhoto: previewPhotos[mainPhotoIndex],
        prefAgeMin: formData.prefAgeMin ? parseInt(formData.prefAgeMin) : undefined,
        prefAgeMax: formData.prefAgeMax ? parseInt(formData.prefAgeMax) : undefined,
        prefDistance: 50, // Default distance (not shown to user)
        prefObjective: formData.prefObjective as any,
        prefFaithImportance: formData.prefFaithImportance as any,
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationEnabled: formData.locationEnabled,
        profileCompletion: 100,
        isComplete: true,
        updatedAt: new Date()
      }

      console.log('Saving user data with Cloudinary photos via API route:', updatedUser)

      // Remove undefined fields to avoid Firestore error
      const cleanedUser = Object.fromEntries(
        Object.entries(updatedUser).filter(([_, value]) => {
          // Don't filter out birthDate if it's a valid Date object
          if (_ === 'birthDate' && value instanceof Date) {
            return true
          }
          return value !== undefined
        })
      ) as Partial<User>

      await userService.updateUser(user.id, cleanedUser)
      
      // Recalculate matches since profile completion affects compatibility
      // Note: In production, this should be done in a background job
      await matchRecalculator.recalculateUserMatches(user.id)
      
      router.push('/discover')
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgress = () => {
    return Math.round((step / 6) * 100)
  }

  const getMaxDateFor18Years = () => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }

  const getMinDateForAgeLimit = () => {
    const today = new Date()
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    return minDate.toISOString().split('T')[0]
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Only allow 1 main photo during onboarding
    if (previewPhotos.length >= 1) {
      alert('Vous ne pouvez ajouter qu\'une seule photo de profil pendant l\'inscription. Vous pourrez ajouter des photos supplémentaires dans votre profil.')
      return
    }

    try {
      setUploadingPhoto(true)
      
      // Upload each photo to Cloudinary via API route
      const photoUrls = await cloudinaryService.uploadMultipleImages(Array.from(files))
      
      // Add to preview photos (limit to 1)
      setPreviewPhotos(prev => [...prev, ...photoUrls].slice(0, 1))
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Erreur lors du téléchargement des photos')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removePhoto = (index: number) => {
    setPreviewPhotos(prev => prev.filter((_, i) => i !== index))
    if (mainPhotoIndex === index) {
      setMainPhotoIndex(0)
    } else if (mainPhotoIndex > index) {
      setMainPhotoIndex(prev => prev - 1)
    }
  }

  const setAsMainPhoto = (index: number) => {
    setMainPhotoIndex(index)
  }

  if (!user) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page">
      <AppHeader />
      
      <div className="onboarding-page">
        <div className="onboarding-container">
          <div className="onboarding-header">
            <h1>Complétez votre profil</h1>
            <p className="onboarding-subtitle">Étape {step} sur 6</p>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${getProgress()}%` }}></div>
              </div>
              <span className="progress-text">{getProgress()}%</span>
            </div>
          </div>

          {step === 1 && (
            <div className="onboarding-step">
              <h2>Informations personnelles</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    max={getMaxDateFor18Years()}
                    min={getMinDateForAgeLimit()}
                  />
                  {formData.birthDate && (
                    <p className={`age-hint ${!isAtLeast18(formData.birthDate) ? 'age-error' : ''}`}>
                      Âge: {calculateAge(formData.birthDate)} ans
                      {!isAtLeast18(formData.birthDate) && (
                        <span className="error-message"> - Vous devez avoir au moins 18 ans</span>
                      )}
                    </p>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Sexe</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Adresse {locationDetected && <span className="location-badge">Détecté automatiquement</span>}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="12 Rue de la République, 75001 Paris"
                    readOnly={locationDetected}
                    className={locationDetected ? 'readonly-input' : ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Ville {locationDetected && <span className="location-badge">Détecté automatiquement</span>}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Abidjan"
                    readOnly={locationDetected}
                    className={locationDetected ? 'readonly-input' : ''}
                  />
                </div>
                
                <div className="form-group">
                  <label>Pays {locationDetected && <span className="location-badge">Détecté automatiquement</span>}</label>
                  <select 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange}
                    disabled={locationDetected}
                    className={locationDetected ? 'readonly-input' : ''}
                  >
                    <option value="">Sélectionner</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Profession</label>
                  <select name="profession" value={formData.profession} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {professions.map(prof => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Niveau d'études</label>
                  <select name="education" value={formData.education} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {educations.map(edu => (
                      <option key={edu} value={edu}>{edu}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Langues parlées</label>
                  <div className="languages-grid">
                    {allLanguages.map(language => (
                      <button
                        key={language}
                        type="button"
                        className={`language-select-btn ${formData.languages.includes(language) ? 'selected' : ''}`}
                        onClick={() => toggleLanguage(language)}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-step">
              <h2>Ma foi</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Relation avec Dieu</label>
                  <select name="faithRelation" value={formData.faithRelation} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {faithRelations.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Importance de la foi</label>
                  <select name="faithImportance" value={formData.faithImportance} onChange={handleChange}>
                    <option value="very_important">Très importante</option>
                    <option value="important">Importante</option>
                    <option value="moderate">Moyenne</option>
                    <option value="low">Peu importante</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Communauté/Église</label>
                  <select name="community" value={formData.community} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {communities.map(comm => (
                      <option key={comm} value={comm}>{comm}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-step">
              <h2>Mes valeurs</h2>
              <p className="step-description">Sélectionnez au moins 3 valeurs importantes pour vous</p>
              <div className="values-grid">
                {allValues.map(value => (
                  <button
                    key={value}
                    className={`value-select-btn ${formData.values.includes(value) ? 'selected' : ''}`}
                    onClick={() => toggleValue(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="onboarding-step">
              <h2>Vision du couple</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Pourquoi suis-je ici ?</label>
                  <select name="whyHere" value={formData.whyHere} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {whyHereOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Qu'est-ce qu'une relation sérieuse pour moi ?</label>
                  <select name="seriousRelationship" value={formData.seriousRelationship} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {seriousRelationshipOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Quelle place la foi doit-elle avoir dans le couple ?</label>
                  <select name="faithInCouple" value={formData.faithInCouple} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {faithInCoupleOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="wantsMarriage"
                      checked={formData.wantsMarriage}
                      onChange={handleChange}
                    />
                    <span>Je souhaite me marier</span>
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="wantsChildren"
                      checked={formData.wantsChildren}
                      onChange={handleChange}
                    />
                    <span>Je souhaite avoir des enfants</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="onboarding-step">
              <h2>Centres d'intérêt et préférences</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Centres d'intérêt</label>
                  <p className="step-description">Sélectionnez vos centres d'intérêt</p>
                  <div className="interests-grid">
                    {allInterests.map(interest => (
                      <button
                        key={interest}
                        className={`interest-select-btn ${formData.interests.includes(interest) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Âge recherché (min)</label>
                  <select name="prefAgeMin" value={formData.prefAgeMin} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {ageOptions.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Âge recherché (max)</label>
                  <select name="prefAgeMax" value={formData.prefAgeMax} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    {ageOptions.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Objectif relationnel</label>
                  <select name="prefObjective" value={formData.prefObjective} onChange={handleChange}>
                    <option value="serious">Relation sérieuse</option>
                    <option value="marriage">Mariage</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Importance de la foi recherchée</label>
                  <select name="prefFaithImportance" value={formData.prefFaithImportance} onChange={handleChange}>
                    <option value="very_important">Très importante</option>
                    <option value="important">Importante</option>
                    <option value="moderate">Moyenne</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="onboarding-step">
              <h2>Photo de profil</h2>
              <p className="step-description">Ajoutez votre photo de profil principale</p>
              
              <div className="photo-upload-section">
                <div className="photo-upload-area">
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="photo-upload" 
                    className="photo-upload-btn"
                    style={{ 
                      cursor: uploadingPhoto || previewPhotos.length >= 1 ? 'not-allowed' : 'pointer',
                      opacity: previewPhotos.length >= 1 ? 0.5 : 1
                    }}
                  >
                    {uploadingPhoto ? 'Téléchargement...' : previewPhotos.length >= 1 ? 'Photo ajoutée' : '+ Ajouter ma photo'}
                  </label>
                </div>

                {previewPhotos.length > 0 && (
                  <div className="photos-preview">
                    {previewPhotos.map((photo, index) => (
                      <div 
                        key={index} 
                        className={`photo-preview-item ${index === mainPhotoIndex ? 'main-photo' : ''}`}
                      >
                        <img src={photo} alt={`Photo ${index + 1}`} />
                        <div className="photo-actions">
                          <button 
                            className="photo-action-btn"
                            onClick={() => setAsMainPhoto(index)}
                            title="Définir comme photo principale"
                          >
                            {index === mainPhotoIndex ? '★' : '☆'}
                          </button>
                          <button 
                            className="photo-action-btn delete"
                            onClick={() => removePhoto(index)}
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {previewPhotos.length === 0 && (
                  <div className="no-photos-placeholder">
                    <div className="placeholder-icon">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                    <p>Aucune photo ajoutée</p>
                    <p className="placeholder-text">Cliquez sur le bouton ci-dessus pour ajouter vos photos</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            {step > 1 && (
              <button className="btn-secondary" onClick={handleBack} disabled={loading}>
                Retour
              </button>
            )}
            
            {step < 6 ? (
              <button className="btn-primary" onClick={handleNext} disabled={loading}>
                Suivant
              </button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit} disabled={loading || uploadingPhoto}>
                {loading ? 'Enregistrement...' : 'Terminer et commencer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
