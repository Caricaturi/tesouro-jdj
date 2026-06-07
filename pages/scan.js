import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Scan() {
  const router = useRouter()
  const scannerRef = useRef(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/register')
      setUserId(session.user.id)
    })
  }, [])

  useEffect(() => {
    if (!userId || !scanning) return

    let scanner
    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 })
      scanner.render(onScanSuccess, onScanError)
      scannerRef.current = scanner
    })

    return () => {
      scannerRef.current?.clear().catch(() => {})
    }
  }, [userId, scanning])

  // Also handle ?code= from URL (when QR opens the page directly)
  useEffect(() => {
    const code = router.query.code
    if (code && userId) handleCode(code)
  }, [router.query.code, userId])

  async function onScanSuccess(code) {
    setScanning(false)
    scannerRef.current?.clear().catch(() => {})
    await handleCode(code)
  }

  function onScanError() {} // silent — scanner retries automatically

  async function handleCode(code) {
    setError('')
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId })
    })

    const data = await res.json()

    if (!res.ok) return setError(data.error || 'Erro ao registrar QR code.')

    setResult(data)
  }

  if (result) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.found}>
            {result.alreadyFound ? '🔁 Já encontrado!' : '🎉 Encontrado!'}
          </h2>
          {result.label && <p style={styles.label}>{result.label}</p>}
          <p style={styles.message}>{result.message}</p>
          <div style={styles.actions}>
            <button style={styles.button} onClick={() => { setResult(null); setScanning(true) }}>
              Escanear outro
            </button>
            <button style={{ ...styles.button, ...styles.secondary }} onClick={() => router.push('/progress')}>
              Ver progresso
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.container}>
      <h2 style={styles.title}>Escanear QR Code</h2>
      <p style={styles.subtitle}>Aponte a câmera para o QR code</p>
      <div id="qr-reader" style={{ width: '100%', maxWidth: '400px' }} />
      {error && <p style={styles.error}>{error}</p>}
      <button style={{ ...styles.button, ...styles.secondary, marginTop: '1.5rem' }} onClick={() => router.push('/progress')}>
        Ver progresso
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
  title: { fontSize: '1.6rem', marginBottom: '0.5rem' },
  subtitle: { color: '#666', marginBottom: '1.5rem' },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  found: { fontSize: '1.5rem', marginBottom: '0.75rem' },
  label: { fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' },
  message: { color: '#444', marginBottom: '1.5rem', lineHeight: 1.6 },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  error: { color: '#dc2626', marginTop: '1rem' },
  button: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  secondary: { background: '#fff', color: '#2563eb', border: '1px solid #2563eb' }
}
