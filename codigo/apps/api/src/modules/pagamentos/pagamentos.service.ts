import { supabase } from '../../lib/supabase'
import { CriarPagamentoInput, RealizarPagamentoInput, CancelarPagamentoInput } from '@brain-master/validators'
import { Pagamento } from '@brain-master/shared/tipos'

export interface CalculoPagamento {
  funcionario_id: string
  funcionario_nome: string
  obra_id: string
  periodo_inicio: string
  periodo_fim: string
  total_medicoes: number
  valor_total: number
  valor_cobranca_total: number
  por_servico: Array<{
    servico_id: string
    servico_nome: string
    unidade_medida: string
    quantidade_total: number
    valor_total: number
  }>
}

async function verificarObraEmpresa(obraId: string, empresaId: string): Promise<void> {
  const { data, error } = await supabase
    .from('obra')
    .select('id')
    .eq('id', obraId)
    .eq('empresa_id', empresaId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Obra não encontrada' }
}

async function verificarFuncionarioEmpresa(funcionarioId: string, empresaId: string): Promise<string> {
  const { data, error } = await supabase
    .from('funcionario')
    .select('id, nome')
    .eq('id', funcionarioId)
    .eq('empresa_id', empresaId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Funcionário não encontrado' }
  return data.nome as string
}

async function calcularValorPeriodo(
  obraId: string,
  funcionarioId: string,
  inicio: string,
  fim: string,
): Promise<{ valor_total: number; valor_cobranca_total: number; total_medicoes: number; por_servico: CalculoPagamento['por_servico'] }> {
  const { data: medicoes, error } = await supabase
    .from('medicao')
    .select('quantidade, valor_calculado, valor_cobranca_calculado, servico:servico_id(id, nome, unidade_medida)')
    .eq('obra_id', obraId)
    .eq('funcionario_id', funcionarioId)
    .eq('status', 'ativa')
    .gte('data', inicio)
    .lte('data', fim)

  if (error) throw { statusCode: 500, message: 'Erro ao calcular pagamento' }

  const porServico = new Map<string, CalculoPagamento['por_servico'][number]>()
  let valorTotal = 0
  let valorCobrancaTotal = 0
  let totalMedicoes = 0

  for (const m of medicoes ?? []) {
    const servico = m.servico as unknown as { id: string; nome: string; unidade_medida: string } | null
    if (!servico) continue

    valorTotal += m.valor_calculado
    valorCobrancaTotal += m.valor_cobranca_calculado ?? 0
    totalMedicoes++

    const existing = porServico.get(servico.id)
    if (existing) {
      existing.quantidade_total += m.quantidade
      existing.valor_total += m.valor_calculado
    } else {
      porServico.set(servico.id, {
        servico_id: servico.id,
        servico_nome: servico.nome,
        unidade_medida: servico.unidade_medida,
        quantidade_total: m.quantidade,
        valor_total: m.valor_calculado,
      })
    }
  }

  return {
    valor_total: Number(valorTotal.toFixed(2)),
    valor_cobranca_total: Number(valorCobrancaTotal.toFixed(2)),
    total_medicoes: totalMedicoes,
    por_servico: Array.from(porServico.values()),
  }
}

export async function calcularTodosPagamentos(
  obraId: string,
  empresaId: string,
  inicio: string,
  fim: string,
): Promise<CalculoPagamento[]> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data: medicoes, error } = await supabase
    .from('medicao')
    .select('funcionario_id, funcionario:funcionario_id(id, nome)')
    .eq('obra_id', obraId)
    .eq('status', 'ativa')
    .gte('data', inicio)
    .lte('data', fim)

  if (error) throw { statusCode: 500, message: 'Erro ao buscar medições' }

  const funcionariosMap = new Map<string, string>()
  for (const m of medicoes ?? []) {
    const func = m.funcionario as unknown as { id: string; nome: string } | null
    if (func && !funcionariosMap.has(func.id)) {
      funcionariosMap.set(func.id, func.nome)
    }
  }

  const resultados: CalculoPagamento[] = []
  for (const [funcionarioId, nomeFuncionario] of funcionariosMap) {
    const calculo = await calcularValorPeriodo(obraId, funcionarioId, inicio, fim)
    resultados.push({
      funcionario_id: funcionarioId,
      funcionario_nome: nomeFuncionario,
      obra_id: obraId,
      periodo_inicio: inicio,
      periodo_fim: fim,
      ...calculo,
    })
  }

  return resultados
}

