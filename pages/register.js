import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  console.log('[register] request received', req.method)
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, name, email, type, teamName } = req.body
  console.log('[register] body:', { userId, name, email, type, teamName })

  if (!userId || !name || !email || !type) {
    console.log('[register] missing fields')
    return res.status(400).json({ error: 'Campos obrigatórios faltando' })
  }

  const { data: existing, error: existingError } = await supabase
    .from('participants')
    .select('id')
    .eq('id', userId)
    .single()

  console.log('[register] existing check:', { existing, existingError })

  if (existing) {
    return res.status(200).json({ message: 'Participante já cadastrado' })
  }

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: type === 'solo' ? name : teamName,
      type
    })
    .select()
    .single()

  console.log('[register] team insert:', { team, teamError })

  if (teamError) {
    return res.status(500).json({ error: 'Não foi possível criar o time' })
  }

  const { error: participantError } = await supabase
    .from('participants')
    .insert({ id: userId, team_id: team.id, name, email })

  console.log('[register] participant insert error:', participantError)

  if (participantError) {
    return res.status(500).json({ error: 'Não foi possível cadastrar o participante' })
  }

  return res.status(200).json({ success: true, teamId: team.id })
}
