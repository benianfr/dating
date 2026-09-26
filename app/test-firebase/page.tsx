'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'

export default function TestFirebasePage() {
  const [status, setStatus] = useState('Initialisation...')
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null)

  useEffect(() => {
    // Check for redirect result on page load
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result && result.user) {
          setStatus(`Connexion réussie via redirect! User: ${result.user.email}`)
        }
      } catch (error: any) {
        if (error.code !== 'auth/no-redirect-result') {
          console.error('Redirect result error:', error)
        }
      }
    }
    checkRedirect()

    // Check if Firebase is initialized
    if (auth) {
      setStatus('Firebase initialisé avec succès')
      setFirebaseConfig({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Configuré' : 'Non configuré',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Non configuré',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Non configuré',
      })
    } else {
      setStatus('Erreur: Firebase non initialisé')
    }
  }, [])

  const testGoogleAuthPopup = async () => {
    try {
      setStatus('Tentative de connexion Google (popup)...')
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      setStatus(`Connexion réussie via popup! User: ${result.user.email}`)
    } catch (error: any) {
      console.error('Google auth error:', error)
      setStatus(`Erreur popup: ${error.code} - ${error.message}`)
    }
  }

  const testGoogleAuthRedirect = async () => {
    try {
      setStatus('Tentative de connexion Google (redirect)...')
      const provider = new GoogleAuthProvider()
      await signInWithRedirect(auth, provider)
      setStatus('Redirection vers Google en cours...')
    } catch (error: any) {
      console.error('Google auth error:', error)
      setStatus(`Erreur redirect: ${error.code} - ${error.message}`)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Firebase</h1>
      
      <div style={{ margin: '2rem 0', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Statut: {status}</h3>
        
        {firebaseConfig && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Configuration:</h4>
            <pre>{JSON.stringify(firebaseConfig, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={testGoogleAuthPopup}
          style={{
            padding: '1rem 2rem',
            background: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Tester Popup
        </button>
        
        <button 
          onClick={testGoogleAuthRedirect}
          style={{
            padding: '1rem 2rem',
            background: '#34A853',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Tester Redirect
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>Instructions de dépannage:</h3>
        <ol>
          <li>Vérifiez que vous avez activé Authentication dans Firebase Console</li>
          <li>Vérifiez que Google est activé comme fournisseur</li>
          <li>Vérifiez que http://localhost:3000 est dans les domaines autorisés</li>
          <li>Ouvrez la console du navigateur (F12) pour voir les logs détaillés</li>
          <li>Vérifiez que les variables d'environnement sont correctement configurées</li>
          <li>Si le popup échoue, essayez la méthode redirect (plus fiable)</li>
        </ol>
      </div>
    </div>
  )
}