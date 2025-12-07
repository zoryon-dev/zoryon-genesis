import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates')
const ZORYON_DIR = path.join(TEMPLATES_DIR, 'zoryon')
const HUSKY_DIR = path.join(TEMPLATES_DIR, 'husky')

/**
 * Copy a directory recursively
 */
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

/**
 * Copy a file and replace placeholders
 */
async function copyFileWithReplacements(src, dest, replacements) {
  let content = await fs.readFile(src, 'utf-8')

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(key, 'g'), value)
  }

  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, content)
}

/**
 * Merge dependencies from multiple sources
 */
function mergeDependencies(...sources) {
  const result = {
    dependencies: {},
    devDependencies: {},
    scripts: {},
  }

  for (const source of sources) {
    if (source.dependencies) {
      Object.assign(result.dependencies, source.dependencies)
    }
    if (source.devDependencies) {
      Object.assign(result.devDependencies, source.devDependencies)
    }
    if (source.scripts) {
      Object.assign(result.scripts, source.scripts)
    }
  }

  return result
}

/**
 * Read dependencies.json from a template folder
 */
async function readDependencies(templatePath) {
  try {
    const content = await fs.readFile(path.join(templatePath, 'dependencies.json'), 'utf-8')
    return JSON.parse(content)
  } catch {
    return { dependencies: {}, devDependencies: {}, scripts: {} }
  }
}

/**
 * Helper: Replace placeholder in a single file
 */
async function replaceInFile(filePath, projectName) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const updated = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName)
    await fs.writeFile(filePath, updated)
  } catch {
    // Ignore binary files
  }
}

/**
 * Helper: Walk directory tree and replace placeholders
 */
async function walkAndReplace(dir, projectName) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkAndReplace(fullPath, projectName)
    } else {
      await replaceInFile(fullPath, projectName)
    }
  }
}

/**
 * Generate project based on options
 */
