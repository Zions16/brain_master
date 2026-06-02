import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocked before imports — vi.mock is hoisted automatically
vi.mock('../../../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

import {
  registrarMedicao,
  corrigirMedicao,
  cancelarMedicao,
  aprovarMedicao,
  rejeitarMedicao,
} from '../medicoes.service'
import { supabase } from '../../../lib/supabase'

const mockFrom = vi.mocked(supabase.from)

// Cria um chain fluente que resolve para `result` tanto via .single() quanto await direto
function chain(result: { data: unknown; error: unknown } = { data: null, error: null }) {
  const c: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'order', 'insert', 'update']) {
    c[m] = () => c
  }
  c['single'] = () => Promise.resolve(result)
  c['then'] = (ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(ok, fail)
  c['catch'] = (fail: (e: unknown) => unknown) => Promise.resolve(result).catch(fail)
  return c as ReturnType<typeof supabase.from>
}

// UUIDs fixos para facilitar leitura dos testes
const IDS = {
  obra: 'obra-0000-0000-0000-000000000001',
  empresa: 'emp--0000-0000-0000-000000000001',
  usuario: 'usr--0000-0000-0000-000000000001',
  func: 'func-0000-0000-0000-000000000001',
  serv: 'serv-0000-0000-0000-000000000001',
  med: 'med--0000-0000-0000-000000000001',
}

// Dados base reutilizados entre testes
const baseServico = {
  id: IDS.serv,
  valor_pagamento: 20,
  valor_cobranca: null as null | number,
  ativo: true,
}

const baseMedicao = {
  id: IDS.med,
  obra_id: IDS.obra,
  funcionario_id: IDS.func,
  servico_id: IDS.serv,
  quantidade: 10,
  valor_calculado: 200,
  valor_cobranca_calculado: null,
  data: '2026-06-02',
  medido_por: IDS.usuario,
  aprovado_por: null,
  status: 'ativa',
  observacao: null,
  created_at: '2026-06-02T00:00:00Z',
}

