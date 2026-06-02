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

export const tokenLoginSchema = z.object({
  token: z
    .string({ required_error: 'Token é obrigatório' })
    .regex(/^(FUN|ENG)-[A-Z0-9]{5}$/, { message: 'Token inválido — formato esperado: FUN-XXXXX ou ENG-XXXXX' }),
})

export type TokenLoginInput = z.infer<typeof tokenLoginSchema>

export const cadastroSchema = z.object({
  nome_empresa: z
    .string({ required_error: 'Nome da empresa é obrigatório' })
    .min(2, { message: 'Nome da empresa deve ter pelo menos 2 caracteres' })
    .max(100),
  nome_gestor: z
    .string({ required_error: 'Seu nome é obrigatório' })
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(100),
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email({ message: 'Email inválido' })
    .toLowerCase(),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' }),
})

export type CadastroInput = z.infer<typeof cadastroSchema>
