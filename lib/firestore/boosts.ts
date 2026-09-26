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
  deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase'
import { Boost, SuperLikeRemaining } from '@/types'

const BOOSTS_COLLECTION = 'boosts'
const SUPER_LIKES_COLLECTION = 'super_likes_remaining'

export const boostService = {
  // Create a boost for a user (30 minutes duration)
  async createBoost(userId: string): Promise<string> {
    const boostRef = doc(collection(db, BOOSTS_COLLECTION))
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes
    
    const boostData: Omit<Boost, 'id'> = {
      userId,
      boostedAt: now,
      expiresAt,
      isActive: true
    }
    await setDoc(boostRef, boostData)
    return boostRef.id
  },

  // Get active boost for a user
  async getActiveBoost(userId: string): Promise<Boost | null> {
    const q = query(
      collection(db, BOOSTS_COLLECTION),
      where('userId', '==', userId),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    
    for (const doc of querySnapshot.docs) {
      const boost = { id: doc.id, ...doc.data() } as Boost
      
      // Check if boost has expired
      if (new Date(boost.expiresAt) < new Date()) {
        await this.deactivateBoost(boost.id)
        continue
      }
      
      return boost
    }
    
    return null
  },

  // Check if user has active boost
  async hasActiveBoost(userId: string): Promise<boolean> {
    const boost = await this.getActiveBoost(userId)
    return boost !== null
  },

  // Deactivate a boost
  async deactivateBoost(boostId: string): Promise<void> {
    const boostRef = doc(db, BOOSTS_COLLECTION, boostId)
    await updateDoc(boostRef, { isActive: false })
  },

  // Get all boosts for a user
  async getUserBoosts(userId: string): Promise<Boost[]> {
    const q = query(
      collection(db, BOOSTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('boostedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Boost)
  },

  // Get users with active boosts (for discovery algorithm)
  async getBoostedUsers(): Promise<string[]> {
    const q = query(
      collection(db, BOOSTS_COLLECTION),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    const boostedUserIds: string[] = []
    
    for (const doc of querySnapshot.docs) {
      const boost = { id: doc.id, ...doc.data() } as Boost
      
      // Check if boost has expired
      if (new Date(boost.expiresAt) < new Date()) {
        await this.deactivateBoost(boost.id)
        continue
      }
      
      boostedUserIds.push(boost.userId)
    }
    
    return boostedUserIds
  },

  // Get or create super like remaining count for user
  async getSuperLikeRemaining(userId: string): Promise<SuperLikeRemaining> {
    const docRef = doc(db, SUPER_LIKES_COLLECTION, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SuperLikeRemaining
      
      // Check if we need to reset (new day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastReset = new Date(data.lastResetDate)
      lastReset.setHours(0, 0, 0, 0)
      
      if (lastReset.getTime() < today.getTime()) {
        // Reset to 1 super like per day
        await this.resetSuperLikes(userId)
        return {
          userId,
          dailyRemaining: 1,
          lastResetDate: new Date()
        }
      }
      
      return data
    } else {
      // Create new entry with 1 super like
      const newData: SuperLikeRemaining = {
        userId,
        dailyRemaining: 1,
        lastResetDate: new Date()
      }
      await setDoc(docRef, newData)
      return newData
    }
  },

  // Use a super like
  async useSuperLike(userId: string): Promise<boolean> {
    const remaining = await this.getSuperLikeRemaining(userId)
    
    if (remaining.dailyRemaining > 0) {
      const docRef = doc(db, SUPER_LIKES_COLLECTION, userId)
      await updateDoc(docRef, {
        dailyRemaining: remaining.dailyRemaining - 1
      })
      return true
    }
    
    return false
  },

  // Reset super likes (called daily)
  async resetSuperLikes(userId: string): Promise<void> {
    const docRef = doc(db, SUPER_LIKES_COLLECTION, userId)
    await updateDoc(docRef, {
      dailyRemaining: 1,
      lastResetDate: new Date()
    })
  }
}