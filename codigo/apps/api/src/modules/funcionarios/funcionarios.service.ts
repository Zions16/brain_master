import { supabase } from '../../lib/supabase'
import { CriarFuncionarioInput, EditarFuncionarioInput } from '@brain-master/validators'
import { Funcionario, Medicao } from '@brain-master/shared/tipos'

export interface ProducaoResult {
  funcionario_id: string
  funcionario_nome: string
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

export async function listarFuncionarios(empresaId: string, obraId?: string): Promise<Funcionario[]> {
  let query = supabase
    .from('funcionario')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome', { ascending: true })

  if (obraId) {
    query = query.or(`obra_id.eq.${obraId},obra_id.is.null`)
  }

  const { data, error } = await query
  if (error) throw { statusCode: 500, message: 'Erro ao listar funcionários' }
  return data as Funcionario[]
}

export async function buscarFuncionario(id: string, empresaId: string): Promise<Funcionario> {
  const { data, error } = await supabase
    .from('funcionario')
    .select('*')
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .single()

  if (error || !data) throw { statusCode: 404, message: 'Funcionário não encontrado' }
  return data as Funcionario
}

export async function criarFuncionario(input: CriarFuncionarioInput, empresaId: string): Promise<Funcionario> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 5; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  const token_acesso = `FUN-${suffix}`

  const { data, error } = await supabase
    .from('funcionario')
    .insert({ ...input, empresa_id: empresaId, ativo: true, token_acesso })
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao criar funcionário' }
  return data as Funcionario
}

export async function editarFuncionario(id: string, input: EditarFuncionarioInput, empresaId: string): Promise<Funcionario> {
  await buscarFuncionario(id, empresaId)

  const { data, error } = await supabase
    .from('funcionario')
    .update(input)
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .select()
    .single()

  if (error || !data) throw { statusCode: 500, message: 'Erro ao editar funcionário' }
  return data as Funcionario
}

export async function buscarMeuPerfil(
  usuarioNome: string,
  empresaId: string,
): Promise<Funcionario | null> {
  const { data, error } = await supabase
    .from('funcionario')
    .select('*')
    .eq('empresa_id', empresaId)
    .ilike('nome', usuarioNome.trim())
    .eq('ativo', true)
    .limit(1)
    .maybeSingle()

  if (error) throw { statusCode: 500, message: 'Erro ao buscar perfil de funcionário' }
  return data as Funcionario | null
}

export async function listarMedicoesDoFuncionario(
  funcionarioId: string,
  empresaId: string,
): Promise<Medicao[]> {
  await buscarFuncionario(funcionarioId, empresaId)

  const { data, error } = await supabase
    .from('medicao')
    .select(`
      *,
      obra:obra_id(id, nome),
      servico:servico_id(id, nome, unidade_medida, tipo_cobranca)
    `)
    .eq('funcionario_id', funcionarioId)
    .order('data', { ascending: false })
    .limit(60)

  if (error) throw { statusCode: 500, message: 'Erro ao listar medições do funcionário' }
  return data as unknown as Medicao[]
}

export async function calcularProducao(
  funcionarioId: string,
  empresaId: string,
  inicio: string,
  fim: string,
): Promise<ProducaoResult> {
  const funcionario = await buscarFuncionario(funcionarioId, empresaId)

  const { data: medicoes, error } = await supabase
    .from('medicao')
    .select('quantidade, valor_calculado, servico:servico_id(id, nome, unidade_medida)')
    .eq('funcionario_id', funcionarioId)
    .eq('status', 'ativa')
    .gte('data', inicio)
    .lte('data', fim)

  if (error) throw { statusCode: 500, message: 'Erro ao calcular produção' }

  const porServico = new Map<string, ProducaoResult['por_servico'][number]>()
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
    funcionario_id: funcionario.id,
    funcionario_nome: funcionario.nome,
    periodo_inicio: inicio,
    periodo_fim: fim,
    total_medicoes: totalMedicoes,
    valor_total: valorTotal,
    por_servico: Array.from(porServico.values()),
  }
}
