# O Que Está Disponível

Visão geral de tudo que seu projeto oferece.

---

## Stack Tecnológica

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Next.js | 16 | Framework React com App Router |
| React | 19 | Biblioteca de UI |
| TypeScript | 5 | Tipagem estática |
| Tailwind CSS | 4 | Framework CSS utilitário |
| pnpm | 9+ | Gerenciador de pacotes rápido |

---

## Recursos do Projeto

### Estrutura

{{#if turborepo}}
**Turborepo** - Monorepo com cache inteligente

```
├── apps/
│   └── web/                 # Aplicação Next.js principal
├── packages/
│   ├── ui/                  # Componentes compartilhados
│   ├── database/            # Configuração Prisma
│   ├── config-typescript/   # Config TypeScript
│   ├── config-eslint/       # Config ESLint
│   └── config-tailwind/     # Config Tailwind
└── turbo.json               # Configuração Turborepo
```
{{/if}}

{{#if single}}
**Projeto Único** - Estrutura tradicional

```
├── src/
│   ├── app/                 # App Router (páginas)
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilitários
│   └── types/               # Tipos TypeScript
└── public/                  # Arquivos estáticos
```
{{/if}}

---

## Autenticação

{{#if clerk}}
### Clerk

Login pronto com:
- Componentes de UI prontos
- Suporte a Google, GitHub, Email
- Proteção de rotas
- Gerenciamento de usuários

**Documentação:** [Tutorial Clerk](../tutoriais/04-auth-clerk.md)
{{/if}}

{{#if supabase-auth}}
### Supabase Auth

Autenticação integrada com:
- Email/Senha
- Magic Link
- OAuth providers
- Row Level Security

**Documentação:** [Tutorial Supabase Auth](../tutoriais/05-auth-supabase.md)
{{/if}}

{{#if no-auth}}
### Sem Autenticação Configurada

Você pode adicionar depois:
- [Clerk](../tutoriais/04-auth-clerk.md) - Mais fácil
- [Supabase Auth](../tutoriais/05-auth-supabase.md) - Integrado com banco
{{/if}}

---

## Banco de Dados

{{#if prisma}}
### Prisma + PostgreSQL

ORM type-safe com:
- Migrations automáticas
- Cliente gerado automaticamente
- Prisma Studio para visualizar dados

**Comandos principais:**
```bash
pnpm db:push      # Sincronizar schema
pnpm db:studio    # Interface visual
```

**Documentação:** [Tutorial Prisma](../tutoriais/06-banco-prisma.md)
{{/if}}

{{#if supabase}}
### Supabase

PostgreSQL gerenciado com:
- APIs REST automáticas
- Realtime subscriptions
- Storage para arquivos
- Edge Functions

**Documentação:** [Tutorial Supabase](../tutoriais/07-banco-supabase.md)
{{/if}}

{{#if no-db}}
### Sem Banco Configurado

Você pode adicionar depois:
- [Prisma](../tutoriais/06-banco-prisma.md) - ORM type-safe
- [Supabase](../tutoriais/07-banco-supabase.md) - Backend completo
{{/if}}

---

## Testes

{{#if testing}}
### Vitest + Playwright

- **Vitest:** Testes unitários e de integração
- **Playwright:** Testes E2E no browser

**Estrutura:**
```
├── tests/
│   ├── unit/           # Testes unitários
│   └── e2e/            # Testes end-to-end
```

**Comandos:**
```bash
pnpm test          # Todos os testes
pnpm test:unit     # Apenas unitários
pnpm test:e2e      # Apenas E2E
```
{{/if}}

{{#unless testing}}
### Sem Testes Configurados

Recomendamos adicionar testes para projetos em produção.
{{/unless}}

---

## CI/CD

{{#if ci}}
### GitHub Actions

Pipelines configurados para:
- **Push:** Lint + Typecheck + Testes
- **Pull Request:** Review automático
- **Deploy:** Automático na Vercel

**Arquivo:** `.github/workflows/ci.yml`
{{/if}}

{{#unless ci}}
### Sem CI/CD Configurado

Recomendamos configurar para projetos em produção.
{{/unless}}

---

## Zoryon Tasks

Sistema de gestão de tarefas integrado:

```bash
pnpm task add "titulo"   # Adicionar tarefa
pnpm task list           # Listar tarefas
pnpm task next           # Próxima tarefa
pnpm task done <id>      # Concluir tarefa
pnpm task status         # Status do projeto
```

---

## Documentação Disponível

### Docs
- [Comece Aqui](./COMECE-AQUI.md) - Primeiro passo
- [Erros Comuns](./ERROS-COMUNS.md) - Soluções rápidas
- [Comandos Essenciais](./COMANDOS-ESSENCIAIS.md) - Referência

### Tutoriais
1. [Primeiro Projeto](../tutoriais/01-primeiro-projeto.md)
2. [Executar com IA](../tutoriais/02-executar-com-ia.md)
3. [Deploy na Vercel](../tutoriais/03-deploy-vercel.md)
4. [Auth com Clerk](../tutoriais/04-auth-clerk.md)
5. [Auth com Supabase](../tutoriais/05-auth-supabase.md)
6. [Banco com Prisma](../tutoriais/06-banco-prisma.md)
7. [Banco com Supabase](../tutoriais/07-banco-supabase.md)
8. [Pagamentos com Stripe](../tutoriais/08-pagamentos-stripe.md)
9. [UI com Shadcn](../tutoriais/09-ui-shadcn.md)
10. [UI com MagicUI](../tutoriais/10-ui-magicui.md)
11. [Adicionar MCP](../tutoriais/11-adicionar-mcp.md)

---

## Configurações de IA

### Agentes Disponíveis

| IA | Arquivo de Config |
|----|-------------------|
| Claude Code | `.zoryon/agents/claude/CLAUDE.md` |
| Cursor | `.zoryon/agents/cursor/.cursorrules` |
| Kiro | `.zoryon/agents/kiro/kiro.config.json` |
| Trae | `.zoryon/agents/trae/trae.config.json` |

### MCP Templates

Templates prontos para Model Context Protocol:
- Supabase
- GitHub
- Filesystem
- Memory
- Context7

**Documentação:** [Adicionar MCP](../tutoriais/11-adicionar-mcp.md)

---

## Segurança

### Recursos de Segurança

- **Scanner:** Verifica secrets e vulnerabilidades
- **Husky:** Valida código antes de commits
- **Git Hooks:** Pre-commit e commit-msg

**Comando:**
```bash
pnpm security:scan
```

---

*Zoryon Genesis - O começo de tudo*
