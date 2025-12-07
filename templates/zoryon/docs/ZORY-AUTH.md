# Zory-Auth: Agente de Configuração de Autenticação

O Zory-Auth é um agente especializado em configurar autenticação em aplicações Next.js 16, oferecendo suporte para múltiplos providers.

---

## Como Usar

### Modo Interativo

```bash
node .zoryon/scripts/zory-auth.mjs
```

### Comandos Diretos

```bash
# Modo rápido com Clerk
node .zoryon/scripts/zory-auth.mjs --quick

# Escolher provider específico
node .zoryon/scripts/zory-auth.mjs --provider=clerk
node .zoryon/scripts/zory-auth.mjs --provider=nextauth
node .zoryon/scripts/zory-auth.mjs --provider=custom

# Listar providers disponíveis
node .zoryon/scripts/zory-auth.mjs --list
```

---

## Providers Disponíveis

### 1. Clerk

**Melhor para:** SaaS, B2B, Multi-tenancy, Prototipagem rápida

**Características:**
- ✅ UI pré-construída e customizável
- ✅ Multi-tenancy built-in (Organizations)
- ✅ Dashboard de gerenciamento
- ✅ Webhooks para sincronização
- ✅ Social logins fácil configuração
- ✅ MFA built-in (TOTP, SMS)

**Pricing:** Freemium (5,000 MAU grátis)

**Complexidade:** Baixa

**Instalação:**
```bash
pnpm add @clerk/nextjs
```

**Variáveis de Ambiente:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Arquivos Gerados:**
- `middleware.ts` - Proteção de rotas
- `app/sign-in/[[...sign-in]]/page.tsx` - Página de login
- `app/sign-up/[[...sign-up]]/page.tsx` - Página de cadastro

