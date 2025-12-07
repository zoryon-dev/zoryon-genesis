# Tutorial 10: UI com MagicUI

Adicione animações e efeitos impressionantes ao seu projeto.

---

## O Que Você Vai Aprender

- Instalar MagicUI
- Usar componentes animados
- Criar landing pages impressionantes

---

## Sobre MagicUI

MagicUI é uma coleção de componentes animados baseados em:
- Tailwind CSS
- Framer Motion
- Shadcn/UI

---

## Passo 1: Pré-requisitos

Certifique-se de ter o Shadcn/UI configurado:

```bash
npx shadcn@latest init
```

---

## Passo 2: Instalar Framer Motion

```bash
pnpm add framer-motion
```

---

## Passo 3: Adicionar Componentes

Acesse [magicui.design](https://magicui.design) e copie os componentes desejados.

### Exemplo: Animated Gradient Text

```tsx
// src/components/magicui/animated-gradient-text.tsx
'use client'

import { cn } from '@/lib/utils'

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        'inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent',
        className
      )}
      style={{ '--bg-size': '300%' } as React.CSSProperties}
    >
      {children}
    </span>
  )
}
```

Adicione ao `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      animation: {
        gradient: 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          to: {
            backgroundPosition: 'var(--bg-size) 0',
          },
        },
      },
    },
  },
}
```

### Exemplo: Sparkles Text

```tsx
// src/components/magicui/sparkles-text.tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SparklesTextProps {
  children: React.ReactNode
  className?: string
}

export function SparklesText({ children, className }: SparklesTextProps) {
  return (
    <motion.span
      className={cn('relative inline-block', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
      <motion.span
        className="absolute -inset-1 block -skew-y-3 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 blur-lg"
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    </motion.span>
  )
}
```

### Exemplo: Animated Border Card

```tsx
// src/components/magicui/animated-border-card.tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedBorderCardProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedBorderCard({
  children,
  className,
}: AnimatedBorderCardProps) {
  return (
    <div className={cn('relative rounded-xl p-[1px]', className)}>
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <div className="relative rounded-xl bg-background p-6">
        {children}
      </div>
    </div>
  )
}
```

### Exemplo: Typing Animation

```tsx
// src/components/magicui/typing-animation.tsx
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TypingAnimationProps {
  text: string
  className?: string
  duration?: number
}

export function TypingAnimation({
  text,
  className,
  duration = 100,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [i, setI] = useState(0)

  useEffect(() => {
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1))
        setI(i + 1)
      } else {
        clearInterval(typingEffect)
      }
    }, duration)

    return () => clearInterval(typingEffect)
  }, [duration, i, text])

  return (
    <span className={cn('inline-block', className)}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
```

---

## Passo 4: Usar Componentes

### Hero Section

```tsx
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AnimatedGradientText className="text-5xl font-bold md:text-7xl">
        Zoryon Genesis
      </AnimatedGradientText>

      <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
        <TypingAnimation
          text="O começo de tudo. Template Next.js completo e configurável."
          duration={50}
        />
      </p>

      <div className="mt-8 flex gap-4">
        <Button size="lg">Começar Agora</Button>
        <Button size="lg" variant="outline">
          Ver Demo
        </Button>
      </div>
    </section>
  )
}
```

### Pricing Cards

```tsx
import { AnimatedBorderCard } from '@/components/magicui/animated-border-card'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: 'Grátis',
    features: ['1 projeto', 'Comunidade', 'Docs'],
  },
  {
    name: 'Pro',
    price: 'R$ 29/mês',
    features: ['Projetos ilimitados', 'Suporte', 'Updates'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    features: ['Tudo do Pro', 'SLA', 'Consultoria'],
  },
]

export function PricingSection() {
  return (
    <section className="py-20">
      <h2 className="text-center text-3xl font-bold">Planos</h2>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {plans.map((plan) =>
          plan.featured ? (
            <AnimatedBorderCard key={plan.name}>
              <PricingCardContent plan={plan} />
            </AnimatedBorderCard>
          ) : (
            <div
              key={plan.name}
              className="rounded-xl border p-6"
            >
              <PricingCardContent plan={plan} />
            </div>
          )
        )}
      </div>
    </section>
  )
}

function PricingCardContent({ plan }) {
  return (
    <>
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className="mt-2 text-3xl font-bold">{plan.price}</p>
      <ul className="mt-4 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>
      <Button className="mt-6 w-full">
        {plan.featured ? 'Mais Popular' : 'Escolher'}
      </Button>
    </>
  )
}
```

---

## Passo 5: Animações de Entrada

```tsx
'use client'

import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function FeaturesList() {
  const features = [
    { title: 'Rápido', desc: 'Build otimizado' },
    { title: 'Seguro', desc: 'TypeScript estrito' },
    { title: 'Moderno', desc: 'React 19' },
  ]

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-3"
      variants={staggerChildren}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {features.map((feature) => (
        <motion.div
          key={feature.title}
          variants={fadeInUp}
          className="rounded-xl border p-6"
        >
          <h3 className="font-bold">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
```

---

## Componentes Populares

| Componente | Uso |
|------------|-----|
| Animated Gradient Text | Títulos chamativos |
| Sparkles | Destaques |
| Animated Border | Cards premium |
| Typing Animation | Hero sections |
| Blur Fade | Transições suaves |
| Marquee | Logos de clientes |
| Number Ticker | Estatísticas |
| Globe | Visualização global |

---

## Dicas de Performance

### Lazy Loading

```tsx
import dynamic from 'next/dynamic'

const HeavyAnimation = dynamic(
  () => import('@/components/magicui/globe'),
  { ssr: false }
)
```

### Reduce Motion

```tsx
import { motion, useReducedMotion } from 'framer-motion'

export function SafeAnimation() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { scale: 1.1 }}
    >
      Conteúdo
    </motion.div>
  )
}
```

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [UI com Shadcn](./09-ui-shadcn.md) | Componentes base |
| [Deploy na Vercel](./03-deploy-vercel.md) | Publicar landing page |

---

*Zoryon Genesis - O começo de tudo*
