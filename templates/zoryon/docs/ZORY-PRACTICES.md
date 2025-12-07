# Zory-Practices: Agente de Analise de Boas Praticas

O Zory-Practices e um agente especializado em analise de boas praticas para aplicacoes React/TypeScript, baseado nas melhores praticas de 2025.

---

## Como Usar

### Modo Interativo

```bash
node .zoryon/scripts/zory-practices.mjs
```

### Comandos Diretos

```bash
# Analise completa (todas as categorias)
node .zoryon/scripts/zory-practices.mjs analyze

# Analise rapida (code-quality, typescript, react)
node .zoryon/scripts/zory-practices.mjs quick

# Apenas TypeScript
node .zoryon/scripts/zory-practices.mjs typescript

# Apenas React patterns
node .zoryon/scripts/zory-practices.mjs react

# Apenas acessibilidade
node .zoryon/scripts/zory-practices.mjs a11y

# Gerar relatorio completo
node .zoryon/scripts/zory-practices.mjs report

# Relatorio em JSON
node .zoryon/scripts/zory-practices.mjs report --json
```

---

## Modos de Verificacao

| Modo | Comando | Descricao |
|------|---------|-----------|
| **Analise Completa** | `analyze` | Verifica todas as 8 categorias |
| **Analise Rapida** | `quick` | Code quality, TypeScript, React |
| **TypeScript** | `typescript` | Foca em tipagem e strict mode |
| **React** | `react` | Patterns React e performance |
| **Acessibilidade** | `a11y` | WCAG 2.2 e semantica |
| **Relatorio** | `report` | Gera relatorio MD ou JSON |

---

## Categorias de Verificacao

### BP-01: Qualidade de Codigo

Verifica principios de codigo limpo:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `large-file` | Arquivos com mais de 300 linhas | Medium |
| `console-statements` | console.log em producao | Low |
| `dead-code` | Codigo comentado | Low |
| `todo-fixme` | Comentarios TODO/FIXME | Info |

**Recomendacoes:**
- Arquivos com menos de 300 linhas
- Funcoes com menos de 50 linhas
- Maximo 4 niveis de aninhamento
- Use nomes descritivos

### BP-02: TypeScript

Verifica tipagem e configuracao:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `explicit-any` | Uso de tipo `any` | High |
| `non-null-assertion` | Uso de `!` | Medium |
| `strict-mode-config` | Strict mode desabilitado | High |

**Configuracao Recomendada (tsconfig.json):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### BP-03: Padroes React

Verifica padroes React e hooks:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `large-component` | Componentes com mais de 250 linhas | Medium |
| `hooks-rules` | Hooks em condicoes/loops | Critical |
| `useeffect-deps` | Dependencias de useEffect | High |
| `key-prop` | Index como key em listas | High |
| `use-client-directive` | Missing 'use client' | Medium |

**React 19+ Mudancas:**
- React Compiler otimiza automaticamente
- Server Components como padrao
- Menos necessidade de memoizacao manual

### BP-04: Performance

Verifica otimizacoes de performance:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `large-bundle` | Import completo de lodash/moment | Medium |
| `image-optimization` | `<img>` ao inves de next/image | Medium |

**Recomendacoes:**
- Use next/image para imagens
- Imports especificos (tree-shaking)
- React Query/SWR para data fetching
- Profile antes de otimizar

### BP-05: Acessibilidade (WCAG 2.2)

Verifica conformidade com acessibilidade:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `missing-alt` | Imagens sem alt | Critical |
| `missing-button-text` | Botoes sem texto acessivel | Critical |
| `semantic-html` | div com onClick | Medium |
| `focus-management` | outline:none | High |

**WCAG 2.2 Requisitos:**
- Contraste minimo 4.5:1
- Tamanho de alvo minimo 24x24px
- Navegacao por teclado
- Texto alternativo em imagens

### BP-06: Testes

Verifica cobertura e qualidade:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `missing-tests` | Arquivos sem teste | Low |

**Stack Recomendada:**
- **Unit:** Vitest + React Testing Library
- **E2E:** Playwright
- **Mocking:** MSW

### BP-07: Tratamento de Erros

Verifica resiliencia da aplicacao:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `error-boundary` | error.tsx ausente | High |
| `not-found` | not-found.tsx ausente | Medium |
| `try-catch-api` | API routes sem try-catch | High |

**Arquivos Necessarios:**
```
app/
├── error.tsx        # Error Boundary
├── global-error.tsx # Erro global
└── not-found.tsx    # Pagina 404
```

