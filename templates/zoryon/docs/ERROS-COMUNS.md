# Erros Comuns e Soluções

Guia rápido para resolver problemas frequentes.

---

## Erro: "Module not found"

**Problema:** Dependência não instalada

**Solução:**
```bash
pnpm install
```

---

## Erro: "NEXT_PUBLIC_* is undefined"

**Problema:** Variável de ambiente não configurada

**Solução:**
1. Verifique se o `.env` existe: `ls -la .env`
2. Verifique se a variável está definida no `.env`
3. Reinicie o servidor: `pnpm dev`

> **Importante:** Variáveis que começam com `NEXT_PUBLIC_` são expostas ao browser. Reinicie o servidor após alterá-las.

---

## Erro: "Prisma: Database connection failed"

**Problema:** Banco de dados não conectado

**Solução:**
1. Verifique a `DATABASE_URL` no `.env`
2. Certifique-se que o banco está rodando
3. Execute: `pnpm db:push`

**Formato da URL:**
```
postgresql://usuario:senha@host:5432/nome_banco
```

---

## Erro: "Clerk: Missing publishable key"

**Problema:** Chaves do Clerk não configuradas

**Solução:**
1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Vá em API Keys
3. Copie as chaves
4. Cole no `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
5. Reinicie o servidor

---

## Erro: "Port 3000 is already in use"

**Problema:** Outra aplicação usando a porta

**Solução:**
```bash
# Opção 1: Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Opção 2: Usar outra porta
pnpm dev -- -p 3001
```

---

## Erro: "Git pre-commit hook failed"

**Problema:** Código não passou na validação

**Solução:**
```bash
# Ver erros de lint
pnpm lint

# Corrigir automaticamente
pnpm lint --fix

# Ver erros de tipo
pnpm typecheck
```

---

## Erro: "Cannot find module 'xyz'"

**Problema:** Módulo não instalado ou cache corrompido

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Erro: "Hydration failed"

**Problema:** HTML do servidor diferente do cliente

**Causas comuns:**
- Usar `Date.now()` ou `Math.random()` sem useEffect
- Extensões do browser modificando o DOM
- Conteúdo dinâmico sem 'use client'

**Solução:**
```tsx
'use client'
import { useEffect, useState } from 'react'

export function ComponenteDinamico() {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  if (!montado) return null

  return <div>{/* conteúdo dinâmico */}</div>
}
```

---

## Erro: "TypeError: fetch failed"

**Problema:** API não acessível ou CORS

**Solução:**
1. Verifique se a API está rodando
2. Verifique a URL no `.env`
3. Para APIs externas, use route handlers do Next.js

---

## Erro: "EACCES: permission denied"

**Problema:** Sem permissão para escrever

**Solução:**
```bash
# Verificar permissões
ls -la

# Corrigir permissões (cuidado!)
sudo chown -R $(whoami) .
```

---

## Performance Lenta no Dev

**Problema:** Desenvolvimento travando

**Soluções:**
1. Use Turbopack: `pnpm dev --turbo`
2. Feche abas desnecessárias do browser
3. Verifique se não há loops infinitos

---

## Build Falha na Vercel

**Problemas comuns:**

1. **Variáveis de ambiente:** Configure no dashboard da Vercel
2. **Versão do Node:** Especifique em `package.json`:
   ```json
   "engines": { "node": ">=18" }
   ```
3. **Tipos faltando:** Execute `pnpm typecheck` localmente

---

## Ainda com Problemas?

Peça ajuda para a IA:

> "Estou com o erro [cole o erro aqui]. Me ajude a resolver."

Ou abra uma issue no repositório do projeto.

---

*Zoryon Genesis - O começo de tudo*
