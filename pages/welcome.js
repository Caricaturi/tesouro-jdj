import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Welcome() {
  const router = useRouter()
  const [status, setStatus] = useState('Finalizando cadastro...')

  useEffect(() => {
    async function finish() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return setStatus('Link inválido ou expirado. Tente se cadastrar novamente.')

      const raw = localStorage.getItem('register_data')
      if (!raw) return router.push('/scan') // already registered

      const { name, type, teamName } = JSON.parse(raw)

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          name,
          type,
          teamName
        })
      })

      localStorage.removeItem('register_data')

      if (res.ok) {
        setStatus('Cadastro concluído! Redirecionando...')
        setTimeout(() => router.push('/scan'), 1500)
      } else {
        setStatus('Erro ao finalizar cadastro. Tente novamente.')
      }
    }

    finish()
  }, [])

  return (
    <main style={styles.container}>
      <p style={styles.text}>{status}</p>
    </main>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    background: '#f9f9f9'
  },
  text: { fontSize: '1.1rem', color: '#333' }
}
