// packages/shared/tipos.ts
// Tipos TypeScript compartilhados entre mobile, web e API

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type Perfil = 'GESTOR' | 'ENGENHEIRO' | 'FUNCIONARIO' | 'COMPRAS' | 'FINANCEIRO'

export type TipoPagamento = 'POR_PRODUCAO' | 'DIARIA' | 'HORA' | 'MISTO'

export type UnidadeMedida = 'M2' | 'ML' | 'M3' | 'UN' | 'KG' | 'HORA' | 'PECA'

export type StatusObra = 'ATIVA' | 'PAUSADA' | 'ENCERRADA'

export type StatusMedicao = 'PENDENTE' | 'ATIVA' | 'CORRIGIDA' | 'CANCELADA'

export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'PARCIAL'

// ─────────────────────────────────────────────
// ENTIDADES
// ─────────────────────────────────────────────

export interface Empresa {
  id: string
  nome: string
  cnpj?: string
  plano: string
  ativo: boolean
  criadoEm: string
}

export interface Usuario {
  id: string
  empresaId: string
  nome: string
  email: string
  perfil: Perfil
  ativo: boolean
  criadoEm: string
}

export interface Obra {
  id: string
  empresaId: string
  nome: string
  endereco?: string
  cliente?: string
  dataInicio?: string
  dataPrevFim?: string
  status: StatusObra
  criadoEm: string
}

export interface Funcionario {
  id: string
  empresaId: string
  usuarioId?: string
  nome: string
  funcao?: string
  tipoPagamento: TipoPagamento
  valorDiaria?: number
  ativo: boolean
  criadoEm: string
}

export interface Servico {
  id: string
  obraId: string
  nome: string
  unidade: UnidadeMedida
  valorPagamento: number
  valorCobranca?: number
  ativo: boolean
  criadoEm: string
}

export interface Medicao {
  id: string
  obraId: string
  funcionarioId: string
  servicoId: string
  quantidade: number
  valorCalculado: number
  valorCobrancaCalc?: number
  data: string
  medidoPorId: string
  aprovadoPorId?: string
  status: StatusMedicao
  observacao?: string
  criadoEm: string
  // relações opcionais (quando carregadas pelo backend)
  funcionario?: Pick<Funcionario, 'id' | 'nome' | 'funcao'>
  servico?: Pick<Servico, 'id' | 'nome' | 'unidade'>
  medidoPor?: Pick<Usuario, 'id' | 'nome'>
}

export interface HistoricoMedicao {
  id: string
  medicaoId: string
  alteradoPorId: string
  dataAlteracao: string
  campoAlterado: string
  valorAnterior: string
  valorNovo: string
  motivo: string
  alteradoPor?: Pick<Usuario, 'id' | 'nome'>
}

export interface Pagamento {
  id: string
  obraId: string
  funcionarioId: string
  periodoInicio: string
  periodoFim: string
  valorTotal: number
  dataPagamento?: string
  status: StatusPagamento
  formaPagamento?: string
  observacao?: string
  lancadoPorId: string
  criadoEm: string
  funcionario?: Pick<Funcionario, 'id' | 'nome'>
}

// ─────────────────────────────────────────────
// DTOs (payloads de requisição)
// ─────────────────────────────────────────────

export interface CriarMedicaoDTO {
  funcionarioId: string
  servicoId: string
  quantidade: number
  data?: string
  observacao?: string
}

export interface CorrigirMedicaoDTO {
  quantidade: number
  motivo: string
}

export interface CriarPagamentoDTO {
  funcionarioId: string
  periodoInicio: string
  periodoFim: string
  formaPagamento?: string
  observacao?: string
}

export interface LoginDTO {
  email: string
  senha: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  usuario: Usuario
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
