import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Progress() {
  const router = useRouter()
  const [scans, setScans] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/register')

      const { data: participant } = await supabase
        .from('participants')
        .select('team_id')
        .eq('id', session.user.id)
        .single()

      if (!participant) return router.push('/register')

      const [{ data: scansData }, { data: config }] = await Promise.all([
        supabase
          .from('scans')
          .select('scanned_at, qr_codes(label)')
          .eq('team_id', participant.team_id)
          .order('scanned_at', { ascending: false }),
        supabase.from('hunt_config').select('total_qr_codes').single()
      ])

      setScans(scansData || [])
      setTotal(config?.total_qr_codes || 0)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <main style={styles.container}>
        <p>Carregando...</p>
      </main>
    )
  }

  const found = scans.length
  const percent = total > 0 ? Math.round((found / total) * 100) : 0

  return (
    <main style={styles.container}>
      <h2 style={styles.title}>Seu Progresso</h2>

      <div style={styles.card}>
        <p style={styles.count}>{found} / {total}</p>
        <p style={styles.label}>QR codes encontrados</p>
        <div style={styles.barBg}>
          <div style={{ ...styles.barFill, width: `${percent}%` }} />
        </div>
        <p style={styles.percent}>{percent}% completo</p>
      </div>

      {scans.length > 0 && (
        <div style={styles.list}>
          <h3 style={styles.listTitle}>Encontrados</h3>
          {scans.map((s, i) => (
            <div key={i} style={styles.listItem}>
              <span>{s.qr_codes?.label || `QR #${i + 1}`}</span>
              <span style={styles.time}>
                {new Date(s.scanned_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      <button style={styles.button} onClick={() => router.push('/scan')}>
        Voltar para o scanner
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
    padding: '2rem',
    fontFamily: 'sans-serif',
    background: '#f9f9f9'
  },
  title: { fontSize: '1.8rem', marginBottom: '1.5rem', marginTop: '1rem' },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem'
  },
  count: { fontSize: '3rem', fontWeight: 'bold', color: '#2563eb', margin: 0 },
  label: { color: '#666', marginBottom: '1rem' },
  barBg: { background: '#e5e7eb', borderRadius: '999px', height: '10px', overflow: 'hidden' },
  barFill: { background: '#2563eb', height: '10px', borderRadius: '999px', transition: 'width 0.5s' },
  percent: { color: '#555', marginTop: '0.5rem', fontSize: '0.9rem' },
  list: { background: '#fff', borderRadius: '12px', padding: '1.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  listTitle: { fontSize: '1rem', marginBottom: '1rem', color: '#333' },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' },
  time: { color: '#999', fontSize: '0.85rem' },
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
