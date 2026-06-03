import { supabase } from './supabase'
import { emailMedicaoRegistrada, emailPagamentoRealizado } from './email'

export async function notificarMedicaoRegistrada(params: {
  medicaoId: string
  obraId: string
  empresaId: string
}) {
  try {
    const [{ data: obra }, { data: medicao }] = await Promise.all([
      supabase.from('obra').select('nome').eq('id', params.obraId).single(),
      supabase
        .from('medicao')
        .select('quantidade, funcionario:funcionario_id(nome), servico:servico_id(nome, unidade)')
        .eq('id', params.medicaoId)
        .single(),
    ])

    const { data: gestores } = await supabase
      .from('usuario')
      .select('email, nome')
      .eq('empresa_id', params.empresaId)
      .eq('perfil', 'GESTOR')

    if (!obra || !medicao || !gestores?.length) return

    const funcRaw = medicao.funcionario as unknown
    const servRaw = medicao.servico as unknown
    const func = (Array.isArray(funcRaw) ? funcRaw[0] : funcRaw) as { nome: string } | null
    const serv = (Array.isArray(servRaw) ? servRaw[0] : servRaw) as { nome: string; unidade: string } | null

    await Promise.all(
      gestores.map((g) =>
        emailMedicaoRegistrada({
          gestorEmail: g.email,
          gestorNome: g.nome,
          funcionarioNome: func?.nome ?? 'Funcionário',
          obraNome: obra.nome,
          servicoNome: serv?.nome ?? 'Serviço',
          quantidade: medicao.quantidade,
          unidade: serv?.unidade ?? 'm²',
          obraId: params.obraId,
        })
      )
    )
  } catch {
    // fire-and-forget: erro de notificação não impacta a operação principal
  }
}

export async function notificarPagamentoRealizado(params: {
  pagamentoId: string
  obraId: string
  empresaId: string
  gestorId: string
  valorTotal: number
  periodoInicio: string
  periodoFim: string
}) {
  try {
    const [{ data: obra }, { data: pagamento }, { data: gestor }] = await Promise.all([
      supabase.from('obra').select('nome').eq('id', params.obraId).single(),
      supabase
        .from('pagamento')
        .select('funcionario:funcionario_id(nome)')
        .eq('id', params.pagamentoId)
        .single(),
      supabase.from('usuario').select('email, nome').eq('id', params.gestorId).single(),
    ])

    if (!obra || !pagamento || !gestor) return

    const funcRaw2 = pagamento.funcionario as unknown
    const func = (Array.isArray(funcRaw2) ? funcRaw2[0] : funcRaw2) as { nome: string } | null
    const inicio = new Date(params.periodoInicio).toLocaleDateString('pt-BR')
    const fim = new Date(params.periodoFim).toLocaleDateString('pt-BR')

    await emailPagamentoRealizado({
      gestorEmail: gestor.email,
      gestorNome: gestor.nome,
      funcionarioNome: func?.nome ?? 'Funcionário',
      obraNome: obra.nome,
      valorTotal: params.valorTotal,
      periodo: `${inicio} — ${fim}`,
    })
  } catch {
    // fire-and-forget
  }
}
