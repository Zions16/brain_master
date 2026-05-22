import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'
import { UsuarioSession } from '@brain-master/shared/tipos'

declare module 'fastify' {
  interface FastifyRequest {
    usuario: UsuarioSession
  }
}

export async function autenticar(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token não fornecido' })
  }

  const token = authHeader.slice(7)

  const { data: authData, error: authError } = await supabase.auth.getUser(token)

  if (authError || !authData.user) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token inválido ou expirado' })
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