**Setup Rápido:**
1. Crie conta em [clerk.com](https://clerk.com)
2. Crie aplicação no dashboard
3. Copie chaves para `.env.local`
4. Adicione `<ClerkProvider>` no `app/layout.tsx`
5. Configure rotas públicas no `middleware.ts`

**Exemplo de Uso (Server Component):**
```tsx
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Dashboard() {
  const { userId } = auth()
  const user = await currentUser()

  if (!userId) {
    redirect('/sign-in')
  }

  return <div>Welcome {user?.firstName}</div>
}
```

**Exemplo de Uso (Client Component):**
```tsx
'use client'
import { useUser } from '@clerk/nextjs'

export default function Profile() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div>Loading...</div>

  return <div>{user?.emailAddresses[0]?.emailAddress}</div>
}
```

---

### 2. NextAuth.js v5 (Auth.js)

**Melhor para:** Controle total, Custom auth flows, Self-hosted, Budget limitado

**Características:**
- ✅ Open-source (grátis)
- ✅ Múltiplos providers (OAuth, Email, Credentials)
- ✅ Database adapters (Prisma, Drizzle)
- ✅ JWT ou Database sessions
- ✅ Edge-compatible
- ✅ Callbacks poderosos

**Pricing:** Grátis (open-source)

**Complexidade:** Média

**Instalação:**
```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

**Variáveis de Ambiente:**
```env
AUTH_SECRET=your-secret-here  # gere com: openssl rand -base64 32
AUTH_URL=http://localhost:3000

# Para OAuth providers
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

**Arquivos Gerados:**
- `auth.ts` - Configuração central
- `middleware.ts` - Proteção de rotas
- `app/api/auth/[...nextauth]/route.ts` - Route handlers
- `prisma/schema.prisma` - Schema do banco (opcional)

**Setup:**
1. Gere `AUTH_SECRET`: `openssl rand -base64 32`
2. Configure providers OAuth (Google, GitHub, etc.)
3. Adicione credenciais ao `.env.local`
4. Se usar Prisma: `pnpm db:push`
5. Customize callbacks em `auth.ts`

**Exemplo de Configuração:**
```ts
// auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
})
```

**Exemplo de Uso (Server Component):**
```tsx
import { auth } from '@/auth'

export default async function Dashboard() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <div>Welcome {session.user.name}</div>
}
```

**Exemplo de Uso (Client Component):**
```tsx
'use client'
import { useSession, signOut } from 'next-auth/react'

export default function Profile() {
  const { data: session } = useSession()

  return (
    <div>
      <p>{session?.user?.email}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}
```

---

### 3. Custom Auth (JWT)

**Melhor para:** Requisitos únicos, High security, Compliance específico

**Características:**
- ✅ Controle total sobre fluxo
- ✅ Zero vendor lock-in
- ✅ Custom business logic
- ✅ Performance otimizada
- ❌ Requer implementação completa
- ❌ Maior complexidade

**Pricing:** Grátis

**Complexidade:** Alta

**Dependências Recomendadas:**
```bash
pnpm add jose bcryptjs zod
pnpm add -D @types/bcryptjs
```

**Componentes Necessários:**
1. **JWT Generation/Validation** - `lib/jwt.ts`
2. **Password Hashing** - bcryptjs (rounds >= 10)
3. **Session Management** - Cookies seguros
4. **Middleware** - Validação de tokens
5. **Database Schema** - Tabela users

**Exemplo de Implementação será fornecido na documentação completa.**

---

## Comparação de Providers

| Feature | Clerk | NextAuth v5 | Custom |
|---------|-------|-------------|--------|
| **Setup** | 5 min | 15-30 min | 2-4 horas |
| **Custo** | Freemium | Grátis | Grátis |
| **UI Pronta** | ✅ Sim | ❌ Não | ❌ Não |
| **Customização** | Média | Alta | Total |
| **Multi-tenancy** | ✅ Built-in | Manual | Manual |
| **MFA** | ✅ Built-in | Manual | Manual |
| **Edge Compatible** | ✅ Sim | ✅ Sim | ✅ Sim |
| **Vendor Lock-in** | Alto | Baixo | Zero |

---

## Arquitetura de Autenticação Next.js 16

### Middleware (`middleware.ts`)

O middleware roda no Edge Runtime e protege rotas antes do acesso:

```ts
// Com Clerk
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

```ts
// Com NextAuth
import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isPublicRoute = ['/login', '/register'].includes(req.nextUrl.pathname)

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Layout Provider

```tsx
// Com Clerk
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

```tsx
// Com NextAuth (requer 'use client')
'use client'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

### Server Components vs Client Components

**Server Components (preferível):**
- Autenticação validada no servidor
- Mais seguro
- Melhor performance
- Use `auth()` (Clerk) ou `auth()` (NextAuth)

**Client Components:**
- Interatividade (sign out button, etc.)
- Use `useUser()` (Clerk) ou `useSession()` (NextAuth)

---

## Best Practices de Segurança

### 1. HTTPS Obrigatório

```env
# Produção
NODE_ENV=production
AUTH_URL=https://yourdomain.com  # HTTPS!
```

### 2. Cookies Seguros

```ts
// NextAuth
export const { handlers, auth } = NextAuth({
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        secure: true, // HTTPS only
        sameSite: 'lax',
        path: '/',
      },
    },
  },
})
```

### 3. CSRF Protection

- Clerk: Built-in
- NextAuth: Built-in (via cookies)
- Custom: Implemente tokens CSRF

### 4. Rate Limiting

```ts
// middleware.ts com rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export default async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // Continue com auth middleware
}
```

### 5. Validação de Input

```ts
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

// Use em API routes
export async function POST(req: Request) {
  const body = await req.json()
  const validatedData = loginSchema.parse(body) // throws se inválido
  // ...
}
```

### 6. Password Hashing

```ts
import bcrypt from 'bcryptjs'

// NUNCA menos que 10 rounds
const SALT_ROUNDS = 12

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}
```

### 7. Session Timeout

```ts
// NextAuth
export const { handlers, auth } = NextAuth({
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
})
```

### 8. Logging de Eventos

```ts
// Após login bem-sucedido
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'USER_LOGIN',
    ip: request.ip,
    userAgent: request.headers.get('user-agent'),
  },
})
```

---

## Integrações Comuns

### Com Prisma (NextAuth)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Webhooks (Clerk)

```ts
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  const svix_id = headers().get('svix-id')
  const svix_timestamp = headers().get('svix-timestamp')
  const svix_signature = headers().get('svix-signature')

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  const evt = wh.verify(body, {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  })

  if (evt.type === 'user.created') {
    await prisma.user.create({
      data: {
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name} ${evt.data.last_name}`,
      },
    })
  }

  return new Response('Webhook received', { status: 200 })
}
```

---

## Troubleshooting

### Clerk: "Invalid publishable key"

**Causa:** Chave pública incorreta ou não configurada.

**Solução:**
```bash
# Verifique .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...  # deve começar com pk_
```

### NextAuth: "Missing secret"

**Causa:** `AUTH_SECRET` não configurado.

**Solução:**
```bash
# Gere secret
openssl rand -base64 32

# Adicione ao .env.local
AUTH_SECRET=your-generated-secret
```

### NextAuth: "Callback URL mismatch"

**Causa:** OAuth app configurado com URL diferente.

**Solução:**
- Google OAuth: `http://localhost:3000/api/auth/callback/google`
- GitHub OAuth: `http://localhost:3000/api/auth/callback/github`

### Session não persiste

**Causa:** Cookies bloqueados ou configuração incorreta.

**Solução:**
- Verifique se está em HTTPS (produção)
- Verifique `sameSite` e `secure` cookies
- Limpe cache do browser

---

*Zoryon Genesis - O começo de tudo*