export async function generateProject(options, projectPath) {
  const { projectName, structure, auth, database, testing, ci } = options
  const replacements = { '{{PROJECT_NAME}}': projectName }

  // Validate write permissions in current directory
  const parentDir = path.dirname(projectPath)
  try {
    await fs.access(parentDir, fs.constants.W_OK)
  } catch (error) {
    throw new Error(`❌ Sem permissão de escrita em: ${parentDir}\n\nVerifique as permissões do diretório e tente novamente.`)
  }

  // Create project directory
  await fs.mkdir(projectPath, { recursive: true })

  // Copy base files
  const baseDir = path.join(TEMPLATES_DIR, 'base')
  const baseFiles = ['.gitignore', '.prettierrc', '.prettierignore']
  for (const file of baseFiles) {
    await copyFileWithReplacements(
      path.join(baseDir, file),
      path.join(projectPath, file),
      replacements
    )
  }

  // Copy structure-specific files
  const structureDir = path.join(TEMPLATES_DIR, 'structures', structure)

  if (structure === 'single') {
    // Single package: copy everything directly
    await copyDir(structureDir, projectPath)

    // Replace placeholders in all files
    await walkAndReplace(projectPath, projectName)
  } else {
    // Monorepo: copy structure files
    const filesToCopy = ['pnpm-workspace.yaml', 'package.json']
    if (structure === 'turborepo') {
      filesToCopy.push('turbo.json')
    }

    for (const file of filesToCopy) {
      await copyFileWithReplacements(
        path.join(structureDir, file),
        path.join(projectPath, file),
        replacements
      )
    }

    // Copy apps and packages
    await copyDir(path.join(structureDir, 'apps'), path.join(projectPath, 'apps'))
    await copyDir(path.join(structureDir, 'packages'), path.join(projectPath, 'packages'))

    // Replace placeholders
    await walkAndReplace(projectPath, projectName)
  }

  // Collect additional dependencies
  const additionalDeps = []
  let envContent = '# Environment Variables\n\n'

  // Auth
  if (auth !== 'none') {
    const authDir = path.join(TEMPLATES_DIR, 'auth', auth)
    additionalDeps.push(await readDependencies(authDir))

    // Copy auth files
    const authEnv = await fs.readFile(path.join(authDir, 'env.example'), 'utf-8')
    envContent += `# Authentication (${auth})\n${authEnv}\n`

    // Copy middleware and lib files
    const srcDir = structure === 'single' ? path.join(projectPath, 'src') : path.join(projectPath, 'apps', 'web', 'src')

    if (auth === 'clerk') {
      await copyFileWithReplacements(
        path.join(authDir, 'middleware.ts'),
        path.join(srcDir, 'middleware.ts'),
        replacements
      )
    } else if (auth === 'supabase') {
      await fs.mkdir(path.join(srcDir, 'lib', 'supabase'), { recursive: true })
      await copyFileWithReplacements(
        path.join(authDir, 'client.ts'),
        path.join(srcDir, 'lib', 'supabase', 'client.ts'),
        replacements
      )
      await copyFileWithReplacements(
        path.join(authDir, 'server.ts'),
        path.join(srcDir, 'lib', 'supabase', 'server.ts'),
        replacements
      )
      await copyFileWithReplacements(
        path.join(authDir, 'middleware.ts'),
        path.join(srcDir, 'lib', 'supabase', 'middleware.ts'),
        replacements
      )
      await copyFileWithReplacements(
        path.join(authDir, 'middleware-entry.ts'),
        path.join(srcDir, 'middleware.ts'),
        replacements
      )
    }
  }

  // Database
  if (database !== 'none') {
    const dbDir = path.join(TEMPLATES_DIR, 'database', database)
    additionalDeps.push(await readDependencies(dbDir))

    // Add env vars
    const dbEnv = await fs.readFile(path.join(dbDir, 'env.example'), 'utf-8')
    envContent += `# Database (${database})\n${dbEnv}\n`

    // Copy database files
    if (database === 'prisma') {
      if (structure === 'single') {
        await fs.mkdir(path.join(projectPath, 'prisma'), { recursive: true })
        await copyFileWithReplacements(
          path.join(dbDir, 'schema.prisma'),
          path.join(projectPath, 'prisma', 'schema.prisma'),
          replacements
        )
        await copyFileWithReplacements(
          path.join(dbDir, 'client.ts'),
          path.join(projectPath, 'src', 'lib', 'db.ts'),
          replacements
        )
      } else {
        // Monorepo: create database package
        const dbPkgDir = path.join(projectPath, 'packages', 'database')
        await fs.mkdir(path.join(dbPkgDir, 'prisma'), { recursive: true })
        await fs.mkdir(path.join(dbPkgDir, 'src'), { recursive: true })

        await copyFileWithReplacements(
          path.join(dbDir, 'schema.prisma'),
          path.join(dbPkgDir, 'prisma', 'schema.prisma'),
          replacements
        )
        await copyFileWithReplacements(
          path.join(dbDir, 'client.ts'),
          path.join(dbPkgDir, 'src', 'client.ts'),
          replacements
        )

        // Create package.json for database package
        const dbPkgJson = {
          name: '@workspace/database',
          version: '0.0.0',
          private: true,
          main: './src/client.ts',
          types: './src/client.ts',
          exports: {
            '.': './src/client.ts',
          },
          scripts: {
            'db:generate': 'prisma generate',
            'db:push': 'prisma db push',
            'db:migrate': 'prisma migrate dev',
            'db:studio': 'prisma studio',
          },
          dependencies: {
            '@prisma/client': '^6.2.0',
          },
          devDependencies: {
            prisma: '^6.2.0',
            '@workspace/config-typescript': 'workspace:*',
          },
        }
        await fs.writeFile(
          path.join(dbPkgDir, 'package.json'),
          JSON.stringify(dbPkgJson, null, 2)
        )

        // Add @workspace/database dependency to web app
        const webPkgPath = path.join(projectPath, 'apps', 'web', 'package.json')
        const webPkg = JSON.parse(await fs.readFile(webPkgPath, 'utf-8'))
        webPkg.dependencies['@workspace/database'] = 'workspace:*'
        await fs.writeFile(webPkgPath, JSON.stringify(webPkg, null, 2))
      }
    } else if (database === 'supabase') {
      // Supabase: copy client files if not already done by auth
      const srcDir = structure === 'single' ? path.join(projectPath, 'src') : path.join(projectPath, 'apps', 'web', 'src')
      const supabaseLibDir = path.join(srcDir, 'lib', 'supabase')

      // Only copy if not already copied by auth
      try {
        await fs.access(path.join(supabaseLibDir, 'client.ts'))
      } catch {
        await fs.mkdir(supabaseLibDir, { recursive: true })
        await copyFileWithReplacements(
          path.join(dbDir, 'client.ts'),
          path.join(supabaseLibDir, 'client.ts'),
          replacements
        )
        await copyFileWithReplacements(
          path.join(dbDir, 'server.ts'),
          path.join(supabaseLibDir, 'server.ts'),
          replacements
        )
      }
    }
  }

  // Testing
  if (testing) {
    const vitestDir = path.join(TEMPLATES_DIR, 'testing', 'vitest')
    const playwrightDir = path.join(TEMPLATES_DIR, 'testing', 'playwright')

    additionalDeps.push(await readDependencies(vitestDir))
    additionalDeps.push(await readDependencies(playwrightDir))

    // Copy test configs
    await copyFileWithReplacements(
      path.join(vitestDir, 'vitest.config.ts'),
      path.join(projectPath, 'vitest.config.ts'),
      replacements
    )
    await copyFileWithReplacements(
      path.join(playwrightDir, 'playwright.config.ts'),
      path.join(projectPath, 'playwright.config.ts'),
      replacements
    )

    // Create tests directory
    await fs.mkdir(path.join(projectPath, 'tests', 'unit'), { recursive: true })
    await fs.mkdir(path.join(projectPath, 'tests', 'e2e'), { recursive: true })

    await copyFileWithReplacements(
      path.join(vitestDir, 'setup.ts'),
      path.join(projectPath, 'tests', 'setup.ts'),
      replacements
    )
    await copyFileWithReplacements(
      path.join(vitestDir, 'example.test.ts'),
      path.join(projectPath, 'tests', 'unit', 'example.test.ts'),
      replacements
    )
    await copyFileWithReplacements(
      path.join(playwrightDir, 'example.spec.ts'),
      path.join(projectPath, 'tests', 'e2e', 'example.spec.ts'),
      replacements
    )
  }

  // CI/CD
  if (ci) {
    const ciDir = path.join(TEMPLATES_DIR, 'ci', 'workflows')
    await fs.mkdir(path.join(projectPath, '.github', 'workflows'), { recursive: true })

    await copyFileWithReplacements(
      path.join(ciDir, 'ci.yml'),
      path.join(projectPath, '.github', 'workflows', 'ci.yml'),
      replacements
    )
    await copyFileWithReplacements(
      path.join(ciDir, 'preview.yml'),
      path.join(projectPath, '.github', 'workflows', 'preview.yml'),
      replacements
    )
  }

  // Add app URL to env
  envContent += '# App\nNEXT_PUBLIC_APP_URL=http://localhost:3000\n'

  // Write .env.example
  await fs.writeFile(path.join(projectPath, '.env.example'), envContent)

  // Copy Zoryon structure
  await copyZoryonStructure(projectPath, options)

  // Generate Flow documentation (BRIEFING.md, PARA-IA-LER.md)
  await generateFlowDocs(projectPath, options)

  // Merge additional dependencies into package.json
  if (additionalDeps.length > 0 && structure === 'single') {
    const merged = mergeDependencies(...additionalDeps)
    const pkgPath = path.join(projectPath, 'package.json')
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))

    Object.assign(pkg.dependencies, merged.dependencies)
    Object.assign(pkg.devDependencies, merged.devDependencies)
    Object.assign(pkg.scripts, merged.scripts)

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))
  } else if (additionalDeps.length > 0 && (structure === 'turborepo' || structure === 'workspaces')) {
    // Add to web app package.json
    const merged = mergeDependencies(...additionalDeps)
    const webPkgPath = path.join(projectPath, 'apps', 'web', 'package.json')
    const webPkg = JSON.parse(await fs.readFile(webPkgPath, 'utf-8'))

    Object.assign(webPkg.dependencies, merged.dependencies)
    Object.assign(webPkg.devDependencies, merged.devDependencies)
    Object.assign(webPkg.scripts, merged.scripts)

    await fs.writeFile(webPkgPath, JSON.stringify(webPkg, null, 2))
  }

  // Create README
  await createReadme(projectPath, options)

  // Create root documentation files
  await createRootDocs(projectPath, options)
}

