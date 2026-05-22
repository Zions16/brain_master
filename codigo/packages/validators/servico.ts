import { z } from 'zod'

export const criarServicoSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(150),
  unidade_medida: z.enum(['M2', 'ML', 'M3', 'UN', 'KG', 'HORA', 'PECA'], {
    required_error: 'Unidade de medida é obrigatória',
    message: 'Unidade inválida. Use: M2, ML, M3, UN, KG, HORA ou PECA',
  }),
  valor_pagamento: z
    .number({ required_error: 'Valor de pagamento é obrigatório' })
    .positive({ message: 'Valor de pagamento deve ser maior que zero' }),
  valor_cobranca: z
    .number()
    .positive({ message: 'Valor de cobrança deve ser maior que zero' })
    .optional(),
})

export const editarServicoSchema = criarServicoSchema.partial()

export type CriarServicoInput = z.infer<typeof criarServicoSchema>
export type EditarServicoInput = z.infer<typeof editarServicoSchema>
