import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { LoginInput, CadastroInput } from '@brain-master/validators'
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

export async function cadastrar(input: CadastroInput): Promise<AuthResponse> {
  const { data: authData, error: authError } = await authOpsClient.auth.admin.createUser({
    email: input.email,
    password: input.senha,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    throw { statusCode: 400, message: authError?.message?.includes('already') ? 'Email já cadastrado' : 'Erro ao criar usuário' }
  }

  const userId = authData.user.id

  const { data: empresa, error: empresaError } = await supabase
    .from('empresa')
    .insert({ nome: input.nome_empresa, plano: 'trial', status: 'ativo' })
    .select('id')
    .single()

  if (empresaError || !empresa) {
    await authOpsClient.auth.admin.deleteUser(userId)
    throw { statusCode: 500, message: 'Erro ao criar empresa' }
  }

  const { error: usuarioError } = await supabase
    .from('usuario')
    .insert({ id: userId, empresa_id: empresa.id, nome: input.nome_gestor, perfil: 'GESTOR' })

  if (usuarioError) {
    await authOpsClient.auth.admin.deleteUser(userId)
    throw { statusCode: 500, message: 'Erro ao criar usuário' }
  }

  const { data: session, error: sessionError } = await authOpsClient.auth.signInWithPassword({
    email: input.email,
    password: input.senha,
  })

  if (sessionError || !session.session) {
    throw { statusCode: 500, message: 'Cadastro realizado, mas erro ao autenticar. Faça login.' }
  }

  return {
    access_token: session.session.access_token,
    usuario: { id: userId, empresa_id: empresa.id, nome: input.nome_gestor, perfil: 'GESTOR' },
  }
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
