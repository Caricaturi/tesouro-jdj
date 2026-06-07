import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [step, setStep] = useState('form') // 'form' | 'sent'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('solo')
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!name || !email) return setError('Preencha todos os campos obrigatórios.')
    if (type === 'team' && !teamName) return setError('Digite o nome do time.')

    setLoading(true)

    // Store registration data to use after magic link login
    localStorage.setItem('register_data', JSON.stringify({ name, type, teamName }))

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/welcome`
      }
    })

    setLoading(false)

    if (authError) {
      console.log('Supabase auth error:', authError.message, authError.status)
      return setError(`Erro: ${authError.message}`)
    }
  }

  if (step === 'sent') {
    return (
      <main style={styles.container}>
        <h2 style={styles.title}>📬 Verifique seu e-mail</h2>
        <p style={styles.subtitle}>
          Enviamos um link de acesso para <strong>{email}</strong>.<br />
          Clique nele para entrar na caça ao tesouro.
        </p>
      </main>
    )
  }

  return (
    <main style={styles.container}>
      <h2 style={styles.title}>Cadastro</h2>

      <input
        style={styles.input}
        placeholder="Seu nome"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Seu e-mail"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <div style={styles.toggle}>
        <button
          style={{ ...styles.toggleBtn, ...(type === 'solo' ? styles.toggleActive : {}) }}
          onClick={() => setType('solo')}
        >
          Solo
        </button>
        <button
          style={{ ...styles.toggleBtn, ...(type === 'team' ? styles.toggleActive : {}) }}
          onClick={() => setType('team')}
        >
          Time
        </button>
      </div>

      {type === 'team' && (
        <input
          style={styles.input}
          placeholder="Nome do time"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
        />
      )}

      {error && <p style={styles.error}>{error}</p>}

      <button style={styles.button} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Enviando...' : 'Receber link de acesso'}
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
    fontFamily: 'sans-serif',
    background: '#f9f9f9'
  },
  title: { fontSize: '1.8rem', marginBottom: '1.5rem' },
  subtitle: { fontSize: '1rem', color: '#555', textAlign: 'center', maxWidth: '360px' },
  input: {
    width: '100%',
    maxWidth: '360px',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem'
  },
  toggle: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  toggleBtn: {
    padding: '0.5rem 1.5rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  toggleActive: { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  error: { color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' },
  button: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem 2rem',
    fontSize: '1rem',
    cursor: 'pointer',
    maxWidth: '360px',
    width: '100%'
  }
}
