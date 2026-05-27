-- Popula valor_cobranca_calculado nas medições do seed
-- Executar no Supabase SQL Editor
UPDATE medicao m
SET valor_cobranca_calculado = ROUND(m.quantidade * s.valor_cobranca, 2)
FROM servico s
WHERE m.servico_id = s.id
  AND m.valor_cobranca_calculado IS NULL
  AND s.valor_cobranca IS NOT NULL;
