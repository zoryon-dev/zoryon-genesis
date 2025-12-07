# Zory-Guard: Gerador de Middlewares de Proteção

Agente especializado para gerar middlewares de proteção em Next.js 16.

---

## Como Usar

```bash
# Modo interativo
node .zoryon/scripts/zory-guard.mjs

# Modo rápido (security + rate limit)
node .zoryon/scripts/zory-guard.mjs --quick

# Pattern específico
node .zoryon/scripts/zory-guard.mjs --pattern=ratelimit
node .zoryon/scripts/zory-guard.mjs --pattern=security

# Listar patterns
node .zoryon/scripts/zory-guard.mjs --list
```

---

## Patterns Disponíveis

### 1. Rate Limiting

**Limita requisições por IP/usuário para prevenir abuse.**

**Setup:**
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

**Configuração:**
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Algoritmos:**
- **Sliding Window** (recomendado): Mais preciso, evita bursts
- **Fixed Window**: Simples, pode permitir burst no início
- **Token Bucket**: Permite bursts controlados

**Limites Recomendados:**
- Anonymous: 5-10 req/10s
- Authenticated: 20-50 req/10s
- Premium: 100-200 req/10s
- API: 60 req/min
- Auth endpoints: 5 req/min

---

### 2. Security Headers

**Adiciona headers de segurança (CSP, HSTS, etc.).**

**Headers Incluídos:**
- **CSP**: Content-Security-Policy (previne XSS)
- **HSTS**: Strict-Transport-Security (force HTTPS)
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **Referrer-Policy**: Controla informação de referrer
- **Permissions-Policy**: Controla features do browser

**Teste Headers:**
- https://securityheaders.com
- https://observatory.mozilla.org

---

### 3. Auth Middleware

**Protege rotas requerendo autenticação.**

Suporta:
- Clerk
- NextAuth v5
- Custom JWT

---

## Exemplos de Código

### Rate Limiting (Upstash)

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}
```

### Security Headers

```ts
export function middleware(request) {
  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  )

  return response
}
```

### Combined (Security + Rate Limit)

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request) {
  // Security Headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Rate Limiting
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

---

## Best Practices

1. **Sempre retorne Response/NextResponse**
2. **Use matcher para otimizar performance**
3. **Cache quando possível**
4. **Falhe de forma segura (deny by default)**
5. **Teste edge cases**
6. **Monitore 429 responses**
7. **Log eventos importantes**

---

*Zoryon Genesis - O começo de tudo*
