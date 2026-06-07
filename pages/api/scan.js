import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { code, userId } = req.body

  if (!code || !userId) {
    return res.status(400).json({ error: 'Código ou usuário inválido' })
  }

  // Check hunt is active
  const { data: config } = await supabase
    .from('hunt_config')
    .select('*')
    .single()

  if (!config?.active) {
    return res.status(403).json({ error: 'A caça ao tesouro ainda não está ativa' })
  }

  const now = new Date()
  if (now < new Date(config.starts_at) || now > new Date(config.ends_at)) {
    return res.status(403).json({ error: 'A caça ao tesouro não está acontecendo agora' })
  }

  // Get participant and their team
  const { data: participant } = await supabase
    .from('participants')
    .select('team_id')
    .eq('id', userId)
    .single()

  if (!participant) {
    return res.status(404).json({ error: 'Participante não encontrado' })
  }

  // Get QR code
  const { data: qr } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .single()

  if (!qr) {
    return res.status(404).json({ error: 'QR code inválido ou desativado' })
  }

  // Try to register the scan (unique constraint handles duplicates)
  const { error } = await supabase.from('scans').insert({
    team_id: participant.team_id,
    qr_code_id: qr.id,
    scanned_by: userId
  })

  if (error?.code === '23505') {
    return res.status(200).json({
      alreadyFound: true,
      message: qr.message,
      label: qr.label
    })
  }

  if (error) {
    return res.status(500).json({ error: 'Não foi possível registrar o QR code' })
  }

  return res.status(200).json({
    success: true,
    message: qr.message,
    label: qr.label
  })
}
