import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { User, Match, Like, Message, Conversation, Report, Block, Boost, SuperLikeRemaining, Subscription } from '@/types'

// Re-export subscription service from separate file
export { subscriptionService } from './firestore/subscriptions'

// User Service
export const userService = {
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) return null
      
      const userData = userDoc.data()
      return {
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
        birthDate: userData.birthDate?.toDate()
      } as User
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  async createUser(user: Partial<User>): Promise<User> {
    try {
      const userRef = doc(collection(db, 'users'))
      const newUser = {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileCompletion: 0,
        isComplete: false,
        isActive: true
      }
      
      await setDoc(userRef, newUser)
      
      return {
        id: userRef.id,
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date()
      } as User
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  async getDiscoverUsers(
    userId: string, 
    currentUserGender?: 'male' | 'female',
    filters: {
      ageMin?: number
      ageMax?: number
      objective?: string
      faithImportance?: string
      maxDistance?: number
      currentLat?: number
      currentLon?: number
    } = {}
  ): Promise<User[]> {
    try {
      // Get current user to exclude them from results
      const currentUser = await this.getUserById(userId)
      if (!currentUser) return []

      // Get all users (in production, this should be optimized with proper indexing)
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true),
        where('isComplete', '==', true)
      )
      
      const snapshot = await getDocs(usersQuery)
      const users: User[] = []
      
      for (const doc of snapshot.docs) {
        if (doc.id === userId) continue // Skip current user
        
        const userData = doc.data()
        const user = {
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          birthDate: userData.birthDate?.toDate()
        } as User
        
        // Apply filters
        let matches = true
        
        // IMPORTANT: Only show opposite gender profiles
        // Men should only see women, women should only see men
        const genderToCheck = currentUserGender || currentUser.gender
        if (genderToCheck && user.gender) {
          if (genderToCheck === 'male' && user.gender !== 'female') {
            matches = false
          } else if (genderToCheck === 'female' && user.gender !== 'male') {
            matches = false
          }
        } else {
          // If current user has no gender specified, don't show any profiles
          matches = false
        }
        
        // Age filter
        if (filters.ageMin && filters.ageMax) {
          const age = user.age || (user.birthDate ? this.calculateAge(user.birthDate) : 0)
          if (age < filters.ageMin || age > filters.ageMax) {
            matches = false
          }
        }
        
        // Objective filter
        if (filters.objective && user.prefObjective !== filters.objective) {
          matches = false
        }
        
        // Faith importance filter
        if (filters.faithImportance && user.faithImportance !== filters.faithImportance) {
          matches = false
        }
        
        // Distance filter
        if (filters.maxDistance && filters.currentLat && filters.currentLon && 
            user.latitude && user.longitude && user.locationEnabled) {
          const distance = this.calculateDistance(
            filters.currentLat, filters.currentLon,
            user.latitude, user.longitude
          )
          if (distance > filters.maxDistance) {
            matches = false
          }
        }
        
        if (matches) {
          users.push(user)
        }
      }
      
      return users
    } catch (error) {
      console.error('Error getting discover users:', error)
      return []
    }
  },

  calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  },

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return Math.round(distance)
  },

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

// Like Service
export const likeService = {
  async createLike(fromUserId: string, toUserId: string, isSuperLike: boolean = false): Promise<void> {
    try {
      const likesQuery = query(
        collection(db, 'likes'),
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId)
      )
      
      const snapshot = await getDocs(likesQuery)
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'likes'), {
          fromUserId,
          toUserId,
          isSuperLike,
          createdAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error creating like:', error)
      throw error
    }
  },

  async createSuperLike(fromUserId: string, toUserId: string): Promise<void> {
    return this.createLike(fromUserId, toUserId, true)
  },

  async isMutualLike(userId1: string, userId2: string): Promise<boolean> {
    try {
      const like1Query = query(
        collection(db, 'likes'),
        where('fromUserId', '==', userId1),
        where('toUserId', '==', userId2)
      )
      
      const like2Query = query(
        collection(db, 'likes'),
        where('fromUserId', '==', userId2),
        where('toUserId', '==', userId1)
      )
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(like1Query),
        getDocs(like2Query)
      ])
      
      return !snapshot1.empty && !snapshot2.empty
    } catch (error) {
      console.error('Error checking mutual like:', error)
      return false
    }
  },

  async deleteLikeBetweenUsers(userId1: string, userId2: string): Promise<void> {
    try {
      const likeQuery = query(
        collection(db, 'likes'),
        where('fromUserId', '==', userId1),
        where('toUserId', '==', userId2)
      )
      
      const snapshot = await getDocs(likeQuery)
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref)
      }
    } catch (error) {
      console.error('Error deleting like:', error)
      throw error
    }
  },

  async getLikesReceived(userId: string): Promise<Like[]> {
    try {
      // Simple query without orderBy to avoid index requirement
      const likesQuery = query(
        collection(db, 'likes'),
        where('toUserId', '==', userId)
      )
      
      const snapshot = await getDocs(likesQuery)
      const likes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Like[]
      
      // Sort by createdAt in JavaScript instead of Firestore
      return likes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error('Error getting likes received:', error)
      return []
    }
  },

  async getReceivedLikes(userId: string): Promise<Like[]> {
    return this.getLikesReceived(userId)
  }
}

