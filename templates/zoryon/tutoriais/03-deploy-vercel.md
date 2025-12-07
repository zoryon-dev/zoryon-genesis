# Tutorial 03: Deploy na Vercel

Publique seu projeto na internet em 5 minutos.

---

## O Que Você Vai Aprender

- Enviar código para o GitHub
- Fazer deploy na Vercel
- Configurar variáveis de ambiente
- Configurar domínio personalizado

---

## Pré-requisitos

- Conta no GitHub: [github.com](https://github.com)
- Conta na Vercel: [vercel.com](https://vercel.com) (grátis)
- Projeto funcionando localmente

---

## Passo 1: Criar Repositório no GitHub

### Via GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `meu-projeto`
3. Mantenha **Private** ou **Public**
4. **NÃO** adicione README, .gitignore ou license
5. Clique em **Create repository**

---

## Passo 2: Enviar Código

```bash
# Se ainda não iniciou o git
git init
git add .
git commit -m "feat: projeto inicial"

# Conectar ao GitHub
git remote add origin https://github.com/seu-usuario/meu-projeto.git
git branch -M main
git push -u origin main
```

---

## Passo 3: Conectar à Vercel

### Opção A: Via Site

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Conecte sua conta GitHub (se ainda não fez)
4. Selecione seu repositório
5. Clique em **Import**

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel
```

---

## Passo 4: Configurar Variáveis de Ambiente

### Na Tela de Deploy

Antes de clicar em **Deploy**, expanda **Environment Variables** e adicione:

| Variável | Exemplo |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` |
| `CLERK_SECRET_KEY` | `sk_test_...` |

### Depois do Deploy

1. Vá em **Settings** > **Environment Variables**
2. Adicione cada variável
3. Clique em **Save**
4. Faça **Redeploy** para aplicar

---

## Passo 5: Deploy!

1. Clique em **Deploy**
2. Aguarde 2-3 minutos
3. Acesse a URL gerada: `meu-projeto.vercel.app`

---

## Configurar Domínio Personalizado

### Passo 1: Adicionar Domínio

1. Vá em **Settings** > **Domains**
2. Digite seu domínio: `meusite.com.br`
3. Clique em **Add**

### Passo 2: Configurar DNS

A Vercel vai mostrar os registros DNS necessários. Configure no seu provedor:

**Para domínio raiz (meusite.com.br):**
```
Tipo: A
Nome: @
Valor: 76.76.21.21
```

**Para subdomínio (www.meusite.com.br):**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

### Passo 3: Aguardar Propagação

DNS pode levar até 48 horas para propagar, mas geralmente funciona em minutos.

---

## Deploy Automático

A Vercel faz deploy automático a cada push no GitHub:

```bash
# Qualquer commit na main dispara deploy
git add .
git commit -m "feat: nova funcionalidade"
git push
# Deploy automático iniciado!
```

---

## Preview Deploys

Pull Requests geram URLs de preview automáticas:

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Faça suas mudanças
3. Push: `git push -u origin feature/nova-feature`
4. Abra PR no GitHub
5. Vercel gera URL de preview automaticamente

---

## Problemas Comuns

### Build Falhou

**Causa:** Geralmente variável de ambiente faltando

**Solução:**
1. Veja os logs de build
2. Procure por erros de variáveis undefined
3. Adicione as variáveis em Settings > Environment Variables
4. Faça Redeploy

### Página em Branco

**Causa:** Variáveis `NEXT_PUBLIC_*` não configuradas

**Solução:**
1. Configure as variáveis
2. **Importante:** Faça Redeploy (variáveis públicas precisam de rebuild)

### Erro 500

**Causa:** Erro no servidor (banco, API, etc.)

**Solução:**
1. Veja os logs em **Logs** tab
2. Verifique conexão com banco
3. Verifique APIs externas

### Domínio Não Funciona

**Causa:** DNS não propagou ou configuração errada

**Solução:**
1. Verifique configuração DNS
2. Aguarde propagação
3. Use [dnschecker.org](https://dnschecker.org) para verificar

---

## Ambientes

### Production
- Branch: `main`
- URL: `meusite.com.br`

### Preview
- Branch: outras
- URL: `meu-projeto-git-branch-usuario.vercel.app`

### Development
- Local
- URL: `localhost:3000`

---

## Variáveis por Ambiente

Configure variáveis diferentes para cada ambiente:

| Variável | Production | Preview | Development |
|----------|------------|---------|-------------|
| `DATABASE_URL` | Banco prod | Banco staging | Banco local |
| `STRIPE_KEY` | Live key | Test key | Test key |

Na Vercel, selecione o ambiente ao adicionar variáveis.

---

## Dicas de Performance

### 1. Use Cache

```typescript
// Em API routes
export const revalidate = 3600 // Cache por 1 hora
```

### 2. Otimize Imagens

```tsx
import Image from 'next/image'

<Image
  src="/foto.jpg"
  width={800}
  height={600}
  alt="Descrição"
/>
```

### 3. Lazy Loading

```typescript
import dynamic from 'next/dynamic'

const Componente = dynamic(() => import('./Componente'), {
  loading: () => <p>Carregando...</p>
})
```

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [Auth com Clerk](./04-auth-clerk.md) | Adicione login |
| [Pagamentos com Stripe](./08-pagamentos-stripe.md) | Aceite pagamentos |

---

*Zoryon Genesis - O começo de tudo*
