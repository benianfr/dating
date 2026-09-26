import { User } from '@/types'
import { calculateDistance } from './location'

interface CompatibilityFactors {
  ageMatch: number
  locationMatch: number
  faithMatch: number
  valuesMatch: number
  objectivesMatch: number
  interestsMatch: number
  totalScore: number
}

export const compatibilityService = {
  /**
   * Calculate compatibility score between two users (0-100)
   */
  calculateCompatibility(user1: User, user2: User): number {
    const factors = this.getCompatibilityFactors(user1, user2)
    return factors.totalScore
  },

  /**
   * Get detailed compatibility factors between two users
   */
  getCompatibilityFactors(user1: User, user2: User): CompatibilityFactors {
    const ageMatch = this.calculateAgeMatch(user1, user2)
    const locationMatch = this.calculateLocationMatch(user1, user2)
    const faithMatch = this.calculateFaithMatch(user1, user2)
    const valuesMatch = this.calculateValuesMatch(user1, user2)
    const objectivesMatch = this.calculateObjectivesMatch(user1, user2)
    const interestsMatch = this.calculateInterestsMatch(user1, user2)

    // Weight the factors (total should be 100)
    // Dynamic weights based on user's faith importance
    const faithImportanceWeight = user1.faithImportance === 'very_important' ? 0.35 : 
                                  user1.faithImportance === 'important' ? 0.25 : 0.20
    
    const weights = {
      ageMatch: 0.15,                      // 15%
      locationMatch: 0.20,                 // 20%
      faithMatch: faithImportanceWeight,  // Dynamic based on faith importance
      valuesMatch: 0.20,                  // 20%
      objectivesMatch: 0.10,              // 10%
      interestsMatch: 0.10               // 10%
    }
    
    // Normalize weights to ensure they sum to 1
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    const normalizedWeights = {
      ageMatch: weights.ageMatch / totalWeight,
      locationMatch: weights.locationMatch / totalWeight,
      faithMatch: weights.faithMatch / totalWeight,
      valuesMatch: weights.valuesMatch / totalWeight,
      objectivesMatch: weights.objectivesMatch / totalWeight,
      interestsMatch: weights.interestsMatch / totalWeight
    }

    const totalScore = Math.round(
      ageMatch * weights.ageMatch +
      locationMatch * weights.locationMatch +
      faithMatch * weights.faithMatch +
      valuesMatch * weights.valuesMatch +
      objectivesMatch * weights.objectivesMatch +
      interestsMatch * weights.interestsMatch
    )

    return {
      ageMatch,
      locationMatch,
      faithMatch,
      valuesMatch,
      objectivesMatch,
      interestsMatch,
      totalScore
    }
  },

  /**
   * Calculate age compatibility based on preferences
   */
  calculateAgeMatch(user1: User, user2: User): number {
    // Check if user2's age is within user1's preferences
    const user2Age = user2.age || (user2.birthDate ? this.calculateAge(user2.birthDate) : 0)
    const user1Age = user1.age || (user1.birthDate ? this.calculateAge(user1.birthDate) : 0)

    if (!user2Age || !user1Age) return 50 // Neutral score if age unknown

    // Check user1's preferences for user2
    const user1PrefValid = user1.prefAgeMin && user1.prefAgeMax
    const user2PrefValid = user2.prefAgeMin && user2.prefAgeMax

    let score = 0

    if (user1PrefValid) {
      if (user2Age >= user1.prefAgeMin && user2Age <= user1.prefAgeMax) {
        score += 50
      } else {
        // Partial points if close to preferences
        const distance = Math.min(
          Math.abs(user2Age - user1.prefAgeMin),
          Math.abs(user2Age - user1.prefAgeMax)
        )
        score += Math.max(0, 50 - distance * 5)
      }
    }

    if (user2PrefValid) {
      if (user1Age >= user2.prefAgeMin && user1Age <= user2.prefAgeMax) {
        score += 50
      } else {
        const distance = Math.min(
          Math.abs(user1Age - user2.prefAgeMin),
          Math.abs(user1Age - user2.prefAgeMax)
        )
        score += Math.max(0, 50 - distance * 5)
      }
    }

    // If no preferences set, give neutral score based on age difference
    if (!user1PrefValid && !user2PrefValid) {
      const ageDiff = Math.abs(user1Age - user2Age)
      score = Math.max(0, 100 - ageDiff * 2) // Lose 2 points per year difference
    }

    return Math.min(100, Math.round(score))
  },

  /**
   * Calculate location compatibility
   */
  calculateLocationMatch(user1: User, user2: User): number {
    // Check if both users have GPS coordinates
    if (user1.latitude && user1.longitude && user2.latitude && user2.longitude && 
        user1.locationEnabled && user2.locationEnabled) {
      const distance = calculateDistance(user1.latitude, user1.longitude, user2.latitude, user2.longitude)
      
      // Distance-based scoring
      if (distance <= 10) return 100 // Within 10km
      if (distance <= 25) return 90 // Within 25km
      if (distance <= 50) return 80 // Within 50km
      if (distance <= 100) return 70 // Within 100km
      if (distance <= 200) return 60 // Within 200km
      if (distance <= 500) return 50 // Within 500km
      return 30 // Far away
    }
    
    // Fallback to country/city matching
    // Same country = high score
    if (user1.country === user2.country && user1.country) {
      // Same city = very high score
      if (user1.city === user2.city && user1.city) {
        return 100
      }
      return 80
    }

    // Different countries but same region (West Africa for example)
    const westAfricanCountries = ['Côte d\'Ivoire', 'Sénégal', 'Bénin', 'Togo', 'Cameroun', 'RDC', 'Gabon', 'Burkina Faso', 'Guinée']
    const europeanCountries = ['France', 'Belgique']
    const northAmericanCountries = ['Canada']

    const user1Region = this.getRegion(user1.country)
    const user2Region = this.getRegion(user2.country)

    if (user1Region === user2Region && user1Region) {
      return 60
    }

    return 30 // Low score for different regions
  },

  /**
   * Calculate faith compatibility
   */
  calculateFaithMatch(user1: User, user2: User): number {
    let score = 0

    // Match faith importance levels
    const faithImportanceMap = {
      'very_important': 4,
      'important': 3,
      'moderate': 2,
      'low': 1
    }

    const user1FaithLevel = faithImportanceMap[user1.faithImportance || 'important']
    const user2FaithLevel = faithImportanceMap[user2.faithImportance || 'important']

    // Similar faith importance = high score
    const levelDiff = Math.abs(user1FaithLevel - user2FaithLevel)
    score += Math.max(0, 60 - levelDiff * 15)

    // Same community = bonus
    if (user1.community === user2.community && user1.community) {
      score += 20
    }

    // Similar faith relation = bonus
    if (user1.faithRelation === user2.faithRelation && user1.faithRelation) {
      score += 20
    }

    return Math.min(100, score)
  },

  /**
   * Calculate values compatibility
   */
  calculateValuesMatch(user1: User, user2: User): number {
    if (!user1.values || !user2.values || user1.values.length === 0 || user2.values.length === 0) {
      return 50 // Neutral score if no values specified
    }

    // Count matching values
    const matchingValues = user1.values.filter(value => user2.values?.includes(value))
    const totalUniqueValues = new Set([...user1.values, ...user2.values]).size

    if (totalUniqueValues === 0) return 50

    const matchPercentage = (matchingValues.length / totalUniqueValues) * 100

    // Boost score if they have several matching values
    if (matchingValues.length >= 3) {
      return Math.min(100, matchPercentage + 20)
    }

    return matchPercentage
  },

  /**
   * Calculate relationship objectives compatibility
   */
  calculateObjectivesMatch(user1: User, user2: User): number {
    let score = 0

    // Match objective (serious vs marriage)
    if (user1.prefObjective === user2.prefObjective && user1.prefObjective) {
      score += 60
    }

    // Match on marriage desire
    if (user1.wantsMarriage === user2.wantsMarriage) {
      score += 20
    }

    // Match on children desire
    if (user1.wantsChildren === user2.wantsChildren) {
      score += 20
    }

    return Math.min(100, score)
  },

  /**
   * Calculate interests compatibility
   */
  calculateInterestsMatch(user1: User, user2: User): number {
    if (!user1.interests || !user2.interests || user1.interests.length === 0 || user2.interests.length === 0) {
      return 50 // Neutral score if no interests specified
    }

    // Count matching interests
    const matchingInterests = user1.interests.filter(interest => user2.interests?.includes(interest))
    const totalUniqueInterests = new Set([...user1.interests, ...user2.interests]).size

    if (totalUniqueInterests === 0) return 50

    const matchPercentage = (matchingInterests.length / totalUniqueInterests) * 100

    return matchPercentage
  },

  /**
   * Get compatibility explanation for UI
   */
  getCompatibilityExplanation(user1: User, user2: User): string[] {
    const factors = this.getCompatibilityFactors(user1, user2)
    const explanations: string[] = []

    if (factors.faithMatch >= 70) {
      explanations.push('Vous partagez des valeurs spirituelles importantes')
    }

    if (factors.valuesMatch >= 60) {
      explanations.push('Vos valeurs fondamentales sont alignées')
    }

    if (factors.objectivesMatch >= 70) {
      explanations.push('Vous avez des objectifs relationnels similaires')
    }

    if (factors.locationMatch >= 80) {
      explanations.push('Vous êtes géographiquement proches')
    }

    if (factors.interestsMatch >= 50) {
      explanations.push('Vous avez des centres d\'intérêt communs')
    }

    if (factors.ageMatch >= 70) {
      explanations.push('Vos préférences d\'âge sont compatibles')
    }

    if (explanations.length === 0) {
      explanations.push('Ce profil présente un potentiel intéressant')
    }

    return explanations
  },

  /**
   * Helper: Calculate age from birth date
   */
  calculateAge(birthDate: Date | string): number {
    const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const today = new Date()
    let age = today.getFullYear() - date.getFullYear()
    const monthDiff = today.getMonth() - date.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--
    }
    
    return age
  },

  /**
   * Helper: Get region from country
   */
  getRegion(country?: string): string {
    if (!country) return ''

    const westAfricanCountries = ['Côte d\'Ivoire', 'Sénégal', 'Bénin', 'Togo', 'Cameroun', 'RDC', 'Gabon', 'Burkina Faso', 'Guinée']
    const europeanCountries = ['France', 'Belgique']
    const northAmericanCountries = ['Canada']

    if (westAfricanCountries.includes(country)) return 'west_africa'
    if (europeanCountries.includes(country)) return 'europe'
    if (northAmericanCountries.includes(country)) return 'north_america'

    return 'other'
  }
}
