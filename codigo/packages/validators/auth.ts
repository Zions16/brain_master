// packages/validators/auth.ts

import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email({ message: 'Email inválido' })
    .toLowerCase(),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' }),
})

export type LoginInput = z.infer<typeof loginSchema>