// Match Service
export const matchService = {
  async createMatch(userId1: string, userId2: string, compatibilityScore: number): Promise<Match> {
    try {
      const matchRef = doc(collection(db, 'matches'))
      const match = {
        userId1,
        userId2,
        compatibilityScore,
        matchedAt: serverTimestamp()
      }
      
      await setDoc(matchRef, match)
      
      return {
        id: matchRef.id,
        ...match,
        matchedAt: new Date()
      } as Match
    } catch (error) {
      console.error('Error creating match:', error)
      throw error
    }
  },

  async areUsersMatched(userId1: string, userId2: string): Promise<boolean> {
    try {
      const matchQuery = query(
        collection(db, 'matches'),
        where('userId1', '==', userId1),
        where('userId2', '==', userId2)
      )
      
      const snapshot = await getDocs(matchQuery)
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking if users matched:', error)
      return false
    }
  },

  async getMatches(userId: string): Promise<Match[]> {
    try {
      // Simple query without orderBy to avoid index requirement
      const matchQuery = query(
        collection(db, 'matches'),
        where('userId1', '==', userId)
      )
      
      const snapshot = await getDocs(matchQuery)
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        matchedAt: doc.data().matchedAt?.toDate() || new Date()
      })) as Match[]
      
      // Also check where userId is userId2
      const matchQuery2 = query(
        collection(db, 'matches'),
        where('userId2', '==', userId)
      )
      
      const snapshot2 = await getDocs(matchQuery2)
      const matches2 = snapshot2.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        matchedAt: doc.data().matchedAt?.toDate() || new Date()
      })) as Match[]
      
      // Sort by matchedAt in JavaScript instead of Firestore
      const allMatches = [...matches, ...matches2]
      return allMatches.sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime())
    } catch (error) {
      console.error('Error getting matches:', error)
      return []
    }
  },

  async getUserMatches(userId: string): Promise<Match[]> {
    return this.getMatches(userId)
  }
}

// Message Service
export const messageService = {
  async createConversation(userId1: string, userId2: string): Promise<Conversation> {
    try {
      // Check if conversation already exists
      const existingQuery = query(
        collection(db, 'conversations'),
        where('userId1', '==', userId1),
        where('userId2', '==', userId2)
      )
      
      const existingSnapshot = await getDocs(existingQuery)
      if (!existingSnapshot.empty) {
        return {
          id: existingSnapshot.docs[0].id,
          ...existingSnapshot.docs[0].data(),
          lastMessageAt: existingSnapshot.docs[0].data().lastMessageAt?.toDate() || new Date()
        } as Conversation
      }
      
      // Check reverse order
      const reverseQuery = query(
        collection(db, 'conversations'),
        where('userId1', '==', userId2),
        where('userId2', '==', userId1)
      )
      
      const reverseSnapshot = await getDocs(reverseQuery)
      if (!reverseSnapshot.empty) {
        return {
          id: reverseSnapshot.docs[0].id,
          ...reverseSnapshot.docs[0].data(),
          lastMessageAt: reverseSnapshot.docs[0].data().lastMessageAt?.toDate() || new Date()
        } as Conversation
      }
      
      // Create new conversation
      const conversationRef = doc(collection(db, 'conversations'))
      const conversation = {
        userId1,
        userId2,
        lastMessageAt: serverTimestamp(),
        unreadCount1: 0,
        unreadCount2: 0
      }
      
      await setDoc(conversationRef, conversation)
      
      return {
        id: conversationRef.id,
        ...conversation,
        lastMessageAt: new Date()
      } as Conversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  },

  async sendMessage(conversationId: string, fromUserId: string, toUserId: string, text: string): Promise<Message> {
    try {
      const messageRef = doc(collection(db, 'messages'))
      const message = {
        conversationId,
        fromUserId,
        toUserId,
        text,
        read: false,
        createdAt: serverTimestamp()
      }
      
      await setDoc(messageRef, message)
      
      // Update conversation
      const conversationRef = doc(db, 'conversations', conversationId)
      const conversation = await getDoc(conversationRef)
      
      if (conversation.exists()) {
        const data = conversation.data()
        const isUser1 = data.userId1 === fromUserId
        
        await updateDoc(conversationRef, {
          lastMessage: text,
          lastMessageAt: serverTimestamp(),
          unreadCount1: isUser1 ? 0 : (data.unreadCount1 || 0) + 1,
          unreadCount2: isUser1 ? (data.unreadCount2 || 0) + 1 : 0
        })
      }
      
      return {
        id: messageRef.id,
        ...message,
        createdAt: new Date()
      } as Message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
      )
      
      const snapshot = await getDocs(messagesQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Message[]
    } catch (error) {
      console.error('Error getting messages:', error)
      return []
    }
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      // Simple query without orderBy to avoid index requirement
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId1', '==', userId)
      )
      
      const snapshot = await getDocs(conversationsQuery)
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date()
      })) as Conversation[]
      
      // Also check where userId is userId2
      const conversationsQuery2 = query(
        collection(db, 'conversations'),
        where('userId2', '==', userId)
      )
      
      const snapshot2 = await getDocs(conversationsQuery2)
      const conversations2 = snapshot2.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date()
      })) as Conversation[]
      
      // Sort by lastMessageAt in JavaScript instead of Firestore
      const allConversations = [...conversations, ...conversations2]
      return allConversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
    } catch (error) {
      console.error('Error getting conversations:', error)
      return []
    }
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.getConversations(userId)
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId)
      const conversation = await getDoc(conversationRef)
      
      if (conversation.exists()) {
        const data = conversation.data()
        const isUser1 = data.userId1 === userId
        
        await updateDoc(conversationRef, {
          unreadCount1: isUser1 ? 0 : data.unreadCount1,
          unreadCount2: isUser1 ? data.unreadCount2 : 0
        })
      }
    } catch (error) {
      console.error('Error marking as read:', error)
      throw error
    }
  }
}

