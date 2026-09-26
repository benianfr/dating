'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userService } from '@/lib/firestore'

export default function RequireCompleteProfile({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    checkProfileCompletion()
  }, [])

  const checkProfileCompletion = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }

      const user = await userService.getUserById(userId)
      if (!user) {
        router.push('/login')
        return
      }

      // Si le profil est incomplet (< 80%), rediriger vers onboarding
      if (user.profileCompletion < 80) {
        router.push('/onboarding')
        return
      }

      setIsComplete(true)
    } catch (error) {
      console.error('Error checking profile completion:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Vérification du profil...</p>
      </div>
    )
  }

  if (!isComplete) {
    return null // Will redirect automatically
  }

  return <>{children}</>
}
