# Zory-Component: Gerador de Componentes React

O Zory-Component é um agente especializado que gera componentes React padronizados seguindo as melhores práticas de 2025.

---

## Como Usar

### Modo Interativo

```bash
node .zoryon/scripts/zory-component.mjs
```

### Modo Rápido

```bash
node .zoryon/scripts/zory-component.mjs --type=atom --name=Button
```

### Listar Opções

```bash
node .zoryon/scripts/zory-component.mjs --list
```

---

## Tipos de Componentes (Atomic Design)

O sistema segue a metodologia **Atomic Design** de Brad Frost:

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| **Atom** | Elemento básico e indivisível | Button, Input, Badge, Icon, Avatar |
| **Molecule** | Grupo de atoms funcionando juntos | Card, FormField, SearchBar, Alert |
| **Organism** | Seção complexa com estado próprio | Header, Sidebar, DataTable, Form |
| **Compound** | Componentes compostos relacionados | Tabs, Accordion, Dialog, Select |

---

## Hierarquia Atomic Design

```
┌─────────────────────────────────────────────────────────────┐
│                         PAGES                               │
│    Instâncias específicas com conteúdo real                 │
├─────────────────────────────────────────────────────────────┤
│                       TEMPLATES                             │
│    Layout estrutural sem conteúdo específico                │
├─────────────────────────────────────────────────────────────┤
│                       ORGANISMS                             │
│    Header, Sidebar, DataTable, Form, Modal                  │
├─────────────────────────────────────────────────────────────┤
│                       MOLECULES                             │
│    Card, FormField, SearchBar, Alert, Toast                 │
├─────────────────────────────────────────────────────────────┤
│                         ATOMS                               │
│    Button, Input, Label, Badge, Avatar, Icon                │
└─────────────────────────────────────────────────────────────┘
```

---

## Padrões Implementados

### 1. Class Variance Authority (CVA)

Todos os componentes usam CVA para gerenciar variantes:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)
```

### 2. Compound Components

Para componentes complexos com estado compartilhado:

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Item value="tab1">Tab 1</Tabs.Item>
    <Tabs.Item value="tab2">Tab 2</Tabs.Item>
  </Tabs.List>
  <Tabs.Content value="tab1">Conteúdo 1</Tabs.Content>
  <Tabs.Content value="tab2">Conteúdo 2</Tabs.Content>
</Tabs>
```

### 3. forwardRef + displayName

Todos os componentes encaminham refs e têm displayName:

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  }
)
Button.displayName = "Button"
```

---

## Estrutura de Arquivos Gerados

```
src/components/atoms/button/
├── button.tsx           # Componente principal
├── button.test.tsx      # Testes unitários
└── index.ts             # Export barrel
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `--help`, `-h` | Mostra ajuda |
| `--list` | Lista tipos de componentes |
| `--type=TYPE` | Define tipo (atom, molecule, organism, compound) |
| `--name=NAME` | Define nome do componente |
| `--quick` | Modo rápido com padrões |

---

## Exemplos de Uso

### Criar um Button (Atom)

```bash
node .zoryon/scripts/zory-component.mjs --type=atom --name=Button
```

Gera:
- `src/components/ui/button/button.tsx`
- `src/components/ui/button/button.test.tsx`
- `src/components/ui/button/index.ts`

### Criar um Card (Molecule)

```bash
node .zoryon/scripts/zory-component.mjs --type=molecule --name=ProductCard
```

### Criar um DataTable (Organism)

```bash
node .zoryon/scripts/zory-component.mjs --type=organism --name=DataTable
```

### Criar Tabs (Compound)

```bash
node .zoryon/scripts/zory-component.mjs --type=compound --name=Tabs
```

---

## Variantes Disponíveis

### Variants (Estilo)

| Variant | Descrição |
|---------|-----------|
| `default` | Estilo padrão primário |
| `secondary` | Estilo secundário |
| `destructive` | Para ações destrutivas |
| `outline` | Apenas borda |
| `ghost` | Transparente com hover |
| `link` | Estilo de link |

### Sizes (Tamanho)

| Size | Descrição |
|------|-----------|
| `sm` | Pequeno (h-8/h-9) |
| `md` | Médio (h-10) - padrão |
| `lg` | Grande (h-11/h-12) |
| `icon` | Quadrado para ícones |

---

## Arquitetura dos Arquivos

```
.zoryon/components/
├── config.json           # Configurações gerais
├── templates/            # Templates de código
│   ├── atom.tsx.template
│   ├── molecule.tsx.template
│   ├── organism.tsx.template
│   ├── compound.tsx.template
│   └── test.tsx.template
├── patterns/             # Padrões de componentes
│   ├── button.json
│   ├── card.json
│   └── input.json
└── presets/              # Presets de estilo
    └── shadcn.json
```

---

## Tech Stack

- **React 19** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Utilitários de estilo
- **CVA** - Class Variance Authority para variantes
- **Radix UI** - Primitivos acessíveis (base do shadcn)
- **Vitest** - Framework de testes

---

## Melhores Práticas Aplicadas

1. **Separation of Concerns**: Lógica separada da apresentação
2. **Composition over Inheritance**: Props de composição
3. **Single Responsibility**: Cada componente faz uma coisa
4. **DRY**: Variantes reutilizáveis via CVA
5. **Type Safety**: TypeScript em todo lugar
6. **Accessibility**: ARIA attributes e keyboard navigation
7. **Performance**: React.memo onde necessário

---

## Fontes de Pesquisa

O sistema foi desenvolvido baseado em:

- [React Design Patterns 2025](https://www.uxpin.com/studio/blog/react-design-patterns/)
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [shadcn/ui Architecture](https://ui.shadcn.com/)
- [Compound Components Pattern](https://www.patterns.dev/react/compound-pattern/)
- [Building Reusable Components](https://hackernoon.com/building-reusable-components-in-react-best-practices-and-patterns)

---

*Zoryon Genesis - O começo de tudo*
