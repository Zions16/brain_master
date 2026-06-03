# Templates de Prompt — Brain Master

Usar estes templates antes de qualquer tarefa de código.
Prompts vagos = retrabalho = crédito desperdiçado.

---

## Template padrão (código)

```
Arquivo: [caminho exato relativo ao monorepo]
Problema: [descrição exata do que está errado ou faltando]
Regra de negócio: [o que deve acontecer segundo a lógica do produto]
Restrição: [o que NÃO pode mudar / efeitos colaterais proibidos]
Output esperado: [código / diff / apenas explicação]
```

### Exemplo real
```
Arquivo: apps/api/src/modules/medicoes/medicoes.service.ts
Problema: criarMedicao não verifica se o funcionario_id pertence à obra antes de inserir
Regra de negócio: funcionário só pode ser medido em obra onde está vinculado
Restrição: não alterar a interface da função nem o schema do banco
Output esperado: diff com a verificação adicionada antes do insert
```

---

## Template — bug

```
Onde acontece: [tela / endpoint / componente]
Comportamento atual: [o que está fazendo]
Comportamento esperado: [o que deveria fazer]
Passos para reproduzir: [1. faça isso 2. veja aquilo]
Stack/erro (se houver): [colar aqui]
```

---

## Template — nova feature

```
Feature: [nome curto]
Fase do roadmap: [1/2/3/4]
Dor que resolve: [qual problema do usuário]
Entidades envolvidas: [obra / funcionario / medicao / etc]
Perfis que acessam: [GESTOR / ENGENHEIRO / FUNCIONARIO]
RLS necessário: [sim/não — descrever regra]
Dependências: [o que precisa estar pronto antes]
```

---

## Template — revisão de segurança

```
Arquivo ou módulo: [caminho]
O que revisar: [RLS / autenticação / validação / exposição de dados]
Perfil de risco: [dado sensível? valor financeiro? multiempresa?]
```

---

## Template — consulta técnica (sem código)

```
Contexto: [onde estou no projeto]
Dúvida: [pergunta objetiva]
Já tentei: [o que já foi tentado/descartado]
Resposta esperada: [explicação / decisão / comparação de opções]
```

---

## Regras de uso

1. **Sempre usar template** antes de pedir código
2. **`/clear` antes de cada nova tarefa** — nunca deixar contexto de tarefa anterior contaminar
3. **Separar "explica" de "faz"** — primeiro entenda, depois execute
4. **Sessões de 3-4 tarefas no máximo** — depois encerra e abre nova com `ultima-sessao.md` atualizado
5. **Especificar caminho exato** — nunca "o arquivo de medição", sempre `apps/api/src/modules/medicoes/medicoes.service.ts`
