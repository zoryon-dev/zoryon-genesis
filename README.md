<p align="center">
  <pre align="center">
███████╗ ██████╗ ██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗
╚══███╔╝██╔═══██╗██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║
  ███╔╝ ██║   ██║██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║
 ███╔╝  ██║   ██║██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║
███████╗╚██████╔╝██║  ██║   ██║   ╚██████╔╝██║ ╚████║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝
 ██████╗ ███████╗███╗   ██╗███████╗███████╗██╗███████╗
██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝
██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████╗██║███████╗
██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║██║╚════██║
╚██████╔╝███████╗██║ ╚████║███████╗███████║██║███████║
 ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝
  </pre>
</p>

<h3 align="center">O começo de tudo. Seu primeiro projeto profissional, do zero ao deploy.</h3>

<p align="center">
  <img src="https://img.shields.io/badge/versão-0.1.0--alpha.2-blue?style=for-the-badge" alt="Versão" />
  <img src="https://img.shields.io/badge/para-iniciantes-brightgreen?style=for-the-badge" alt="Para Iniciantes" />
  <img src="https://img.shields.io/badge/100%25-português-yellow?style=for-the-badge" alt="Português" />
  <img src="https://img.shields.io/badge/licença-MIT-orange?style=for-the-badge" alt="MIT" />
</p>

<p align="center">
  <a href="#-início-rápido">Início Rápido</a> •
  <a href="#-por-que-zoryon-genesis">Por que usar</a> •
  <a href="#-zoryon-flow">Zoryon Flow</a> •
  <a href="#-zoryon-tasks">Zoryon Tasks</a> •
  <a href="#-integração-com-ia">Integração com IA</a> •
  <a href="CHANGELOG.md">Changelog</a>
</p>

---

## Por que Zoryon Genesis?

Você não precisa de **Lovable**, **v0** ou **builders no-code**.

Essas ferramentas são legais para prototipar, mas:

- **Você não aprende** - O código é gerado e você não entende
- **Fica preso** - Precisa pagar para continuar ou exportar
- **Código confuso** - Difícil de manter e evoluir
- **Sem controle** - Não sabe o que está rodando

**Zoryon Genesis** é diferente:

> Você começa com código real, organizado, que você entende e controla.
> A documentação em português te guia passo a passo.

| Problema comum | Como o Genesis resolve |
|----------------|------------------------|
| "Não sei por onde começar" | Assistente interativo te guia em cada escolha |
| "Tenho uma ideia mas não sei organizar" | **Zoryon Flow** estrutura sua ideia antes de codar |
| "Código bagunçado" | Estrutura profissional desde o primeiro dia |
| "Não entendo o que estou fazendo" | 11 tutoriais em português, do básico ao deploy |
| "Medo de errar" | Sistema de segurança bloqueia erros antes do commit |
| "Perco o foco" | **Zoryon Tasks** te ajuda a organizar o que fazer |
| "IA não entende meu projeto" | Configurações prontas para Claude, Cursor, Kiro e Trae |

---

## Início Rápido

```bash
# 1. Clone o projeto
git clone https://github.com/zoryon-dev/zoryon-genesis.git meu-projeto

# 2. Entre na pasta
cd meu-projeto

# 3. Instale as dependências
pnpm install

# 4. Inicie o desenvolvimento
pnpm dev
```

**Em 2 minutos você tem um projeto pronto para desenvolver.**

### Próximo passo: Peça ajuda para sua IA

Abra o projeto com Claude Code, Cursor ou sua IA preferida e diga:

> "Leia `.zoryon/flow/PARA-IA-LER.md` e me ajude a começar"

A IA vai entender o projeto e te guiar!

---

## Zoryon Flow

### Da Ideia ao Código

O Zoryon Flow é um processo simples que te ajuda a ir da ideia ao código:

```
┌─────────────────────────────────────────────────────────────────┐
│                        ZORYON FLOW                              │
│                                                                 │
│   IDEIA  →  BRIEFING  →  IA EXPANDE  →  TAREFAS  →  CÓDIGO     │
│   (você)    (assistente)   (sua IA)     (Zoryon)    (você+IA)  │
└─────────────────────────────────────────────────────────────────┘
```

**Como funciona:**

1. Você responde algumas perguntas simples sobre o que quer construir
2. O assistente gera um **briefing** estruturado
3. Sua IA (Claude, Cursor, etc) expande em PRD, user stories e tarefas
4. Você começa a desenvolver com tudo organizado

**Arquivos gerados:**

```
.zoryon/flow/
├── PARA-IA-LER.md    # Instruções para sua IA
├── BRIEFING.md       # Sua ideia estruturada
├── PRD.md            # PRD (IA preenche)
└── STORIES.md        # User stories (IA preenche)
```

