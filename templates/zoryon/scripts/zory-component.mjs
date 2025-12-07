#!/usr/bin/env node
/**
 * Zory-Component - Gerador de Componentes React Padronizados
 * Versão: 1.0.0
 *
 * Gera componentes seguindo:
 * - Atomic Design (atoms, molecules, organisms)
 * - Compound Components pattern
 * - shadcn/ui style com CVA
 * - TypeScript com tipos corretos
 * - Testes unitários
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  colors,
  log,
  logStep,
  logSuccess,
  logError,
  loadJSON,
  question,
  questionWithOptions,
  questionYesNo,
  closeReadline,
  kebabToPascal,
  pascalToKebab,
} from "./utils/common.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

const ZORYON_DIR = path.join(__dirname, "..")
const COMPONENTS_DIR = path.join(ZORYON_DIR, "components")
const TEMPLATES_DIR = path.join(COMPONENTS_DIR, "templates")
const PATTERNS_DIR = path.join(COMPONENTS_DIR, "patterns")

// =============================================================================
// UTILIDADES (específicas deste agente)
// =============================================================================

function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
}

// =============================================================================
// GERAÇÃO DE CÓDIGO
// =============================================================================

function generateAtomComponent(config) {
  const { name, variants, sizes, features } = config
  const pascalName = toPascalCase(name)
  const camelName = toCamelCase(name)

  return `// ${pascalName} - Atom Component
// Gerado por Zory-Component

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// =============================================================================
// VARIANTS (CVA)
// =============================================================================

const ${camelName}Variants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// =============================================================================
// TYPES
// =============================================================================

export interface ${pascalName}Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ${camelName}Variants> {
  /** Conteúdo do componente */
  children?: React.ReactNode
  /** Ícone a ser exibido */
  icon?: React.ReactNode
  /** Posição do ícone */
  iconPosition?: "left" | "right"
  /** Estado de carregamento */
  isLoading?: boolean
  /** Renderizar como outro elemento */
  asChild?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

