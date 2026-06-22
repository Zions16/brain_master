-- Sprint 29 — Billing Stripe
-- Adiciona campos de assinatura na tabela empresa

ALTER TABLE empresa
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS stripe_status           TEXT NOT NULL DEFAULT 'sem_plano'
    CHECK (stripe_status IN ('sem_plano','trial','active','past_due','canceled','incomplete')),
  ADD COLUMN IF NOT EXISTS trial_ends_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end      TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresa_stripe_customer  ON empresa(stripe_customer_id)    WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_empresa_stripe_sub       ON empresa(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
