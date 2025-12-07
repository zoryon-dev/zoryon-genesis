# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.1.0-alpha.1] - 2025-12-07

### Release Inicial

O começo de tudo. Primeira release pública do Zoryon Genesis.

#### Zoryon Flow - Da Ideia ao Código

Sistema completo para organizar suas ideias antes de começar a codar:

- Assistente interativo com perguntas simples
- Geração automática de briefing estruturado
- Arquivos prontos para sua IA expandir (PRD, User Stories)
- Integração perfeita com Claude, Cursor, Kiro e Trae

#### Zoryon Tasks - Gerenciador de Tarefas

Gerenciamento de tarefas com dependências, direto no terminal:

- `task add`, `task list`, `task next`, `task done`
- Sistema de dependências entre tarefas
- Visualização de grafo de dependências
- Detecção de ciclos e prevenção de dependências circulares
- `task next` só sugere tarefas desbloqueadas

#### Zoryon Security - Scanner de Segurança

Scanner que roda automaticamente antes de cada commit:

- Detecta API keys expostas
- Identifica senhas no código
- Bloqueia secrets do Stripe, JWT, etc.
- Integração com Git hooks (Husky)

#### 6 Agentes Inteligentes

- **Zory-Page** - Gerador de landing pages
- **Zory-Component** - Gerador de componentes React
- **Zory-Test** - Gerador de testes (unitários, integração, e2e)
- **Zory-Auth** - Configuração de autenticação (Clerk, NextAuth, Custom)
- **Zory-Guard** - Middlewares de proteção
- **Zory-Roles** - Sistema RBAC (Role-Based Access Control)

#### Documentação Completa

- 11 tutoriais práticos em português
- Documentação de comandos essenciais
- Guia de erros comuns
- FAQ completo

#### Integrações

- **Estruturas:** Single package, Turborepo, pnpm workspaces
- **Autenticação:** Clerk, Supabase Auth
- **Banco de dados:** Prisma + PostgreSQL, Supabase
- **Testes:** Vitest, Playwright
- **CI/CD:** GitHub Actions
- **IAs:** Claude Code, Cursor, Kiro, Trae

---

## Tipos de Mudanças

- **Adicionado** - Novas features
- **Melhorado** - Mudanças em features existentes
- **Obsoleto** - Features que serão removidas
- **Removido** - Features removidas
- **Corrigido** - Bug fixes
- **Segurança** - Vulnerabilidades corrigidas

---

## Links

- [README](README.md)
- [Como Contribuir](CONTRIBUTING.md)
- [FAQ](FAQ.md)
- [Documentação Completa](templates/zoryon/docs/COMECE-AQUI.md)