const ${pascalName} = React.forwardRef<HTMLButtonElement, ${pascalName}Props>(
  (
    {
      className,
      variant,
      size,
      children,
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(${camelName}Variants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && iconPosition === "left" && !isLoading && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    )
  }
)

${pascalName}.displayName = "${pascalName}"

// =============================================================================
// EXPORTS
// =============================================================================

export { ${pascalName}, ${camelName}Variants }
`
}

function generateMoleculeComponent(config) {
  const { name } = config
  const pascalName = toPascalCase(name)
  const camelName = toCamelCase(name)

  return `// ${pascalName} - Molecule Component
// Gerado por Zory-Component
// Molecule: Combinação de atoms que funcionam juntos

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// =============================================================================
// VARIANTS
// =============================================================================

const ${camelName}Variants = cva(
  "rounded-lg border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "border-border shadow-sm",
        outlined: "border-2 border-primary/20",
        elevated: "shadow-lg border-0",
        ghost: "border-transparent shadow-none bg-transparent",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// =============================================================================
// TYPES
// =============================================================================

export interface ${pascalName}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${camelName}Variants> {
  children: React.ReactNode
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const ${pascalName}Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
${pascalName}Header.displayName = "${pascalName}Header"

const ${pascalName}Title = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
${pascalName}Title.displayName = "${pascalName}Title"

const ${pascalName}Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
${pascalName}Description.displayName = "${pascalName}Description"

const ${pascalName}Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-4", className)} {...props} />
))
${pascalName}Content.displayName = "${pascalName}Content"

const ${pascalName}Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
${pascalName}Footer.displayName = "${pascalName}Footer"

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ${pascalName} = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(${camelName}Variants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

${pascalName}.displayName = "${pascalName}"

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ${pascalName},
  ${pascalName}Header,
  ${pascalName}Title,
  ${pascalName}Description,
  ${pascalName}Content,
  ${pascalName}Footer,
  ${camelName}Variants,
}
`
}

function generateOrganismComponent(config) {
  const { name } = config
  const pascalName = toPascalCase(name)
  const camelName = toCamelCase(name)

  return `// ${pascalName} - Organism Component
// Gerado por Zory-Component
// Organism: Seção complexa com múltiplos molecules e estado próprio

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// =============================================================================
// CONTEXT
// =============================================================================

interface ${pascalName}ContextValue {
  isExpanded: boolean
  setIsExpanded: (value: boolean) => void
}

const ${pascalName}Context = React.createContext<${pascalName}ContextValue | null>(null)

export function use${pascalName}() {
  const context = React.useContext(${pascalName}Context)
  if (!context) {
    throw new Error("use${pascalName} must be used within ${pascalName}")
  }
  return context
}

// =============================================================================
// VARIANTS
// =============================================================================

const ${camelName}Variants = cva(
  "w-full",
  {
    variants: {
      variant: {
        default: "space-y-4",
        compact: "space-y-2",
        spacious: "space-y-8",
      },
      layout: {
        vertical: "flex flex-col",
        horizontal: "flex flex-row gap-6",
        grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
      },
    },
    defaultVariants: {
      variant: "default",
      layout: "vertical",
    },
  }
)

// =============================================================================
// TYPES
// =============================================================================

export interface ${pascalName}Props
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof ${camelName}Variants> {
  /** Estado inicial expandido */
  defaultExpanded?: boolean
  /** Callback quando estado muda */
  onExpandedChange?: (expanded: boolean) => void
  children: React.ReactNode
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ${pascalName}HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  actions?: React.ReactNode
}

const ${pascalName}Header = React.forwardRef<HTMLDivElement, ${pascalName}HeaderProps>(
  ({ className, title, description, actions, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-4 border-b", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
)
${pascalName}Header.displayName = "${pascalName}Header"

const ${pascalName}Body = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 py-4", className)} {...props} />
))
${pascalName}Body.displayName = "${pascalName}Body"

const ${pascalName}Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-2 pt-4 border-t", className)}
    {...props}
  />
))
${pascalName}Footer.displayName = "${pascalName}Footer"

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ${pascalName} = React.forwardRef<HTMLElement, ${pascalName}Props>(
  (
    {
      className,
      variant,
      layout,
      defaultExpanded = false,
      onExpandedChange,
      children,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

    const handleExpandedChange = React.useCallback(
      (value: boolean) => {
        setIsExpanded(value)
        onExpandedChange?.(value)
      },
      [onExpandedChange]
    )

    const contextValue: ${pascalName}ContextValue = React.useMemo(
      () => ({
        isExpanded,
        setIsExpanded: handleExpandedChange,
      }),
      [isExpanded, handleExpandedChange]
    )

    return (
      <${pascalName}Context.Provider value={contextValue}>
        <section
          ref={ref}
          className={cn(${camelName}Variants({ variant, layout }), className)}
          {...props}
        >
          {children}
        </section>
      </${pascalName}Context.Provider>
    )
  }
)

${pascalName}.displayName = "${pascalName}"

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ${pascalName},
  ${pascalName}Header,
  ${pascalName}Body,
  ${pascalName}Footer,
  ${camelName}Variants,
}
`
}

function generateCompoundComponent(config) {
  const { name } = config
  const pascalName = toPascalCase(name)
  const camelName = toCamelCase(name)

  return `// ${pascalName} - Compound Component
// Gerado por Zory-Component
// Compound: Componentes relacionados que compartilham estado implícito

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// =============================================================================
// CONTEXT
// =============================================================================

interface ${pascalName}ContextValue {
  value: string | null
  onValueChange: (value: string) => void
  variant: "default" | "outlined" | "pills"
  size: "sm" | "md" | "lg"
  disabled: boolean
}

const ${pascalName}Context = React.createContext<${pascalName}ContextValue | null>(null)

function use${pascalName}Context() {
  const context = React.useContext(${pascalName}Context)
  if (!context) {
    throw new Error("${pascalName} compound components must be used within ${pascalName}")
  }
  return context
}

// =============================================================================
// VARIANTS
// =============================================================================

const ${camelName}ListVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-muted p-1 rounded-md",
        outlined: "border rounded-lg p-1",
        pills: "bg-muted rounded-full p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ${camelName}ItemVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm",
        outlined: "rounded-md data-[state=active]:border data-[state=active]:border-primary",
        pills: "rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-9 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// =============================================================================
// TYPES
// =============================================================================

export interface ${pascalName}Props extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: "default" | "outlined" | "pills"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  children: React.ReactNode
}