/**
 * Create README.md
 */
async function createReadme(projectPath, options) {
  const { projectName, structure, auth, database, testing, ci, gitHooks } = options

  const sections = []

  sections.push(`# ${projectName}`)
  sections.push('')
  sections.push('> Criado com **Zoryon Genesis** - O começo de tudo.')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Início Rápido')
  sections.push('')
  sections.push('```bash')
  sections.push('# Instalar dependências')
  sections.push('pnpm install')
  sections.push('')
  sections.push('# Configurar ambiente')
  sections.push('cp .env.example .env')
  sections.push('# Edite o .env com suas credenciais')
  sections.push('')

  if (database === 'prisma') {
    sections.push('# Configurar banco de dados')
    sections.push('pnpm db:push')
    sections.push('')
  }

  sections.push('# Iniciar servidor de desenvolvimento')
  sections.push('pnpm dev')
  sections.push('```')
  sections.push('')
  sections.push('Acesse http://localhost:3000')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Stack')
  sections.push('')
  sections.push('| Tecnologia | Descrição |')
  sections.push('|------------|-----------|')
  sections.push('| Next.js 16 | Framework React |')
  sections.push('| TypeScript 5 | Tipagem estática |')
  sections.push('| Tailwind CSS 4 | Framework CSS |')

  if (structure !== 'single') {
    sections.push(`| ${structure === 'turborepo' ? 'Turborepo' : 'pnpm workspaces'} | Monorepo |`)
  }

  if (auth !== 'none') {
    sections.push(`| ${auth === 'clerk' ? 'Clerk' : 'Supabase Auth'} | Autenticação |`)
  }

  if (database !== 'none') {
    sections.push(`| ${database === 'prisma' ? 'Prisma + PostgreSQL' : 'Supabase'} | Banco de dados |`)
  }

  if (testing) {
    sections.push('| Vitest + Playwright | Testes |')
  }

  if (ci) {
    sections.push('| GitHub Actions | CI/CD |')
  }

  if (gitHooks) {
    sections.push('| Husky | Git Hooks (validação automática) |')
  }

  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Comandos')
  sections.push('')
  sections.push('### Desenvolvimento')
  sections.push('')
  sections.push('```bash')
  sections.push('pnpm dev        # Iniciar servidor')
  sections.push('pnpm build      # Compilar')
  sections.push('pnpm lint       # Verificar código')
  sections.push('pnpm typecheck  # Verificar tipos')
  sections.push('```')
  sections.push('')
  sections.push('### Zoryon Tasks')
  sections.push('')
  sections.push('```bash')
  sections.push('pnpm task list    # Ver todas as tarefas')
  sections.push('pnpm task next    # Iniciar próxima tarefa')
  sections.push('pnpm task done 1  # Concluir tarefa #1')
  sections.push('pnpm task status  # Ver progresso')
  sections.push('```')

  if (testing) {
    sections.push('')
    sections.push('### Testes')
    sections.push('')
    sections.push('```bash')
    sections.push('pnpm test:unit  # Testes unitários')
    sections.push('pnpm test:e2e   # Testes E2E')
    sections.push('```')
  }

  if (database === 'prisma') {
    sections.push('')
    sections.push('### Banco de Dados')
    sections.push('')
    sections.push('```bash')
    sections.push('pnpm db:push    # Sincronizar schema')
    sections.push('pnpm db:studio  # Interface visual')
    sections.push('```')
  }

  if (gitHooks) {
    sections.push('')
    sections.push('### Segurança e Qualidade')
    sections.push('')
    sections.push('```bash')
    sections.push('pnpm security:scan       # Verificar vulnerabilidades')
    sections.push('sh .husky/pre-commit     # Testar hook pre-commit')
    sections.push('sh .husky/commit-msg     # Testar validação de mensagem')
    sections.push('```')
    sections.push('')
    sections.push('> **Nota:** Os Git Hooks rodam automaticamente em commits e pushes.')
    sections.push('> Ver `.zoryon/docs/ZORY-HUSKY.md` para mais detalhes.')
  }

  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Agentes Zory')
  sections.push('')
  sections.push('Geradores de código disponíveis em `.zoryon/scripts/`:')
  sections.push('')
  sections.push('| Agente | Comando | Descrição |')
  sections.push('|--------|---------|-----------|')
  sections.push('| Zory-Pages | `pnpm zory:page` | Gera páginas completas |')
  sections.push('| Zory-Component | `pnpm zory:component` | Gera componentes React |')
  sections.push('| Zory-Test | `pnpm zory:test` | Gera testes unitários |')
  sections.push('| Zory-Auth | `pnpm zory:auth` | Gera autenticação |')
  sections.push('| Zory-Guard | `pnpm zory:guard` | Gera middlewares |')
  sections.push('| Zory-Roles | `pnpm zory:roles` | Gera sistema RBAC |')
  sections.push('| Zory-Security | `pnpm zory:security` | Scanner de segurança |')
  sections.push('| Zory-Practices | `pnpm zory:practices` | Verificador de boas práticas |')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Documentação')
  sections.push('')
  sections.push('Toda a documentação está em `.zoryon/docs/`:')
  sections.push('')
  sections.push('- **[Comece Aqui](.zoryon/docs/COMECE-AQUI.md)** - Guia de início rápido')
  sections.push('- **[Erros Comuns](.zoryon/docs/ERROS-COMUNS.md)** - Soluções para problemas')
  sections.push('- **[Comandos Essenciais](.zoryon/docs/COMANDOS-ESSENCIAIS.md)** - Referência rápida')
  sections.push('')
  sections.push('Tutoriais passo a passo em `.zoryon/tutoriais/`.')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Usando com IA')
  sections.push('')
  sections.push('Abra o Claude, Cursor ou sua IA preferida e diga:')
  sections.push('')
  sections.push('> "Leia o arquivo .zoryon/docs/COMECE-AQUI.md e me guie no desenvolvimento"')
  sections.push('')
  sections.push('A IA vai entender seu projeto e te ajudar!')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Próximos Passos')
  sections.push('')
  sections.push('1. Leia `.zoryon/docs/COMECE-AQUI.md`')
  sections.push('2. Configure seu `.env` com as credenciais necessárias')
  sections.push('3. Use `pnpm task list` para ver as tarefas iniciais')
  sections.push('4. Comece a desenvolver com sua IA favorita!')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('*Zoryon Genesis - O começo de tudo*')

  await fs.writeFile(path.join(projectPath, 'README.md'), sections.join('\n'))
}