### BP-08: Arquitetura

Verifica estrutura do projeto:

| Check | Descricao | Severidade |
|-------|-----------|------------|
| `env-management` | .env.example ausente | Medium |
| `import-organization` | Imports relativos profundos | Info |

**Estrutura Recomendada (Feature-Based):**
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   └── products/
├── shared/
│   ├── components/
│   └── utils/
└── app/
```

---

## Sistema de Score

O agente calcula um score de 0-100 baseado nas issues encontradas:

| Severidade | Pontos Deduzidos |
|------------|------------------|
| Critical | 10 |
| High | 7 |
| Medium | 4 |
| Low | 2 |
| Info | 1 |

### Classificacao

| Score | Classificacao | Emoji |
|-------|---------------|-------|
| 90-100 | Excelente | 🏆 |
| 75-89 | Bom | ✅ |
| 50-74 | Moderado | ⚠️ |
| 0-49 | Precisa Melhorar | ❌ |

---

## Relatorios

### Markdown Report

```bash
node .zoryon/scripts/zory-practices.mjs report
# Salva em: .zoryon/reports/practices-report.md
```

### JSON Report

```bash
node .zoryon/scripts/zory-practices.mjs report --json
# Salva em: .zoryon/reports/practices-report.json
```

---

## Integracao no Fluxo de Trabalho

### Pre-commit Hook

Adicione ao `.husky/pre-commit`:

```bash
# Analise rapida antes de commit
node .zoryon/scripts/zory-practices.mjs quick
```

### CI/CD (GitHub Actions)

```yaml
- name: Run Practices Analysis
  run: node .zoryon/scripts/zory-practices.mjs analyze
```

### VSCode Task

Adicione ao `.vscode/tasks.json`:

```json
{
  "label": "Zory-Practices: Analyze",
  "type": "shell",
  "command": "node .zoryon/scripts/zory-practices.mjs analyze"
}
```

### Antes de Pull Request

```bash
# Analise completa com relatorio
node .zoryon/scripts/zory-practices.mjs report
```

---

## Arquitetura de Arquivos

```
.zoryon/
├── practices/
│   ├── config.json              # Configuracao do agente
│   └── rules/
│       ├── code-quality.json    # Regras de qualidade
│       ├── typescript.json      # Regras TypeScript
│       ├── react-patterns.json  # Regras React
│       ├── performance.json     # Regras de performance
│       ├── accessibility.json   # Regras a11y
│       ├── testing.json         # Regras de testes
│       ├── error-handling.json  # Regras de erros
│       └── architecture.json    # Regras de arquitetura
├── scripts/
│   └── zory-practices.mjs       # CLI principal
├── reports/
│   ├── practices-report.md      # Relatorio Markdown
│   └── practices-report.json    # Relatorio JSON
└── docs/
    └── ZORY-PRACTICES.md        # Esta documentacao
```

---

## CLI Options

| Opcao | Descricao |
|-------|-----------|
| `--help`, `-h` | Mostra ajuda |
| `--json` | Relatorio em formato JSON |
| `--verbose` | Saida detalhada |

---

## Melhores Praticas 2025

### React 19+
- React Compiler otimiza automaticamente
- Server Components como padrao
- Actions API para operacoes async
- `use` API para recursos

### TypeScript 5.x
- Strict mode obrigatorio
- `noUncheckedIndexedAccess` recomendado
- Prefira `unknown` sobre `any`

### Next.js 16
- App Router com Turbopack
- Server e Client Components
- Route handlers com try-catch

### Acessibilidade
- WCAG 2.2 como baseline
- Target size minimo 24x24px
- Teste com screen readers

---

## Exemplo de Output

```
Zory-Practices - Analise de Boas Praticas

Carregando arquivos...
✓ 45 arquivos encontrados (3,250 linhas)

Verificando Qualidade de Codigo... ✓
Verificando TypeScript... ✓
Verificando Padroes React... ✓
Verificando Performance... ✓
Verificando Acessibilidade... ✓
Verificando Testes... ✓
Verificando Tratamento de Erros... ✓
Verificando Arquitetura... ✓

──────────────────────────────────────────────────

Score: 82/100 ✅ Bom

Por Severidade:
  🟠 Alto: 2
  🟡 Medio: 5
  🟢 Baixo: 3
  🔵 Info: 4

Por Categoria:
  • TypeScript: 3
  • React Patterns: 4
  • Acessibilidade: 2
  • Arquitetura: 5
```

---

*Zoryon Genesis - O comeco de tudo*
