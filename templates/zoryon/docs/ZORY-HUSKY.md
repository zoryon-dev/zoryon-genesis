# Zory-Husky: Git Hooks Automatizados

Sistema de validação automática que roda antes de commits e pushes.

---

## O que são Git Hooks?

Git Hooks são scripts que rodam automaticamente em eventos do Git (commit, push, etc).

**Por que usar:**
- Previne commits com erros
- Garante padrão de código
- Detecta secrets antes de vazar
- Força boas práticas

---

## Hooks Configurados

### 1. Pre-commit

**Quando:** Antes de cada commit

**O que faz:**
1. **Lint** - Verifica formatação e boas práticas
2. **TypeCheck** - Valida tipos TypeScript
3. **Security Scan** - Detecta secrets e vulnerabilidades

**Exemplo:**
```bash
git add .
git commit -m "feat: nova feature"

# Executa automaticamente:
# 🔍 Verificando código antes do commit...
# 📝 Lint...
# 🔷 TypeScript...
# 🔒 Segurança...
# ✅ Tudo certo! Prosseguindo com o commit...
```

Se houver erros, o commit é bloqueado até corrigir.

---

### 2. Commit-msg

**Quando:** Valida mensagem do commit

**O que faz:**
Força o padrão **Conventional Commits**

**Formatos válidos:**
```bash
feat: adicionar login com Clerk
fix: corrigir bug no carrinho
docs: atualizar README
style: formatar código
refactor: melhorar estrutura
test: adicionar testes
chore: atualizar dependências
perf: otimizar query do banco
ci: configurar GitHub Actions
build: atualizar webpack
revert: reverter commit anterior

# Com escopo (opcional):
feat(auth): adicionar 2FA
fix(api): corrigir rate limit
```

**Tipos:**

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação (sem mudar lógica) |
| `refactor` | Refatoração (sem mudar comportamento) |
| `test` | Adicionar/modificar testes |
| `chore` | Manutenção, deps, config |
| `perf` | Melhoria de performance |
| `ci` | CI/CD |
| `build` | Sistema de build |
| `revert` | Reverter commit |

**Exemplo de erro:**
```bash
git commit -m "adicionei login"

# ❌ Formato de commit inválido!
# Use o formato: tipo(escopo): mensagem
```

---

### 3. Pre-push

**Quando:** Antes de cada push

**O que faz:**
Roda todos os testes (se configurados)

**Exemplo:**
```bash
git push

# 🧪 Verificando testes antes do push...
# Executando testes...
# ✅ Todos os testes passaram!
```

Se testes falharem, o push é bloqueado.

---

## Como Usar

### Instalação Automática

Ao criar projeto com Zoryon:
```bash
pnpm create

# Escolha "Sim" para Git Hooks
```

### Instalação Manual

```bash
# 1. Instalar Husky
pnpm add -D husky

# 2. Inicializar
pnpm exec husky init

# 3. Copiar hooks do Zoryon
cp .zoryon/security/hooks/* .husky/

# 4. Dar permissão de execução
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push

# 5. Adicionar script ao package.json
# "prepare": "husky install"
```

---

## Pular Hooks (Use com cuidado!)

### Pular pre-commit
```bash
git commit -m "feat: algo" --no-verify
```

### Pular pre-push
```bash
git push --no-verify
```

**⚠️ Aviso:** Só pule hooks se tiver certeza do que está fazendo!

---

## Testar Hooks Manualmente

### Testar pre-commit
```bash
sh .husky/pre-commit
```

### Testar commit-msg
```bash
echo "feat: teste" > /tmp/msg.txt
sh .husky/commit-msg /tmp/msg.txt
```

### Testar pre-push
```bash
sh .husky/pre-push
```

---

## Resolver Problemas Comuns

### Hook não executa

**Causa:** Sem permissão de execução

**Solução:**
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

---

### Erro "husky - not found"

**Causa:** Husky não instalado

**Solução:**
```bash
pnpm add -D husky
pnpm exec husky install
```

---

### Lint sempre falha

**Causa:** Código com erros de formatação

**Solução:**
```bash
# Corrigir automaticamente
pnpm lint --fix

# Depois commitar
git add .
git commit -m "style: formatar código"
```

---

### TypeCheck sempre falha

**Causa:** Erros de tipo TypeScript

**Solução:**
```bash
# Ver erros
pnpm typecheck

# Corrigir os erros manualmente
# Depois commitar
```

---

### Security scan detecta falsos positivos

**Causa:** Scan detectou algo que não é secret

**Solução 1:** Adicionar ao whitelist
```json
// .zoryon/security/whitelist.json
{
  "patterns": [
    "exemplo_nao_secreto"
  ]
}
```

**Solução 2:** Pular só este commit (não recomendado)
```bash
git commit -m "feat: algo" --no-verify
```

---

## Fluxo de Trabalho Completo

```bash
# 1. Fazer mudanças no código
# ...

# 2. Adicionar arquivos
git add .

# 3. Commitar (hooks rodam automaticamente)
git commit -m "feat: adicionar carrinho de compras"
# → pre-commit roda (lint, typecheck, security)
# → commit-msg valida formato

# 4. Push (hook roda automaticamente)
git push
# → pre-push roda testes
```

---

## Personalizar Hooks

### Adicionar verificação extra no pre-commit

Edite `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# ... código existente ...

# Adicionar nova verificação
echo "\n🔍 Verificando algo específico..."
pnpm run meu-script || {
  echo "\n❌ Falha na verificação customizada"
  exit 1
}
```

### Desabilitar typecheck (não recomendado)

Edite `.husky/pre-commit` e comente:
```bash
# echo "\n🔷 TypeScript..."
# pnpm typecheck || {
#   echo "\n❌ Erro no typecheck..."
#   exit 1
# }
```

---

## Boas Práticas

### ✅ Fazer

- Commitar frequentemente
- Seguir Conventional Commits
- Corrigir erros antes de forçar commit
- Rodar `pnpm lint --fix` antes de commitar

### ❌ Evitar

- Pular hooks com `--no-verify` sem necessidade
- Commitar código quebrado
- Usar mensagens genéricas ("fix stuff")
- Desabilitar hooks permanentemente

---

## Integração com CI/CD

Os mesmos checks rodam em CI:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Lint
        run: pnpm lint

      - name: TypeCheck
        run: pnpm typecheck

      - name: Security
        run: node .zoryon/security/scan.mjs

      - name: Tests
        run: pnpm test
```

Hooks locais evitam surpresas no CI!

---

## Recursos

- [Husky Docs](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Hooks Guide](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

---

*Zoryon Genesis - O começo de tudo*
