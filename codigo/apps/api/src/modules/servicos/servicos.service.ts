import { supabase } from '../../lib/supabase'
import { CriarServicoInput, EditarServicoInput } from '@brain-master/validators'
import { Servico } from '@brain-master/shared/tipos'

async function verificarObraEmpresa(obraId: string, empresaId: string): Promise<void> {
  const { data, error } = await supabase
    .from('obra')
    .select('id')
    .eq('id', obraId)
    .eq('empresa_id', empresaId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Obra não encontrada' }
}

export async function listarServicos(obraId: string, empresaId: string): Promise<Servico[]> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data, error } = await supabase
    .from('servico')
    .select('*')
    .eq('obra_id', obraId)
    .order('nome', { ascending: true })

  if (error) throw { statusCode: 500, message: 'Erro ao listar serviços' }
  return data as Servico[]
}

export async function buscarServico(id: string, obraId: string, empresaId: string): Promise<Servico> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data, error } = await supabase
    .from('servico')
    .select('*')
    .eq('id', id)
    .eq('obra_id', obraId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Serviço não encontrado' }
  return data as Servico
}

export async function criarServico(input: CriarServicoInput, obraId: string, empresaId: string): Promise<Servico> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data, error } = await supabase
    .from('servico')
    .insert({ ...input, obra_id: obraId, ativo: true })
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao criar serviço' }
  return data as Servico
}

export async function editarServico(id: string, input: EditarServicoInput, obraId: string, empresaId: string): Promise<Servico> {
  await buscarServico(id, obraId, empresaId)

  const { data, error } = await supabase
    .from('servico')
    .update(input)
    .eq('id', id)
    .eq('obra_id', obraId)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao editar serviço' }
  return data as Servico
}

export async function desativarServico(id: string, obraId: string, empresaId: string): Promise<void> {
  await buscarServico(id, obraId, empresaId)

  const { error } = await supabase
    .from('servico')
    .update({ ativo: false })
    .eq('id', id)
    .eq('obra_id', obraId)

  if (error) throw { statusCode: 500, message: 'Erro ao desativar serviço' }
}
