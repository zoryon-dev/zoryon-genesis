# Tutorial 07: Banco de Dados com Supabase

Use o PostgreSQL gerenciado do Supabase com APIs automáticas.

---

## O Que Você Vai Aprender

- Configurar cliente Supabase
- Criar tabelas
- Fazer queries
- Usar Row Level Security (RLS)
- Realtime subscriptions

---

## Pré-requisitos

- Projeto Supabase criado
- Variáveis de ambiente configuradas

---

## Passo 1: Configuração

Se ainda não configurou, veja o [Tutorial de Auth Supabase](./05-auth-supabase.md) para:
- Criar projeto
- Obter credenciais
- Configurar cliente

---

## Passo 2: Criar Tabelas

### Via Dashboard

1. Acesse **Table Editor**
2. Clique em **New Table**
3. Configure os campos

### Via SQL

Vá em **SQL Editor** e execute:

```sql
-- Tabela de perfis (conectada ao auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX posts_author_id_idx ON posts(author_id);
CREATE INDEX posts_published_idx ON posts(published);
```

---

## Passo 3: Habilitar RLS

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem editar próprio perfil"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Políticas para posts
CREATE POLICY "Qualquer um pode ver posts publicados"
ON posts FOR SELECT
USING (published = true);

CREATE POLICY "Autores podem ver seus próprios posts"
ON posts FOR SELECT
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Autores podem criar posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Autores podem editar seus posts"
ON posts FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Autores podem deletar seus posts"
ON posts FOR DELETE
TO authenticated
USING (author_id = auth.uid());
```

---

## Passo 4: Queries Básicas

### Buscar Todos

```typescript
const supabase = await createClient()

const { data, error } = await supabase
  .from('posts')
  .select('*')

if (error) throw error
console.log(data)
```

### Buscar com Filtros

```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(10)
```

### Buscar Um

```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('id', postId)
  .single()
```

### Criar

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'Novo Post',
    content: 'Conteúdo aqui',
    author_id: userId
  })
  .select()
  .single()
```

### Atualizar

```typescript
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Título Atualizado' })
  .eq('id', postId)
  .select()
  .single()
```

### Deletar

```typescript
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

---

## Passo 5: Relações

### Buscar com Relação

```typescript
// Posts com autor
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles(id, name, avatar_url)
  `)
```

### Foreign Keys Automáticas

O Supabase detecta automaticamente as relações via foreign keys.

---

## Passo 6: Filtros Avançados

```typescript
// Múltiplos filtros
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false })

// Busca por texto
const { data } = await supabase
  .from('posts')
  .select('*')
  .ilike('title', '%react%')

// In (lista de valores)
const { data } = await supabase
  .from('posts')
  .select('*')
  .in('id', ['id1', 'id2', 'id3'])

// Not
const { data } = await supabase
  .from('posts')
  .select('*')
  .not('content', 'is', null)
```

---

## Passo 7: Realtime

### Escutar Mudanças

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimePosts() {
  const [posts, setPosts] = useState([])
  const supabase = createClient()

  useEffect(() => {
    // Buscar posts iniciais
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .then(({ data }) => setPosts(data || []))

    // Escutar mudanças
    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Mudança:', payload)

          if (payload.eventType === 'INSERT') {
            setPosts(prev => [...prev, payload.new])
          }

          if (payload.eventType === 'UPDATE') {
            setPosts(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new : p)
            )
          }

          if (payload.eventType === 'DELETE') {
            setPosts(prev =>
              prev.filter(p => p.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

---

## Passo 8: Storage (Arquivos)

### Upload

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true
  })
```

### Download URL

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`)

console.log(data.publicUrl)
```

### Deletar

```typescript
const { error } = await supabase.storage
  .from('avatars')
  .remove([`${userId}/avatar.png`])
```

---

## Passo 9: Edge Functions

### Criar Function

```bash
supabase functions new hello-world
```

### Código da Function

```typescript
// supabase/functions/hello-world/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { name } = await req.json()

  return new Response(
    JSON.stringify({ message: `Olá, ${name}!` }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### Deploy

```bash
supabase functions deploy hello-world
```

### Chamar

```typescript
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'João' }
})
```

---

## Tipos TypeScript

### Gerar Tipos

```bash
npx supabase gen types typescript --project-id xxx > src/types/database.ts
```

### Usar Tipos

```typescript
import { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type NewPost = Database['public']['Tables']['posts']['Insert']

const { data } = await supabase
  .from('posts')
  .select('*')
  .returns<Post[]>()
```

---

## Exemplo Completo: CRUD

```typescript
// src/lib/posts.ts
import { createClient } from '@/lib/supabase/server'

export async function getPosts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, name)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getPost(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPost(post: {
  title: string
  content: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...post,
      author_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [Auth com Supabase](./05-auth-supabase.md) | Integrar autenticação |
| [Pagamentos com Stripe](./08-pagamentos-stripe.md) | Salvar assinaturas |

---

*Zoryon Genesis - O começo de tudo*
