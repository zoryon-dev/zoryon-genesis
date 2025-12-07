# Tutorial 05: Autenticação com Supabase

Adicione login integrado com seu banco de dados Supabase.

---

## O Que Você Vai Aprender

- Configurar Supabase Auth
- Criar páginas de login/registro
- Proteger rotas
- Usar Row Level Security (RLS)

---

## Pré-requisitos

- Projeto criado com Zoryon Genesis
- Conta no Supabase: [supabase.com](https://supabase.com) (grátis)

---

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **New project**
3. Preencha:
   - Nome: `meu-projeto`
   - Senha do banco (guarde!)
   - Região: mais próxima de você
4. Clique em **Create new project**
5. Aguarde ~2 minutos

---

## Passo 2: Obter Credenciais

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL**
   - **anon public** key

---

## Passo 3: Configurar Variáveis

Adicione ao `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Passo 4: Instalar Dependências

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

---

## Passo 5: Criar Cliente Supabase

### Cliente para Browser (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Cliente para Servidor (`src/lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore em Server Components
          }
        },
      },
    }
  )
}
```

---

## Passo 6: Configurar Middleware

Crie `src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Atualiza sessão
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas protegidas
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redireciona logado para dashboard
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Passo 7: Página de Login

Crie `src/app/login/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">Entrar</h1>

        {error && (
          <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-3"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-500 p-3 text-white disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="text-center text-gray-500">ou</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded border p-3"
        >
          Continuar com Google
        </button>

        <p className="text-center">
          Não tem conta?{' '}
          <a href="/register" className="text-blue-500">
            Criar conta
          </a>
        </p>
      </form>
    </div>
  )
}
```

---

## Passo 8: Página de Registro

Crie `src/app/register/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Mostra mensagem de verificação
    alert('Verifique seu email para confirmar o cadastro!')
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleRegister} className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">Criar Conta</h1>

        {error && (
          <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-3"
          required
        />

        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-3"
          minLength={6}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-500 p-3 text-white disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>

        <p className="text-center">
          Já tem conta?{' '}
          <a href="/login" className="text-blue-500">
            Entrar
          </a>
        </p>
      </form>
    </div>
  )
}
```

---

## Passo 9: Callback OAuth

Crie `src/app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

---

## Passo 10: Acessar Usuário

### No Servidor

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1>Olá, {user?.email}!</h1>
    </div>
  )
}
```

### No Cliente

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

---

## Passo 11: Logout

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return <button onClick={handleLogout}>Sair</button>
}
```

---

## Row Level Security (RLS)

### Habilitar RLS

```sql
-- No SQL Editor do Supabase
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuários veem apenas seus dados
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Política: usuários podem atualizar seus dados
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### Usar com RLS

```typescript
const supabase = await createClient()

// Automaticamente filtra pelo usuário logado
const { data } = await supabase
  .from('profiles')
  .select('*')
  .single()
```

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [Banco com Supabase](./07-banco-supabase.md) | Usar banco integrado |
| [Pagamentos com Stripe](./08-pagamentos-stripe.md) | Adicionar assinaturas |

---

*Zoryon Genesis - O começo de tudo*
