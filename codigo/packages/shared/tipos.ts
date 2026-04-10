// packages/shared/tipos.ts
// Tipos TypeScript compartilhados entre mobile, web e API
// Nomes de campos em snake_case para corresponder ao schema do Supabase

// ─────────────────────────────────────────────
// ENUMS — valores em lowercase para corresponder ao CHECK do SQL
// ─────────────────────────────────────────────

export type Perfil = 'GESTOR' | 'ENGENHEIRO' | 'FUNCIONARIO' | 'COMPRAS' | 'FINANCEIRO'

export type TipoPagamento = 'POR_PRODUCAO' | 'DIARIA' | 'HORA' | 'MISTO'

export type UnidadeMedida = 'M2' | 'ML' | 'M3' | 'UN' | 'KG' | 'HORA' | 'PECA'

export type StatusObra = 'ativa' | 'pausada' | 'encerrada'

export type StatusMedicao = 'pendente' | 'ativa' | 'corrigida' | 'cancelada' | 'pendente_aprovacao'

export type StatusPagamento = 'pendente' | 'realizado'

// ─────────────────────────────────────────────
// ENTIDADES — campo por campo alinhado com o Supabase
// ─────────────────────────────────────────────

export interface Empresa {
  id: string
  nome: string
  cnpj?: string
  plano: string
  status: string
  created_at: string
}

export interface Usuario {
  id: string
  empresa_id: string
  nome: string
  perfil: Perfil
  created_at: string
}

export interface UsuarioSession {
  id: string
  empresa_id: string
  nome: string
  perfil: Perfil
}

export interface Obra {
  id: string
  empresa_id: string
  nome: string
  endereco?: string
  cliente?: string
  responsavel_id?: string
  data_inicio?: string
  data_prev_fim?: string
  status: StatusObra
  created_at: string
}

export interface ObraUsuario {
  obra_id: string
  usuario_id: string
}

export interface Funcionario {
  id: string
  empresa_id: string
  obra_id?: string
  nome: string
  funcao?: string
  tipo_pagamento: TipoPagamento
  valor_base?: number
  ativo: boolean
  created_at: string
}

export interface Servico {
  id: string
  obra_id: string
  nome: string
  unidade_medida: UnidadeMedida
  valor_pagamento: number
  valor_cobranca?: number
  ativo: boolean
  created_at: string
}

export interface Medicao {
  id: string
  obra_id: string
  funcionario_id: string
  servico_id: string
  quantidade: number
  valor_calculado: number
  valor_cobranca_calculado?: number
  data: string
  medido_por: string
  aprovado_por?: string
  status: StatusMedicao
  observacao?: string
  created_at: string
  // relações opcionais (quando carregadas pelo backend)
  funcionario?: Pick<Funcionario, 'id' | 'nome' | 'funcao'>
  servico?: Pick<Servico, 'id' | 'nome' | 'unidade_medida'>
  medido_por_usuario?: Pick<Usuario, 'id' | 'nome'>
}

export interface MedicaoHistorico {
  id: string
  medicao_id: string
  alterado_por: string
  data_alteracao: string
  campo_alterado: string
  valor_anterior: string
  valor_novo: string
  motivo: string
  alterado_por_usuario?: Pick<Usuario, 'id' | 'nome'>
}

export interface Pagamento {
  id: string
  obra_id: string
  funcionario_id: string
  periodo_inicio: string
  periodo_fim: string
  valor_total: number
  data_pagamento?: string
  pago_por?: string
  forma_pagamento?: string
  status: StatusPagamento
  observacao?: string
  created_at: string
  funcionario?: Pick<Funcionario, 'id' | 'nome'>
}

// ─────────────────────────────────────────────
// DTOs (payloads de requisição)
// ─────────────────────────────────────────────

export interface CriarMedicaoDTO {
  funcionario_id: string
  servico_id: string
  quantidade: number
  data?: string
  observacao?: string
}

export interface CorrigirMedicaoDTO {
  quantidade: number
  motivo: string
}

export interface CriarPagamentoDTO {
  funcionario_id: string
  periodo_inicio: string
  periodo_fim: string
  forma_pagamento?: string
  observacao?: string
}

export interface LoginDTO {
  email: string
  senha: string
}

// Supabase gerencia tokens — apenas access_token é exposto pela API
export interface AuthResponse {
  access_token: string
  usuario: UsuarioSession
}

// ─────────────────────────────────────────────
// RESPOSTAS DA API
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ─────────────────────────────────────────────
// TIPOS AGREGADOS (responses de dashboard)
// ─────────────────────────────────────────────

export interface DashboardObra {
  obra_id: string
  obra_nome: string
  total_medicoes: number
  valor_total_periodo: number
  funcionarios_ativos: number
}

export interface ResumoFuncionario {
  funcionario_id: string
  funcionario_nome: string
  total_medicoes: number
  valor_total: number
  periodo_inicio: string
  periodo_fim: string
}
