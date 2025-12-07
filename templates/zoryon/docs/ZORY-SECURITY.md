# Zory-Security: Agente de Auditoria de Seguranca

O Zory-Security e um agente especializado em auditoria de seguranca para aplicacoes web, baseado no **OWASP Top 10 2025** e melhores praticas de seguranca.

---

## Como Usar

### Modo Interativo

```bash
node .zoryon/scripts/zory-security.mjs
```

### Comandos Diretos

```bash
# Scanner rapido (secrets + vulnerabilidades)
node .zoryon/scripts/zory-security.mjs scan

# Auditoria completa OWASP Top 10
node .zoryon/scripts/zory-security.mjs audit

# Verificar dependencias (npm audit)
node .zoryon/scripts/zory-security.mjs deps

# Verificar security headers
node .zoryon/scripts/zory-security.mjs headers

# Gerar relatorio completo
node .zoryon/scripts/zory-security.mjs report

# Gerar relatorio em JSON
node .zoryon/scripts/zory-security.mjs report --json
```

---

## Modos de Verificacao

| Modo | Comando | Descricao |
|------|---------|-----------|
| **Quick Scan** | `scan` | Verifica secrets e vulnerabilidades de codigo |
| **Full Audit** | `audit` | Auditoria completa baseada no OWASP Top 10 |
| **Dependencies** | `deps` | Executa npm audit e verifica pacotes vulneraveis |
| **Headers** | `headers` | Verifica configuracao de HTTP Security Headers |
| **Report** | `report` | Gera relatorio completo em Markdown ou JSON |

---

## OWASP Top 10 2025

O agente verifica todas as categorias do OWASP Top 10 2025:

| Codigo | Categoria | Verificacoes |
|--------|-----------|--------------|
| A01 | Broken Access Control | Rotas desprotegidas, middleware, RBAC |
| A02 | Cryptographic Failures | Secrets expostos, HTTPS, JWT config |
| A03 | Injection | SQL Injection, XSS, Command Injection |
| A04 | Insecure Design | Arquitetura, validacao de entrada |
| A05 | Security Misconfiguration | Headers HTTP, configuracoes |
| A06 | Vulnerable Components | npm audit, dependencias desatualizadas |
| A07 | Auth Failures | Autenticacao, rate limiting, sessoes |
| A08 | Integrity Failures | Supply chain, integridade de dados |
| A09 | Logging Failures | Logs de seguranca, dados sensiveis em logs |
| A10 | Exceptional Conditions | Error handling, error boundaries |

---

## Categorias de Verificacao

### SEC-01: Secrets & API Keys
Detecta vazamento de credenciais no codigo:

- Stripe Keys (`sk_live_*`, `sk_test_*`)
- Clerk Keys
- JWT Tokens
- GitHub Tokens (`ghp_*`, `gho_*`)
- AWS Keys (`AKIA*`)
- Private Keys
- Database URLs
- MongoDB Connection Strings

### SEC-02: Code Vulnerabilities
Detecta padroes vulneraveis:

- `eval()` usage
- `innerHTML` assignment
- `dangerouslySetInnerHTML`
- Command Injection
- SQL Injection
- `document.write`
- `new Function()`

### SEC-03: Dependencies
Verifica dependencias do projeto:

- npm audit (vulnerabilidades conhecidas)
- Lockfile presente
- Pacotes desatualizados
- Pacotes conhecidamente vulneraveis

### SEC-04: Authentication & Authorization
Verifica implementacao de auth:

- Provider de auth configurado (Clerk, NextAuth, etc.)
- Middleware de autenticacao
- Rotas de API protegidas
- Rate limiting implementado
- Configuracao de sessao/JWT

### SEC-05: Input Validation
Verifica validacao de entradas:

- Biblioteca de validacao (Zod, Yup)
- Validacao em API routes
- Sanitizacao de input
- Queries parametrizadas

### SEC-06: Security Headers
Verifica headers HTTP:

- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### SEC-07: Logging & Monitoring
Verifica sistema de logs:

- Biblioteca de logging (Pino, Winston)
- Dados sensiveis em logs
- Error logging
- Audit trail

### SEC-10: Error Handling
Verifica tratamento de erros:

- Error boundaries (`error.tsx`)
- Pagina 404 customizada
- Try-catch em API routes

---

## Niveis de Severidade

| Nivel | Icone | Descricao |
|-------|-------|-----------|
| **Critical** | :red_circle: | Risco critico - corrigir imediatamente |
| **High** | :orange_circle: | Risco alto - corrigir antes do deploy |
| **Medium** | :yellow_circle: | Risco medio - planejar correcao |
| **Low** | :green_circle: | Risco baixo - melhorar quando possivel |
| **Info** | :blue_circle: | Informativo - recomendacao |

---

## Integracao com Git Hooks

O scanner de seguranca ja esta integrado ao pre-commit hook:

```bash
# .husky/pre-commit
pnpm lint
pnpm typecheck
node .zoryon/security/scan.mjs  # Scanner existente
```

Para usar o agente completo no pre-commit:

