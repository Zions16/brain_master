import { supabase } from '../../lib/supabase'
import { LoginInput } from '@brain-master/validators'
import { AuthResponse, UsuarioSession } from '@brain-master/shared/tipos'

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
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
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })

  if (error || !data.session) {
    throw { statusCode: 401, message: 'Refresh token inválido ou expirado' }
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from('usuario')
    .select('id, empresa_id, nome, perfil')
    .eq('id', data.user!.id)
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
  await supabase.auth.admin.signOut(accessToken)
}