/**
 * Create root documentation files (BOAS-VINDAS.md, COMANDOS.md, PROXIMOS-PASSOS.md)
 */
async function createRootDocs(projectPath, options) {
  const { projectName, auth, database, testing, gitHooks } = options

  // BOAS-VINDAS.md
  const boasVindas = `# 🎉 Bem-vindo ao ${projectName}!

Parabéns! Você acabou de criar um projeto Next.js profissional com **Zoryon Genesis**.

---

## 🚀 Primeiros Passos

\`\`\`bash
# 1. Instalar dependências
pnpm install

# 2. Configurar ambiente
cp .env.example .env
# Edite o .env com suas credenciais
${database === 'prisma' ? `
# 3. Configurar banco de dados
pnpm db:push
` : ''}
# ${database === 'prisma' ? '4' : '3'}. Iniciar desenvolvimento
pnpm dev
\`\`\`

Acesse **http://localhost:3000** 🚀

---

## 📚 Estrutura do Projeto

Seu projeto inclui:
- ✅ Next.js 16 + React 19 + TypeScript
- ✅ Tailwind CSS 4
- ✅ Zoryon Tasks (gerenciador de tarefas)
- ✅ Zoryon Security (scanner de segurança)
${auth !== 'none' ? `- ✅ ${auth === 'clerk' ? 'Clerk' : 'Supabase'} (autenticação)` : ''}
${database !== 'none' ? `- ✅ ${database === 'prisma' ? 'Prisma + PostgreSQL' : 'Supabase'} (banco de dados)` : ''}
${testing ? '- ✅ Vitest + Playwright (testes)' : ''}
${gitHooks ? '- ✅ Git Hooks (validação automática)' : ''}

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[README.md](README.md)** | Visão geral do projeto |
| **[COMANDOS.md](COMANDOS.md)** | Referência rápida de comandos |
| **[PROXIMOS-PASSOS.md](PROXIMOS-PASSOS.md)** | O que fazer agora |
| **[.zoryon/docs/COMECE-AQUI.md](.zoryon/docs/COMECE-AQUI.md)** | Guia detalhado |

---

## 🤖 Usando com IA

Abra o Claude, Cursor ou sua IA favorita e diga:

> "Leia o arquivo .zoryon/docs/COMECE-AQUI.md e me guie no desenvolvimento"

A IA vai entender seu projeto e te ajudar!

---

*Zoryon Genesis - O começo de tudo*
`

  await fs.writeFile(path.join(projectPath, 'BOAS-VINDAS.md'), boasVindas)

  // COMANDOS.md
  const comandos = `# Comandos Rápidos

Referência rápida dos comandos mais usados.

---

## 🚀 Desenvolvimento

\`\`\`bash
pnpm dev        # Iniciar servidor
pnpm build      # Compilar para produção
pnpm lint       # Verificar código
pnpm typecheck  # Verificar tipos
\`\`\`

---

## 📋 Zoryon Tasks

\`\`\`bash
pnpm task add "Criar login"   # Nova tarefa
pnpm task list                # Ver todas
pnpm task next                # Próxima tarefa
pnpm task done 1              # Marcar como feita
pnpm task status              # Ver progresso
pnpm task graph               # Visualizar dependências
\`\`\`

---

## 🎨 Agentes Zory

\`\`\`bash
pnpm zory:page        # Gerar páginas
pnpm zory:component   # Gerar componentes
pnpm zory:test        # Gerar testes
pnpm zory:auth        # Gerar autenticação
pnpm zory:guard       # Gerar middlewares
pnpm zory:roles       # Sistema RBAC
pnpm zory:security    # Scanner de segurança
pnpm zory:practices   # Boas práticas
\`\`\`

> Use \`--help\` em qualquer comando para ver todas as opções.
${database === 'prisma' ? `
---

## 🗄️ Banco de Dados

\`\`\`bash
pnpm db:push    # Sincronizar schema
pnpm db:studio  # Interface visual
pnpm db:seed    # Popular dados
\`\`\`
` : ''}
${testing ? `
---

## 🧪 Testes

\`\`\`bash
pnpm test           # Todos os testes
pnpm test:unit      # Unitários
pnpm test:e2e       # E2E
pnpm test:coverage  # Com cobertura
\`\`\`
` : ''}
---

