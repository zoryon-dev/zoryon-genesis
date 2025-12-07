# Tutorial 08: Pagamentos com Stripe

Aceite pagamentos e assinaturas no seu projeto.

---

## O Que Você Vai Aprender

- Configurar Stripe
- Criar checkout de pagamento
- Implementar assinaturas
- Processar webhooks

---

## Pré-requisitos

- Conta Stripe: [stripe.com](https://stripe.com)
- Projeto com autenticação configurada
- Banco de dados configurado

---

## Passo 1: Criar Conta Stripe

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Crie uma conta
3. Complete a verificação

> **Modo Teste:** Use o modo teste para desenvolvimento. Ative produção apenas quando estiver pronto.

---

## Passo 2: Obter Chaves

1. Vá em **Developers** > **API Keys**
2. Copie:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`)

---

## Passo 3: Configurar Variáveis

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Passo 4: Instalar Dependências

```bash
pnpm add stripe @stripe/stripe-js
```

---

## Passo 5: Criar Cliente Stripe

### Servidor (`src/lib/stripe.ts`)

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

### Cliente (`src/lib/stripe-client.ts`)

```typescript
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)
```

---

## Passo 6: Criar Produtos no Stripe

### Via Dashboard

1. Vá em **Products** > **Add product**
2. Configure:
   - Nome: `Pro Plan`
   - Preço: R$ 29,90/mês
3. Copie o **Price ID** (`price_xxx`)

### Via Código

```typescript
const product = await stripe.products.create({
  name: 'Pro Plan',
  description: 'Acesso a todas as funcionalidades'
})

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 2990, // Em centavos (R$ 29,90)
  currency: 'brl',
  recurring: { interval: 'month' }
})
```

---

## Passo 7: Checkout de Assinatura

### API Route

```typescript
// src/app/api/checkout/route.ts
import { stripe } from '@/lib/stripe'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }

  const { priceId } = await req.json()

  // Buscar ou criar customer no Stripe
  // (em produção, salve o customer_id no banco)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/precos`,
    metadata: {
      userId, // Para identificar no webhook
    },
  })

  return NextResponse.json({ url: session.url })
}
```

### Botão de Checkout

```tsx
'use client'

import { useState } from 'react'

interface CheckoutButtonProps {
  priceId: string
  planName: string
}

export function CheckoutButton({ priceId, planName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erro no checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="rounded bg-blue-500 px-6 py-3 text-white disabled:opacity-50"
    >
      {loading ? 'Carregando...' : `Assinar ${planName}`}
    </button>
  )
}
```

---

## Passo 8: Webhook

### Criar Endpoint

```typescript
// src/app/api/webhook/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed')
    return NextResponse.json(
      { error: 'Webhook Error' },
      { status: 400 }
    )
  }

  // Processar eventos
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      const subscriptionId = session.subscription as string

      // Salvar assinatura no banco
      // await db.subscription.create({
      //   data: {
      //     userId,
      //     stripeSubscriptionId: subscriptionId,
      //     status: 'active'
      //   }
      // })

      console.log('Assinatura criada:', { userId, subscriptionId })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      // Atualizar status no banco
      console.log('Assinatura atualizada:', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      // Marcar como cancelada no banco
      console.log('Assinatura cancelada:', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      // Notificar usuário sobre falha
      console.log('Pagamento falhou:', invoice.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

### Configurar Webhook no Stripe

1. Vá em **Developers** > **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://seusite.com/api/webhook/stripe`
4. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copie o **Signing secret** (`whsec_...`)

---

## Passo 9: Testar Localmente

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Encaminhar webhooks para localhost
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Copie o webhook secret exibido e use no `.env`.

---

## Passo 10: Portal do Cliente

Permita que usuários gerenciem assinaturas:

```typescript
// src/app/api/billing/portal/route.ts
import { stripe } from '@/lib/stripe'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }

  // Buscar customer_id do banco
  // const user = await db.user.findUnique({ where: { id: userId } })

  const session = await stripe.billingPortal.sessions.create({
    customer: 'cus_xxx', // user.stripeCustomerId
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/configuracoes`,
  })

  return NextResponse.json({ url: session.url })
}
```

---

## Verificar Assinatura

```typescript
// src/lib/subscription.ts
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function checkSubscription() {
  const { userId } = await auth()

  if (!userId) return false

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
  })

  return !!subscription
}
```

### Proteger Rota

```tsx
import { checkSubscription } from '@/lib/subscription'
import { redirect } from 'next/navigation'

export default async function ProFeaturePage() {
  const isSubscribed = await checkSubscription()

  if (!isSubscribed) {
    redirect('/precos')
  }

  return <div>Conteúdo exclusivo para assinantes</div>
}
```

---

## Cartões de Teste

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | Sucesso |
| `4000 0000 0000 0002` | Recusado |
| `4000 0000 0000 3220` | Requer autenticação |

Use qualquer data futura e CVC.

---

## Checklist de Produção

- [ ] Ativar conta Stripe
- [ ] Trocar chaves de teste por produção
- [ ] Configurar webhook em produção
- [ ] Testar fluxo completo
- [ ] Configurar emails de notificação

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [UI com Shadcn](./09-ui-shadcn.md) | Criar página de preços bonita |
| [Deploy na Vercel](./03-deploy-vercel.md) | Publicar com webhooks |

---

*Zoryon Genesis - O começo de tudo*
