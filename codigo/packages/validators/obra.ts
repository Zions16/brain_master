import { z } from 'zod'

export const criarObraSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(150),
  endereco: z.string().max(300).optional(),
  cliente: z.string().max(150).optional(),
  responsavel_id: z.string().uuid({ message: 'ID de responsável inválido' }).optional(),
  data_inicio: z.string().date().optional(),
  data_prev_fim: z.string().date().optional(),
  valor_contrato: z.number().positive({ message: 'Valor do contrato deve ser positivo' }).optional(),
  lucro_esperado: z.number().positive({ message: 'Lucro esperado deve ser positivo' }).optional(),
})

export const editarObraSchema = criarObraSchema.partial()

export const mudarStatusObraSchema = z.object({
  status: z.enum(['ativa', 'pausada', 'encerrada'], {
    required_error: 'Status é obrigatório',
    message: 'Status deve ser: ativa, pausada ou encerrada',
  }),
})

export type CriarObraInput = z.infer<typeof criarObraSchema>
export type EditarObraInput = z.infer<typeof editarObraSchema>
export type MudarStatusObraInput = z.infer<typeof mudarStatusObraSchema>
