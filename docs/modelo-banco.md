# Modelo de Banco de Dados — ObrasApp

## Tecnologia
PostgreSQL 15 + Prisma ORM

---

## Diagrama de entidades (simplificado)

```
Empresa
  └── N Obras
        ├── N Funcionários (via ObraFuncionario)
        ├── N Serviços
        ├── N Medições
        │     └── N HistoricoMedicao
        ├── N MovimentacaoMaterial
        └── N Pagamentos

Empresa
  └── N Usuários (com perfil e obras vinculadas)

Empresa
  └── N Funcionários (cadastro global da empresa)
```

---

## Schema Prisma (MVP)

```prisma
// ─────────────────────────────────────────────
// EMPRESA
// ─────────────────────────────────────────────
model Empresa {
  id         String   @id @default(cuid())
  nome       String
  cnpj       String?  @unique
  plano      String   @default("trial")
  ativo      Boolean  @default(true)
  criadoEm   DateTime @default(now())

  obras      Obra[]
  usuarios   Usuario[]
  funcionarios Funcionario[]
}

// ─────────────────────────────────────────────
// USUÁRIO (quem acessa o sistema)
// ─────────────────────────────────────────────
model Usuario {
  id           String   @id @default(cuid())
  empresaId    String
  nome         String
  email        String   @unique
  senhaHash    String
  perfil       Perfil
  ativo        Boolean  @default(true)
  criadoEm    DateTime @default(now())

  empresa      Empresa  @relation(fields: [empresaId], references: [id])
  obrasVinculadas ObraUsuario[]
  medicoesFetas   Medicao[]     @relation("MedidoPor")
  medicoesAprovadas Medicao[]   @relation("AprovadoPor")
  historicos      HistoricoMedicao[]
  pagamentosLancados Pagamento[]
  refreshTokens   RefreshToken[]
}

enum Perfil {
  GESTOR
  ENGENHEIRO
  FUNCIONARIO
  COMPRAS
  FINANCEIRO
}

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────
model RefreshToken {
  id         String   @id @default(cuid())
  usuarioId  String
  token      String   @unique
  expiresAt  DateTime
  usado      Boolean  @default(false)
  criadoEm   DateTime @default(now())

  usuario    Usuario  @relation(fields: [usuarioId], references: [id])
}

// ─────────────────────────────────────────────
// OBRA
// ─────────────────────────────────────────────
model Obra {
  id              String      @id @default(cuid())
  empresaId       String
  nome            String
  endereco        String?
  cliente         String?
  dataInicio      DateTime?
  dataPrevFim     DateTime?
  status          StatusObra  @default(ATIVA)
  criadoEm        DateTime    @default(now())

  empresa         Empresa     @relation(fields: [empresaId], references: [id])
  usuarios        ObraUsuario[]
  funcionarios    ObraFuncionario[]
  servicos        Servico[]
  medicoes        Medicao[]
  pagamentos      Pagamento[]
}

enum StatusObra {
  ATIVA
  PAUSADA
  ENCERRADA
}

// ─────────────────────────────────────────────
// OBRA <-> USUÁRIO (quais obras cada usuário vê)
// ─────────────────────────────────────────────
model ObraUsuario {
  obraId    String
  usuarioId String

  obra      Obra    @relation(fields: [obraId], references: [id])
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  @@id([obraId, usuarioId])
}

// ─────────────────────────────────────────────
// FUNCIONÁRIO (executa serviços — pode não ter login)
// ─────────────────────────────────────────────
model Funcionario {
  id              String          @id @default(cuid())
  empresaId       String
  usuarioId       String?         @unique  // se tiver login próprio
  nome            String
  funcao          String?
  tipoPagamento   TipoPagamento   @default(POR_PRODUCAO)
  valorDiaria     Decimal?        // se diária ou misto
  ativo           Boolean         @default(true)
  criadoEm        DateTime        @default(now())

  empresa         Empresa         @relation(fields: [empresaId], references: [id])
  obras           ObraFuncionario[]
  medicoes        Medicao[]
  pagamentos      Pagamento[]
}

enum TipoPagamento {
  POR_PRODUCAO   // 100% calculado pelas medições
  DIARIA         // valor fixo por dia
  HORA           // valor por hora
  MISTO          // diária mínima + produção
}

// ─────────────────────────────────────────────
// OBRA <-> FUNCIONÁRIO
// ─────────────────────────────────────────────
model ObraFuncionario {
  obraId        String
  funcionarioId String
  dataEntrada   DateTime @default(now())
  ativo         Boolean  @default(true)

  obra          Obra        @relation(fields: [obraId], references: [id])
  funcionario   Funcionario @relation(fields: [funcionarioId], references: [id])

  @@id([obraId, funcionarioId])
}

// ─────────────────────────────────────────────
// SERVIÇO (o que pode ser medido em uma obra)
// ─────────────────────────────────────────────
model Servico {
  id                  String        @id @default(cuid())
  obraId              String
  nome                String
  unidade             UnidadeMedida
  valorPagamento      Decimal       // valor pago ao funcionário por unidade
  valorCobranca       Decimal?      // valor cobrado do cliente por unidade
  ativo               Boolean       @default(true)
  criadoEm            DateTime      @default(now())

  obra                Obra          @relation(fields: [obraId], references: [id])
  medicoes            Medicao[]
}

enum UnidadeMedida {
  M2        // metro quadrado
  ML        // metro linear
  M3        // metro cúbico
  UN        // unidade
  KG        // quilograma
  HORA      // hora trabalhada
  PECA      // peça
}

// ─────────────────────────────────────────────
// MEDIÇÃO (evento central do sistema)
// ─────────────────────────────────────────────
model Medicao {
  id                  String         @id @default(cuid())
  obraId              String
  funcionarioId       String
  servicoId           String
  quantidade          Decimal
  valorCalculado      Decimal        // quantidade × valorPagamento do serviço
  valorCobrancaCalc   Decimal?       // quantidade × valorCobranca do serviço
  data                DateTime       @default(now())
  medidoPorId         String
  aprovadoPorId       String?
  status              StatusMedicao  @default(ATIVA)
  observacao          String?
  criadoEm            DateTime       @default(now())
  atualizadoEm        DateTime       @updatedAt

  obra                Obra           @relation(fields: [obraId], references: [id])
  funcionario         Funcionario    @relation(fields: [funcionarioId], references: [id])
  servico             Servico        @relation(fields: [servicoId], references: [id])
  medidoPor           Usuario        @relation("MedidoPor", fields: [medidoPorId], references: [id])
  aprovadoPor         Usuario?       @relation("AprovadoPor", fields: [aprovadoPorId], references: [id])
  historico           HistoricoMedicao[]
}

enum StatusMedicao {
  PENDENTE    // aguardando aprovação
  ATIVA       // aprovada e válida
  CORRIGIDA   // foi corrigida (substituída por nova versão)
  CANCELADA   // cancelada com motivo
}

// ─────────────────────────────────────────────
// HISTÓRICO DE ALTERAÇÃO DE MEDIÇÃO (imutável)
// ─────────────────────────────────────────────
model HistoricoMedicao {
  id              String   @id @default(cuid())
  medicaoId       String
  alteradoPorId   String
  dataAlteracao   DateTime @default(now())
  campoAlterado   String
  valorAnterior   String
  valorNovo       String
  motivo          String   // obrigatório

  medicao         Medicao  @relation(fields: [medicaoId], references: [id])
  alteradoPor     Usuario  @relation(fields: [alteradoPorId], references: [id])
}

// ─────────────────────────────────────────────
// PAGAMENTO
// ─────────────────────────────────────────────
model Pagamento {
  id              String         @id @default(cuid())
  obraId          String
  funcionarioId   String
  periodoInicio   DateTime
  periodoFim      DateTime
  valorTotal      Decimal
  dataPagamento   DateTime?
  status          StatusPagamento @default(PENDENTE)
  formaPagamento  String?
  observacao      String?
  lancadoPorId    String
  criadoEm        DateTime       @default(now())

  obra            Obra            @relation(fields: [obraId], references: [id])
  funcionario     Funcionario     @relation(fields: [funcionarioId], references: [id])
  lancadoPor      Usuario         @relation(fields: [lancadoPorId], references: [id])
}

enum StatusPagamento {
  PENDENTE
  PAGO
  PARCIAL
}
```

---

## Índices importantes (performance)

```sql
-- Medições por obra + período (query mais frequente)
CREATE INDEX idx_medicao_obra_data ON "Medicao"("obraId", "data");

-- Medições por funcionário (área do funcionário)
CREATE INDEX idx_medicao_funcionario ON "Medicao"("funcionarioId", "data");

-- Pagamentos por funcionário + obra
CREATE INDEX idx_pagamento_func_obra ON "Pagamento"("funcionarioId", "obraId");

-- Usuário por email (login)
CREATE UNIQUE INDEX idx_usuario_email ON "Usuario"("email");
```

---

## Regras de integridade

1. `HistoricoMedicao` — nunca deletar, nunca atualizar (append-only)
2. `Medicao` — nunca deletar; cancelar com `status = CANCELADA` e motivo no histórico
3. `Pagamento` com `status = PAGO` — não pode ser editado sem novo histórico
4. Funcionário só aparece em medições de obras às quais está vinculado (`ObraFuncionario`)
5. Usuário só vê obras listadas em `ObraUsuario` (filtro obrigatório em todas as queries)