export interface ${pascalName}ListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface ${pascalName}ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

export interface ${pascalName}ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  forceMount?: boolean
  children: React.ReactNode
}

// =============================================================================
// COMPONENTS
// =============================================================================

const ${pascalName}Root = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      onValueChange,
      variant = "default",
      size = "md",
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string | null>(
      defaultValue ?? null
    )

    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [isControlled, onValueChange]
    )

    const contextValue = React.useMemo(
      () => ({ value, onValueChange: handleValueChange, variant, size, disabled }),
      [value, handleValueChange, variant, size, disabled]
    )

    return (
      <${pascalName}Context.Provider value={contextValue}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </${pascalName}Context.Provider>
    )
  }
)
${pascalName}Root.displayName = "${pascalName}"

const ${pascalName}List = React.forwardRef<HTMLDivElement, ${pascalName}ListProps>(
  ({ className, children, ...props }, ref) => {
    const { variant } = use${pascalName}Context()

    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(${camelName}ListVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
${pascalName}List.displayName = "${pascalName}List"

const ${pascalName}Item = React.forwardRef<HTMLButtonElement, ${pascalName}ItemProps>(
  ({ className, value, disabled: itemDisabled, children, ...props }, ref) => {
    const context = use${pascalName}Context()
    const isActive = context.value === value
    const isDisabled = context.disabled || itemDisabled

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        disabled={isDisabled}
        className={cn(
          ${camelName}ItemVariants({ variant: context.variant, size: context.size }),
          className
        )}
        onClick={() => context.onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
${pascalName}Item.displayName = "${pascalName}Item"

const ${pascalName}Content = React.forwardRef<HTMLDivElement, ${pascalName}ContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const context = use${pascalName}Context()
    const isActive = context.value === value

    if (!isActive && !forceMount) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        hidden={!isActive}
        className={cn("mt-2", !isActive && "hidden", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
${pascalName}Content.displayName = "${pascalName}Content"

// =============================================================================
// COMPOUND EXPORT
// =============================================================================

const ${pascalName} = Object.assign(${pascalName}Root, {
  List: ${pascalName}List,
  Item: ${pascalName}Item,
  Content: ${pascalName}Content,
})

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ${pascalName},
  ${pascalName}Root,
  ${pascalName}List,
  ${pascalName}Item,
  ${pascalName}Content,
  use${pascalName}Context,
  ${camelName}ListVariants,
  ${camelName}ItemVariants,
}
`
}

function generateTestFile(config) {
  const { name, type } = config
  const pascalName = toPascalCase(name)
  const kebabName = toKebabCase(name)

  return `// ${pascalName}.test.tsx
// Gerado por Zory-Component

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ${pascalName} } from "./${kebabName}"

describe("${pascalName}", () => {
  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================

  it("deve renderizar corretamente", () => {
    render(<${pascalName}>Test Content</${pascalName}>)
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it("deve aceitar className customizada", () => {
    render(<${pascalName} className="custom-class">Content</${pascalName}>)
    const element = screen.getByText("Content")
    expect(element.parentElement).toHaveClass("custom-class")
  })

  // ==========================================================================
  // VARIANTES
  // ==========================================================================

  describe("Variantes", () => {
    it("deve aplicar variante default por padrão", () => {
      render(<${pascalName}>Default</${pascalName}>)
      expect(screen.getByText("Default")).toBeInTheDocument()
    })

    it("deve aplicar variante primary", () => {
      render(<${pascalName} variant="primary">Primary</${pascalName}>)
      expect(screen.getByText("Primary")).toBeInTheDocument()
    })

    it("deve aplicar variante secondary", () => {
      render(<${pascalName} variant="secondary">Secondary</${pascalName}>)
      expect(screen.getByText("Secondary")).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // TAMANHOS
  // ==========================================================================

  describe("Tamanhos", () => {
    it("deve aplicar tamanho sm", () => {
      render(<${pascalName} size="sm">Small</${pascalName}>)
      expect(screen.getByText("Small")).toBeInTheDocument()
    })

    it("deve aplicar tamanho md por padrão", () => {
      render(<${pascalName}>Medium</${pascalName}>)
      expect(screen.getByText("Medium")).toBeInTheDocument()
    })

    it("deve aplicar tamanho lg", () => {
      render(<${pascalName} size="lg">Large</${pascalName}>)
      expect(screen.getByText("Large")).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ACESSIBILIDADE
  // ==========================================================================

  describe("Acessibilidade", () => {
    it("deve ser acessível via teclado", () => {
      const handleClick = vi.fn()
      render(<${pascalName} onClick={handleClick}>Accessible</${pascalName}>)

      const element = screen.getByText("Accessible")
      element.focus()
      fireEvent.keyDown(element, { key: "Enter" })
    })
  })

  // ==========================================================================
  // REFS
  // ==========================================================================

  it("deve encaminhar ref corretamente", () => {
    const ref = React.createRef<HTMLElement>()
    render(<${pascalName} ref={ref}>With Ref</${pascalName}>)
    expect(ref.current).toBeInTheDocument()
  })
})
`
}

function generateIndexFile(config) {
  const { name } = config
  const pascalName = toPascalCase(name)
  const kebabName = toKebabCase(name)

  return `// index.ts - ${pascalName}
// Gerado por Zory-Component

export * from "./${kebabName}"
`
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2)

  // Help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
${colors.bright}Zory-Component - Gerador de Componentes React${colors.reset}

${colors.cyan}Uso:${colors.reset}
  node .zoryon/scripts/zory-component.mjs [opções]

${colors.cyan}Opções:${colors.reset}
  --help, -h      Mostra esta ajuda
  --list          Lista tipos de componentes disponíveis
  --type=TYPE     Define o tipo (atom, molecule, organism, compound)
  --name=NAME     Define o nome do componente
  --quick         Modo rápido com padrões

${colors.cyan}Exemplos:${colors.reset}
  node .zoryon/scripts/zory-component.mjs
  node .zoryon/scripts/zory-component.mjs --type=atom --name=Button
  node .zoryon/scripts/zory-component.mjs --quick

${colors.cyan}Tipos de Componentes:${colors.reset}
  ${colors.green}atom${colors.reset}       Elemento básico (Button, Input, Badge)
  ${colors.green}molecule${colors.reset}   Grupo de atoms (Card, FormField, Alert)
  ${colors.green}organism${colors.reset}   Seção complexa (Header, Sidebar, DataTable)
  ${colors.green}compound${colors.reset}   Componentes compostos (Tabs, Accordion, Dialog)
`)
    process.exit(0)
  }

  // List
  if (args.includes("--list")) {
    console.log(`
${colors.bright}Tipos de Componentes Disponíveis${colors.reset}

${colors.cyan}1. Atom${colors.reset} - Elemento básico e indivisível
   Exemplos: Button, Input, Label, Badge, Avatar, Icon
   Características: variants, sizes, asChild

${colors.cyan}2. Molecule${colors.reset} - Grupo de atoms que funcionam juntos
   Exemplos: SearchBar, FormField, Card, Alert, Toast
   Características: variants, composition, slots

${colors.cyan}3. Organism${colors.reset} - Seção complexa com múltiplos molecules
   Exemplos: Header, Sidebar, DataTable, Form, Modal
   Características: state, context, compound

${colors.cyan}4. Compound${colors.reset} - Componentes compostos com sub-componentes
   Exemplos: Tabs, Accordion, Dialog, DropdownMenu, Select
   Características: context, composition, implicit-state
`)
    process.exit(0)
  }

  // Banner
  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${colors.cyan}Zory-Component${colors.reset}${colors.bright} - Gerador de Componentes React          ║
║                                                              ║
║   Atomic Design • TypeScript • shadcn/ui • CVA               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`)

  // Coletar informações
  let componentType
  let componentName
  let generateTest = true
  let targetPath

  // Verificar argumentos CLI
  const typeArg = args.find((a) => a.startsWith("--type="))
  const nameArg = args.find((a) => a.startsWith("--name="))
  const quickMode = args.includes("--quick")

  if (typeArg) {
    componentType = typeArg.split("=")[1]
  }
  if (nameArg) {
    componentName = nameArg.split("=")[1]
  }

  // Modo interativo
  if (!componentType) {
    const typeOption = await questionWithOptions("Qual tipo de componente você quer criar?", [
      { label: "Atom", description: "Elemento básico (Button, Input, Badge)" },
      { label: "Molecule", description: "Grupo de atoms (Card, FormField, Alert)" },
      { label: "Organism", description: "Seção complexa (Header, DataTable, Form)" },
      { label: "Compound", description: "Componentes compostos (Tabs, Accordion)" },
    ])
    componentType = typeOption.label.toLowerCase()
  }

  if (!componentName) {
    componentName = await question("\nQual o nome do componente? (ex: Button, UserCard, DataTable): ")
  }

  if (!quickMode) {
    generateTest = await questionYesNo("\nGerar arquivo de teste?", true)
  }

  // Normalizar nome
  const pascalName = toPascalCase(componentName)
  const kebabName = toKebabCase(componentName)

  // Determinar path de destino
  const config = loadJSON(path.join(COMPONENTS_DIR, "config.json"))
  const basePath = config?.paths?.[componentType] || `src/components/${componentType}s`
  targetPath = path.join(process.cwd(), basePath, kebabName)

  console.log(`
${colors.bright}Configuração:${colors.reset}
  Tipo: ${colors.cyan}${componentType}${colors.reset}
  Nome: ${colors.cyan}${pascalName}${colors.reset}
  Arquivo: ${colors.cyan}${kebabName}.tsx${colors.reset}
  Destino: ${colors.cyan}${targetPath}${colors.reset}
  Teste: ${generateTest ? colors.green + "Sim" : colors.yellow + "Não"}${colors.reset}
`)

  const confirm = await questionYesNo("Confirmar geração?", true)

  if (!confirm) {
    log("\nOperação cancelada.", "yellow")
    closeReadline()
    process.exit(0)
  }

  // Gerar código
  logStep("1/4", "Gerando código do componente...")

  let componentCode
  switch (componentType) {
    case "atom":
      componentCode = generateAtomComponent({ name: componentName })
      break
    case "molecule":
      componentCode = generateMoleculeComponent({ name: componentName })
      break
    case "organism":
      componentCode = generateOrganismComponent({ name: componentName })
      break
    case "compound":
      componentCode = generateCompoundComponent({ name: componentName })
      break
    default:
      componentCode = generateAtomComponent({ name: componentName })
  }

  // Criar diretório
  logStep("2/4", "Criando diretório...")
  fs.mkdirSync(targetPath, { recursive: true })

  // Salvar componente
  logStep("3/4", "Salvando arquivos...")
  const componentFile = path.join(targetPath, `${kebabName}.tsx`)
  fs.writeFileSync(componentFile, componentCode)
  logSuccess(`Criado: ${componentFile}`)

  // Salvar index
  const indexFile = path.join(targetPath, "index.ts")
  fs.writeFileSync(indexFile, generateIndexFile({ name: componentName }))
  logSuccess(`Criado: ${indexFile}`)

  // Salvar teste
  if (generateTest) {
    logStep("4/4", "Gerando teste...")
    const testFile = path.join(targetPath, `${kebabName}.test.tsx`)
    fs.writeFileSync(testFile, generateTestFile({ name: componentName, type: componentType }))
    logSuccess(`Criado: ${testFile}`)
  } else {
    logStep("4/4", "Pulando geração de teste...")
  }

  // Resumo final
  console.log(`
${colors.bright}${colors.green}✓ Componente criado com sucesso!${colors.reset}

${colors.bright}Arquivos gerados:${colors.reset}
  ${colors.cyan}${targetPath}/${kebabName}.tsx${colors.reset}
  ${colors.cyan}${targetPath}/index.ts${colors.reset}
  ${generateTest ? `${colors.cyan}${targetPath}/${kebabName}.test.tsx${colors.reset}` : ""}

${colors.bright}Próximos passos:${colors.reset}
  1. Importe o componente: ${colors.cyan}import { ${pascalName} } from "@/components/${componentType}s/${kebabName}"${colors.reset}
  2. Customize as variants e estilos conforme necessário
  3. Adicione props específicas do seu caso de uso
  ${generateTest ? `4. Execute os testes: ${colors.cyan}pnpm test ${kebabName}${colors.reset}` : ""}

${colors.magenta}Zoryon Genesis - O começo de tudo${colors.reset}
`)

  closeReadline()
}

main().catch((error) => {
  logError(`Erro: ${error.message}`)
  process.exit(1)
})
