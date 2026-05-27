-- Sprint 14b: token de acesso para engenheiros (login sem senha, igual funcionário)
ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS token_acesso TEXT UNIQUE;

-- Gerar tokens ENG-XXXXX para engenheiros já cadastrados
UPDATE usuario
SET token_acesso = 'ENG-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 5))
WHERE perfil = 'ENGENHEIRO' AND token_acesso IS NULL;
