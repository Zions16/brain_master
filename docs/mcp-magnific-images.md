# MCP — magnific-images

## Status
**Pronto para usar** — aguardando API key do Magnific

## O que é
Servidor MCP em TypeScript que conecta o Claude a um banco local de imagens e à API do Magnific (Freepik) para geração e upscaling de imagens diretamente durante o desenvolvimento de websites.

## Localização
```
~/magnific-mcp/          ← código fonte + build
~/.mcp/images/           ← banco local de imagens (criado no primeiro uso)
  ├── generated/         ← imagens geradas por prompt
  ├── upscaled/          ← imagens com upscaling
  ├── imported/          ← imagens importadas de URL
  └── index.json         ← metadados
```

## Tools disponíveis

| Tool | Descrição |
|------|-----------|
| `generate_image` | Gera imagem por prompt — modelo `classic` (rápido) ou `flux` (qualidade alta) |
| `upscale_image` | Upscaling Magnific — modo `precision` (fiel) ou `creative` (adiciona detalhes) |
| `list_images` | Lista banco com filtros por tipo |
| `search_images` | Busca por prompt, filename ou tags |
| `get_image` | Detalhes + base64 de uma imagem |
| `import_image` | Baixa imagem de URL e salva no banco |
| `delete_image` | Remove do banco + arquivo |

## Como ativar

### 1 — Obter API key
Acessar: https://www.magnific.com/api  
Criar conta ou fazer login → seção de API keys.  
A API do Magnific é **separada** do plano Pro — tem cobrança por uso.

### 2 — Configurar Claude Desktop
Editar: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "magnific-images": {
      "command": "node",
      "args": ["/Users/keilasilva/magnific-mcp/dist/index.js"],
      "env": {
        "FREEPIK_API_KEY": "SUA_KEY_AQUI"
      }
    }
  }
}
```

### 3 — Reiniciar Claude Desktop

## Como recompilar após edições
```bash
cd ~/magnific-mcp && npm run build
```

## API usada
- Base URL: `https://api.freepik.com/v1/ai`
- Auth header: `x-freepik-api-key`
- Endpoints:
  - `POST /text-to-image` — geração clássica (síncrona)
  - `POST /text-to-image/flux-pro-v1-1` — Flux Pro (async + polling)
  - `POST /image-upscaler-precision-v2` — Magnific upscale (async + polling)
  - `POST /image-upscaler` — upscale criativo (async + polling)

## Notas técnicas
- Polling timeout: 3 minutos por tarefa async
- Imagens salvas como `.jpg` com UUID no filename
- Index JSON atualizado a cada operação
- Erros da API retornados como tool result com `isError: true`
