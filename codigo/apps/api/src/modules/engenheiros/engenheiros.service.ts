import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

const authAdminClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export interface EngenheiroRow {
  id: string
  nome: string
  perfil: string
  token_acesso: string | null
  created_at: string
}

function gerarToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let s = ''
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `ENG-${s}`
}

export async function listarEngenheiros(empresaId: string): Promise<EngenheiroRow[]> {
  const { data, error } = await supabase
    .from('usuario')
    .select('id, nome, perfil, token_acesso, created_at')
    .eq('empresa_id', empresaId)
    .eq('perfil', 'ENGENHEIRO')
    .order('nome', { ascending: true })

  if (error) throw { statusCode: 500, message: 'Erro ao listar engenheiros' }
  return (data ?? []) as EngenheiroRow[]
}

export async function criarEngenheiro(nome: string, empresaId: string): Promise<EngenheiroRow> {
  const token = gerarToken()
  // Email interno — nunca usado para login, serve apenas para satisfazer a constraint do Supabase Auth
  const emailInterno = `${token.toLowerCase()}@eng.brainmaster.internal`

  const { data: authData, error: authError } = await authAdminClient.auth.admin.createUser({
    email: emailInterno,
    password: randomUUID(),
    email_confirm: true,
  })

  if (authError || !authData.user) {
    throw { statusCode: 500, message: 'Erro ao criar conta do engenheiro' }
  }

  const { data, error } = await supabase
    .from('usuario')
    .insert({
      id: authData.user.id,
      empresa_id: empresaId,
      nome: nome.trim(),
      perfil: 'ENGENHEIRO',
      token_acesso: token,
    })
    .select('id, nome, perfil, token_acesso, created_at')
    .single()

  if (error || !data) {
    await authAdminClient.auth.admin.deleteUser(authData.user.id)
    throw { statusCode: 500, message: 'Erro ao cadastrar engenheiro' }
  }

  return data as EngenheiroRow
}

export async function regenerarToken(id: string, empresaId: string): Promise<EngenheiroRow> {
  const { data: existe, error: errBusca } = await supabase
    .from('usuario')
    .select('id')
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .eq('perfil', 'ENGENHEIRO')
    .single()

  if (errBusca || !existe) throw { statusCode: 404, message: 'Engenheiro não encontrado' }

  const novoToken = gerarToken()

  const { data, error } = await supabase
    .from('usuario')
    .update({ token_acesso: novoToken })
    .eq('id', id)
    .select('id, nome, perfil, token_acesso, created_at')
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao regenerar token' }
  return data as EngenheiroRow
}
