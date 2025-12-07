# Guia de Contribuição - Zoryon Genesis

Obrigado por considerar contribuir com o Zoryon Genesis! 🎉

Este documento contém diretrizes para contribuir com o projeto.

---

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Posso Contribuir?](#como-posso-contribuir)
3. [Processo de Desenvolvimento](#processo-de-desenvolvimento)
4. [Padrões de Código](#padrões-de-código)
5. [Commits e Pull Requests](#commits-e-pull-requests)
6. [Estrutura do Projeto](#estrutura-do-projeto)

---

## 📜 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e acolhedor para todos.

**Comportamentos esperados:**
- ✅ Respeito mútuo
- ✅ Feedback construtivo
- ✅ Foco em melhorias
- ✅ Colaboração aberta

**Comportamentos inaceitáveis:**
- ❌ Linguagem ofensiva ou discriminatória
- ❌ Ataques pessoais
- ❌ Trolling ou spam
- ❌ Assédio de qualquer tipo

---

## 🤝 Como Posso Contribuir?

### Reportar Bugs

Encontrou um bug? Abra uma issue com:

1. **Título claro** - Descreva o problema em poucas palavras
2. **Passos para reproduzir** - Como fazer o bug acontecer
3. **Comportamento esperado** - O que deveria acontecer
4. **Comportamento atual** - O que está acontecendo
5. **Ambiente** - OS, versão do Node, etc.
6. **Screenshots** - Se aplicável

**Exemplo:**
```markdown
### Bug: Generator falha em Windows

**Passos:**
1. Executar `pnpm create` no Windows 11
2. Escolher opção "Turborepo"
3. Erro ao copiar arquivos

**Esperado:** Projeto criado com sucesso
**Atual:** Erro de permissão

**Ambiente:**
- OS: Windows 11
- Node: v20.10.0
- pnpm: 8.14.0
```

### Sugerir Melhorias

Tem uma ideia? Abra uma issue com:

1. **Motivação** - Por que essa melhoria é útil?
2. **Descrição** - Como funcionaria?
3. **Alternativas** - Outras abordagens consideradas?
4. **Impacto** - Quebraria compatibilidade?

### Contribuir com Código

1. **Fork** o repositório
2. **Crie um branch** para sua feature (`git checkout -b feature/minha-feature`)
3. **Faça suas mudanças** seguindo os padrões
4. **Teste** suas mudanças
5. **Commit** com mensagens descritivas
6. **Push** para seu fork
7. **Abra um Pull Request**

### Melhorar Documentação

Documentação nunca é demais! Você pode:

- Corrigir erros de digitação
- Melhorar explicações
- Adicionar exemplos
- Traduzir (futuro)
- Criar tutoriais
- Adicionar diagramas

---

## 🔧 Processo de Desenvolvimento

### Setup Local

```bash
# 1. Fork e clone
git clone https://github.com/SEU-USUARIO/zoryon-genesis.git
cd zoryon-genesis

# 2. Instalar dependências
pnpm install

# 3. Criar branch
git checkout -b feature/minha-contribuicao

# 4. Fazer mudanças
# ... código ...

# 5. Testar localmente
pnpm create  # Testar gerador

# 6. Commit e push
git add .
git commit -m "feat: adicionar nova feature"
git push origin feature/minha-contribuicao
```

### Testando Agentes Zoryon

```bash
# Testar um agente específico
node templates/zoryon/scripts/zory-test.mjs --help

# Testar geração de componente
node templates/zoryon/scripts/zory-component.mjs --type=button --name=TestButton

# Testar scanner de segurança
node templates/zoryon/scripts/zory-security.mjs
```

### Testando o Gerador

```bash
# Criar projeto de teste
cd /tmp
node /caminho/para/zoryon-genesis/scripts/create.mjs

# Testar diferentes configurações
# - Single vs Monorepo
# - Com/sem Auth
# - Com/sem Database
# - Com/sem Tests
```

---

## 📏 Padrões de Código

### JavaScript/TypeScript

- **ES Modules** (`.mjs` para scripts Node)
- **Async/Await** ao invés de callbacks
- **Destructuring** quando apropriado
- **Arrow functions** para callbacks
- **Template literals** para strings

**Exemplo:**
```javascript
// ✅ Bom
export async function generateProject(options) {
  const { projectName, structure } = options
  await copyFiles(projectName)
  return `Projeto ${projectName} criado!`
}

// ❌ Evitar
exports.generateProject = function(options, callback) {
  var projectName = options.projectName
  copyFiles(projectName, function(err) {
    callback(null, 'Projeto ' + projectName + ' criado!')
  })
}
```

### Nomenclatura

- **Arquivos:** `kebab-case.mjs`
- **Funções:** `camelCase()`
- **Classes:** `PascalCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Variáveis:** `camelCase`

**Padrões do Projeto:**
- Scripts agentes: `zory-{nome}.mjs`
- Docs gerais: `UPPERCASE.md`
- Docs agentes: `ZORY-{NOME}.md`
- Tutoriais: `NN-nome.md` (ex: `01-primeiro-projeto.md`)

### Comentários

```javascript
// ✅ Comentários úteis
/**
 * Gera projeto Next.js com configurações customizadas
 * @param {object} options - Opções de configuração
 * @param {string} projectPath - Caminho do projeto
 * @returns {Promise<void>}
 */
export async function generateProject(options, projectPath) {
  // Validar permissões antes de criar arquivos
  await validatePermissions(projectPath)

  // ...
}

// ❌ Comentários óbvios
// Incrementa i
i++
```

### Imports

```javascript
// ✅ Ordem de imports
// 1. Node built-ins
import fs from 'fs'
import path from 'path'

// 2. External packages
import { confirm } from '@clack/prompts'

// 3. Internal modules
import { generateProject } from './generator.mjs'
import { colors, log } from './utils/common.mjs'
```

---

## 📝 Commits e Pull Requests

### Mensagens de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

**Formato:**
```
tipo(escopo): descrição curta

Descrição detalhada (opcional)

Rodapé (opcional)
```

**Tipos:**
- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `chore`: Manutenção

**Exemplos:**
```bash
feat(generator): adicionar validação de permissões

Adiciona validação de permissão de escrita antes de criar
projeto para evitar falhas parciais.

Closes #123

---

fix(zory-test): corrigir geração de testes E2E

O template estava com placeholder incorreto.

---

docs(readme): atualizar seção de instalação

Adiciona instruções para pnpm.

---

refactor(common): extrair funções duplicadas

Cria módulo utils/common.mjs com funções compartilhadas,
eliminando ~250 linhas de duplicação.
```

### Pull Requests

**Checklist antes de abrir PR:**

- [ ] Código segue os padrões do projeto
- [ ] Commits seguem Conventional Commits
- [ ] Testes passam localmente
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem `console.log` esquecidos
- [ ] Sem comentários de debug
- [ ] Branch atualizado com `main`

**Template de PR:**
```markdown
## Descrição
Breve descrição do que foi feito

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)
...

## Checklist
- [ ] Código segue padrões
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Nenhuma breaking change (ou documentada)
```

---

## 🗂️ Estrutura do Projeto

```
zoryon-genesis/
├── scripts/               # Scripts de geração
│   ├── create.mjs        # CLI principal
│   └── generator.mjs     # Lógica de geração
├── templates/
│   ├── auth/             # Templates de auth
│   ├── base/             # Arquivos base
│   ├── database/         # Configs de DB
│   ├── structures/       # Estruturas de projeto
│   └── zoryon/           # ⭐ Sistema Zoryon
│       ├── agents/       # Configs de IA
│       ├── docs/         # Documentação
│       ├── scripts/      # Agentes zory-*
│       │   └── utils/    # Utilidades compartilhadas
│       ├── tasks/        # Task manager
│       ├── test/         # Templates de teste
│       └── tutoriais/    # Tutoriais práticos
├── docs-dev/             # Docs privados (gitignored)
├── README.md             # README público
├── CHANGELOG.md          # Histórico de mudanças
├── CONTRIBUTING.md       # Este arquivo
└── FAQ.md                # Perguntas frequentes
```

### Convenções de Diretórios

- **`scripts/`** - Scripts de setup/geração do projeto
- **`templates/`** - Templates copiados para projetos gerados
- **`templates/zoryon/`** - Sistema Zoryon (agentes, docs, tasks)
- **`docs-dev/`** - Documentação interna (NÃO versionada)

### Arquivos Importantes

- **`scripts/create.mjs`** - Entry point do CLI
- **`scripts/generator.mjs`** - Lógica principal de geração
- **`templates/zoryon/scripts/utils/common.mjs`** - Utilidades compartilhadas
- **`templates/zoryon/docs/`** - Documentação do usuário

---

## 🔍 Review Process

1. **Automated Checks**
   - Linting (se configurado)
   - Tests (se existirem)

2. **Manual Review**
   - Código é legível?
   - Segue padrões do projeto?
   - Documentação adequada?
   - Testes cobrem mudanças?

3. **Aprovação**
   - Pelo menos 1 aprovação de maintainer
   - Todos os comentários resolvidos
   - CI passando

---

## ❓ Dúvidas?

- **Issues:** Para bugs e sugestões
- **Discussions:** Para perguntas gerais
- **Email:** [contato do projeto]

---

## 📚 Recursos

- [README](README.md) - Visão geral do projeto
- [CHANGELOG](CHANGELOG.md) - Histórico de mudanças
- [FAQ](FAQ.md) - Perguntas frequentes
- [Documentação](templates/zoryon/docs/COMECE-AQUI.md) - Guia completo

---

**Obrigado por contribuir! 🚀**

*Zoryon Genesis - O começo de tudo*
