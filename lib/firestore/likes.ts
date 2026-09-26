import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy,
  deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase'
import { Like } from '@/types'

const LIKES_COLLECTION = 'likes'

export const likeService = {
  // Create a like
  async createLike(fromUserId: string, toUserId: string, isSuperLike: boolean = false): Promise<string> {
    const likeRef = doc(collection(db, LIKES_COLLECTION))
    const likeData: Omit<Like, 'id'> = {
      fromUserId,
      toUserId,
      createdAt: new Date(),
      isSuperLike
    }
    await setDoc(likeRef, likeData)
    return likeRef.id
  },

  // Create a super like
  async createSuperLike(fromUserId: string, toUserId: string): Promise<string> {
    return this.createLike(fromUserId, toUserId, true)
  },

  // Get like by ID
  async getLikeById(likeId: string): Promise<Like | null> {
    const likeRef = doc(db, LIKES_COLLECTION, likeId)
    const likeSnap = await getDoc(likeRef)
    
    if (likeSnap.exists()) {
      return { id: likeSnap.id, ...likeSnap.data() } as Like
    }
    return null
  },

  // Get all likes received by a user
  async getReceivedLikes(userId: string): Promise<Like[]> {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('toUserId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    const likes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Like)
    // Sort by createdAt in JavaScript to avoid needing composite index
    return likes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  // Get all likes sent by a user
  async getSentLikes(userId: string): Promise<Like[]> {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('fromUserId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    const likes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Like)
    // Sort by createdAt in JavaScript to avoid needing composite index
    return likes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  // Check if user has liked another user
  async hasLiked(fromUserId: string, toUserId: string): Promise<boolean> {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    )
    
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  },

  // Check for mutual like (both users liked each other)
  async isMutualLike(userId1: string, userId2: string): Promise<boolean> {
    const q1 = query(
      collection(db, LIKES_COLLECTION),
      where('fromUserId', '==', userId1),
      where('toUserId', '==', userId2)
    )
    
    const q2 = query(
      collection(db, LIKES_COLLECTION),
      where('fromUserId', '==', userId2),
      where('toUserId', '==', userId1)
    )

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
    return !snap1.empty && !snap2.empty
  },

  // Delete like
  async deleteLike(likeId: string): Promise<void> {
    const likeRef = doc(db, LIKES_COLLECTION, likeId)
    await deleteDoc(likeRef)
  },

  // Delete like between two users
  async deleteLikeBetweenUsers(fromUserId: string, toUserId: string): Promise<void> {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    )
    
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref)
    })
  }
}