## 🔒 Segurança

\`\`\`bash
pnpm security:scan  # Escanear vulnerabilidades
\`\`\`

---

Para mais detalhes, veja \`.zoryon/docs/COMANDOS-ESSENCIAIS.md\`
`

  await fs.writeFile(path.join(projectPath, 'COMANDOS.md'), comandos)

  // PROXIMOS-PASSOS.md
  const proximosPassos = `# Próximos Passos

O que fazer agora que seu projeto está criado.

---

## ✅ Checklist Pós-Instalação

- [ ] Configurar \`.env\` com suas credenciais
${auth !== 'none' ? `- [ ] Configurar ${auth === 'clerk' ? 'Clerk' : 'Supabase Auth'}` : ''}
${database !== 'none' ? `- [ ] Configurar ${database === 'prisma' ? 'banco de dados Prisma' : 'Supabase'}` : ''}
- [ ] Rodar \`pnpm dev\` e verificar http://localhost:3000
- [ ] Ler \`.zoryon/docs/COMECE-AQUI.md\`

---

## 🎯 Sugestões de Primeira Tarefa

### Opção 1: Criar sua primeira página
\`\`\`bash
pnpm zory:page
# Siga o assistente interativo
\`\`\`

### Opção 2: Organizar suas tarefas
\`\`\`bash
pnpm task add "Configurar projeto"
pnpm task add "Criar página inicial"
pnpm task add "Adicionar autenticação"
pnpm task list
\`\`\`

### Opção 3: Ler a documentação
Comece por \`.zoryon/docs/COMECE-AQUI.md\`

---

## 📚 Tutoriais Recomendados

| Tutorial | O que você aprende |
|----------|-------------------|
| [01 - Primeiro Projeto](.zoryon/tutoriais/01-primeiro-projeto.md) | Estrutura, arquivos, como funciona |
| [02 - Executar com IA](.zoryon/tutoriais/02-executar-com-ia.md) | Usar Claude, Cursor, etc. |
| [03 - Deploy Vercel](.zoryon/tutoriais/03-deploy-vercel.md) | Colocar online em 5 minutos |
${auth !== 'none' ? `| [04/05 - Autenticação](.zoryon/tutoriais/04-auth-clerk.md) | Login funcionando |` : ''}
${database !== 'none' ? `| [06/07 - Banco de Dados](.zoryon/tutoriais/06-banco-prisma.md) | Salvar dados |` : ''}

---

## 🤖 Trabalhando com IA

1. Abra seu projeto no Claude Code, Cursor ou outra IA
2. Diga: "Leia o arquivo .zoryon/docs/COMECE-AQUI.md"
3. A IA vai entender seu projeto e te ajudar!

---

## 📋 Gerenciando Tarefas

O Zoryon Tasks ajuda você a organizar o trabalho:

\`\`\`bash
# Ver todas as tarefas
pnpm task list

# Iniciar próxima tarefa
pnpm task next

# Ao concluir
pnpm task done <id>
\`\`\`

---

## 🔒 Segurança Automática

${gitHooks ? `Os Git Hooks já estão configurados! Antes de cada commit, o sistema:
- ✅ Verifica secrets expostos
- ✅ Roda linter
- ✅ Valida tipos TypeScript
` : `Execute manualmente o scanner de segurança:
\`\`\`bash
pnpm security:scan
\`\`\`
`}

---

*Zoryon Genesis - O começo de tudo*
`

  await fs.writeFile(path.join(projectPath, 'PROXIMOS-PASSOS.md'), proximosPassos)
}

/**
 * Copy Zoryon structure (.zoryon/, .husky/, agent configs)
 */
async function copyZoryonStructure(projectPath, options) {
  const { projectName, gitHooks } = options
  const today = new Date().toISOString().split('T')[0]

  const replacements = {
    '{{PROJECT_NAME}}': projectName,
    '{{DATE}}': today,
  }

  // Copy .zoryon/ folder
  const zoryonDest = path.join(projectPath, '.zoryon')
  await copyDirWithReplacements(ZORYON_DIR, zoryonDest, replacements)

  // Copy Husky hooks (only if gitHooks is true)
  if (gitHooks) {
    const huskyDest = path.join(projectPath, '.husky')
    await fs.mkdir(huskyDest, { recursive: true })
    await fs.mkdir(path.join(huskyDest, '_'), { recursive: true })

    // Create husky.sh helper
    const huskyScript = `#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  if [ $exitCode = 127 ]; then
    echo "husky - command not found in PATH=$PATH"
  fi

  exit $exitCode
