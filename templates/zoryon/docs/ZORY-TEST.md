# Zory-Test: Gerador de Testes

Agente para gerar testes automatizados (unit, integration, e2e) para Next.js.

---

## Como Usar

```bash
# Modo interativo
node .zoryon/scripts/zory-test.mjs

# Modo direto com argumentos
node .zoryon/scripts/zory-test.mjs --type=unit --pattern=component --target=Button
```

---

## O que Gera

1. **Testes Unitários** - Componentes, Hooks, Funções
2. **Testes de Integração** - Páginas, API Routes
3. **Testes E2E** - Fluxos de usuário completos

---

## Tipos de Testes

### 1. Testes Unitários (unit)

**Component:**
```bash
node .zoryon/scripts/zory-test.mjs --type=unit --pattern=component --target=Button
```

Gera:
- `tests/unit/Button.test.tsx`
- Testa renderização, interações, props
- Usa React Testing Library

**Hook:**
```bash
node .zoryon/scripts/zory-test.mjs --type=unit --pattern=hook --target=useAuth
```

Gera:
- `tests/unit/useAuth.test.tsx`
- Testa estado, atualizações, async
- Usa renderHook

**Utility Function:**
```bash
node .zoryon/scripts/zory-test.mjs --type=unit --pattern=utility --target=formatDate
```

Gera:
- `tests/unit/formatDate.test.ts`
- Testa entrada/saída, edge cases
- Testes puros de lógica

---

### 2. Testes de Integração (integration)

**Page:**
```bash
node .zoryon/scripts/zory-test.mjs --type=integration --pattern=page --target=login
```

Gera:
- `tests/integration/LoginPage.integration.test.tsx`
- Testa página completa com dados
- Mock de navegação e APIs

**API Route:**
```bash
node .zoryon/scripts/zory-test.mjs --type=integration --pattern=api-route --target=users
```

Gera:
- `tests/integration/api-users.integration.test.ts`
- Testa GET, POST, PUT, DELETE
- Mock de banco de dados

---

### 3. Testes E2E (e2e)

**User Flow:**
```bash
node .zoryon/scripts/zory-test.mjs --type=e2e --pattern=user-flow --target=checkout
```

Gera:
- `tests/e2e/checkout.spec.ts`
- Testa fluxo completo do usuário
- Usa Playwright

---

## Estrutura Gerada

```
tests/
├── unit/                      # Testes unitários
│   ├── Button.test.tsx
│   ├── useAuth.test.tsx
│   └── formatDate.test.ts
├── integration/               # Testes de integração
│   ├── LoginPage.integration.test.tsx
│   └── api-users.integration.test.ts
└── e2e/                       # Testes E2E
    └── checkout.spec.ts
```

---

## Stack de Testes

### Ferramentas Principais

| Ferramenta | Para que serve |
|------------|----------------|
| **Vitest** | Runner de testes (unit + integration) |
| **React Testing Library** | Testes de componentes |
| **Playwright** | Testes E2E |
| **MSW** | Mock de APIs |
| **Testing Library User Event** | Simular interações |

---

## Comandos de Teste

### Executar testes

```bash
# Todos os testes
pnpm test

# Apenas unitários
pnpm test:unit

# Apenas integração
pnpm test:integration

# Apenas E2E
pnpm test:e2e

# Com coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# UI interativa (Vitest)
pnpm test:ui
```

---

## Exemplos de Testes Gerados

### Teste de Componente

```typescript
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button />)

    const element = screen.getByRole('button')
    expect(element).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()

    render(<Button onClick={mockOnClick} />)

    await user.click(screen.getByRole('button'))

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
```

### Teste de Hook

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current).toBeDefined()
  })

  it('should update state correctly', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.login('user@example.com', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

### Teste de API Route

```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '@/app/api/users/route'

describe('API Route: /api/users', () => {
  describe('GET', () => {
    it('should return users', async () => {
      const request = new Request('http://localhost:3000/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('POST', () => {
    it('should create user', async () => {
      const newUser = { name: 'John', email: 'john@example.com' }

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })
  })
})
```

### Teste E2E

```typescript
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete checkout successfully', async ({ page }) => {
    await page.goto('/')

    // Add to cart
    await page.click('text=Add to Cart')
    await expect(page.locator('.cart-count')).toHaveText('1')

    // Go to checkout
    await page.click('text=Checkout')
    await expect(page).toHaveURL(/checkout/)

    // Fill form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="card"]', '4242424242424242')

    // Submit
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('text=Order confirmed')).toBeVisible()
  })
})
```

---

## Boas Práticas

### Naming Convention

```bash
# Unit tests
ComponentName.test.tsx
hookName.test.tsx
functionName.test.ts

# Integration tests
PageName.integration.test.tsx
api-endpoint.integration.test.ts

# E2E tests
flow-name.spec.ts
```

### Estrutura AAA

Sempre siga o padrão **Arrange-Act-Assert**:

```typescript
it('should do something', () => {
  // Arrange (preparar)
  const user = { name: 'John' }

  // Act (agir)
  const result = doSomething(user)

  // Assert (verificar)
  expect(result).toBe('Hello John')
})
```

### Queries Recomendadas

```typescript
// ✅ Preferir (acessibilidade)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByPlaceholderText(/search/i)

// ⚠️ Usar com moderação
screen.getByTestId('submit-button')
```

### Mocking

```typescript
// Mock de módulo
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

// Mock de função
const mockFn = vi.fn()
mockFn.mockReturnValue('result')
mockFn.mockResolvedValue({ data: [] })

// Mock de API (MSW)
import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'John' }])
  }),
]
```

---

## Coverage

### Configuração

No `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
```

### Ver Coverage

```bash
pnpm test:coverage

# Abre relatório HTML
open coverage/index.html
```

---

## Troubleshooting

### Erro: "Cannot find module"

**Causa:** Path alias não configurado

**Solução:**
```typescript
// vitest.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

### Erro: "window is not defined"

**Causa:** Teste rodando em Node, não em browser

**Solução:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom', // ou 'happy-dom'
  },
})
```

---

### Erro: "Cannot use import statement outside a module"

**Causa:** ESM/CommonJS conflict

**Solução:**
```json
// package.json
{
  "type": "module"
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Recursos

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

*Zoryon Genesis - O começo de tudo*
