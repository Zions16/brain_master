# Regras de Código — ObrasApp

## Antes de escrever qualquer código
- Entenda o requisito completamente
- Pergunte se houver dúvida
- Pense na segurança primeiro

## Padrões gerais
- Funções pequenas, com uma responsabilidade
- Nomes descritivos (sem abreviações obscuras)
- Comentários apenas onde a lógica não é óbvia
- Sem código morto ou comentado no repositório

## Estrutura de commits
- feat: nova funcionalidade
- fix: correção de bug
- docs: documentação
- refactor: refatoração sem mudança de comportamento
- security: correção de segurança (PRIORIDADE MÁXIMA)

## Tratamento de erros
- Sempre trate erros explicitamente
- Nunca use catch vazio
- Log de erro no servidor, mensagem genérica para o usuário

## Performance
- Não otimize prematuramente
- Meça antes de otimizar
- Documente otimizações não óbvias

## Revisão antes de entregar código
- [ ] Sem credenciais hardcoded
- [ ] Inputs validados
- [ ] Erros tratados
- [ ] Funções testáveis
- [ ] Segue os padrões acima
