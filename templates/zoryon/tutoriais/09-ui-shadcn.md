# Tutorial 09: UI com Shadcn/UI

Adicione componentes bonitos e acessíveis ao seu projeto.

---

## O Que Você Vai Aprender

- Instalar Shadcn/UI
- Adicionar componentes
- Personalizar tema
- Criar layouts

---

## Sobre Shadcn/UI

Shadcn/UI **não é uma biblioteca** - são componentes que você copia para seu projeto. Isso significa:

- ✅ Controle total sobre o código
- ✅ Sem dependências extras
- ✅ Personalizável 100%
- ✅ Acessível por padrão

---

## Passo 1: Inicializar

```bash
npx shadcn@latest init
```

Responda as perguntas:

```
Would you like to use TypeScript? yes
Which style would you like to use? New York
Which color would you like to use as base color? Slate
Where is your global CSS file? src/app/globals.css
Would you like to use CSS variables? yes
Where is your tailwind.config? tailwind.config.ts
Configure import alias for components? @/components
Configure import alias for utils? @/lib/utils
```

---

## Passo 2: Adicionar Componentes

### Componentes Comuns

```bash
# Botões
npx shadcn@latest add button

# Formulários
npx shadcn@latest add input label form

# Feedback
npx shadcn@latest add toast alert dialog

# Layout
npx shadcn@latest add card separator

# Navegação
npx shadcn@latest add dropdown-menu navigation-menu

# Múltiplos de uma vez
npx shadcn@latest add button input card toast
```

### Ver Todos Disponíveis

```bash
npx shadcn@latest add
```

---

## Passo 3: Usar Componentes

### Button

```tsx
import { Button } from '@/components/ui/button'

export function Example() {
  return (
    <div className="space-x-2">
      <Button>Padrão</Button>
      <Button variant="secondary">Secundário</Button>
      <Button variant="destructive">Deletar</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PricingCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Plano Pro</CardTitle>
        <CardDescription>Para equipes em crescimento</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">R$ 29,90/mês</p>
        <ul className="mt-4 space-y-2">
          <li>✓ Usuários ilimitados</li>
          <li>✓ Suporte prioritário</li>
          <li>✓ API completa</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Assinar</Button>
      </CardFooter>
    </Card>
  )
}
```

### Form com React Hook Form

```bash
npx shadcn@latest add form input button
```

```tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </Form>
  )
}
```

### Toast (Notificações)

```bash
npx shadcn@latest add toast
```

Adicione ao layout:

```tsx
// src/app/layout.tsx
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

Usar:

```tsx
'use client'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export function Example() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: 'Sucesso!',
          description: 'Operação realizada com sucesso.',
        })
      }}
    >
      Mostrar Toast
    </Button>
  )
}
```

### Dialog (Modal)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Deletar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Passo 4: Personalizar Tema

### Cores

Edite `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### Dark Mode

```bash
npx shadcn@latest add dropdown-menu
```

```tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Passo 5: Layouts Prontos

### Header

```tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Logo
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/sobre" className="text-sm hover:underline">
            Sobre
          </Link>
          <Link href="/precos" className="text-sm hover:underline">
            Preços
          </Link>
          <Button>Começar</Button>
        </nav>
      </div>
    </header>
  )
}
```

### Footer

```tsx
export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>© 2024 Meu Projeto. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
```

---

## Componentes Úteis

| Componente | Uso |
|------------|-----|
| `button` | Ações |
| `input`, `form` | Formulários |
| `card` | Containers |
| `dialog` | Modais |
| `toast` | Notificações |
| `dropdown-menu` | Menus |
| `table` | Tabelas |
| `tabs` | Navegação |
| `skeleton` | Loading |
| `avatar` | Fotos de perfil |

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [UI com MagicUI](./10-ui-magicui.md) | Animações e efeitos |
| [Pagamentos com Stripe](./08-pagamentos-stripe.md) | Página de preços |

---

*Zoryon Genesis - O começo de tudo*
