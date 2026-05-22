import { supabase } from '../../lib/supabase'
import { CriarPagamentoInput, RealizarPagamentoInput } from '@brain-master/validators'
import { Pagamento } from '@brain-master/shared/tipos'

export interface CalculoPagamento {
  funcionario_id: string
  funcionario_nome: string
  obra_id: string
  periodo_inicio: string
  periodo_fim: string
  total_medicoes: number
  valor_total: number
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
): Promise<{ valor_total: number; total_medicoes: number; por_servico: CalculoPagamento['por_servico'] }> {
  const { data: medicoes, error } = await supabase
    .from('medicao')
    .select('quantidade, valor_calculado, servico:servico_id(id, nome, unidade_medida)')
    .eq('obra_id', obraId)
    .eq('funcionario_id', funcionarioId)
    .eq('status', 'ativa')
    .gte('data', inicio)
    .lte('data', fim)

  if (error) throw { statusCode: 500, message: 'Erro ao calcular pagamento' }

  const porServico = new Map<string, CalculoPagamento['por_servico'][number]>()
  let valorTotal = 0
  let totalMedicoes = 0

  for (const m of medicoes ?? []) {
    const servico = m.servico as unknown as { id: string; nome: string; unidade_medida: string } | null
    if (!servico) continue

    valorTotal += m.valor_calculado
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
    total_medicoes: totalMedicoes,
    por_servico: Array.from(porServico.values()),
  }
}

export async function calcularPagamento(
  obraId: string,
  funcionarioId: string,
  empresaId: string,
  inicio: string,
  fim: string,
): Promise<CalculoPagamento> {
  await verificarObraEmpresa(obraId, empresaId)
  const nomeFuncionario = await verificarFuncionarioEmpresa(funcionarioId, empresaId)
  const calculo = await calcularValorPeriodo(obraId, funcionarioId, inicio, fim)

  return {
    funcionario_id: funcionarioId,
    funcionario_nome: nomeFuncionario,
    obra_id: obraId,
    periodo_inicio: inicio,
    periodo_fim: fim,
    ...calculo,
  }
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
    .select('id, status')
    .eq('id', id)
    .eq('obra_id', obraId)
    .single()

  if (findError || !pagamento) throw { statusCode: 404, message: 'Pagamento não encontrado' }
  if (pagamento.status === 'realizado') throw { statusCode: 400, message: 'Pagamento já foi realizado' }

  const { data, error } = await supabase
    .from('pagamento')
    .update({
      status: 'realizado',
      pago_por: usuarioId,
      data_pagamento: input.data_pagamento ?? new Date().toISOString().split('T')[0],
      forma_pagamento: input.forma_pagamento,
      observacao: input.observacao ?? null,
    })
    .eq('id', id)
    .eq('obra_id', obraId)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao realizar pagamento' }
  return data as Pagamento
}
