-- Sprint 14: orçamento por obra + token de acesso do funcionário

-- Orçamento da obra
ALTER TABLE obra
  ADD COLUMN IF NOT EXISTS valor_contrato NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS lucro_esperado NUMERIC(12,2);

-- Token de acesso único para funcionário (login sem senha)
ALTER TABLE funcionario
  ADD COLUMN IF NOT EXISTS token_acesso TEXT UNIQUE;

-- Gerar tokens para funcionários já cadastrados
UPDATE funcionario
SET token_acesso = 'FUN-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 5))
WHERE token_acesso IS NULL;
