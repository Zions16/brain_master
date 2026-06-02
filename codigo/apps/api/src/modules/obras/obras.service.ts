import { supabase } from '../../lib/supabase'
import { CriarObraInput, EditarObraInput, MudarStatusObraInput } from '@brain-master/validators'
import { Obra, ObraResumo } from '@brain-master/shared/tipos'

export interface MembroObra {
  id: string
  nome: string
  perfil: string
  token_acesso: string | null
}

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
    .neq('status', 'encerrada')
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

export async function listarMembros(obraId: string, empresaId: string): Promise<MembroObra[]> {
  await buscarObra(obraId, empresaId)

  const { data, error } = await supabase
    .from('obra_usuario')
    .select('usuario:usuario_id(id, nome, perfil, token_acesso)')
    .eq('obra_id', obraId)

  if (error) throw { statusCode: 500, message: 'Erro ao listar membros da obra' }
  return ((data ?? []).map((row: any) => row.usuario)) as MembroObra[]
}

export async function adicionarMembro(
  obraId: string,
  usuarioId: string,
  empresaId: string,
): Promise<void> {
  await buscarObra(obraId, empresaId)

  const { data: usuario, error: userError } = await supabase
    .from('usuario')
    .select('id')
    .eq('id', usuarioId)
    .eq('empresa_id', empresaId)
    .eq('perfil', 'ENGENHEIRO')
    .single()

  if (userError || !usuario) {
    throw { statusCode: 400, message: 'Engenheiro não encontrado nesta empresa' }
  }

  const { error } = await supabase
    .from('obra_usuario')
    .insert({ obra_id: obraId, usuario_id: usuarioId })

  if (error) {
    if (error.code === '23505') throw { statusCode: 409, message: 'Engenheiro já vinculado a esta obra' }
    throw { statusCode: 500, message: 'Erro ao vincular engenheiro à obra' }
  }
}

export async function removerMembro(
  obraId: string,
  usuarioId: string,
  empresaId: string,
): Promise<void> {
  await buscarObra(obraId, empresaId)

  const { error } = await supabase
    .from('obra_usuario')
    .delete()
    .eq('obra_id', obraId)
    .eq('usuario_id', usuarioId)

  if (error) throw { statusCode: 500, message: 'Erro ao remover engenheiro da obra' }
}

export async function resumoTodasObras(empresaId: string): Promise<ObraResumo[]> {
  const { data: obras, error } = await supabase
    .from('obra')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false })

  if (error) throw { statusCode: 500, message: 'Erro ao listar obras' }

  const obraList = (obras as Obra[]) ?? []
  if (obraList.length === 0) return []

  const obraIds = obraList.map((o) => o.id)

  const [pagResult, medResult] = await Promise.all([
    supabase.from('pagamento').select('obra_id, valor_total, status').in('obra_id', obraIds),
    supabase
      .from('medicao')
      .select('obra_id, funcionario_id, valor_calculado, valor_cobranca_calculado')
      .in('obra_id', obraIds)
      .eq('status', 'ativa'),
  ])

  type PagRow = { obra_id: string; valor_total: number; status: string }
  type MedRow = { obra_id: string; funcionario_id: string; valor_calculado: number; valor_cobranca_calculado?: number }

  const pagsByObra = new Map<string, PagRow[]>()
  for (const p of (pagResult.data ?? []) as PagRow[]) {
    const list = pagsByObra.get(p.obra_id) ?? []
    list.push(p)
    pagsByObra.set(p.obra_id, list)
  }

  const medsByObra = new Map<string, MedRow[]>()
  for (const m of (medResult.data ?? []) as MedRow[]) {
    const list = medsByObra.get(m.obra_id) ?? []
    list.push(m)
    medsByObra.set(m.obra_id, list)
  }

  return obraList.map((obra) => {
    const obraPags = pagsByObra.get(obra.id) ?? []
    const obraMeds = medsByObra.get(obra.id) ?? []

    const totalPago = obraPags
      .filter((p) => p.status === 'realizado')
      .reduce((s, p) => s + Number(p.valor_total), 0)

    const totalPendente = obraPags
      .filter((p) => p.status === 'pendente')
      .reduce((s, p) => s + Number(p.valor_total), 0)

    const totalCustoProducao = obraMeds.reduce((s, m) => s + Number(m.valor_calculado ?? 0), 0)
    const totalCobrancaProducao = obraMeds.reduce((s, m) => s + Number(m.valor_cobranca_calculado ?? 0), 0)

    const funcUnicos = new Set(obraMeds.map((m) => m.funcionario_id)).size

    let progressoPct: number | null = null
    if (obra.data_inicio && obra.data_prev_fim) {
      const inicio = new Date(obra.data_inicio).getTime()
      const fim = new Date(obra.data_prev_fim).getTime()
      const hoje = Date.now()
      progressoPct = Math.min(100, Math.max(0, Math.round(((hoje - inicio) / (fim - inicio)) * 100)))
    }

    return {
      ...obra,
      total_pago: Number(totalPago.toFixed(2)),
      total_pendente: Number(totalPendente.toFixed(2)),
      total_medicoes: obraMeds.length,
      total_funcionarios: funcUnicos,
      progresso_pct: progressoPct,
      total_custo_producao: Number(totalCustoProducao.toFixed(2)),
      total_cobranca_producao: Number(totalCobrancaProducao.toFixed(2)),
    }
  })
}