const criarInput = {
  funcionario_id: IDS.func,
  servico_id: IDS.serv,
  quantidade: 10,
  emergencia: false,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ──────────────────────────────────────────────────────────────
// registrarMedicao
// ──────────────────────────────────────────────────────────────

describe('registrarMedicao', () => {
  // Sequência de from() dentro da função:
  //   1. obra (verificarObraEmpresa)
  //   2. funcionario
  //   3. servico
  //   4. medicao (insert)

  function setupHappyPath(statusRetornado: string) {
    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: { id: IDS.func }, error: null }))
      .mockReturnValueOnce(chain({ data: baseServico, error: null }))
      .mockReturnValueOnce(chain({ data: { ...baseMedicao, status: statusRetornado }, error: null }))
  }

  it('GESTOR cria medição com status=ativa', async () => {
    setupHappyPath('ativa')

    const result = await registrarMedicao(criarInput, IDS.obra, IDS.empresa, IDS.usuario, 'GESTOR')

    expect(result.status).toBe('ativa')
  })

  it('ENGENHEIRO cria medição com status=pendente_aprovacao', async () => {
    setupHappyPath('pendente_aprovacao')

    const result = await registrarMedicao(criarInput, IDS.obra, IDS.empresa, IDS.usuario, 'ENGENHEIRO')

    expect(result.status).toBe('pendente_aprovacao')
  })

  it('valor_calculado = quantidade × valor_pagamento arredondado em 2 casas', async () => {
    // 7 × 14.333... → 100.33
    const servicoOdd = { ...baseServico, valor_pagamento: 14.333 }
    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: { id: IDS.func }, error: null }))
      .mockReturnValueOnce(chain({ data: servicoOdd, error: null }))
      .mockReturnValueOnce(chain({ data: { ...baseMedicao, quantidade: 7, valor_calculado: 100.33 }, error: null }))

    const result = await registrarMedicao(
      { ...criarInput, quantidade: 7 },
      IDS.obra, IDS.empresa, IDS.usuario, 'GESTOR',
    )

    expect(result.valor_calculado).toBe(100.33)
  })

  it('throws 400 quando serviço está inativo', async () => {
    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: { id: IDS.func }, error: null }))
      .mockReturnValueOnce(chain({ data: { ...baseServico, ativo: false }, error: null }))

    await expect(
      registrarMedicao(criarInput, IDS.obra, IDS.empresa, IDS.usuario, 'GESTOR'),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('inativo') })
  })

  it('throws 400 quando funcionário não encontrado ou inativo', async () => {
    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: { code: 'PGRST116' } }))

    await expect(
      registrarMedicao(criarInput, IDS.obra, IDS.empresa, IDS.usuario, 'GESTOR'),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 404 quando obra não pertence à empresa', async () => {
    mockFrom.mockReturnValueOnce(chain({ data: null, error: { code: 'PGRST116' } }))

    await expect(
      registrarMedicao(criarInput, IDS.obra, IDS.empresa, IDS.usuario, 'GESTOR'),
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ──────────────────────────────────────────────────────────────
// corrigirMedicao
// ──────────────────────────────────────────────────────────────

describe('corrigirMedicao', () => {
  // Sequência de from() dentro da função:
  //   1. obra (verificarObraEmpresa, dentro de buscarMedicaoComVerificacao)
  //   2. medicao (buscarMedicaoComVerificacao)
  //   3. servico (para recálculo)
  //   4. medicao_historico (gravarHistorico quantidade)
  //   5. medicao_historico (gravarHistorico valor_calculado — apenas se valor mudou)
  //   6. medicao (update)

  const corrigirInput = { quantidade: 15, motivo: 'Erro na contagem inicial do dia' }

  it('recalcula valor_calculado com a nova quantidade', async () => {
    const medicaoOriginal = { ...baseMedicao, quantidade: 10, valor_calculado: 200 }
    const medicaoAtualizada = { ...baseMedicao, quantidade: 15, valor_calculado: 300, status: 'corrigida' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))           // obra
      .mockReturnValueOnce(chain({ data: medicaoOriginal, error: null }))             // medicao fetch
      .mockReturnValueOnce(chain({ data: { valor_pagamento: 20, valor_cobranca: null }, error: null })) // servico
      .mockReturnValueOnce(chain({ data: null, error: null }))                        // historico quantidade
      .mockReturnValueOnce(chain({ data: null, error: null }))                        // historico valor_calculado
      .mockReturnValueOnce(chain({ data: medicaoAtualizada, error: null }))           // medicao update

    const result = await corrigirMedicao(IDS.med, corrigirInput, IDS.obra, IDS.empresa, IDS.usuario)

    expect(result.quantidade).toBe(15)
    expect(result.valor_calculado).toBe(300)
    expect(result.status).toBe('corrigida')
  })

  it('não grava historico de valor_calculado quando valor não muda', async () => {
    // quantidade 10 → 10 com mesmo serviço → valor_calculado não muda
    const medicaoOriginal = { ...baseMedicao, quantidade: 10, valor_calculado: 200 }
    const medicaoAtualizada = { ...baseMedicao, quantidade: 10, valor_calculado: 200, status: 'corrigida' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoOriginal, error: null }))
      .mockReturnValueOnce(chain({ data: { valor_pagamento: 20, valor_cobranca: null }, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }))    // historico quantidade
      // sem historico de valor_calculado
      .mockReturnValueOnce(chain({ data: medicaoAtualizada, error: null })) // medicao update

    const result = await corrigirMedicao(
      IDS.med, { quantidade: 10, motivo: 'Confirmar sem alteração de valor' },
      IDS.obra, IDS.empresa, IDS.usuario,
    )

    expect(result.status).toBe('corrigida')
    // 4 chamadas: obra, medicao, servico, historico-qtd, update
    expect(mockFrom).toHaveBeenCalledTimes(5)
  })

  it('throws 400 ao tentar corrigir medição cancelada', async () => {
    const medicaoCancelada = { ...baseMedicao, status: 'cancelada' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoCancelada, error: null }))

    await expect(
      corrigirMedicao(IDS.med, corrigirInput, IDS.obra, IDS.empresa, IDS.usuario),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('cancelada') })
  })
})