// Boost Service
export const boostService = {
  async createBoost(userId: string): Promise<Boost> {
    try {
      const boostRef = doc(collection(db, 'boosts'))
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 30) // 30 minutes boost
      
      const boost = {
        userId,
        boostedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        isActive: true
      }
      
      await setDoc(boostRef, boost)
      
      return {
        id: boostRef.id,
        ...boost,
        boostedAt: new Date(),
        expiresAt: expiresAt
      } as Boost
    } catch (error) {
      console.error('Error creating boost:', error)
      throw error
    }
  },

  async hasActiveBoost(userId: string): Promise<boolean> {
    try {
      const boostQuery = query(
        collection(db, 'boosts'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      )
      
      const snapshot = await getDocs(boostQuery)
      
      // Check if any boost is still active (not expired)
      const now = new Date()
      for (const doc of snapshot.docs) {
        const boost = doc.data()
        const expiresAt = boost.expiresAt?.toDate()
        if (expiresAt && expiresAt > now) {
          return true
        } else {
          // Deactivate expired boost
          await updateDoc(doc.ref, { isActive: false })
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking active boost:', error)
      return false
    }
  },

  async useSuperLike(userId: string): Promise<boolean> {
    try {
      const superLikeRef = doc(db, 'superLikeRemaining', userId)
      const superLikeDoc = await getDoc(superLikeRef)
      
      if (!superLikeDoc.exists()) {
        // Create new super like counter
        await setDoc(superLikeRef, {
          userId,
          dailyRemaining: 0,
          lastResetDate: serverTimestamp()
        })
        return false
      }
      
      const data = superLikeDoc.data()
      const lastResetDate = data.lastResetDate?.toDate() || new Date()
      const today = new Date()
      
      // Reset if it's a new day
      if (lastResetDate.toDateString() !== today.toDateString()) {
        await updateDoc(superLikeRef, {
          dailyRemaining: 0,
          lastResetDate: serverTimestamp()
        })
        return false
      }
      
      if (data.dailyRemaining <= 0) {
        return false
      }
      
      await updateDoc(superLikeRef, {
        dailyRemaining: data.dailyRemaining - 1
      })
      
      return true
    } catch (error) {
      console.error('Error using super like:', error)
      return false
    }
  },

  async getSuperLikeRemaining(userId: string): Promise<SuperLikeRemaining> {
    try {
      const superLikeRef = doc(db, 'superLikeRemaining', userId)
      const superLikeDoc = await getDoc(superLikeRef)
      
      if (!superLikeDoc.exists()) {
        // Create new super like counter with 1 daily super like
        await setDoc(superLikeRef, {
          userId,
          dailyRemaining: 1,
          lastResetDate: serverTimestamp()
        })
        
        return {
          userId,
          dailyRemaining: 1,
          lastResetDate: new Date()
        }
      }
      
      const data = superLikeDoc.data()
      const lastResetDate = data.lastResetDate?.toDate() || new Date()
      const today = new Date()
      
      // Reset if it's a new day
      if (lastResetDate.toDateString() !== today.toDateString()) {
        await updateDoc(superLikeRef, {
          dailyRemaining: 1,
          lastResetDate: serverTimestamp()
        })
        
        return {
          userId,
          dailyRemaining: 1,
          lastResetDate: new Date()
        }
      }
      
      return {
        userId,
        dailyRemaining: data.dailyRemaining || 0,
        lastResetDate: lastResetDate
      }
    } catch (error) {
      console.error('Error getting super like remaining:', error)
      return {
        userId,
        dailyRemaining: 0,
        lastResetDate: new Date()
      }
    }
  }
}

// Subscription Service
