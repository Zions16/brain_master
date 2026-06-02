import { supabase } from '../../lib/supabase'
import { RelatorioFuncionarioFechamento } from '@brain-master/shared/tipos'

export async function fechamentoPeriodo(
  empresaId: string,
  inicio: string,
  fim: string,
): Promise<RelatorioFuncionarioFechamento[]> {
  const { data: obras, error: obrasError } = await supabase
    .from('obra')
    .select('id, nome')
    .eq('empresa_id', empresaId)

  if (obrasError) throw { statusCode: 500, message: 'Erro ao buscar obras' }

  const obraList = (obras ?? []) as { id: string; nome: string }[]
  if (obraList.length === 0) return []

  const obraIds = obraList.map((o) => o.id)
  const obraNomes = new Map(obraList.map((o) => [o.id, o.nome]))

  const [medResult, pagResult] = await Promise.all([
    supabase
      .from('medicao')
      .select('funcionario_id, obra_id, valor_calculado')
      .in('obra_id', obraIds)
      .eq('status', 'ativa')
      .gte('data', inicio)
      .lte('data', fim),
    supabase
      .from('pagamento')
      .select('funcionario_id, obra_id, valor_total, status')
      .in('obra_id', obraIds)
      .gte('periodo_inicio', inicio)
      .lte('periodo_inicio', fim),
  ])

  type MedRow = { funcionario_id: string; obra_id: string; valor_calculado: number }
  type PagRow = { funcionario_id: string; obra_id: string; valor_total: number; status: string }

  const meds = (medResult.data ?? []) as MedRow[]
  const pags = (pagResult.data ?? []) as PagRow[]

  const funcIds = [...new Set([...meds.map((m) => m.funcionario_id), ...pags.map((p) => p.funcionario_id)])]
  if (funcIds.length === 0) return []

  const { data: funcionarios, error: funcError } = await supabase
    .from('funcionario')
    .select('id, nome, funcao')
    .in('id', funcIds)
    .eq('empresa_id', empresaId)

  if (funcError) throw { statusCode: 500, message: 'Erro ao buscar funcionários' }

  type FuncRow = { id: string; nome: string; funcao: string | null }
  const funcMap = new Map(((funcionarios ?? []) as FuncRow[]).map((f) => [f.id, f]))

  type Agg = {
    total_produzido: number
    total_medicoes: number
    total_pendente: number
    total_pago: number
    obras: Set<string>
  }

  const aggMap = new Map<string, Agg>()

  function getOrCreate(id: string): Agg {
    if (!aggMap.has(id)) {
      aggMap.set(id, { total_produzido: 0, total_medicoes: 0, total_pendente: 0, total_pago: 0, obras: new Set() })
    }
    return aggMap.get(id)!
  }

  for (const m of meds) {
    const agg = getOrCreate(m.funcionario_id)
    agg.total_produzido += Number(m.valor_calculado)
    agg.total_medicoes++
    const nome = obraNomes.get(m.obra_id)
    if (nome) agg.obras.add(nome)
  }

  for (const p of pags) {
    const agg = getOrCreate(p.funcionario_id)
    if (p.status === 'pendente') agg.total_pendente += Number(p.valor_total)
    else if (p.status === 'realizado') agg.total_pago += Number(p.valor_total)
    const nome = obraNomes.get(p.obra_id)
    if (nome) agg.obras.add(nome)
  }

  return [...aggMap.entries()]
    .map(([funcId, agg]): RelatorioFuncionarioFechamento | null => {
      const func = funcMap.get(funcId)
      if (!func) return null
      const total_produzido = Number(agg.total_produzido.toFixed(2))
      const total_pendente = Number(agg.total_pendente.toFixed(2))
      const total_pago = Number(agg.total_pago.toFixed(2))
      return {
        funcionario_id: funcId,
        nome: func.nome,
        funcao: func.funcao ?? null,
        total_medicoes: agg.total_medicoes,
        total_produzido,
        total_pendente,
        total_pago,
        saldo_a_gerar: Number((total_produzido - total_pendente - total_pago).toFixed(2)),
        obras: [...agg.obras].sort(),
      }
    })
    .filter((r): r is RelatorioFuncionarioFechamento => r !== null)
    .sort((a, b) => b.total_produzido - a.total_produzido)
}
