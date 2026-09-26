import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from './firebase'
import { userService } from './firestore'
import { User } from '@/types'

export const authService = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    console.log('Attempting email sign in...')
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log('Email sign in successful')
    
    // Save userId to localStorage
    localStorage.setItem('userId', userCredential.user.uid)
    
    return userCredential.user
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Sign up with email and password
  async signUpWithEmail(
    email: string, 
    password: string,
    firstName: string,
    lastName: string
  ): Promise<FirebaseUser> {
    console.log('Attempting email sign up...')
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    console.log('Creating user document in Firestore...')
    // Create user document in Firestore
    await userService.createUser(userCredential.user.uid, {
      id: userCredential.user.uid,
      email: userCredential.user.email!,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Save userId to localStorage
    localStorage.setItem('userId', userCredential.user.uid)
    
    console.log('Email sign up successful')
    return userCredential.user
  },

  // Sign in with Google (try popup first, fallback to redirect)
  async signInWithGoogle(): Promise<FirebaseUser> {
    console.log('Creating Google provider...')
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    try {
      console.log('Attempting Google sign in with popup...')
      const userCredential = await signInWithPopup(auth, provider)
      console.log('Google sign in successful with popup, user:', userCredential.user)
      
      // Save userId to localStorage
      localStorage.setItem('userId', userCredential.user.uid)
      
      // Check if user document exists, if not create it
      await this.handleUserAfterAuth(userCredential.user)
      
      return userCredential.user
    } catch (error: any) {
      console.log('Popup failed, trying redirect method...', error.code)
      
      // If popup fails (often due to popup blocking), use redirect
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked') {
        console.log('Using redirect method instead...')
        await signInWithRedirect(auth, provider)
        throw new Error('REDIRECT_IN_PROGRESS')
      }
      
      throw error
    }
  },

  // Handle redirect result (call this after redirect)
  async handleRedirectResult(): Promise<FirebaseUser | null> {
    try {
      console.log('Checking redirect result...')
      const result = await getRedirectResult(auth)
      
      if (result && result.user) {
        console.log('Redirect result successful, user:', result.user)
        
        // Save userId to localStorage
        localStorage.setItem('userId', result.user.uid)
        
        await this.handleUserAfterAuth(result.user)
        return result.user
      }
      
      return null
    } catch (error: any) {
      console.error('Redirect result error:', error)
      return null
    }
  },

  // Helper to create/update user document after auth
  async handleUserAfterAuth(user: FirebaseUser): Promise<void> {
    console.log('Checking if user document exists...')
    const existingUser = await userService.getUserById(user.uid)
    
    if (!existingUser) {
      console.log('User document does not exist, creating...')
      const displayName = user.displayName || ''
      const nameParts = displayName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      await userService.createUser(user.uid, {
        id: user.uid,
        email: user.email!,
        firstName,
        lastName,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log('User document created')
    } else {
      console.log('User document already exists')
      
      // Save userId to localStorage
      localStorage.setItem('userId', user.uid)
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback)
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth.currentUser !== null
  }
}