fi
`
    await fs.writeFile(path.join(huskyDest, '_', 'husky.sh'), huskyScript)

    // Copy hook files from Zoryon security hooks
    const hooksSource = path.join(ZORYON_DIR, 'security', 'hooks')
    const hookFiles = ['pre-commit', 'commit-msg', 'pre-push']
    for (const hook of hookFiles) {
      try {
        await fs.copyFile(
          path.join(hooksSource, hook),
          path.join(huskyDest, hook)
        )
        // Make executable
        await fs.chmod(path.join(huskyDest, hook), 0o755)
      } catch (error) {
        console.warn(`Warning: Could not copy hook ${hook}:`, error.message)
      }
    }
  }

  // Copy Claude CLAUDE.md to root
  try {
    const claudeContent = await fs.readFile(
      path.join(ZORYON_DIR, 'agents', 'claude', 'CLAUDE.md'),
      'utf-8'
    )
    await fs.writeFile(path.join(projectPath, 'CLAUDE.md'), claudeContent)
  } catch {
    // Ignore if doesn't exist
  }

  // Copy Cursor .cursorrules to root
  try {
    const cursorContent = await fs.readFile(
      path.join(ZORYON_DIR, 'agents', 'cursor', '.cursorrules'),
      'utf-8'
    )
    await fs.writeFile(path.join(projectPath, '.cursorrules'), cursorContent)
  } catch {
    // Ignore if doesn't exist
  }

  // Copy .claude/ commands folder
  try {
    const claudeCommandsSrc = path.join(ZORYON_DIR, 'agents', 'claude', 'commands')
    const claudeCommandsDest = path.join(projectPath, '.claude', 'commands')
    await fs.mkdir(claudeCommandsDest, { recursive: true })
    await copyDir(claudeCommandsSrc, claudeCommandsDest)
  } catch {
    // Ignore if doesn't exist
  }

  // Add Zoryon scripts and dependencies to package.json
  await addZoryonToPackageJson(projectPath, options)
}

/**
 * Copy directory with replacements in all files
 */
async function copyDirWithReplacements(src, dest, replacements) {
  await fs.mkdir(dest, { recursive: true })

  let entries
  try {
    entries = await fs.readdir(src, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirWithReplacements(srcPath, destPath, replacements)
    } else {
      try {
        let content = await fs.readFile(srcPath, 'utf-8')
        for (const [key, value] of Object.entries(replacements)) {
          content = content.replace(new RegExp(key, 'g'), value)
        }
        await fs.writeFile(destPath, content)
      } catch {
        // Binary file, just copy
        await fs.copyFile(srcPath, destPath)
      }
    }
  }
}

/**
 * Add Zoryon scripts and dependencies to package.json
 */
async function addZoryonToPackageJson(projectPath, options) {
  const { structure, gitHooks } = options

  // Determine package.json path
  const pkgPath = structure === 'single'
    ? path.join(projectPath, 'package.json')
    : path.join(projectPath, 'package.json')

  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))

    // Add Zoryon scripts
    pkg.scripts = pkg.scripts || {}

    // Task manager
    pkg.scripts.task = 'node .zoryon/scripts/task.mjs'
    pkg.scripts['task:add'] = 'node .zoryon/scripts/task.mjs add'
    pkg.scripts['task:list'] = 'node .zoryon/scripts/task.mjs list'
    pkg.scripts['task:next'] = 'node .zoryon/scripts/task.mjs next'
    pkg.scripts['task:done'] = 'node .zoryon/scripts/task.mjs done'
    pkg.scripts['task:status'] = 'node .zoryon/scripts/task.mjs status'

    // Zory agents - aliases simplificados
    pkg.scripts['zory:page'] = 'node .zoryon/scripts/zory-pages.mjs'
    pkg.scripts['zory:component'] = 'node .zoryon/scripts/zory-component.mjs'
    pkg.scripts['zory:test'] = 'node .zoryon/scripts/zory-test.mjs'
    pkg.scripts['zory:auth'] = 'node .zoryon/scripts/zory-auth.mjs'
    pkg.scripts['zory:guard'] = 'node .zoryon/scripts/zory-guard.mjs'
    pkg.scripts['zory:roles'] = 'node .zoryon/scripts/zory-roles.mjs'
    pkg.scripts['zory:security'] = 'node .zoryon/scripts/zory-security.mjs'
    pkg.scripts['zory:practices'] = 'node .zoryon/scripts/zory-practices.mjs'

    // Security scan
    pkg.scripts['security:scan'] = 'node .zoryon/security/scan.mjs'

    // Add Husky only if gitHooks is enabled
    if (gitHooks) {
      pkg.scripts.prepare = 'husky install || true'

      // Add husky as dev dependency
      pkg.devDependencies = pkg.devDependencies || {}
      pkg.devDependencies.husky = '^9.1.7'
    }

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))
  } catch (error) {
    console.error('Error updating package.json:', error.message)
  }
}

/**
 * Generate Flow documentation (BRIEFING.md and PARA-IA-LER.md)
 */
async function generateFlowDocs(projectPath, options) {
  const { projectName, structure, auth, database, testing, ci, ideaData } = options
  const today = new Date().toISOString().split('T')[0]

  // Create flow directory
  const flowDir = path.join(projectPath, '.zoryon', 'flow')
  await fs.mkdir(flowDir, { recursive: true })

  // Always create PARA-IA-LER.md (instructions for AI)
  const paraIaLer = generateParaIaLerContent(options, today)
  await fs.writeFile(path.join(flowDir, 'PARA-IA-LER.md'), paraIaLer)

  // If user has idea data, create BRIEFING.md
  if (ideaData) {
    const briefing = generateBriefingContent(options, today)
    await fs.writeFile(path.join(flowDir, 'BRIEFING.md'), briefing)
  }

  // Create placeholder files for AI to fill
  const prdPlaceholder = `# PRD - ${projectName}

