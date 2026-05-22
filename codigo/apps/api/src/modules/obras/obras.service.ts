import { supabase } from '../../lib/supabase'
import { CriarObraInput, EditarObraInput, MudarStatusObraInput } from '@brain-master/validators'
import { Obra } from '@brain-master/shared/tipos'

export async function listarObras(empresaId: string): Promise<Obra[]> {
  const { data, error } = await supabase
    .from('obra')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false })

  if (error) throw { statusCode: 500, message: 'Erro ao listar obras' }
  return data as Obra[]
}

export async function listarMinhasObras(usuarioId: string, empresaId: string): Promise<Obra[]> {
  const { data: links, error: linksError } = await supabase
    .from('obra_usuario')
    .select('obra_id')
    .eq('usuario_id', usuarioId)

  if (linksError) throw { statusCode: 500, message: 'Erro ao listar obras vinculadas' }

  const obraIds = (links ?? []).map((l) => l.obra_id as string)
  if (obraIds.length === 0) return []

  const { data, error } = await supabase
    .from('obra')
    .select('*')
    .eq('empresa_id', empresaId)
    .in('id', obraIds)
    .order('created_at', { ascending: false })

  if (error) throw { statusCode: 500, message: 'Erro ao listar obras vinculadas' }
  return data as Obra[]
}

export async function buscarObra(id: string, empresaId: string): Promise<Obra> {
  const { data, error } = await supabase
    .from('obra')
    .select('*')
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Obra não encontrada' }
  return data as Obra
}

export async function criarObra(input: CriarObraInput, empresaId: string): Promise<Obra> {
  const { data, error } = await supabase
    .from('obra')
    .insert({ ...input, empresa_id: empresaId, status: 'ativa' })
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao criar obra' }
  return data as Obra
}

export async function editarObra(id: string, input: EditarObraInput, empresaId: string): Promise<Obra> {
  await buscarObra(id, empresaId)

  const { data, error } = await supabase
    .from('obra')
    .update(input)
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao editar obra' }
  return data as Obra
}

export async function mudarStatusObra(id: string, input: MudarStatusObraInput, empresaId: string): Promise<Obra> {
  await buscarObra(id, empresaId)

  const { data, error } = await supabase
    .from('obra')
    .update({ status: input.status })
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao mudar status da obra' }
  return data as Obra
}
