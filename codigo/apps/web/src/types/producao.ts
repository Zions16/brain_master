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
