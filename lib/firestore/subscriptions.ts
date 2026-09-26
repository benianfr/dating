import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from '../firebase'
import { Subscription } from '@/types'

const SUBSCRIPTIONS_COLLECTION = 'subscriptions'

export const subscriptionService = {
  // Create a subscription for a user
  async createSubscription(userId: string, plan: 'gold' | 'platinum', durationMonths: number = 1): Promise<string> {
    const subscriptionRef = doc(collection(db, SUBSCRIPTIONS_COLLECTION))
    const now = new Date()
    const endDate = new Date(now)
    endDate.setMonth(endDate.getMonth() + durationMonths)
    
    const subscriptionData: Omit<Subscription, 'id'> = {
      userId,
      plan,
      startDate: now,
      endDate,
      isActive: true,
      autoRenew: false
    }
    await setDoc(subscriptionRef, subscriptionData)
    return subscriptionRef.id
  },

  // Get active subscription for a user
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const q = query(
      collection(db, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    
    for (const doc of querySnapshot.docs) {
      const subscription = { id: doc.id, ...doc.data() } as Subscription
      
      // Check if subscription has expired
      if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
        await this.deactivateSubscription(subscription.id)
        continue
      }
      
      return subscription
    }
    
    return null
  },

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId)
    return subscription !== null
  },

  // Check if user has specific plan
  async hasPlan(userId: string, plan: 'gold' | 'platinum'): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId)
    return subscription !== null && subscription.plan === plan
  },

  // Get subscription plan for user
  async getUserPlan(userId: string): Promise<'free' | 'gold' | 'platinum'> {
    const subscription = await this.getActiveSubscription(userId)
    if (!subscription) return 'free'
    return subscription.plan
  },

  // Deactivate a subscription
  async deactivateSubscription(subscriptionId: string): Promise<void> {
    const subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId)
    await updateDoc(subscriptionRef, { isActive: false })
  },

  // Cancel subscription (stop auto-renewal)
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId)
    await updateDoc(subscriptionRef, { autoRenew: false })
  },

  // Get all subscriptions for a user
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const q = query(
      collection(db, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Subscription)
  },

  // Get premium features for a user
  async getPremiumFeatures(userId: string) {
    const plan = await this.getUserPlan(userId)
    
    const features = {
      unlimitedLikes: plan !== 'free',
      unlimitedSuperLikes: plan === 'platinum',
      unlimitedRewinds: plan === 'platinum',
      seeWhoLikedYou: plan !== 'free',
      passportMode: plan === 'platinum',
      adFree: plan !== 'free',
      profileBoosts: plan === 'gold' ? 1 : plan === 'platinum' ? 5 : 0,
      dailySuperLikes: plan === 'gold' ? 5 : plan === 'platinum' ? 10 : 1,
      dailyRewinds: plan === 'gold' ? 5 : plan === 'platinum' ? 10 : 3
    }
    
    return features
  }
}