# CONTEXT — packages/shared

## Função
Tipos TypeScript compartilhados entre web, mobile e API.  
**Fonte da verdade para todas as entidades.**

## Arquivos
- `tipos.ts` — todas as interfaces: Obra, Funcionario, Medicao, Pagamento, Servico, UsuarioSession
- `auth.ts` — tipos de autenticação e sessão
- `funcionario.ts`, `medicao.ts`, `obra.ts`, `pagamento.ts`, `servico.ts` — tipos por entidade
- `index.ts` — barrel export

## Regra
Toda mudança de schema do banco deve refletir aqui primeiro.  
Nunca definir tipo inline em app — sempre importar de `@brain-master/shared`.

## packages/validators
- Schemas Zod para validação de input
- Um schema por operação: `CriarMedicaoInput`, `CorrigirMedicaoInput`, etc.
- Importar em: API (body validation) + web/mobile (form validation)
