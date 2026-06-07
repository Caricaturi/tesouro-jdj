import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/scan')
    })
  }, [])

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>🗺️ Caça ao Tesouro</h1>
      <p style={styles.subtitle}>Encontre os QR codes escondidos e registre suas descobertas!</p>
      <button style={styles.button} onClick={() => router.push('/register')}>
        Participar
      </button>
    </main>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
    fontFamily: 'sans-serif',
    background: '#f9f9f9'
  },
  title: { fontSize: '2.5rem', marginBottom: '1rem' },
  subtitle: { fontSize: '1.1rem', color: '#555', marginBottom: '2rem', maxWidth: '400px' },
  button: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem 2rem',
    fontSize: '1rem',
    cursor: 'pointer'
  }
}