**Por que isso funciona:**

- **Você pensa antes de codar** - Evita retrabalho
- **Sua IA entende o contexto** - Ajuda mais efetivamente
- **Tudo fica documentado** - Não perde informação
- **Sem complexidade** - 5-6 perguntas simples, não 50

---

## Zoryon Tasks

**Gerenciamento de tarefas com dependências, direto no terminal.**

```bash
# Comandos básicos
pnpm task add "Criar página de login"   # Adicionar tarefa
pnpm task list                          # Ver todas
pnpm task next                          # Próxima tarefa disponível
pnpm task done 1                        # Marcar como feita
pnpm task status                        # Ver progresso

# Dependências
pnpm task depends 3 --on 1              # Tarefa 3 depende da 1
pnpm task graph                         # Visualizar grafo
```

**Visualização:**

```
┌─────────────────────────────────────────────────┐
│  ZORYON TASKS                                   │
├─────────────────────────────────────────────────┤
│  ○ [1] Configurar autenticação                  │
│  → [2] Criar página de login       ← EM PROGRESSO│
│  ⊘ [3] Adicionar perfil (deps: 1,2) [BLOQUEADA] │
│  ✓ [4] Configurar projeto                       │
├─────────────────────────────────────────────────┤
│  Disponíveis: 1  │  Bloqueadas: 1  │  25%       │
└─────────────────────────────────────────────────┘
```

**Grafo de dependências:**

```
┌─────────────────────────────────────────────────┐
│             GRAFO DE DEPENDÊNCIAS               │
├─────────────────────────────────────────────────┤
│ ○ [1] Setup inicial ──► [2, 3]                  │
│   ○ [2] Configurar auth ──► [4, 5]              │
│   ○ [3] Configurar banco                        │
│     ○ [4] Página de login                       │
│     ○ [5] Página de perfil                      │
├─────────────────────────────────────────────────┤
│ Legenda: ○ pendente  → em progresso  ✓ concluída│
└─────────────────────────────────────────────────┘
```

---

## Zoryon Security

**Scanner de segurança que roda antes de cada commit.**

| Problema | Exemplo | Por que é grave |
|----------|---------|-----------------|
| **API Keys expostas** | `sk_live_abc123...` | Qualquer um pode usar sua conta |
| **Senhas no código** | `password = "123456"` | Acesso não autorizado |
| **Secrets do Stripe** | `sk_test_...` | Cobranças fraudulentas |
| **JWT exposto** | `eyJ...` | Acesso ao banco de dados |

**Roda automaticamente via Git hooks.** Você não precisa lembrar.

---

## O que você recebe

### Estrutura do Projeto

```
meu-projeto/
├── .zoryon/
│   ├── flow/                   # Zoryon Flow
│   │   ├── PARA-IA-LER.md      # Instruções para sua IA
│   │   ├── BRIEFING.md         # Sua ideia estruturada
│   │   ├── PRD.md              # PRD (IA preenche)
│   │   └── STORIES.md          # User stories (IA preenche)
│   ├── docs/                   # Documentação em português
│   │   ├── COMECE-AQUI.md      # Primeiro arquivo para ler
│   │   ├── ERROS-COMUNS.md     # Soluções para problemas
│   │   └── COMANDOS.md         # Referência rápida
│   ├── tutoriais/              # 11 tutoriais passo a passo
│   ├── tasks/                  # Zoryon Tasks (gerenciador)
│   └── security/               # Zoryon Security (scanner)
├── src/                        # Seu código
├── CLAUDE.md                   # Instruções para Claude Code
├── .cursorrules                # Regras para Cursor
└── package.json
```

### 11 Tutoriais em Português

| Tutorial | O que você aprende |
|----------|-------------------|
| 01 - Primeiro Projeto | Estrutura, arquivos, como tudo funciona |
| 02 - Executar com IA | Como usar Claude, Cursor, ou outra IA |
| 03 - Deploy na Vercel | Colocar online em 5 minutos |
| 04 - Auth com Clerk | Login/cadastro funcionando |
| 05 - Auth com Supabase | Alternativa gratuita ao Clerk |
| 06 - Banco com Prisma | Salvar dados de verdade |
| 07 - Banco com Supabase | Alternativa mais simples |
| 08 - Pagamentos Stripe | Cobrar dos seus usuários |
| 09 - UI com Shadcn | Componentes bonitos |
| 10 - UI com MagicUI | Animações e efeitos |
| 11 - Adicionar MCP | Conectar IA ao seu projeto |

---

## Integração com IA

### Todas as IAs leem o mesmo arquivo

O arquivo `.zoryon/flow/PARA-IA-LER.md` contém instruções claras para qualquer IA:

