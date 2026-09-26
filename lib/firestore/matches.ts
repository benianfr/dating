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
import { Match } from '@/types'

const MATCHES_COLLECTION = 'matches'

export const matchService = {
  // Create a match with provided compatibility score
  async createMatch(userId1: string, userId2: string, compatibilityScore: number): Promise<string> {
    const matchRef = doc(collection(db, MATCHES_COLLECTION))
    const matchData: Omit<Match, 'id'> = {
      userId1,
      userId2,
      matchedAt: new Date(),
      compatibilityScore
    }
    await setDoc(matchRef, matchData)
    return matchRef.id
  },

  // Create a match with automatic compatibility calculation
  async createMatchWithCompatibility(userId1: string, userId2: string): Promise<string> {
    // Dynamic import to avoid circular dependency
    const { compatibilityService } = await import('../compatibility')
    const { userService } = await import('./users')
    
    const user1 = await userService.getUserById(userId1)
    const user2 = await userService.getUserById(userId2)
    
    const compatibilityScore = user1 && user2 
      ? compatibilityService.calculateCompatibility(user1, user2)
      : 75 // fallback score
    
    return this.createMatch(userId1, userId2, compatibilityScore)
  },

  // Recalculate compatibility score for an existing match
  async recalculateCompatibility(matchId: string): Promise<void> {
    // Dynamic import to avoid circular dependency
    const { compatibilityService } = await import('../compatibility')
    const { userService } = await import('./users')
    
    const match = await this.getMatchById(matchId)
    if (!match) return

    const user1 = await userService.getUserById(match.userId1)
    const user2 = await userService.getUserById(match.userId2)
    
    if (user1 && user2) {
      const newScore = compatibilityService.calculateCompatibility(user1, user2)
      const matchRef = doc(db, MATCHES_COLLECTION, matchId)
      await updateDoc(matchRef, { compatibilityScore: newScore })
    }
  },

  // Get match by ID
  async getMatchById(matchId: string): Promise<Match | null> {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId)
    const matchSnap = await getDoc(matchRef)
    
    if (matchSnap.exists()) {
      return { id: matchSnap.id, ...matchSnap.data() } as Match
    }
    return null
  },

  // Get all matches for a user
  async getUserMatches(userId: string): Promise<Match[]> {
    const q = query(
      collection(db, MATCHES_COLLECTION),
      where('userId1', '==', userId)
    )
    
    const q2 = query(
      collection(db, MATCHES_COLLECTION),
      where('userId2', '==', userId)
    )

    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
    
    const matches = [
      ...snap1.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Match),
      ...snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Match)
    ]

    // Sort by matchedAt in JavaScript to avoid needing composite index
    return matches.sort((a, b) => 
      new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()
    )
  },

  // Check if users are matched
  async areUsersMatched(userId1: string, userId2: string): Promise<boolean> {
    const q = query(
      collection(db, MATCHES_COLLECTION),
      where('userId1', '==', userId1),
      where('userId2', '==', userId2)
    )
    
    const q2 = query(
      collection(db, MATCHES_COLLECTION),
      where('userId1', '==', userId2),
      where('userId2', '==', userId1)
    )

    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
    return !snap1.empty || !snap2.empty
  },

  // Delete match
  async deleteMatch(matchId: string): Promise<void> {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId)
    await deleteDoc(matchRef)
  }
}