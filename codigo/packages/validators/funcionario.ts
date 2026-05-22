import { z } from 'zod'

export const criarFuncionarioSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(150),
  funcao: z.string().max(100).optional(),
  tipo_pagamento: z.enum(['POR_PRODUCAO', 'DIARIA', 'HORA', 'MISTO'], {
    required_error: 'Tipo de pagamento é obrigatório',
    message: 'Tipo de pagamento deve ser: POR_PRODUCAO, DIARIA, HORA ou MISTO',
  }),
  valor_base: z.number().positive({ message: 'Valor base deve ser maior que zero' }).optional(),
  obra_id: z.string().uuid({ message: 'ID de obra inválido' }).optional(),
})

export const editarFuncionarioSchema = criarFuncionarioSchema.partial()

export const producaoQuerySchema = z.object({
  inicio: z.string().date('Data de início inválida (formato: YYYY-MM-DD)'),
  fim: z.string().date('Data de fim inválida (formato: YYYY-MM-DD)'),
})

export type CriarFuncionarioInput = z.infer<typeof criarFuncionarioSchema>
export type EditarFuncionarioInput = z.infer<typeof editarFuncionarioSchema>
export type ProducaoQueryInput = z.infer<typeof producaoQuerySchema>
