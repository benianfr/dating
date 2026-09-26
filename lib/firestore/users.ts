import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  arrayUnion,
  increment
} from 'firebase/firestore'
import { db } from '../firebase'
import { User } from '@/types'

const USERS_COLLECTION = 'users'

// Helper function to calculate age from birthDate
function calculateAgeFromBirthDate(birthDate: Date | string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  // If birthday hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export const userService = {
  // Create a new user
  async createUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await setDoc(userRef, {
      ...userData,
      profileCompletion: 0,
      isComplete: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  },

  // Get user by ID with age calculation
  async getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = { id: userSnap.id, ...userSnap.data() } as User
      
      // Calculate age from birthDate if not already set
      if (userData.birthDate && !userData.age) {
        userData.age = calculateAgeFromBirthDate(userData.birthDate)
      }
      
      return userData
    }
    return null
  },

  // Update user
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    })
  },

  // Update profile completion
  async updateProfileCompletion(userId: string, completion: number): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      profileCompletion: completion,
      isComplete: completion >= 100,
      updatedAt: new Date()
    })
  },

  // Get users for discovery (with filters)
  async getDiscoverUsers(
    currentUserId: string,
    currentUserGender?: 'male' | 'female',
    filters?: {
      ageMin?: number
      ageMax?: number
      country?: string
      city?: string
      objective?: 'serious' | 'marriage'
      faithImportance?: string
      maxDistance?: number
      currentLat?: number
      currentLon?: number
    }
  ): Promise<User[]> {
    let q = query(
      collection(db, USERS_COLLECTION),
      where('isActive', '==', true),
      where('isComplete', '==', true),
      limit(20)
    )

    // Apply filters
    if (filters?.ageMin && filters?.ageMax) {
      // Note: Firestore doesn't support range queries on multiple fields without composite indexes
      // For now, we'll filter client-side or create composite indexes in Firebase console
    }

    const querySnapshot = await getDocs(q)
    let users = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as User)
      .filter(user => user.id !== currentUserId)

    // Filter by opposite gender - users only see the opposite sex
    if (currentUserGender) {
      const oppositeGender = currentUserGender === 'male' ? 'female' : 'male'
      users = users.filter(user => user.gender === oppositeGender)
    }

    // Prioritize boosted users
    try {
      const { boostService } = await import('./boosts')
      const boostedUserIds = await boostService.getBoostedUsers()
      
      // Sort boosted users to the top
      users.sort((a, b) => {
        const aBoosted = boostedUserIds.includes(a.id)
        const bBoosted = boostedUserIds.includes(b.id)
        
        if (aBoosted && !bBoosted) return -1
        if (!aBoosted && bBoosted) return 1
        return 0
      })
    } catch (error) {
      console.error('Error getting boosted users:', error)
    }

    // Filter by distance if location is available
    if (filters?.currentLat && filters?.currentLon && filters?.maxDistance) {
      const { calculateDistance } = await import('../location')
      users = users.filter(user => {
        if (!user.latitude || !user.longitude || !user.locationEnabled) return true // Include users without location
        const distance = calculateDistance(
          filters.currentLat!,
          filters.currentLon!,
          user.latitude,
          user.longitude
        )
        return distance <= filters.maxDistance!
      })
    }

    return users
  },

  // Search users by name or location
  async searchUsers(searchTerm: string): Promise<User[]> {
    // Note: For better search, consider using Algolia or a dedicated search service
    const q = query(
      collection(db, USERS_COLLECTION),
      where('isActive', '==', true),
      limit(20)
    )

    const querySnapshot = await getDocs(q)
    const users = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as User)
      .filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )

    return users
  },

  // Add photo to user
  async addPhoto(userId: string, photoUrl: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      photos: arrayUnion(photoUrl),
      updatedAt: new Date()
    })
  },

  // Remove photo from user
  async removePhoto(userId: string, photoUrl: string): Promise<void> {
    const user = await this.getUserById(userId)
    if (user?.photos) {
      const updatedPhotos = user.photos.filter(p => p !== photoUrl)
      await this.updateUser(userId, { photos: updatedPhotos })
    }
  },

  // Set main photo
  async setMainPhoto(userId: string, photoUrl: string): Promise<void> {
    await this.updateUser(userId, { mainPhoto: photoUrl })
  },

  // Deactivate user
  async deactivateUser(userId: string): Promise<void> {
    await this.updateUser(userId, { isActive: false })
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      isActive: false,
      deletedAt: new Date()
    })
  },

  // Update user and recalculate match compatibilities
  async updateUserAndRecalculateMatches(userId: string, userData: Partial<User>): Promise<void> {
    await this.updateUser(userId, userData)
    
    // Dynamic import to avoid circular dependency
    const { matchRecalculator } = await import('../matchRecalculator')
    await matchRecalculator.recalculateUserMatches(userId)
  }
}