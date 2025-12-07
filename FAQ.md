# FAQ - Perguntas Frequentes

Respostas para as dúvidas mais comuns sobre Zoryon Genesis.

---

## 📋 Índice

1. [Geral](#geral)
2. [Instalação e Setup](#instalação-e-setup)
3. [Uso e Features](#uso-e-features)
4. [Agentes Zoryon](#agentes-zoryon)
5. [Troubleshooting](#troubleshooting)
6. [Contribuição](#contribuição)

---

## 🌐 Geral

### O que é Zoryon Genesis?

Zoryon Genesis é um gerador inteligente de projetos Next.js que vai além de um simples boilerplate. Ele inclui:

- **Gerador Configurável:** Crie projetos com exatamente o que você precisa
- **8 Agentes IA:** Automatize tarefas repetitivas (componentes, testes, segurança, etc.)
- **Task Manager:** Organize seu trabalho com sistema de tarefas integrado
- **Integração com IAs:** Funciona perfeitamente com Claude Code, Cursor, Kiro e Trae
- **11 Tutoriais:** Guias práticos para implementar features

### Por que usar Zoryon Genesis ao invés de `create-next-app`?

| Feature | create-next-app | Zoryon Genesis |
|---------|----------------|----------------|
| Projeto básico | ✅ | ✅ |
| Auth pré-configurado | ❌ | ✅ (Clerk, Supabase) |
| Database setup | ❌ | ✅ (Prisma, Supabase) |
| Testes configurados | ❌ | ✅ (Vitest, Playwright) |
| Agentes de automação | ❌ | ✅ (8 agentes) |
| Task manager | ❌ | ✅ |
| Monorepo support | ❌ | ✅ (Turborepo, pnpm) |
| Git hooks | ❌ | ✅ (Husky + security) |
| Tutoriais práticos | ❌ | ✅ (11 tutoriais) |

### Qual a diferença entre Zoryon Genesis e outros templates?

Zoryon Genesis não é apenas um template - é um **sistema completo de desenvolvimento**:

1. **Geração Inteligente:** Você escolhe apenas o que precisa
2. **Agentes Automatizados:** Scripts que geram código seguindo best practices
3. **IA First:** Projetado para trabalhar com Claude Code e Cursor
4. **Task Manager:** Organize todo o desenvolvimento
5. **Documentação Rica:** 11 tutoriais + docs completas

---

## 💻 Instalação e Setup

### Como instalar?

```bash
# Clone o repositório
git clone https://github.com/zoryon-dev/zoryon-genesis.git meu-projeto
cd meu-projeto
pnpm install
pnpm dev
```

### Quais são os requisitos?

- **Node.js:** v18.17.0 ou superior
- **pnpm:** v8.0.0 ou superior (recomendado)
- **Git:** Para controle de versão
- **Sistema Operacional:** macOS, Linux ou Windows

### Posso usar npm ou yarn?

Sim, mas **pnpm é fortemente recomendado** porque:
- É 2-3x mais rápido
- Usa menos espaço em disco
- Gerencia workspaces melhor (para monorepos)
- É o padrão do Zoryon Genesis

Se insistir em npm/yarn, os comandos funcionarão, mas algumas features de monorepo podem ter problemas.

### O projeto funciona no Windows?

Sim! Zoryon Genesis funciona em Windows, mas:

✅ **Funciona:**
- Geração de projetos
- Todos os agentes Zoryon
- Task manager
- Build e deploy

⚠️ **Atenção:**
- Use PowerShell ou Windows Terminal (não CMD)
- Alguns scripts bash podem precisar de WSL
- Git hooks podem precisar de configuração adicional

**Recomendação:** Use WSL2 para melhor compatibilidade.

---

## 🚀 Uso e Features

### Como criar meu primeiro projeto?

```bash
# 1. Clone o repositório
git clone https://github.com/zoryon-dev/zoryon-genesis.git meu-projeto

# 2. Entre na pasta
cd meu-projeto

# 3. Instale dependências
pnpm install

# 4. Inicie o desenvolvimento
pnpm dev
```

### Como funciona o sistema de tasks?

```bash
# Ver todas as tarefas
pnpm task list

# Adicionar tarefa
pnpm task add "Implementar login"

# Marcar como concluída
pnpm task done 1

# Ver próxima tarefa disponível
pnpm task next

# Ver status geral
pnpm task status
```

Veja mais em [COMANDOS-ESSENCIAIS.md](templates/zoryon/docs/COMANDOS-ESSENCIAIS.md)

### Posso adicionar features depois?

Sim! Use os agentes Zory:

```bash
# Adicionar autenticação
pnpm zory:auth

# Adicionar componente
pnpm zory:component --type=button --name=MyButton

# Adicionar testes
pnpm zory:test --type=unit --target=MyButton
```

### Como funciona a integração com IA?

Zoryon Genesis é otimizado para IAs:

**Com Claude Code:**
```bash
# Claude lê automaticamente CLAUDE.md
# Use slash commands:
/tarefa     # Gerenciar tarefas
/iniciar    # Começar feature
/revisar    # Revisar código
```

**Com Cursor:**
```bash
# Cursor lê .cursorrules automaticamente
# Use @-mentions para contexto
@docs @tasks @components
```

---

## 🤖 Agentes Zoryon

### Quais agentes estão disponíveis?

| Agente | Versão | Função |
|--------|--------|--------|
| zory-auth | v0.0.5 | Configurar autenticação |
| zory-component | v1.0.0 | Gerar componentes React |
| zory-guard | v0.0.6 | Criar guards de proteção |
| zory-pages | v1.0.0 | Gerar páginas Next.js |
| zory-practices | v0.0.7 | Aplicar boas práticas |
| zory-roles | v0.0.3 | Sistema de roles RBAC |
| zory-security | v0.0.8 | Scanner de segurança |
| zory-test | v0.0.10 | Gerar testes |

### Como usar um agente?

```bash
# Modo interativo (recomendado)
pnpm zory:component

# Modo com argumentos
pnpm zory:component --type=button --name=PrimaryButton

# Ver ajuda
pnpm zory:component --help
```

### Os agentes sobrescrevem meu código?

**Não**, por padrão os agentes:

✅ **Seguro:**
- Perguntam antes de sobrescrever
- Criam arquivos novos
- Mostram preview antes de aplicar

⚠️ **Atenção:**
- Use flags `--force` com cuidado
- Sempre tenha backup (git)
- Revise código gerado

---

## 🔧 Troubleshooting

### Erro: "Diretório já existe"

**Causa:** Tentando clonar projeto em pasta existente.

**Solução:**
```bash
# Opção 1: Escolher outro nome
git clone https://github.com/zoryon-dev/zoryon-genesis.git outro-nome

# Opção 2: Remover pasta existente
rm -rf meu-projeto
git clone https://github.com/zoryon-dev/zoryon-genesis.git meu-projeto
```

### Erro: "Sem permissão de escrita"

**Causa:** Diretório atual não tem permissão de escrita.

**Solução:**
```bash
# Verificar permissões
ls -la

# Criar em outro diretório
cd ~/projects
git clone https://github.com/zoryon-dev/zoryon-genesis.git meu-projeto

# Ou ajustar permissões (cuidado!)
chmod u+w .
```

### Erro: "command not found: pnpm"

**Causa:** pnpm não instalado.

**Solução:**
```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Depois rode
pnpm install
```

### Testes não estão passando

**Causas comuns:**

1. **Dependências não instaladas:**
```bash
pnpm install
```

2. **Ambiente não configurado:**
```bash
cp .env.example .env
# Editar .env com credenciais
```

3. **Porta em uso:**
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
```

### Build falha

**Checklist:**

- [ ] `pnpm install` executado?
- [ ] `.env` configurado corretamente?
- [ ] Erros de TypeScript resolvidos?
- [ ] Todas as importações corretas?

```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
pnpm install
pnpm build
```

### Git hooks não funcionam

**Solução:**
```bash
# Reinstalar Husky
pnpm husky install

# Dar permissão de execução
chmod +x .husky/*

# Testar hook
git commit -m "test" --allow-empty
```

Veja mais em [ERROS-COMUNS.md](templates/zoryon/docs/ERROS-COMUNS.md)

---

## 🤝 Contribuição

### Como posso contribuir?

Várias formas:

1. **Reportar bugs** - Abra uma issue
2. **Sugerir features** - Abra uma discussion
3. **Melhorar docs** - Corrija erros ou adicione exemplos
4. **Código** - Envie pull requests
5. **Compartilhar** - Conte para outros desenvolvedores

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

### Como reportar um bug?

Abra uma issue com:

```markdown
### Bug: [Título curto]

**Passos para reproduzir:**
1. ...
2. ...

**Esperado:** ...
**Atual:** ...

**Ambiente:**
- OS: ...
- Node: ...
- pnpm: ...
```

### Posso criar meu próprio agente Zoryon?

Sim! Siga o padrão:

1. **Copie um agente existente** como template
2. **Siga a estrutura:**
   - Imports do `utils/common.mjs`
   - Modo interativo
   - Modo com argumentos
   - Help command
   - Validações
3. **Documente** em `docs/ZORY-[NOME].md`
4. **Teste** localmente
5. **Abra PR**

---

## 📚 Mais Recursos

- **Documentação Completa:** [COMECE-AQUI.md](templates/zoryon/docs/COMECE-AQUI.md)
- **Comandos Essenciais:** [COMANDOS-ESSENCIAIS.md](templates/zoryon/docs/COMANDOS-ESSENCIAIS.md)
- **Tutoriais:** [tutoriais/](templates/zoryon/tutoriais/)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Contribuir:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## ❓ Pergunta não respondida?

- **Abra uma Discussion:** Para perguntas gerais
- **Abra uma Issue:** Para bugs ou sugestões
- **Email:** [contato do projeto]

---

**Zoryon Genesis - O começo de tudo** 🚀
