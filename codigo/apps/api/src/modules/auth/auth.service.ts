import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { LoginInput } from '@brain-master/validators'
import { AuthResponse, Funcionario, UsuarioSession } from '@brain-master/shared/tipos'

// Cliente isolado exclusivamente para operações de auth do usuário (signIn, refresh, signOut).
// Nunca usar o singleton supabase para auth — signInWithPassword seta a sessão interna
// do cliente e faz queries subsequentes usarem o JWT do usuário, ativando RLS.
const authOpsClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data, error } = await authOpsClient.auth.signInWithPassword({
    email: input.email,
    password: input.senha,
  })

  if (error || !data.session) {
    throw { statusCode: 401, message: 'Email ou senha inválidos' }
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from('usuario')
    .select('id, empresa_id, nome, perfil')
    .eq('id', data.user.id)
    .single()

  if (usuarioError || !usuario) {
    throw { statusCode: 401, message: 'Usuário não cadastrado na plataforma' }
  }

  return {
    access_token: data.session.access_token,
    usuario: usuario as UsuarioSession,
  }
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data, error } = await authOpsClient.auth.refreshSession({ refresh_token: refreshToken })

  if (error || !data.session || !data.user) {
    throw { statusCode: 401, message: 'Refresh token inválido ou expirado' }
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from('usuario')
    .select('id, empresa_id, nome, perfil')
    .eq('id', data.user.id)
    .single()

  if (usuarioError || !usuario) {
    throw { statusCode: 401, message: 'Usuário não encontrado' }
  }

  return {
    access_token: data.session.access_token,
    usuario: usuario as UsuarioSession,
  }
}

export async function logout(accessToken: string): Promise<void> {
  await authOpsClient.auth.admin.signOut(accessToken)
}

export async function buscarFuncionarioPorToken(token: string): Promise<Funcionario> {
  const { data, error } = await supabase
    .from('funcionario')
    .select('*')
    .eq('token_acesso', token.toUpperCase())
    .eq('ativo', true)
    .single()

  if (error || !data) {
    throw { statusCode: 401, message: 'Token inválido ou funcionário inativo' }
  }

  return data as Funcionario
}

export async function buscarEngenheiroPorToken(token: string): Promise<UsuarioSession> {
  const { data, error } = await supabase
    .from('usuario')
    .select('id, empresa_id, nome, perfil')
    .eq('token_acesso', token.toUpperCase())
    .eq('perfil', 'ENGENHEIRO')
    .single()

  if (error || !data) {
    throw { statusCode: 401, message: 'Token inválido ou engenheiro não encontrado' }
  }

  return data as UsuarioSession
}
