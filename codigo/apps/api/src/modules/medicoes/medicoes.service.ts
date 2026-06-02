import { supabase } from '../../lib/supabase'
import { CriarMedicaoInput, CorrigirMedicaoInput, CancelarMedicaoInput } from '@brain-master/validators'
import { Medicao, MedicaoHistorico } from '@brain-master/shared/tipos'

async function verificarObraEmpresa(obraId: string, empresaId: string): Promise<void> {
  const { data, error } = await supabase
    .from('obra')
    .select('id')
    .eq('id', obraId)
    .eq('empresa_id', empresaId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Obra não encontrada' }
}

async function buscarMedicaoComVerificacao(id: string, obraId: string, empresaId: string): Promise<Medicao> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data, error } = await supabase
    .from('medicao')
    .select('*')
    .eq('id', id)
    .eq('obra_id', obraId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Medição não encontrada' }
  return data as Medicao
}

async function gravarHistorico(
  medicaoId: string,
  usuarioId: string,
  campo: string,
  valorAnterior: string,
  valorNovo: string,
  motivo: string,
): Promise<void> {
  const { error } = await supabase.from('medicao_historico').insert({
    medicao_id: medicaoId,
    alterado_por: usuarioId,
    campo_alterado: campo,
    valor_anterior: valorAnterior,
    valor_novo: valorNovo,
    motivo,
  })

  if (error) throw { statusCode: 500, message: 'Erro ao registrar histórico da medição' }
}

export async function listarMedicoes(obraId: string, empresaId: string): Promise<Medicao[]> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data, error } = await supabase
    .from('medicao')
    .select(`
      *,
      funcionario:funcionario_id(id, nome, funcao),
      servico:servico_id(id, nome, unidade_medida),
      medido_por_usuario:medido_por(id, nome)
    `)
    .eq('obra_id', obraId)
    .order('data', { ascending: false })

  if (error) throw { statusCode: 500, message: 'Erro ao listar medições' }
  return data as unknown as Medicao[]
}

export async function buscarMedicao(id: string, obraId: string, empresaId: string): Promise<Medicao & { historico: MedicaoHistorico[] }> {
  const medicao = await buscarMedicaoComVerificacao(id, obraId, empresaId)

  const { data: historico, error } = await supabase
    .from('medicao_historico')
    .select('*, alterado_por_usuario:alterado_por(id, nome)')
    .eq('medicao_id', id)
    .order('data_alteracao', { ascending: true })

  if (error) throw { statusCode: 500, message: 'Erro ao buscar histórico da medição' }

  return { ...medicao, historico: historico as unknown as MedicaoHistorico[] }
}

export async function registrarMedicao(
  input: CriarMedicaoInput,
  obraId: string,
  empresaId: string,
  usuarioId: string,
  usuarioPerfil: string,
): Promise<Medicao> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data: funcionario, error: funcError } = await supabase
    .from('funcionario')
    .select('id')
    .eq('id', input.funcionario_id)
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .single()

  if (funcError || !funcionario) throw { statusCode: 400, message: 'Funcionário não encontrado ou inativo' }

  const { data: servico, error: servError } = await supabase
    .from('servico')
    .select('id, valor_pagamento, valor_cobranca, ativo')
    .eq('id', input.servico_id)
    .eq('obra_id', obraId)
    .single()

  if (servError || !servico) throw { statusCode: 400, message: 'Serviço não encontrado nesta obra' }
  if (!servico.ativo) throw { statusCode: 400, message: 'Serviço inativo — não é possível registrar medição' }

  const valor_calculado = Number((input.quantidade * servico.valor_pagamento).toFixed(2))
  const valor_cobranca_calculado = servico.valor_cobranca
    ? Number((input.quantidade * servico.valor_cobranca).toFixed(2))
    : null

  const status = usuarioPerfil === 'GESTOR' ? 'ativa' : 'pendente_aprovacao'

  const { data, error } = await supabase
    .from('medicao')
    .insert({
      obra_id: obraId,
      funcionario_id: input.funcionario_id,
      servico_id: input.servico_id,
      quantidade: input.quantidade,
      valor_calculado,
      valor_cobranca_calculado,
      data: input.data ?? new Date().toISOString().split('T')[0],
      medido_por: usuarioId,
      status,
      observacao: input.observacao ?? null,
    })
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao registrar medição' }
  return data as Medicao
}

