// packages/validators/medicao.ts
// Schemas Zod compartilhados entre API e frontend

import { z } from 'zod'

export const criarMedicaoSchema = z.object({
  funcionario_id: z.string().uuid({ message: 'ID de funcionário inválido' }),
  servico_id: z.string().uuid({ message: 'ID de serviço inválido' }),
  quantidade: z
    .number({ required_error: 'Quantidade é obrigatória' })
    .positive({ message: 'Quantidade deve ser maior que zero' })
    .max(99999, { message: 'Quantidade muito alta — verifique o valor' }),
  data: z.string().datetime().optional(),
  observacao: z.string().max(500).optional(),
})

export const corrigirMedicaoSchema = z.object({
  quantidade: z
    .number({ required_error: 'Nova quantidade é obrigatória' })
    .positive({ message: 'Quantidade deve ser maior que zero' })
    .max(99999),
  motivo: z
    .string({ required_error: 'Motivo é obrigatório' })
    .min(10, { message: 'Descreva o motivo com pelo menos 10 caracteres' })
    .max(500),
})

export const cancelarMedicaoSchema = z.object({
  motivo: z
    .string({ required_error: 'Motivo é obrigatório' })
    .min(10, { message: 'Descreva o motivo com pelo menos 10 caracteres' })
    .max(500),
})

export type CriarMedicaoInput = z.infer<typeof criarMedicaoSchema>
export type CorrigirMedicaoInput = z.infer<typeof corrigirMedicaoSchema>
export type CancelarMedicaoInput = z.infer<typeof cancelarMedicaoSchema>
