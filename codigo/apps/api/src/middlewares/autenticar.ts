import { FastifyRequest, FastifyReply } from 'fastify'
import '@fastify/jwt'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UsuarioSession } from '@brain-master/shared/tipos'

declare module 'fastify' {
  interface FastifyRequest {
    usuario: UsuarioSession
  }
}

// Cliente isolado exclusivamente para verificação de JWT.
// Nunca usado para queries de banco — evita que auth.getUser() polua
// a sessão do cliente de serviço e ative RLS nas queries seguintes.
const authVerifyClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function autenticar(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token não fornecido' })
  }

  const token = authHeader.slice(7)

  const { data: authData, error: authError } = await authVerifyClient.auth.getUser(token)

  if (authError || !authData.user) {
    // Fallback: tentar JWT próprio (login de funcionário por token)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator do @fastify/jwt não tipado neste escopo
      const jwt = (request.server as any).jwt
      const payload = jwt.verify(token) as { sub: string; empresa_id: string; nome: string; perfil: string }
      request.usuario = {
        id: payload.sub,
        empresa_id: payload.empresa_id,
        nome: payload.nome,
        perfil: payload.perfil as UsuarioSession['perfil'],
      }
      return
    } catch {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token inválido ou expirado' })
    }
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from('usuario')
    .select('id, empresa_id, nome, perfil')
    .eq('id', authData.user.id)
    .single()

  if (usuarioError || !usuario) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Usuário não encontrado' })
  }

  request.usuario = usuario as UsuarioSession
}
