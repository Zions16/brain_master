import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { LoginInput } from '@brain-master/validators'
import { AuthResponse, UsuarioSession } from '@brain-master/shared/tipos'

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