```bash
# Adicione ao .husky/pre-commit
node .zoryon/scripts/zory-security.mjs scan
```

---

## Ignorando Falsos Positivos

### Inline Comments

```javascript
// Ignorar linha especifica
const example = "sk_test_exemplo123" // zoryon-ignore

// Ignorar proxima linha
// zoryon-ignore-next-line
const token = "eyJhbGciOiJIUzI1NiJ9..."

// Ignorar arquivo inteiro (no topo do arquivo)
// zoryon-ignore-file
```

### Whitelist Global

Configure em `.zoryon/security/whitelist.json`:

```json
{
  "ignorarArquivos": [
    "**/*.md",
    "**/*.txt",
    ".env.example"
  ],
  "ignorarDiretorios": [
    "node_modules",
    ".git",
    ".next"
  ],
  "ignorarRegras": {
    "README.md": ["*"],
    "docs/**": ["*"]
  },
  "ignorarPadroes": [
    {
      "pattern": "sk_test_exemplo",
      "motivo": "Exemplo ilustrativo"
    }
  ]
}
```

---

## Relatorios

### Markdown Report

```bash
node .zoryon/scripts/zory-security.mjs report
# Salva em: .zoryon/reports/security-audit.md
```

### JSON Report

```bash
node .zoryon/scripts/zory-security.mjs report --json
# Salva em: .zoryon/reports/security-audit.json
```

### Estrutura do Relatorio

```
# Zoryon Security Audit Report

## Resumo por Severidade
- Critical: X
- High: X
- Medium: X
- Low: X
- Info: X

## Resumo por OWASP Top 10
- A01: Broken Access Control - X issues
- A02: Cryptographic Failures - X issues
...

## Detalhes das Issues
### Secrets
- Issue 1
- Issue 2

### Vulnerabilities
...
```

---

## Melhores Praticas Implementadas

### Security Headers Recomendados

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'"
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
```

### Validacao com Zod

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return Response.json(
      { error: result.error.flatten() },
      { status: 400 }
    )
  }

  // result.data is typed and validated
}
```

### Rate Limiting com Upstash

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
}
```

---

## Integracao com Git Hooks (Husky)

O scanner de segurança está integrado aos Git Hooks para prevenir commits inseguros.

### Pre-commit Hook

Roda automaticamente antes de cada commit:

```bash
# .husky/pre-commit
echo "🔒 Segurança..."
node .zoryon/security/scan.mjs || {
  echo "\n❌ Problemas de segurança detectados."
  exit 1
}
```

### Como funciona

1. **Antes do commit:** Hook `pre-commit` executa
2. **Scanner roda:** Verifica secrets e vulnerabilidades
3. **Se encontrar problemas:** Bloqueia o commit
4. **Se tudo ok:** Permite o commit

### Benefícios

- ✅ Previne vazamento de secrets
- ✅ Garante código seguro
- ✅ Não depende da memória do dev
- ✅ Automático em todo commit

### Pular validação (emergências)

```bash
# Só use se tiver certeza!
git commit -m "mensagem" --no-verify
```

> **📖 Mais sobre Git Hooks:** Ver `.zoryon/docs/ZORY-HUSKY.md`

---

## Fontes de Pesquisa

O agente foi desenvolvido baseado em:

- [OWASP Top 10 2025](https://owasp.org/Top10/)
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/pages/guides/content-security-policy)
- [NPM Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html)
- [Node.js Security Resources](https://github.com/lirantal/awesome-nodejs-security)

---

## Arquitetura de Arquivos

```
.zoryon/
├── security/
│   ├── scan.mjs              # Scanner original (pre-commit)
│   ├── config.json           # Configuracao do agente
│   ├── whitelist.json        # Whitelist de falsos positivos
│   ├── hooks.json            # Configuracao de Git Hooks
│   ├── hooks/                # Templates de Git Hooks
│   │   ├── pre-commit        # Hook de pre-commit
│   │   ├── commit-msg        # Hook de validacao de mensagem
│   │   └── pre-push          # Hook de pre-push
│   ├── rules/
│   │   ├── secrets.json      # Regras de secrets
│   │   └── vulnerabilities.json
│   └── checks/
│       ├── dependencies.json # Verificacoes de deps
│       ├── headers.json      # Verificacoes de headers
│       ├── authentication.json
│       ├── input-validation.json
│       └── logging.json
├── scripts/
│   └── zory-security.mjs     # CLI principal
├── reports/
│   ├── security-audit.md     # Relatorio Markdown
│   └── security-audit.json   # Relatorio JSON
└── docs/
    ├── ZORY-SECURITY.md      # Esta documentacao
    └── ZORY-HUSKY.md         # Documentacao Git Hooks
```

---

## CLI Options

| Opcao | Descricao |
|-------|-----------|
| `--help`, `-h` | Mostra ajuda |
| `--json` | Saida em formato JSON |
| `--verbose` | Saida detalhada |
| `--fix` | Mostra sugestoes de correcao |

---

*Zoryon Genesis - O comeco de tudo*
