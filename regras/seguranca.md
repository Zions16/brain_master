# Regras de Segurança — ObrasApp

## OBRIGATÓRIO — Leia antes de qualquer código

### Dados sensíveis
- NUNCA exponha dados de usuários em logs
- NUNCA armazene senhas em texto plano (use bcrypt ou argon2)
- NUNCA commite .env, tokens, chaves de API no GitHub
- SEMPRE use variáveis de ambiente para credenciais
- SEMPRE adicione .env ao .gitignore antes do primeiro commit

### Autenticação
- Use JWT com expiração curta (máx 1h access token)
- Use refresh tokens com rotação
- Implemente rate limiting em todas as rotas de auth
- Bloqueie após 5 tentativas de login falhas

### API e Backend
- Valide e sanitize TODOS os inputs (nunca confie no cliente)
- Use HTTPS obrigatório em produção
- Implemente CORS restritivo (somente origens conhecidas)
- Nunca exponha stack traces ao usuário final
- Use helmet.js (Node) ou equivalente

### Banco de Dados
- Use prepared statements / ORM (nunca SQL raw com input do usuário)
- Princípio do menor privilégio: usuário do DB só acessa o necessário
- Faça backup automático

### Código
- Nunca faça push direto na branch main
- Toda feature em branch separada + PR
- Revise dependências antes de instalar (npm audit)
- Mantenha dependências atualizadas

### Checklist antes de qualquer deploy
- [ ] .env não está no repositório
- [ ] Variáveis de produção configuradas no servidor
- [ ] Logs não expõem dados sensíveis
- [ ] Rate limiting ativo
- [ ] HTTPS configurado
