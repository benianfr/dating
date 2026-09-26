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
  addDoc,
  onSnapshot,
  increment
} from 'firebase/firestore'
import { db } from '../firebase'
import { Message, Conversation } from '@/types'

const MESSAGES_COLLECTION = 'messages'
const CONVERSATIONS_COLLECTION = 'conversations'

export const messageService = {
  // Create a new conversation
  async createConversation(userId1: string, userId2: string): Promise<string> {
    const conversationRef = doc(collection(db, CONVERSATIONS_COLLECTION))
    const conversationData: Omit<Conversation, 'id'> = {
      userId1,
      userId2,
      lastMessageAt: new Date(),
      unreadCount1: 0,
      unreadCount2: 0
    }
    await setDoc(conversationRef, conversationData)
    return conversationRef.id
  },

  // Get conversation between two users
  async getConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId1', '==', userId1),
      where('userId2', '==', userId2)
    )
    
    const q2 = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId1', '==', userId2),
      where('userId2', '==', userId1)
    )

    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
    
    if (!snap1.empty) {
      return { id: snap1.docs[0].id, ...snap1.docs[0].data() } as Conversation
    }
    if (!snap2.empty) {
      return { id: snap2.docs[0].id, ...snap2.docs[0].data() } as Conversation
    }
    return null
  },

  // Get all conversations for a user
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId1', '==', userId)
    )
    
    const q2 = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId2', '==', userId)
    )

    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
    
    const conversations = [
      ...snap1.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation),
      ...snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation)
    ]

    // Sort by lastMessageAt in JavaScript to avoid needing composite index
    return conversations.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    fromUserId: string,
    toUserId: string,
    text: string
  ): Promise<string> {
    const messageRef = doc(collection(db, MESSAGES_COLLECTION))
    const messageData: Omit<Message, 'id'> = {
      conversationId,
      fromUserId,
      toUserId,
      text,
      createdAt: new Date(),
      read: false
    }
    await setDoc(messageRef, messageData)

    // Update conversation
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId)
    const conversation = await getDoc(conversationRef)
    if (conversation.exists()) {
      const convData = conversation.data() as Conversation
      const isUser1 = convData.userId1 === fromUserId
      
      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageAt: new Date(),
        [isUser1 ? 'unreadCount2' : 'unreadCount1']: increment(1)
      })
    }

    return messageRef.id
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message)
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId)
    const conversation = await getDoc(conversationRef)
    
    if (conversation.exists()) {
      const convData = conversation.data() as Conversation
      const isUser1 = convData.userId1 === userId
      
      await updateDoc(conversationRef, {
        [isUser1 ? 'unreadCount1' : 'unreadCount2']: 0
      })

      // Mark individual messages as read
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('toUserId', '==', userId),
        where('read', '==', false)
      )
      
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { read: true })
      })
    }
  },

  // Subscribe to messages in real-time
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message)
      callback(messages)
    })
    
    return unsubscribe
  },

  // Subscribe to conversations in real-time
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q1 = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId1', '==', userId)
    )

    const q2 = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId2', '==', userId)
    )

    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      const conversations1 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation)
      callback(conversations1)
    })

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const conversations2 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation)
      callback(conversations2)
    })

    return () => {
      unsubscribe1()
      unsubscribe2()
    }
  }
}