> Este arquivo será preenchido pela sua IA.
> Peça para ela ler PARA-IA-LER.md primeiro.

---

*Aguardando IA expandir o briefing...*
`
  await fs.writeFile(path.join(flowDir, 'PRD.md'), prdPlaceholder)

  const storiesPlaceholder = `# User Stories - ${projectName}

> Este arquivo será preenchido pela sua IA.
> Peça para ela ler PARA-IA-LER.md primeiro.

---

*Aguardando IA criar user stories...*
`
  await fs.writeFile(path.join(flowDir, 'STORIES.md'), storiesPlaceholder)
}

/**
 * Generate BRIEFING.md content
 */
function generateBriefingContent(options, today) {
  const { projectName, structure, auth, database, testing, ci, ideaData } = options

  // Parse features into list
  const featuresList = ideaData.mainFeatures
    .split(',')
    .map((f, i) => `${i + 1}. ${f.trim()}`)
    .join('\n')

  const sections = []

  sections.push(`# Briefing do Projeto: ${projectName}`)
  sections.push('')
  sections.push('> Este arquivo contém as respostas do usuário durante a criação.')
  sections.push('> Use sua IA para expandir isso em documentação completa.')
  sections.push('')
  sections.push(`**Data:** ${today}`)
  sections.push(`**Projeto:** ${projectName}`)
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## O que é')
  sections.push('')
  sections.push(ideaData.whatIsIt)
  sections.push('')
  sections.push('## Público-alvo')
  sections.push('')
  sections.push(ideaData.targetAudience)
  sections.push('')
  sections.push('## Problema que resolve')
  sections.push('')
  sections.push(ideaData.problemSolved)
  sections.push('')
  sections.push('## Funcionalidades desejadas')
  sections.push('')
  sections.push(featuresList)
  sections.push('')

  if (ideaData.references) {
    sections.push('## Referências')
    sections.push('')
    sections.push(ideaData.references)
    sections.push('')
  }

  if (ideaData.extraNotes) {
    sections.push('## Observações adicionais')
    sections.push('')
    sections.push(ideaData.extraNotes)
    sections.push('')
  }

  sections.push('---')
  sections.push('')
  sections.push('## Configuração Técnica Escolhida')
  sections.push('')
  sections.push(`- **Estrutura:** ${structure === 'single' ? 'Projeto único' : structure === 'turborepo' ? 'Turborepo' : 'pnpm workspaces'}`)
  sections.push(`- **Autenticação:** ${auth === 'none' ? 'Nenhuma (configurar depois)' : auth === 'clerk' ? 'Clerk' : 'Supabase Auth'}`)
  sections.push(`- **Banco de dados:** ${database === 'none' ? 'Nenhum (configurar depois)' : database === 'prisma' ? 'Prisma + PostgreSQL' : 'Supabase'}`)
  sections.push(`- **Testes:** ${testing ? 'Vitest + Playwright' : 'Não incluídos'}`)
  sections.push(`- **CI/CD:** ${ci ? 'GitHub Actions' : 'Não incluído'}`)
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('*Gerado automaticamente pelo Zoryon Genesis*')
  sections.push('*Este é um RASCUNHO - peça para sua IA expandir*')

  return sections.join('\n')
}

/**
 * Generate PARA-IA-LER.md content
 */
