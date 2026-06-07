import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Register() {
  const [step, setStep] = useState('form')
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

    localStorage.setItem('register_data', JSON.stringify({ name, type, teamName }))

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/welcome`
      }
    })

    setLoading(false)

    if (authError) {
      console.log('Supabase auth error:', authError)
      return setError(`Erro: ${authError.message}`)
    }

    setStep('sent')
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
