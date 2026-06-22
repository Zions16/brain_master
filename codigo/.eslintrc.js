module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
  },
  overrides: [
    {
      // Camada de UI (web): `any` em boundaries de libs (axios, react-query, recharts,
      // joins do Supabase) é tolerado como aviso — dívida visível, paga gradualmente.
      // O backend (api) mantém `no-explicit-any` como erro.
      files: ['apps/web/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
}