function generateParaIaLerContent(options, today) {
  const { projectName, structure, auth, database, testing, ci, ideaData } = options

  const sections = []

  sections.push('# Instruções para IA - Zoryon Genesis')
  sections.push('')
  sections.push('> **LEIA ESTE ARQUIVO PRIMEIRO**')
  sections.push('> Ele contém o contexto do projeto e o que você deve fazer.')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Sobre Este Projeto')
  sections.push('')
  sections.push(`Este projeto **${projectName}** foi criado com **Zoryon Genesis**.`)
  sections.push('')
  sections.push('**Configurações escolhidas:**')
  sections.push(`- Estrutura: ${structure === 'single' ? 'Projeto único' : structure === 'turborepo' ? 'Turborepo (monorepo)' : 'pnpm workspaces (monorepo)'}`)
  sections.push(`- Autenticação: ${auth === 'none' ? 'Nenhuma' : auth === 'clerk' ? 'Clerk' : 'Supabase Auth'}`)
  sections.push(`- Banco de dados: ${database === 'none' ? 'Nenhum' : database === 'prisma' ? 'Prisma + PostgreSQL' : 'Supabase'}`)
  sections.push(`- Testes: ${testing ? 'Vitest + Playwright' : 'Não'}`)
  sections.push(`- CI/CD: ${ci ? 'GitHub Actions' : 'Não'}`)
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Sua Missão')
  sections.push('')
  sections.push('Ajude o usuário a transformar a ideia em um projeto real.')
  sections.push('')

  if (ideaData) {
    sections.push('### Passo 1: Entender o Contexto')
    sections.push('')
    sections.push('1. Leia `.zoryon/flow/BRIEFING.md` - contém a ideia do usuário')
    sections.push('2. Leia `.zoryon/docs/COMECE-AQUI.md` - guia inicial do projeto')
    sections.push('3. Entenda a stack técnica escolhida')
    sections.push('')
    sections.push('### Passo 2: Expandir Documentação')
    sections.push('')
    sections.push('Baseado no BRIEFING, ajude a criar:')
    sections.push('')
    sections.push('1. **PRD expandido** → Edite `.zoryon/flow/PRD.md`')
    sections.push('   - Visão geral detalhada')
    sections.push('   - Objetivos claros')
    sections.push('   - Funcionalidades por fase (MVP, v2, etc)')
    sections.push('   - Requisitos não-funcionais')
    sections.push('')
    sections.push('2. **User Stories** → Edite `.zoryon/flow/STORIES.md`')
    sections.push('   - Formato: "Como [persona], quero [ação], para [benefício]"')
    sections.push('   - Critérios de aceite para cada story')
    sections.push('')
    sections.push('3. **Tarefas práticas** → Use `pnpm task add "titulo"`')
    sections.push('   - Quebre as funcionalidades em tarefas pequenas')
    sections.push('   - Ou edite `.zoryon/tasks/tasks.json` diretamente')
    sections.push('')
  } else {
    sections.push('### Passo 1: Entender o Projeto')
    sections.push('')
    sections.push('1. Leia `.zoryon/docs/COMECE-AQUI.md` - guia inicial')
    sections.push('2. O usuário ainda não definiu a ideia do app')
    sections.push('3. Pergunte o que ele quer construir')
    sections.push('')
    sections.push('### Passo 2: Ajudar a Definir')
    sections.push('')
    sections.push('Faça perguntas para entender:')
    sections.push('- O que é o app?')
    sections.push('- Quem vai usar?')
    sections.push('- Qual problema resolve?')
    sections.push('- Quais as funcionalidades principais?')
    sections.push('')
    sections.push('Depois, ajude a criar:')
    sections.push('- `.zoryon/flow/BRIEFING.md` - resumo da ideia')
    sections.push('- `.zoryon/flow/PRD.md` - documento de requisitos')
    sections.push('- `.zoryon/flow/STORIES.md` - user stories')
    sections.push('')
  }

  sections.push('### Passo 3: Desenvolver')
  sections.push('')
  sections.push('Quando a documentação estiver pronta:')
  sections.push('')
  sections.push('1. `pnpm task list` - ver tarefas')
  sections.push('2. `pnpm task next` - pegar próxima')
  sections.push('3. Implementar seguindo os padrões')
  sections.push('4. `pnpm task done <id>` - marcar como feita')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Comandos Úteis')
  sections.push('')
  sections.push('| Comando | O que faz |')
  sections.push('|---------|-----------|')
  sections.push('| `pnpm dev` | Inicia o servidor |')
  sections.push('| `pnpm task list` | Lista tarefas |')
  sections.push('| `pnpm task add "x"` | Adiciona tarefa |')
  sections.push('| `pnpm task done 1` | Conclui tarefa #1 |')
  sections.push('| `pnpm lint` | Verifica código |')
  sections.push('| `pnpm typecheck` | Verifica tipos |')

  if (database === 'prisma') {
    sections.push('| `pnpm db:push` | Sincroniza banco |')
    sections.push('| `pnpm db:studio` | Interface visual do banco |')
  }

  if (testing) {
    sections.push('| `pnpm test:unit` | Testes unitários |')
    sections.push('| `pnpm test:e2e` | Testes E2E |')
  }

  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Arquivos Importantes')
  sections.push('')
  sections.push('| Arquivo | Descrição |')
  sections.push('|---------|-----------|')

  if (ideaData) {
    sections.push('| `.zoryon/flow/BRIEFING.md` | Ideia do usuário (rascunho) |')
  }

  sections.push('| `.zoryon/flow/PRD.md` | PRD completo (você expande) |')
  sections.push('| `.zoryon/flow/STORIES.md` | User stories (você cria) |')
  sections.push('| `.zoryon/tasks/tasks.json` | Tarefas do projeto |')
  sections.push('| `.zoryon/docs/COMECE-AQUI.md` | Guia inicial |')
  sections.push('| `.zoryon/docs/COMANDOS-ESSENCIAIS.md` | Referência de comandos |')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Regras do Projeto')
  sections.push('')
  sections.push('1. **Idioma:** Português brasileiro em tudo')
  sections.push('2. **Commits:** Em português, formato `tipo: descrição`')
  sections.push('3. **Código:** TypeScript estrito, sem `any`')
  sections.push('4. **Segurança:** Nunca commitar secrets (`.env`)')
  sections.push('5. **Padrões:** Server Components por padrão, Client só quando necessário')
  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push('## Sugestão de Primeiro Comando')
  sections.push('')

  if (ideaData) {
    sections.push('Diga ao usuário:')
    sections.push('')
    sections.push('```')
    sections.push('Vou ler o briefing do seu projeto...')
    sections.push('')
    sections.push('[Após ler BRIEFING.md]')
    sections.push('')
    sections.push('Entendi! Você quer criar [resumo]. Posso te ajudar de algumas formas:')
    sections.push('')
    sections.push('1. 📋 Expandir em um PRD completo')
    sections.push('2. 📝 Criar user stories detalhadas')
    sections.push('3. ✅ Criar tarefas práticas para começar')
    sections.push('4. 🚀 Ir direto pro código')
    sections.push('')
    sections.push('O que prefere?')
    sections.push('```')
  } else {
    sections.push('Diga ao usuário:')
    sections.push('')
    sections.push('```')
    sections.push('Olá! Vi que seu projeto foi criado com Zoryon Genesis.')
    sections.push('')
    sections.push('Você ainda não definiu o que vai construir.')
    sections.push('Vamos fazer isso agora?')
    sections.push('')
    sections.push('Me conta: O que você quer criar?')
    sections.push('```')
  }

  sections.push('')
  sections.push('---')
  sections.push('')
  sections.push(`*Criado pelo Zoryon Genesis em ${today}*`)

  return sections.join('\n')
}