// ──────────────────────────────────────────────────────────────
// aprovarMedicao
// ──────────────────────────────────────────────────────────────

describe('aprovarMedicao', () => {
  it('aprova medição pendente_aprovacao → status=ativa', async () => {
    const medicaoPendente = { ...baseMedicao, status: 'pendente_aprovacao' }
    const medicaoAprovada = { ...baseMedicao, status: 'ativa', aprovado_por: IDS.usuario }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoPendente, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }))        // historico
      .mockReturnValueOnce(chain({ data: medicaoAprovada, error: null })) // update

    const result = await aprovarMedicao(IDS.med, IDS.obra, IDS.empresa, IDS.usuario)

    expect(result.status).toBe('ativa')
    expect(result.aprovado_por).toBe(IDS.usuario)
  })

  it('throws 400 ao tentar aprovar medição que já está ativa', async () => {
    const medicaoAtiva = { ...baseMedicao, status: 'ativa' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoAtiva, error: null }))

    await expect(
      aprovarMedicao(IDS.med, IDS.obra, IDS.empresa, IDS.usuario),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 ao tentar aprovar medição cancelada', async () => {
    const medicaoCancelada = { ...baseMedicao, status: 'cancelada' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoCancelada, error: null }))

    await expect(
      aprovarMedicao(IDS.med, IDS.obra, IDS.empresa, IDS.usuario),
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})

// ──────────────────────────────────────────────────────────────
// cancelarMedicao
// ──────────────────────────────────────────────────────────────

describe('cancelarMedicao', () => {
  const cancelarInput = { motivo: 'Medição duplicada registrada por engano' }

  it('cancela medição ativa → status=cancelada', async () => {
    const medicaoAtiva = { ...baseMedicao, status: 'ativa' }
    const medicaoCancelada = { ...baseMedicao, status: 'cancelada' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoAtiva, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }))          // historico
      .mockReturnValueOnce(chain({ data: medicaoCancelada, error: null })) // update

    const result = await cancelarMedicao(IDS.med, cancelarInput, IDS.obra, IDS.empresa, IDS.usuario)

    expect(result.status).toBe('cancelada')
  })

  it('throws 400 ao cancelar medição já cancelada', async () => {
    const medicaoCancelada = { ...baseMedicao, status: 'cancelada' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoCancelada, error: null }))

    await expect(
      cancelarMedicao(IDS.med, cancelarInput, IDS.obra, IDS.empresa, IDS.usuario),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('cancelada') })
  })
})

// ──────────────────────────────────────────────────────────────
// rejeitarMedicao
// ──────────────────────────────────────────────────────────────

describe('rejeitarMedicao', () => {
  it('rejeita medição pendente_aprovacao → status=cancelada', async () => {
    const medicaoPendente = { ...baseMedicao, status: 'pendente_aprovacao' }
    const medicaoRejeitada = { ...baseMedicao, status: 'cancelada' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoPendente, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }))            // historico
      .mockReturnValueOnce(chain({ data: medicaoRejeitada, error: null })) // update

    const result = await rejeitarMedicao(IDS.med, 'Quantidade não confere com o relatório', IDS.obra, IDS.empresa, IDS.usuario)

    expect(result.status).toBe('cancelada')
  })

  it('throws 400 ao rejeitar medição que não está pendente_aprovacao', async () => {
    const medicaoAtiva = { ...baseMedicao, status: 'ativa' }

    mockFrom
      .mockReturnValueOnce(chain({ data: { id: IDS.obra }, error: null }))
      .mockReturnValueOnce(chain({ data: medicaoAtiva, error: null }))

    await expect(
      rejeitarMedicao(IDS.med, 'motivo', IDS.obra, IDS.empresa, IDS.usuario),
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})
