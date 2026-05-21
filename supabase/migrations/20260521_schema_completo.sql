-- ============================================================
-- Brain Master — Schema completo (Sprints 3, 4 e 5)
-- Executar após 20260408_sprint1_fundacao.sql
-- ============================================================


-- 1. FUNCIONARIO
CREATE TABLE funcionario (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  obra_id        UUID REFERENCES obra(id),
  nome           TEXT NOT NULL,
  funcao         TEXT,
  tipo_pagamento TEXT NOT NULL DEFAULT 'POR_PRODUCAO'
                   CHECK (tipo_pagamento IN ('POR_PRODUCAO','DIARIA','HORA','MISTO')),
  valor_base     NUMERIC(10,2),
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 2. SERVICO
CREATE TABLE servico (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id         UUID NOT NULL REFERENCES obra(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  unidade_medida  TEXT NOT NULL
                    CHECK (unidade_medida IN ('M2','ML','M3','UN','KG','HORA','PECA')),
  valor_pagamento NUMERIC(10,2) NOT NULL,
  valor_cobranca  NUMERIC(10,2),
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. MEDICAO — evento central do produto
-- NUNCA deletar — apenas cancelar com motivo
CREATE TABLE medicao (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id                  UUID NOT NULL REFERENCES obra(id),
  funcionario_id           UUID NOT NULL REFERENCES funcionario(id),
  servico_id               UUID NOT NULL REFERENCES servico(id),
  data                     DATE NOT NULL DEFAULT CURRENT_DATE,
  quantidade               NUMERIC(10,2) NOT NULL CHECK (quantidade > 0),
  valor_calculado          NUMERIC(10,2) NOT NULL,
  valor_cobranca_calculado NUMERIC(10,2),
  medido_por               UUID NOT NULL REFERENCES usuario(id),
  aprovado_por             UUID REFERENCES usuario(id),
  status                   TEXT NOT NULL DEFAULT 'pendente'
                             CHECK (status IN ('pendente','ativa','corrigida','cancelada','pendente_aprovacao')),
  observacao               TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4. MEDICAO_HISTORICO — log imutável (append-only)
CREATE TABLE medicao_historico (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id     UUID NOT NULL REFERENCES medicao(id),
  alterado_por   UUID NOT NULL REFERENCES usuario(id),
  data_alteracao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  campo_alterado TEXT NOT NULL,
  valor_anterior TEXT NOT NULL,
  valor_novo     TEXT NOT NULL,
  motivo         TEXT NOT NULL
);


-- 5. PAGAMENTO
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


-- 6. ÍNDICES
CREATE INDEX idx_funcionario_empresa ON funcionario(empresa_id);
CREATE INDEX idx_funcionario_obra    ON funcionario(obra_id);
CREATE INDEX idx_servico_obra        ON servico(obra_id);
CREATE INDEX idx_medicao_obra_data   ON medicao(obra_id, data);
CREATE INDEX idx_medicao_funcionario ON medicao(funcionario_id, data);
CREATE INDEX idx_pagamento_func_obra ON pagamento(funcionario_id, obra_id);


-- 7. ATIVAR RLS
ALTER TABLE funcionario      ENABLE ROW LEVEL SECURITY;
ALTER TABLE servico           ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicao           ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicao_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamento         ENABLE ROW LEVEL SECURITY;


-- 8. POLICIES — funcionario
CREATE POLICY "funcionario: ve da empresa"
  ON funcionario FOR SELECT
  USING (empresa_id = get_minha_empresa());

CREATE POLICY "funcionario: gestor cria"
  ON funcionario FOR INSERT
  WITH CHECK (
    empresa_id = get_minha_empresa()
    AND get_meu_perfil() = 'GESTOR'
  );

CREATE POLICY "funcionario: gestor atualiza"
  ON funcionario FOR UPDATE
  USING (
    empresa_id = get_minha_empresa()
    AND get_meu_perfil() = 'GESTOR'
  );


-- 9. POLICIES — servico
CREATE POLICY "servico: ve da obra vinculada"
  ON servico FOR SELECT
  USING (obra_vinculada(obra_id) OR get_meu_perfil() IN ('GESTOR','FINANCEIRO'));

CREATE POLICY "servico: gestor cria"
  ON servico FOR INSERT
  WITH CHECK (
    obra_vinculada(obra_id)
    AND get_meu_perfil() = 'GESTOR'
  );

CREATE POLICY "servico: gestor atualiza"
  ON servico FOR UPDATE
  USING (
    obra_vinculada(obra_id)
    AND get_meu_perfil() = 'GESTOR'
  );


-- 10. POLICIES — medicao
CREATE POLICY "medicao: ve da obra vinculada"
  ON medicao FOR SELECT
  USING (obra_vinculada(obra_id) OR get_meu_perfil() IN ('GESTOR','FINANCEIRO'));

CREATE POLICY "medicao: engenheiro e gestor criam"
  ON medicao FOR INSERT
  WITH CHECK (
    obra_vinculada(obra_id)
    AND get_meu_perfil() IN ('ENGENHEIRO','GESTOR')
  );

CREATE POLICY "medicao: engenheiro e gestor atualizam"
  ON medicao FOR UPDATE
  USING (
    obra_vinculada(obra_id)
    AND get_meu_perfil() IN ('ENGENHEIRO','GESTOR')
  );


-- 11. POLICIES — medicao_historico
CREATE POLICY "medicao_historico: ve vinculado"
  ON medicao_historico FOR SELECT
  USING (
    medicao_id IN (
      SELECT id FROM medicao WHERE obra_vinculada(obra_id)
        OR get_meu_perfil() IN ('GESTOR','FINANCEIRO')
    )
  );

CREATE POLICY "medicao_historico: insert auditavel"
  ON medicao_historico FOR INSERT
  WITH CHECK (get_meu_perfil() IN ('ENGENHEIRO','GESTOR'));


-- 12. POLICIES — pagamento
CREATE POLICY "pagamento: gestor e financeiro veem"
  ON pagamento FOR SELECT
  USING (
    obra_vinculada(obra_id)
    AND get_meu_perfil() IN ('GESTOR','FINANCEIRO')
  );

CREATE POLICY "pagamento: funcionario ve o proprio"
  ON pagamento FOR SELECT
  USING (
    funcionario_id IN (
      SELECT id FROM funcionario WHERE empresa_id = get_minha_empresa()
    )
    AND get_meu_perfil() = 'FUNCIONARIO'
  );

CREATE POLICY "pagamento: gestor e financeiro criam"
  ON pagamento FOR INSERT
  WITH CHECK (
    obra_vinculada(obra_id)
    AND get_meu_perfil() IN ('GESTOR','FINANCEIRO')
  );

-- RN-011: pagamento realizado é imutável — UPDATE só permitido enquanto pendente
CREATE POLICY "pagamento: gestor e financeiro atualizam"
  ON pagamento FOR UPDATE
  USING (
    obra_vinculada(obra_id)
    AND get_meu_perfil() IN ('GESTOR','FINANCEIRO')
    AND status = 'pendente'
  );
