// packages/validators/auth.ts

import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email({ message: 'Email inválido' })
    .toLowerCase(),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token é obrigatório' }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