export async function listarPagamentos(obraId: string, empresaId: string): Promise<Pagamento[]> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data, error } = await supabase
    .from('pagamento')
    .select('*, funcionario:funcionario_id(id, nome)')
    .eq('obra_id', obraId)
    .order('created_at', { ascending: false })

  if (error) throw { statusCode: 500, message: 'Erro ao listar pagamentos' }
  return data as unknown as Pagamento[]
}

export async function criarPagamento(
  input: CriarPagamentoInput,
  obraId: string,
  empresaId: string,
): Promise<Pagamento> {
  await verificarObraEmpresa(obraId, empresaId)
  await verificarFuncionarioEmpresa(input.funcionario_id, empresaId)

  // valor_total sempre calculado server-side — nunca confia no cliente
  const calculo = await calcularValorPeriodo(
    obraId,
    input.funcionario_id,
    input.periodo_inicio,
    input.periodo_fim,
  )

  if (calculo.total_medicoes === 0) {
    throw { statusCode: 400, message: 'Nenhuma medição ativa encontrada para o período informado' }
  }

  const { data: existente } = await supabase
    .from('pagamento')
    .select('id')
    .eq('obra_id', obraId)
    .eq('funcionario_id', input.funcionario_id)
    .eq('periodo_inicio', input.periodo_inicio)
    .eq('periodo_fim', input.periodo_fim)
    .eq('status', 'pendente')
    .maybeSingle()

  if (existente) {
    throw { statusCode: 409, message: 'Já existe um pagamento pendente para este funcionário neste período' }
  }

  const { data, error } = await supabase
    .from('pagamento')
    .insert({
      obra_id: obraId,
      funcionario_id: input.funcionario_id,
      periodo_inicio: input.periodo_inicio,
      periodo_fim: input.periodo_fim,
      valor_total: calculo.valor_total,
      forma_pagamento: input.forma_pagamento ?? null,
      observacao: input.observacao ?? null,
      status: 'pendente',
    })
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao registrar pagamento' }
  return data as Pagamento
}

export async function realizarPagamento(
  id: string,
  input: RealizarPagamentoInput,
  obraId: string,
  empresaId: string,
  usuarioId: string,
): Promise<Pagamento> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data: pagamento, error: findError } = await supabase
    .from('pagamento')
    .select('id, status, funcionario_id, periodo_inicio, periodo_fim')
    .eq('id', id)
    .eq('obra_id', obraId)
    .single()

  if (findError || !pagamento) throw { statusCode: 404, message: 'Pagamento não encontrado' }
  if (pagamento.status === 'realizado') throw { statusCode: 400, message: 'Pagamento já foi realizado' }
  if (pagamento.status === 'cancelado') throw { statusCode: 400, message: 'Pagamento foi cancelado e não pode ser realizado' }

  // Recalcula o valor no momento da realização — garante que medições adicionadas depois do lançamento sejam incluídas
  const calculo = await calcularValorPeriodo(
    obraId,
    pagamento.funcionario_id,
    pagamento.periodo_inicio,
    pagamento.periodo_fim,
  )

  const { data, error } = await supabase
    .from('pagamento')
    .update({
      status: 'realizado',
      pago_por: usuarioId,
      data_pagamento: input.data_pagamento ?? new Date().toISOString().split('T')[0],
      forma_pagamento: input.forma_pagamento,
      observacao: input.observacao ?? null,
      valor_total: calculo.valor_total,
    })
    .eq('id', id)
    .eq('obra_id', obraId)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao realizar pagamento' }
  return data as Pagamento
}

export async function cancelarPagamento(
  id: string,
  input: CancelarPagamentoInput,
  obraId: string,
  empresaId: string,
): Promise<Pagamento> {
  await verificarObraEmpresa(obraId, empresaId)

  const { data: pagamento, error: findError } = await supabase
    .from('pagamento')
    .select('id, status')
    .eq('id', id)
    .eq('obra_id', obraId)
    .single()

  if (findError || !pagamento) throw { statusCode: 404, message: 'Pagamento não encontrado' }
  if (pagamento.status === 'realizado') throw { statusCode: 400, message: 'Pagamento já realizado não pode ser cancelado' }
  if (pagamento.status === 'cancelado') throw { statusCode: 400, message: 'Pagamento já está cancelado' }

  const { data, error } = await supabase
    .from('pagamento')
    .update({
      status: 'cancelado',
      motivo_cancelamento: input.motivo,
    })
    .eq('id', id)
    .eq('obra_id', obraId)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao cancelar pagamento' }
  return data as Pagamento
}
