# Comandos Essenciais

Referência rápida de todos os comandos disponíveis.

---

## Agentes Zory (Aliases Simplificados)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:page` | Gera páginas completas (landing, dashboard, etc.) |
| `pnpm zory:component` | Gera componentes React |
| `pnpm zory:test` | Gera testes unitários |
| `pnpm zory:auth` | Gera autenticação |
| `pnpm zory:guard` | Gera middlewares de proteção |
| `pnpm zory:roles` | Gera sistema RBAC |
| `pnpm zory:security` | Scanner de segurança OWASP |
| `pnpm zory:practices` | Verificador de boas práticas |

> Todos os agentes também aceitam `--help` para ver opções disponíveis.

---

## Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm dev --turbo` | Desenvolvimento com Turbopack (mais rápido) |
| `pnpm build` | Compila para produção |
| `pnpm start` | Inicia servidor de produção |
| `pnpm lint` | Verifica erros de código |
| `pnpm lint --fix` | Corrige erros automaticamente |
| `pnpm typecheck` | Verifica tipos TypeScript |

---

## Zoryon Tasks

### Comandos básicos

| Comando | Descrição |
|---------|-----------|
| `pnpm task add "titulo"` | Adicionar nova tarefa |
| `pnpm task list` | Listar todas as tarefas |
| `pnpm task next` | Iniciar próxima tarefa (por score) |
| `pnpm task done <id>` | Marcar tarefa como concluída |
| `pnpm task status` | Ver status geral do projeto |
| `pnpm task edit <id>` | Ver/editar detalhes da tarefa |
| `pnpm task priority <id> <p>` | Mudar prioridade (alta/media/baixa) |

### Comandos de dependências

| Comando | Descrição |
|---------|-----------|
| `pnpm task depends <id> --on <dep-id>` | Adicionar dependência entre tarefas |
| `pnpm task undepends <id> --from <dep-id>` | Remover dependência |
| `pnpm task graph` | Visualizar grafo de dependências |

### Auto priorização (v0.0.9)

| Comando | Descrição |
|---------|-----------|
| `pnpm task scores` | Ver scores de todas as tarefas |

O sistema calcula automaticamente a prioridade de cada tarefa usando a fórmula:

```
Score = (Urgência × 2) + (Prioridade × 3) + (Dependentes × 4) + (Profundidade × 1)
```

| Fator | Descrição | Peso |
|-------|-----------|------|
| Urgência | Dias desde criação (max 10) | ×2 |
| Prioridade | alta=10, média=5, baixa=2 | ×3 |
| Dependentes | Quantas tarefas dependem desta | ×4 |
| Profundidade | Nível no grafo de dependências | ×1 |

**O `task next` agora sugere automaticamente a tarefa com maior score!**

**Exemplo de fluxo básico:**
```bash
pnpm task add "Implementar login com Clerk"
pnpm task next      # Inicia a tarefa com maior score
# ... trabalha na tarefa ...
pnpm task done 1    # Conclui a tarefa
```

**Exemplo com dependências e scores:**
```bash
pnpm task add "Configurar auth"
pnpm task add "Criar página de login"
pnpm task add "Criar página de perfil"

# Página de login depende de auth
pnpm task depends 2 --on 1

# Página de perfil depende de auth
pnpm task depends 3 --on 1

# Ver scores calculados
pnpm task scores

# task next sugere tarefa com maior score
pnpm task next  # Sugere #1 (tem dependentes = maior score)
```

---

## Banco de Dados (Prisma)

| Comando | Descrição |
|---------|-----------|
| `pnpm db:push` | Sincroniza schema com banco (dev) |
| `pnpm db:generate` | Gera cliente Prisma |
| `pnpm db:studio` | Abre interface visual do banco |
| `pnpm db:migrate` | Cria migration (produção) |
| `pnpm db:seed` | Popula banco com dados iniciais |

**Fluxo típico de desenvolvimento:**
```bash
# 1. Edite prisma/schema.prisma
# 2. Sincronize com o banco
pnpm db:push

# 3. Gere o cliente
pnpm db:generate
```

---

## Testes

| Comando | Descrição |
|---------|-----------|
| `pnpm test` | Executa todos os testes |
| `pnpm test:unit` | Testes unitários (Vitest) |
| `pnpm test:e2e` | Testes E2E (Playwright) |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm test:coverage` | Relatório de cobertura |

---

## Segurança

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:security` | Modo interativo |
| `pnpm zory:security scan` | Scanner rápido de secrets |
| `pnpm zory:security audit` | Auditoria OWASP completa |
| `pnpm security:scan` | Scanner rápido (pre-commit) |

### Ignorar falsos positivos

```javascript
// Ignorar linha específica
const example = "sk_test_exemplo" // zoryon-ignore

// Ignorar próxima linha
// zoryon-ignore-next-line
const example = "sk_test_exemplo"
```

> **Documentação completa:** Ver `.zoryon/docs/ZORY-SECURITY.md`

