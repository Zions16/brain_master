-- ============================================================
-- Brain Master — Sprint 1: Fundação
-- Executar no Supabase SQL Editor na ordem abaixo
-- ============================================================


-- ============================================================
-- 1. EMPRESA
-- ============================================================

CREATE TABLE empresa (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  cnpj       TEXT UNIQUE,
  plano      TEXT NOT NULL DEFAULT 'starter',
  status     TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. USUARIO
-- ============================================================

CREATE TABLE usuario (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  nome       TEXT NOT NULL,
  perfil     TEXT NOT NULL CHECK (perfil IN ('GESTOR','ENGENHEIRO','FUNCIONARIO','COMPRAS','FINANCEIRO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. OBRA
-- ============================================================

CREATE TABLE obra (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  endereco       TEXT,
  cliente        TEXT,
  responsavel_id UUID REFERENCES usuario(id),
  data_inicio    DATE,
  data_prev_fim  DATE,
  status         TEXT NOT NULL DEFAULT 'ativa'
                   CHECK (status IN ('ativa','pausada','encerrada')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. OBRA_USUARIO — vínculo M:N
-- ============================================================

CREATE TABLE obra_usuario (
  obra_id    UUID NOT NULL REFERENCES obra(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  PRIMARY KEY (obra_id, usuario_id)
);


-- ============================================================
-- 5. ÍNDICES
-- ============================================================

CREATE INDEX idx_usuario_empresa ON usuario(empresa_id);
CREATE INDEX idx_obra_empresa    ON obra(empresa_id);
CREATE INDEX idx_obra_status     ON obra(empresa_id, status);


-- ============================================================
-- 6. FUNÇÕES AUXILIARES — usadas pelas policies
-- Definir ANTES das policies
-- ============================================================

CREATE OR REPLACE FUNCTION get_minha_empresa()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT empresa_id FROM usuario WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_meu_perfil()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT perfil FROM usuario WHERE id = auth.uid()
$$;


-- ============================================================
-- 7. ATIVAR RLS — padrão: DENY ALL
-- ============================================================

ALTER TABLE empresa      ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario      ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra         ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra_usuario ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 8. POLICIES — empresa
-- ============================================================

CREATE POLICY "empresa: ve a propria"
  ON empresa FOR SELECT
  USING (id = get_minha_empresa());


-- ============================================================
-- 9. POLICIES — usuario
-- ============================================================

CREATE POLICY "usuario: ve colegas da empresa"
  ON usuario FOR SELECT
  USING (empresa_id = get_minha_empresa());

CREATE POLICY "usuario: atualiza proprio"
  ON usuario FOR UPDATE
  USING (id = auth.uid());


-- ============================================================
-- 10. POLICIES — obra
-- ============================================================

-- GESTOR e FINANCEIRO veem todas as obras da empresa
CREATE POLICY "obra: gestor financeiro veem todas"
  ON obra FOR SELECT
  USING (
    empresa_id = get_minha_empresa()
    AND get_meu_perfil() IN ('GESTOR', 'FINANCEIRO')
  );

-- ENGENHEIRO e COMPRAS veem apenas obras vinculadas a eles
CREATE POLICY "obra: engenheiro compras veem vinculadas"
  ON obra FOR SELECT
  USING (
    get_meu_perfil() IN ('ENGENHEIRO', 'COMPRAS')
    AND id IN (
      SELECT obra_id FROM obra_usuario WHERE usuario_id = auth.uid()
    )
  );

-- Apenas GESTOR cria obra
CREATE POLICY "obra: gestor cria"
  ON obra FOR INSERT
  WITH CHECK (
    empresa_id = get_minha_empresa()
    AND get_meu_perfil() = 'GESTOR'
  );

-- Apenas GESTOR atualiza obra
CREATE POLICY "obra: gestor atualiza"
  ON obra FOR UPDATE
  USING (
    empresa_id = get_minha_empresa()
    AND get_meu_perfil() = 'GESTOR'
  );


-- ============================================================
-- 11. POLICIES — obra_usuario
-- ============================================================

CREATE POLICY "obra_usuario: ve vinculos da empresa"
  ON obra_usuario FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM obra WHERE empresa_id = get_minha_empresa()
    )
  );

CREATE POLICY "obra_usuario: gestor vincula"
  ON obra_usuario FOR INSERT
  WITH CHECK (get_meu_perfil() = 'GESTOR');

CREATE POLICY "obra_usuario: gestor desvincula"
  ON obra_usuario FOR DELETE
  USING (get_meu_perfil() = 'GESTOR');


-- ============================================================
-- FIM DO SPRINT 1
-- Verifique no Table Editor: 4 tabelas com cadeado (RLS ativo)
-- ============================================================
