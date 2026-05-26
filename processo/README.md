# Processo — Brain Master

Esta pasta documenta **como** o projeto foi construído: métodos tentados, erros encontrados, soluções adotadas e decisões técnicas.

**Objetivo:** evitar repetir erros, economizar tempo de diagnóstico e permitir revisão posterior da eficiência das abordagens.

---

## Estrutura

```
processo/
├── README.md                  ← este arquivo
├── erros-e-solucoes.md        ← log de todos os erros com causa raiz + solução
├── metodos.md                 ← métodos e padrões que funcionaram (referência rápida)
└── sprints/
    ├── sprint-07-web-setup.md
    └── ...
```

---

## Como usar

- **Antes de implementar algo:** leia `metodos.md` para ver se já existe um padrão testado
- **Ao encontrar um erro:** consulte `erros-e-solucoes.md` antes de começar a investigar do zero
- **Ao terminar um sprint:** o agente documenta em `sprints/sprint-XX-nome.md`

---

## Ritual do agente (a partir de 2026-05-26)

Ao **iniciar** cada sessão: ler `processo/erros-e-solucoes.md` e `processo/metodos.md`
Ao **encerrar** cada sessão: atualizar os arquivos com o que foi aprendido naquela sessão
