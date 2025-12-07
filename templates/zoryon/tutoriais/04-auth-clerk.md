# Tutorial 04: Autenticação com Clerk

Adicione login, registro e gerenciamento de usuários ao seu projeto.

---

## O Que Você Vai Aprender

- Configurar Clerk no projeto
- Adicionar botões de login/logout
- Proteger rotas
- Acessar dados do usuário

---

## Pré-requisitos

- Projeto criado com Zoryon Genesis
- Conta no Clerk: [clerk.com](https://clerk.com) (grátis)

---

## Passo 1: Criar Aplicação no Clerk

1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Clique em **Create application**
3. Escolha um nome: `Meu Projeto`
4. Selecione os métodos de login:
   - ✅ Email
   - ✅ Google
   - ✅ GitHub
5. Clique em **Create application**

---

## Passo 2: Obter Chaves

Na página da aplicação:

1. Vá em **API Keys**
2. Copie as chaves:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

---

## Passo 3: Configurar Variáveis

Adicione ao seu `.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URLs de redirecionamento
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## Passo 4: Instalar Dependências

```bash
pnpm add @clerk/nextjs
```

---

## Passo 5: Configurar Middleware

Crie `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rotas públicas (não precisam de login)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Se não for rota pública, exige autenticação
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

---

## Passo 6: Configurar Provider

Atualize `src/app/layout.tsx`:

```tsx
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

---

## Passo 7: Criar Páginas de Login

### Sign In (`src/app/sign-in/[[...sign-in]]/page.tsx`)

```tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
```

### Sign Up (`src/app/sign-up/[[...sign-up]]/page.tsx`)

```tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  )
}
```

---

## Passo 8: Adicionar Botões de Login

### Componente Header

```tsx
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-xl font-bold">Meu App</h1>

      <nav>
        {/* Mostra quando NÃO está logado */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="mr-2 rounded bg-gray-200 px-4 py-2">
              Entrar
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded bg-blue-500 px-4 py-2 text-white">
              Criar conta
            </button>
          </SignUpButton>
        </SignedOut>

        {/* Mostra quando está logado */}
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>
    </header>
  )
}
```

---

## Passo 9: Acessar Dados do Usuário

### No Servidor (Server Components)

```tsx
import { currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <h1>Olá, {user.firstName}!</h1>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
    </div>
  )
}
```

### No Cliente (Client Components)

```tsx
'use client'

import { useUser } from '@clerk/nextjs'

export function ProfileCard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div>Carregando...</div>
  }

  if (!user) {
    return <div>Não autenticado</div>
  }

  return (
    <div>
      <img src={user.imageUrl} alt="Avatar" />
      <h2>{user.fullName}</h2>
      <p>{user.primaryEmailAddress?.emailAddress}</p>
    </div>
  )
}
```

### Em API Routes

```typescript
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // userId disponível para buscar dados do banco
  return NextResponse.json({ userId })
}
```

---

## Passo 10: Proteger Rotas Específicas

### Via Middleware (já configurado)

Adicione rotas protegidas no matcher:

```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/pricing',  // Adicione rotas públicas aqui
])
```

### Via Componente

```tsx
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'

export default function ProtectedPage() {
  return (
    <>
      <SignedIn>
        <div>Conteúdo protegido</div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
```

---

## Personalização

### Tema Escuro

```tsx
<ClerkProvider
  appearance={{
    baseTheme: dark,
  }}
>
```

### Cores Personalizadas

```tsx
<ClerkProvider
  appearance={{
    variables: {
      colorPrimary: '#3B82F6', // Azul
      colorText: '#1F2937',
      borderRadius: '0.5rem',
    },
  }}
>
```

### Em Português

```tsx
import { ptBR } from '@clerk/localizations'

<ClerkProvider localization={ptBR}>
```

---

## Webhooks (Sincronizar com Banco)

### Configurar Webhook no Clerk

1. Vá em **Webhooks** no dashboard
2. Clique em **Add endpoint**
3. URL: `https://seusite.com/api/webhook/clerk`
4. Eventos: `user.created`, `user.updated`, `user.deleted`
5. Copie o **Signing Secret**

### Criar API Route

```typescript
// src/app/api/webhook/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  const body = await req.text()

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id!,
      'svix-timestamp': svix_timestamp!,
      'svix-signature': svix_signature!,
    }) as WebhookEvent
  } catch {
    return new Response('Erro na verificação', { status: 400 })
  }

  // Processar evento
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name } = evt.data
    // Criar usuário no seu banco
    // await db.user.create({ ... })
  }

  return new Response('OK', { status: 200 })
}
```

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [Banco com Prisma](./06-banco-prisma.md) | Salvar dados do usuário |
| [Pagamentos com Stripe](./08-pagamentos-stripe.md) | Adicionar assinaturas |

---

*Zoryon Genesis - O começo de tudo*