- Contexto do projeto
- O que você quer construir
- O que a IA deve fazer
- Próximos passos recomendados

### Configurações prontas

| IA | Arquivo | O que faz |
|----|---------|-----------|
| **Claude Code** | `CLAUDE.md` | Instruções detalhadas + slash commands |
| **Cursor** | `.cursorrules` | Padrões de código e convenções |
| **Kiro** | `kiro.config.json` | Configuração completa |
| **Trae** | `trae.config.json` | Workflow automatizado |

### Como usar

1. Abra seu projeto com sua IA favorita
2. A IA automaticamente lê as configurações
3. Diga: "Leia o arquivo `.zoryon/flow/PARA-IA-LER.md`"
4. A IA entende seu projeto e te ajuda

---

## Tecnologias

| Tecnologia | Versão | Por que usar |
|------------|--------|--------------|
| **Next.js** | 16 | Framework React mais usado |
| **React** | 19 | Biblioteca de UI moderna |
| **TypeScript** | 5 | JavaScript com tipos (menos bugs) |
| **Tailwind CSS** | 4 | Estilização rápida e consistente |
| **pnpm** | 9+ | Instalação de pacotes mais rápida |

### Opcionais (você escolhe)

| Tecnologia | Para que serve |
|------------|----------------|
| **Clerk** | Login/cadastro sem complicação |
| **Supabase** | Banco de dados + auth + storage |
| **Prisma** | Acessar banco com TypeScript |
| **Vitest** | Testes que rodam rápido |
| **Playwright** | Testar como usuário real |
| **Turborepo** | Monorepo para projetos grandes |

---

## Comandos Essenciais

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor local
pnpm build            # Compilar para produção
pnpm lint             # Verificar erros de código
pnpm typecheck        # Verificar tipos TypeScript

# Zoryon Tasks
pnpm task add "x"     # Nova tarefa
pnpm task list        # Ver todas
pnpm task next        # Próxima tarefa disponível
pnpm task done 1      # Marcar como feita
pnpm task status      # Resumo do progresso
pnpm task depends 3 --on 1  # Adicionar dependência
pnpm task graph       # Visualizar grafo

# Banco de Dados (se usar Prisma)
pnpm db:push          # Sincronizar schema
pnpm db:studio        # Interface visual

# Segurança
pnpm security:scan    # Verificar manualmente
```

---

## Requisitos

- **Node.js 18+** - [Instalar](https://nodejs.org/)
- **pnpm 9+** - `npm install -g pnpm`

---

## Perguntas Frequentes

<details>
<summary><strong>Preciso saber programar?</strong></summary>

Um pouco. Se você sabe o básico de JavaScript/React, consegue usar. Os tutoriais explicam o resto.
</details>

<details>
<summary><strong>É de graça?</strong></summary>

Sim, 100%. Licença MIT - use como quiser, inclusive comercialmente.
</details>

<details>
<summary><strong>Posso usar com [minha IA favorita]?</strong></summary>

Sim! O arquivo `PARA-IA-LER.md` funciona com qualquer IA que entende markdown.
</details>

<details>
<summary><strong>E se eu não tiver ideia ainda?</strong></summary>

Sem problema. Escolha "Não ainda" quando o assistente perguntar. Você pode criar o briefing depois.
</details>

Mais perguntas? Veja o [FAQ completo](FAQ.md).

---

## Contribuindo

Encontrou um bug? Tem uma ideia? Contribuições são bem-vindas!

Veja o guia completo em **[CONTRIBUTING.md](CONTRIBUTING.md)**.

**Resumo rápido:**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Push (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## Links

| Documento | Descrição |
|-----------|-----------|
| **[CHANGELOG.md](CHANGELOG.md)** | Histórico de versões e mudanças |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Guia para contribuidores |
| **[FAQ.md](FAQ.md)** | Perguntas frequentes |
| **[LICENSE](LICENSE)** | Licença MIT |

---

## Licença

MIT - Use como quiser. Veja [LICENSE](LICENSE) para detalhes.

---

## 🌎 English

> Zoryon Genesis is a Next.js template designed for Portuguese-speaking developers.
> Full documentation in Brazilian Portuguese.

---

<p align="center">
  <strong>Criado por Jonas Silva</strong>
  <br />
  <a href="https://zoryon.org">zoryon.org</a> •
  <a href="https://instagram.com/o.jonas.silva">@o.jonas.silva</a>
</p>

<p align="center">
  <br />
  <strong>Zoryon Genesis v0.1.0-alpha.2</strong>
  <br />
  <em>O começo de tudo. Da ideia ao código, com organização desde o primeiro dia.</em>
</p>