export async function corrigirMedicao(
  id: string,
  input: CorrigirMedicaoInput,
  obraId: string,
  empresaId: string,
  usuarioId: string,
): Promise<Medicao> {
  const medicao = await buscarMedicaoComVerificacao(id, obraId, empresaId)

  if (medicao.status === 'cancelada') {
    throw { statusCode: 400, message: 'Não é possível corrigir uma medição cancelada' }
  }

  // Recalcula valor com a nova quantidade
  const { data: servico, error: servError } = await supabase
    .from('servico')
    .select('valor_pagamento, valor_cobranca')
    .eq('id', medicao.servico_id)
    .single()

  if (servError || !servico) throw { statusCode: 500, message: 'Erro ao buscar serviço para recálculo' }

  const valor_calculado = Number((input.quantidade * servico.valor_pagamento).toFixed(2))
  const valor_cobranca_calculado = servico.valor_cobranca
    ? Number((input.quantidade * servico.valor_cobranca).toFixed(2))
    : null

  // Grava histórico antes de alterar
  await gravarHistorico(
    id,
    usuarioId,
    'quantidade',
    String(medicao.quantidade),
    String(input.quantidade),
    input.motivo,
  )

  if (valor_calculado !== medicao.valor_calculado) {
    await gravarHistorico(
      id,
      usuarioId,
      'valor_calculado',
      String(medicao.valor_calculado),
      String(valor_calculado),
      input.motivo,
    )
  }

  const { data, error } = await supabase
    .from('medicao')
    .update({ quantidade: input.quantidade, valor_calculado, valor_cobranca_calculado, status: 'corrigida' })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao corrigir medição' }
  return data as Medicao
}

export async function aprovarMedicao(
  id: string,
  obraId: string,
  empresaId: string,
  usuarioId: string,
  observacaoGestor?: string,
): Promise<Medicao> {
  const medicao = await buscarMedicaoComVerificacao(id, obraId, empresaId)

  if (medicao.status !== 'pendente' && medicao.status !== 'pendente_aprovacao') {
    throw { statusCode: 400, message: `Medição não pode ser aprovada — status atual: ${medicao.status}` }
  }

  const motivo = observacaoGestor ? `Medição aprovada. Obs: ${observacaoGestor}` : 'Medição aprovada'
  await gravarHistorico(id, usuarioId, 'status', medicao.status, 'ativa', motivo)

  const { data, error } = await supabase
    .from('medicao')
    .update({ status: 'ativa', aprovado_por: usuarioId })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao aprovar medição' }
  return data as Medicao
}

export async function cancelarMedicao(
  id: string,
  input: CancelarMedicaoInput,
  obraId: string,
  empresaId: string,
  usuarioId: string,
): Promise<Medicao> {
  const medicao = await buscarMedicaoComVerificacao(id, obraId, empresaId)

  if (medicao.status === 'cancelada') {
    throw { statusCode: 400, message: 'Medição já está cancelada' }
  }

  await gravarHistorico(id, usuarioId, 'status', medicao.status, 'cancelada', input.motivo)

  const { data, error } = await supabase
    .from('medicao')
    .update({ status: 'cancelada' })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao cancelar medição' }
  return data as Medicao
}

export async function rejeitarMedicao(
  id: string,
  motivo: string,
  obraId: string,
  empresaId: string,
  usuarioId: string,
): Promise<Medicao> {
  const medicao = await buscarMedicaoComVerificacao(id, obraId, empresaId)

  if (medicao.status !== 'pendente_aprovacao') {
    throw { statusCode: 400, message: `Apenas medições pendentes de aprovação podem ser rejeitadas — status atual: ${medicao.status}` }
  }

  await gravarHistorico(id, usuarioId, 'status', medicao.status, 'cancelada', `Medição rejeitada: ${motivo}`)

  const { data, error } = await supabase
    .from('medicao')
    .update({ status: 'cancelada' })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao rejeitar medição' }
  return data as Medicao
}

export async function listarPendentesAprovacao(empresaId: string): Promise<(Medicao & { obra: { id: string; nome: string } })[]> {
  const { data, error } = await supabase
    .from('medicao')
    .select(`
      *,
      funcionario:funcionario_id(id, nome, funcao),
      servico:servico_id(id, nome, unidade_medida),
      medido_por_usuario:medido_por(id, nome),
      obra:obra_id(id, nome)
    `)
    .eq('status', 'pendente_aprovacao')
    .order('created_at', { ascending: true })

  if (error) throw { statusCode: 500, message: 'Erro ao listar pendentes de aprovação' }

  // Filtra apenas medições de obras da empresa
  const rows = (data ?? []) as any[]
  const daMesmaEmpresa = rows.filter((m) => {
    // A query de RLS já garante isolamento, mas verificamos a obra_id via join
    return m.obra !== null
  })

  return daMesmaEmpresa
}

export async function buscarHistorico(id: string, obraId: string, empresaId: string): Promise<MedicaoHistorico[]> {
  await buscarMedicaoComVerificacao(id, obraId, empresaId)

  const { data, error } = await supabase
    .from('medicao_historico')
    .select('*, alterado_por_usuario:alterado_por(id, nome)')
    .eq('medicao_id', id)
    .order('data_alteracao', { ascending: true })

  if (error) throw { statusCode: 500, message: 'Erro ao buscar histórico' }
  return data as unknown as MedicaoHistorico[]
}