---

## Zory-Page (Gerador de Landing Pages)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:page` | Modo interativo |
| `pnpm zory:page --quick` | Modo rápido (padrões SaaS) |
| `pnpm zory:page --list` | Ver estilos e indústrias |
| `pnpm zory:page --help` | Ajuda |

> **Documentação completa:** Ver `.zoryon/docs/ZORY-PAGES.md`

---

## Zory-Component (Gerador de Componentes)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:component` | Modo interativo |
| `pnpm zory:component --type=atom --name=Button` | Modo direto |
| `pnpm zory:component --list` | Ver tipos disponíveis |
| `pnpm zory:component --help` | Ajuda |

**Tipos:** `atom`, `molecule`, `organism`, `compound`

> **Documentação completa:** Ver `.zoryon/docs/ZORY-COMPONENT.md`

---

## Zory-Practices (Boas Práticas)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:practices` | Modo interativo |
| `pnpm zory:practices analyze` | Análise completa |
| `pnpm zory:practices quick` | Análise rápida |

> **Documentação completa:** Ver `.zoryon/docs/ZORY-PRACTICES.md`

---

## Zory-Auth (Autenticação)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:auth` | Modo interativo |
| `pnpm zory:auth --quick` | Modo rápido (Clerk) |
| `pnpm zory:auth --provider=clerk` | Configurar Clerk |
| `pnpm zory:auth --provider=nextauth` | Configurar NextAuth v5 |
| `pnpm zory:auth --list` | Ver providers |

> **Documentação completa:** Ver `.zoryon/docs/ZORY-AUTH.md`

---

## Zory-Guard (Middlewares)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:guard` | Modo interativo |
| `pnpm zory:guard --quick` | Security + Rate Limit |
| `pnpm zory:guard --pattern=ratelimit` | Rate limiting |
| `pnpm zory:guard --pattern=security` | Security headers |
| `pnpm zory:guard --list` | Ver patterns |

> **Documentação completa:** Ver `.zoryon/docs/ZORY-GUARD.md`

---

## Zory-Roles (Sistema RBAC)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:roles` | Modo interativo |
| `pnpm zory:roles --quick` | Gerar tudo |

> **Documentação completa:** Ver `.zoryon/docs/ZORY-ROLES.md`

---

## Zory-Test (Gerador de Testes)

| Comando | Descrição |
|---------|-----------|
| `pnpm zory:test` | Modo interativo |
| `pnpm zory:test --type=unit --target=Button` | Teste de componente |
| `pnpm zory:test --type=e2e --target=checkout` | Teste E2E |

### Executar testes

| Comando | Descrição |
|---------|-----------|
| `pnpm test` | Todos os testes |
| `pnpm test:unit` | Unitários |
| `pnpm test:e2e` | E2E |
| `pnpm test:coverage` | Com cobertura |

> **Documentação completa:** Ver `.zoryon/docs/ZORY-TEST.md`

---

## Git Hooks

| Hook | O que faz |
|------|-----------|
| `pre-commit` | Lint, TypeCheck, Security Scan |
| `commit-msg` | Valida formato do commit |
| `pre-push` | Roda testes |

> **Pular hooks:** `git commit --no-verify` (use com cuidado!)

---

## Git

| Comando | Descrição |
|---------|-----------|
| `git status` | Ver arquivos modificados |
| `git add .` | Adicionar todas as alterações |
| `git commit -m "msg"` | Criar commit (roda hooks) |
| `git push` | Enviar para remoto (roda hooks) |
| `git pull` | Atualizar do remoto |

**Formato de commit obrigatório (validado por hooks):**
```
tipo(escopo): descrição curta

Tipos: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert

Exemplos:
feat: adicionar login com Clerk
fix(api): corrigir validação de formulário
docs: atualizar README
```

---

## Turborepo (se monorepo)

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia todos os apps |
| `pnpm build` | Build de todos os pacotes |
| `pnpm dev --filter=web` | Inicia apenas o app web |
| `pnpm build --filter=@repo/ui` | Build apenas do pacote UI |

---

## NPM/PNPM

| Comando | Descrição |
|---------|-----------|
| `pnpm install` | Instala dependências |
| `pnpm add pacote` | Adiciona dependência |
| `pnpm add -D pacote` | Adiciona dev dependency |
| `pnpm remove pacote` | Remove dependência |
| `pnpm update` | Atualiza dependências |

---

## Dicas

### Alias úteis

Adicione ao seu `.bashrc` ou `.zshrc`:

```bash
alias pd="pnpm dev"
alias pb="pnpm build"
alias pt="pnpm task"
```

### Atalhos de teclado (VS Code)

| Atalho | Ação |
|--------|------|
| `Ctrl+`` ` | Abrir terminal |
| `Ctrl+P` | Buscar arquivo |
| `Ctrl+Shift+P` | Paleta de comandos |
| `Ctrl+B` | Toggle sidebar |

---

*Zoryon Genesis - O começo de tudo*
