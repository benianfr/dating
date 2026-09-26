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
import { Block } from '@/types'

const BLOCKS_COLLECTION = 'blocks'

export const blockService = {
  // Create a block
  async createBlock(blockerId: string, blockedUserId: string): Promise<string> {
    const blockRef = doc(collection(db, BLOCKS_COLLECTION))
    const blockData: Omit<Block, 'id'> = {
      blockerId,
      blockedUserId,
      createdAt: new Date()
    }
    await setDoc(blockRef, blockData)
    return blockRef.id
  },

  // Get block by ID
  async getBlockById(blockId: string): Promise<Block | null> {
    const blockRef = doc(db, BLOCKS_COLLECTION, blockId)
    const blockSnap = await getDoc(blockRef)
    
    if (blockSnap.exists()) {
      return { id: blockSnap.id, ...blockSnap.data() } as Block
    }
    return null
  },

  // Get all users blocked by a user
  async getBlockedUsers(userId: string): Promise<Block[]> {
    const q = query(
      collection(db, BLOCKS_COLLECTION),
      where('blockerId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Block)
  },

  // Check if user has blocked another user
  async hasBlocked(blockerId: string, blockedUserId: string): Promise<boolean> {
    const q = query(
      collection(db, BLOCKS_COLLECTION),
      where('blockerId', '==', blockerId),
      where('blockedUserId', '==', blockedUserId)
    )
    
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  },

  // Check if there's a block between two users (either direction)
  async isBlockedBetweenUsers(userId1: string, userId2: string): Promise<boolean> {
    const q1 = query(
      collection(db, BLOCKS_COLLECTION),
      where('blockerId', '==', userId1),
      where('blockedUserId', '==', userId2)
    )
    
    const q2 = query(
      collection(db, BLOCKS_COLLECTION),
      where('blockerId', '==', userId2),
      where('blockedUserId', '==', userId1)
    )

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
    return !snap1.empty || !snap2.empty
  },

  // Delete block
  async deleteBlock(blockId: string): Promise<void> {
    const blockRef = doc(db, BLOCKS_COLLECTION, blockId)
    await deleteDoc(blockRef)
  },

  // Delete block between two users
  async deleteBlockBetweenUsers(blockerId: string, blockedUserId: string): Promise<void> {
    const q = query(
      collection(db, BLOCKS_COLLECTION),
      where('blockerId', '==', blockerId),
      where('blockedUserId', '==', blockedUserId)
    )
    
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref)
    })
  }
}