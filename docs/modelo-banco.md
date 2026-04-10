# Modelo de Banco de Dados — ObrasApp

## Tecnologia
PostgreSQL 15 via Supabase — SQL puro, sem ORM, migrations em `supabase/migrations/`

---

## Diagrama de entidades (simplificado)

```
Empresa
  └── N Obras
        ├── N Usuários (via obra_usuario)
        ├── N Funcionários
        ├── N Serviços
        ├── N Medições
        │     └── N medicao_historico
        └── N Pagamentos

Empresa
  └── N Usuários (perfil e acesso)

Empresa
  └── N Funcionários (cadastro global da empresa)
```

---

## Schema SQL (MVP)

### EMPRESA

```sql
CREATE TABLE empresa (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  cnpj       TEXT UNIQUE,
  plano      TEXT NOT NULL DEFAULT 'starter',
  status     TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### USUÁRIO — quem acessa o sistema

```sql
-- id referencia auth.users do Supabase (criado pelo Supabase Auth)
CREATE TABLE usuario (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresa(id),
  nome       TEXT NOT NULL,
  perfil     TEXT NOT NULL CHECK (perfil IN ('GESTOR','ENGENHEIRO','FUNCIONARIO','COMPRAS','FINANCEIRO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### OBRA_USUARIO — quais obras cada usuário acessa

```sql
-- Tabela de vínculo (não usar array em usuario — sem FK, sem auditoria)
CREATE TABLE obra_usuario (
  obra_id    UUID NOT NULL REFERENCES obra(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  PRIMARY KEY (obra_id, usuario_id)
);
```

---

### OBRA

```sql
CREATE TABLE obra (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresa(id),
  nome            TEXT NOT NULL,
  endereco        TEXT,
  cliente         TEXT,
  responsavel_id  UUID REFERENCES usuario(id),
  data_inicio     DATE,
  data_prev_fim   DATE,
  status          TEXT NOT NULL DEFAULT 'ativa'
                    CHECK (status IN ('ativa','pausada','encerrada')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### FUNCIONÁRIO — executa serviços (pode não ter login)

```sql
CREATE TABLE funcionario (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresa(id),
  obra_id         UUID REFERENCES obra(id),
  nome            TEXT NOT NULL,
  funcao          TEXT,
  tipo_pagamento  TEXT NOT NULL DEFAULT 'POR_PRODUCAO'
                    CHECK (tipo_pagamento IN ('POR_PRODUCAO','DIARIA','HORA','MISTO')),
  valor_base      NUMERIC(10,2),  -- diária ou hora, se aplicável
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### SERVIÇO — o que pode ser medido em uma obra

```sql
CREATE TABLE servico (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id          UUID NOT NULL REFERENCES obra(id),
  nome             TEXT NOT NULL,
  unidade_medida   TEXT NOT NULL
                     CHECK (unidade_medida IN ('M2','ML','M3','UN','KG','HORA','PECA')),
  valor_pagamento  NUMERIC(10,2) NOT NULL,  -- pago ao funcionário por unidade
  valor_cobranca   NUMERIC(10,2),           -- cobrado do cliente por unidade
  ativo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### MEDIÇÃO — evento central do produto

```sql
CREATE TABLE medicao (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id                   UUID NOT NULL REFERENCES obra(id),
  funcionario_id            UUID NOT NULL REFERENCES funcionario(id),
  servico_id                UUID NOT NULL REFERENCES servico(id),
  data                      DATE NOT NULL DEFAULT CURRENT_DATE,
  quantidade                NUMERIC(10,2) NOT NULL CHECK (quantidade > 0),
  -- valor_calculado calculado no backend: quantidade × servico.valor_pagamento
  valor_calculado           NUMERIC(10,2) NOT NULL,
  valor_cobranca_calculado  NUMERIC(10,2),
  medido_por                UUID NOT NULL REFERENCES usuario(id),
  aprovado_por              UUID REFERENCES usuario(id),
  status                    TEXT NOT NULL DEFAULT 'pendente'
                              CHECK (status IN ('pendente','ativa','corrigida','cancelada','pendente_aprovacao')),
  observacao                TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- NUNCA deletar medições — apenas cancelar com motivo em medicao_historico
```

---

### MEDICAO_HISTORICO — log imutável de alterações

```sql
CREATE TABLE medicao_historico (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id     UUID NOT NULL REFERENCES medicao(id),
  alterado_por   UUID NOT NULL REFERENCES usuario(id),
  data_alteracao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  campo_alterado TEXT NOT NULL,
  valor_anterior TEXT NOT NULL,
  valor_novo     TEXT NOT NULL,
  motivo         TEXT NOT NULL  -- obrigatório, mín. 10 chars validado na API
);
-- Somente INSERT — sem UPDATE, sem DELETE
```

---

### PAGAMENTO

```sql
CREATE TABLE pagamento (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id         UUID NOT NULL REFERENCES obra(id),
  funcionario_id  UUID NOT NULL REFERENCES funcionario(id),
  periodo_inicio  DATE NOT NULL,
  periodo_fim     DATE NOT NULL,
  valor_total     NUMERIC(10,2) NOT NULL,
  data_pagamento  DATE,
  pago_por        UUID REFERENCES usuario(id),
  forma_pagamento TEXT,
  status          TEXT NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente','realizado')),
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Pagamento com status='realizado' é imutável (RN-011)
```

---

## Índices (performance)

```sql
-- Medições por obra + período (query mais frequente)
CREATE INDEX idx_medicao_obra_data ON medicao(obra_id, data);

-- Medições por funcionário
CREATE INDEX idx_medicao_funcionario ON medicao(funcionario_id, data);

-- Pagamentos por funcionário + obra
CREATE INDEX idx_pagamento_func_obra ON pagamento(funcionario_id, obra_id);

-- Isolamento por empresa
CREATE INDEX idx_obra_empresa ON obra(empresa_id);
CREATE INDEX idx_funcionario_empresa ON funcionario(empresa_id);
```

---

## RLS — Row Level Security

```sql
-- Ativar em todas as tabelas (DENY ALL por padrão)
ALTER TABLE empresa          ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario          ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra             ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra_usuario     ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionario      ENABLE ROW LEVEL SECURITY;
ALTER TABLE servico          ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicao          ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicao_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamento        ENABLE ROW LEVEL SECURITY;

-- Exemplo: usuário só vê obras da sua empresa
CREATE POLICY "obra_empresa" ON obra
  FOR ALL USING (
    empresa_id = (SELECT empresa_id FROM usuario WHERE id = auth.uid())
  );

-- Usuário só vê obras às quais está vinculado (exceto GESTOR — vê todas)
CREATE POLICY "obra_usuario_acesso" ON obra
  FOR SELECT USING (
    id IN (SELECT obra_id FROM obra_usuario WHERE usuario_id = auth.uid())
    OR (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'GESTOR'
  );
```

---

## Regras de integridade

1. `medicao_historico` — append-only: sem UPDATE, sem DELETE
2. `medicao` — nunca deletar; cancelar com `status = 'cancelada'` + registro em historico
3. `pagamento` com `status = 'realizado'` — imutável (RN-011)
4. `valor_calculado` — sempre calculado no backend: `quantidade × servico.valor_pagamento`
5. Isolamento por `empresa_id` obrigatório em todas as queries (RLS)
