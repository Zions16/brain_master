import { z } from 'zod'

export const calculoPagamentoQuerySchema = z.object({
  inicio: z.string().date('Data de início inválida (formato: YYYY-MM-DD)'),
  fim: z.string().date('Data de fim inválida (formato: YYYY-MM-DD)'),
})

export const criarPagamentoSchema = z.object({
  funcionario_id: z.string().uuid({ message: 'ID de funcionário inválido' }),
  periodo_inicio: z.string().date('Data de início inválida (formato: YYYY-MM-DD)'),
  periodo_fim: z.string().date('Data de fim inválida (formato: YYYY-MM-DD)'),
  forma_pagamento: z.string().max(100).optional(),
  observacao: z.string().max(500).optional(),
})

export const realizarPagamentoSchema = z.object({
  forma_pagamento: z.string({ required_error: 'Forma de pagamento é obrigatória' }).max(100),
  data_pagamento: z.string().date('Data de pagamento inválida (formato: YYYY-MM-DD)').optional(),
  observacao: z.string().max(500).optional(),
})

export type CalculoPagamentoQuery = z.infer<typeof calculoPagamentoQuerySchema>

export const cancelarPagamentoSchema = z.object({
  motivo: z.string({ required_error: 'Motivo é obrigatório' }).min(5, 'Mínimo 5 caracteres').max(500),
})

export type CriarPagamentoInput = z.infer<typeof criarPagamentoSchema>
export type RealizarPagamentoInput = z.infer<typeof realizarPagamentoSchema>
export type CancelarPagamentoInput = z.infer<typeof cancelarPagamentoSchema>
