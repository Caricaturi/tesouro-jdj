import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, name, email, type, teamName } = req.body

  if (!userId || !name || !email || !type) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' })
  }

  // Check if participant already exists
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('id', userId)
    .single()

  if (existing) {
    return res.status(200).json({ message: 'Participante já cadastrado' })
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: type === 'solo' ? name : teamName,
      type
    })
    .select()
    .single()

  if (teamError) {
    return res.status(500).json({ error: 'Não foi possível criar o time' })
  }

  // Create participant
  const { error: participantError } = await supabase
    .from('participants')
    .insert({ id: userId, team_id: team.id, name, email })

  if (participantError) {
    return res.status(500).json({ error: 'Não foi possível cadastrar o participante' })
  }

  return res.status(200).json({ success: true, teamId: team.id })
}
