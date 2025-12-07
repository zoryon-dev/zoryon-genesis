# Tutorial 06: Banco de Dados com Prisma

Configure um banco PostgreSQL type-safe com Prisma ORM.

---

## O Que Você Vai Aprender

- Configurar Prisma com PostgreSQL
- Criar modelos (schemas)
- Fazer queries type-safe
- Usar migrations

---

## Pré-requisitos

- Projeto criado com Zoryon Genesis
- Banco PostgreSQL (local ou serviço como Supabase, Neon, Railway)

---

## Passo 1: Instalar Prisma

```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
```

---

## Passo 2: Inicializar Prisma

```bash
npx prisma init
```

Isso cria:
- `prisma/schema.prisma` - Schema do banco
- `.env` - Variável DATABASE_URL

---

## Passo 3: Configurar DATABASE_URL

### PostgreSQL Local

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/meu_banco"
```

### Supabase

1. Vá em **Settings** > **Database**
2. Copie **Connection string (URI)**
3. Substitua `[YOUR-PASSWORD]` pela senha

```env
DATABASE_URL="postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres"
```

### Neon

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

## Passo 4: Criar Schema

Edite `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Usuário
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts Post[]

  @@map("users")
}

// Post
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("posts")
}
```

---

## Passo 5: Sincronizar com Banco

### Desenvolvimento (db push)

```bash
pnpm db:push
# ou: npx prisma db push
```

### Produção (migrations)

```bash
pnpm db:migrate
# ou: npx prisma migrate dev --name init
```

---

## Passo 6: Gerar Cliente

```bash
pnpm db:generate
# ou: npx prisma generate
```

---

## Passo 7: Criar Cliente Prisma

Crie `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

> **Por que isso?** Em desenvolvimento, o hot reload cria múltiplas instâncias. Esse padrão evita isso.

---

## Passo 8: Usar Prisma

### Buscar Todos

```typescript
import { prisma } from '@/lib/prisma'

// Em Server Component ou API Route
const users = await prisma.user.findMany()
```

### Buscar Um

```typescript
const user = await prisma.user.findUnique({
  where: { id: 'xxx' }
})
```

### Criar

```typescript
const newUser = await prisma.user.create({
  data: {
    email: 'user@email.com',
    name: 'João Silva'
  }
})
```

### Atualizar

```typescript
const updatedUser = await prisma.user.update({
  where: { id: 'xxx' },
  data: { name: 'Novo Nome' }
})
```

### Deletar

```typescript
await prisma.user.delete({
  where: { id: 'xxx' }
})
```

---

## Exemplo: API Route

```typescript
// src/app/api/users/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/users
export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(users)
}

// POST /api/users
export async function POST(request: Request) {
  const body = await request.json()

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name
    }
  })

  return NextResponse.json(user, { status: 201 })
}
```

---

## Exemplo: Server Component

```tsx
// src/app/users/page.tsx
import { prisma } from '@/lib/prisma'

export default async function UsersPage() {
  const users = await prisma.user.findMany()

  return (
    <div>
      <h1>Usuários</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Relações

### Include (Eager Loading)

```typescript
const userWithPosts = await prisma.user.findUnique({
  where: { id: 'xxx' },
  include: {
    posts: true
  }
})
```

### Select (Campos Específicos)

```typescript
const user = await prisma.user.findUnique({
  where: { id: 'xxx' },
  select: {
    id: true,
    name: true,
    posts: {
      select: {
        title: true
      }
    }
  }
})
```

### Criar com Relação

```typescript
const userWithPost = await prisma.user.create({
  data: {
    email: 'user@email.com',
    name: 'João',
    posts: {
      create: {
        title: 'Meu primeiro post'
      }
    }
  }
})
```

---

## Filtros

### Where

```typescript
const users = await prisma.user.findMany({
  where: {
    email: { contains: '@gmail.com' },
    name: { not: null }
  }
})
```

### Ordenação

```typescript
const posts = await prisma.post.findMany({
  orderBy: [
    { published: 'desc' },
    { createdAt: 'desc' }
  ]
})
```

### Paginação

```typescript
const posts = await prisma.post.findMany({
  skip: 0,    // Offset
  take: 10    // Limit
})
```

---

## Prisma Studio

Visualize e edite dados com interface gráfica:

```bash
pnpm db:studio
# ou: npx prisma studio
```

Acesse http://localhost:5555

---

## Seed (Dados Iniciais)

Crie `prisma/seed.ts`:

```typescript
import { prisma } from '../src/lib/prisma'

async function main() {
  // Limpar dados existentes
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuário de teste
  const user = await prisma.user.create({
    data: {
      email: 'teste@email.com',
      name: 'Usuário Teste',
      posts: {
        create: [
          { title: 'Primeiro post', published: true },
          { title: 'Segundo post', published: false }
        ]
      }
    }
  })

  console.log('Seed concluído:', user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Adicione ao `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Execute:

```bash
pnpm db:seed
# ou: npx prisma db seed
```

---

## Comandos Essenciais

| Comando | Descrição |
|---------|-----------|
| `pnpm db:push` | Sincroniza schema (dev) |
| `pnpm db:generate` | Gera cliente Prisma |
| `pnpm db:studio` | Interface visual |
| `pnpm db:migrate` | Cria migration (prod) |
| `pnpm db:seed` | Popula banco |

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [Auth com Clerk](./04-auth-clerk.md) | Integrar com usuários |
| [Pagamentos com Stripe](./08-pagamentos-stripe.md) | Salvar assinaturas |

---

*Zoryon Genesis - O começo de tudo*
