'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase/config'
import { 
  onAuthStateChanged, 
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/callback`,
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      
      // Save email to localStorage to complete sign-in
      window.localStorage.setItem('emailForSignIn', email)
      
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}
