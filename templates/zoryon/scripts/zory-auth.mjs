#!/usr/bin/env node
/**
 * Zory-Auth - Agente de Configuração de Autenticação
 * Versão: 0.0.5
 *
 * Configura autenticação em aplicações Next.js:
 * - Clerk (solução completa)
 * - NextAuth v5 (open-source)
 * - Custom JWT (controle total)
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { exec } from "child_process"
import { promisify } from "util"
import {
  colors,
  log,
  logStep,
  logSuccess,
  logError,
  logWarning,
  loadJSON,
  writeFile,
  fileExists,
  question,
  questionWithOptions,
  questionYesNo,
  closeReadline,
} from "./utils/common.mjs"

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

const ZORYON_DIR = path.join(__dirname, "..")
const AUTH_DIR = path.join(ZORYON_DIR, "auth")
const PROVIDERS_DIR = path.join(AUTH_DIR, "providers")

// =============================================================================
// GERAÇÃO DE CÓDIGO - CLERK
// =============================================================================

function generateClerkFiles(options = {}) {
  const config = loadJSON(path.join(PROVIDERS_DIR, "clerk.json"))
  const files = []

  // middleware.ts
  const middlewarePath = path.join(process.cwd(), "middleware.ts")
  if (!fileExists(middlewarePath) || options.overwrite) {
    writeFile(middlewarePath, config.templates.middleware)
    files.push({ path: middlewarePath, status: "created" })
  } else {
    files.push({ path: middlewarePath, status: "skipped (exists)" })
  }

  // Layout com ClerkProvider
  const layoutPath = path.join(process.cwd(), "app/layout.tsx")
  if (options.updateLayout) {
    // Lê layout existente e adiciona ClerkProvider se ainda não tiver
    let layoutContent = ""
    if (fileExists(layoutPath)) {
      layoutContent = fs.readFileSync(layoutPath, "utf-8")
    }

    if (!layoutContent.includes("ClerkProvider")) {
      // Aqui seria a lógica de merge - por simplicidade, sugerimos edição manual
      logWarning("Layout existe. Adicione <ClerkProvider> manualmente.")
      files.push({ path: layoutPath, status: "manual edit needed" })
    } else {
      files.push({ path: layoutPath, status: "already configured" })
    }
  }

  // Sign in page
  const signInPath = path.join(process.cwd(), "app/sign-in/[[...sign-in]]/page.tsx")
  writeFile(signInPath, config.templates["signin-page"])
  files.push({ path: signInPath, status: "created" })

  // Sign up page
  const signUpPath = path.join(process.cwd(), "app/sign-up/[[...sign-up]]/page.tsx")
  writeFile(signUpPath, config.templates["signup-page"])
  files.push({ path: signUpPath, status: "created" })

  return files
}

// =============================================================================
// GERAÇÃO DE CÓDIGO - NEXTAUTH
// =============================================================================

function generateNextAuthFiles(options = {}) {
  const config = loadJSON(path.join(PROVIDERS_DIR, "nextauth.json"))
  const files = []

  // auth.ts
  const authPath = path.join(process.cwd(), "auth.ts")
  writeFile(authPath, config.templates["auth-config"])
  files.push({ path: authPath, status: "created" })

  // middleware.ts
  const middlewarePath = path.join(process.cwd(), "middleware.ts")
  if (!fileExists(middlewarePath) || options.overwrite) {
    writeFile(middlewarePath, config.templates.middleware)
    files.push({ path: middlewarePath, status: "created" })
  } else {
    files.push({ path: middlewarePath, status: "skipped (exists)" })
  }

  // Route handler
  const routePath = path.join(process.cwd(), "app/api/auth/[...nextauth]/route.ts")
  writeFile(routePath, config.templates["route-handler"])
  files.push({ path: routePath, status: "created" })

  // Prisma schema (opcional)
  if (options.includePrisma) {
    const prismaPath = path.join(process.cwd(), "prisma/schema.prisma")
    if (!fileExists(prismaPath) || options.overwrite) {
      writeFile(prismaPath, config.templates["prisma-schema"])
      files.push({ path: prismaPath, status: "created" })
    } else {
      logWarning("prisma/schema.prisma existe. Merge manual necessário.")
      files.push({ path: prismaPath, status: "manual merge needed" })
    }
  }

  return files
}

// =============================================================================
// ENV FILE
// =============================================================================

function generateEnvFile(provider, options = {}) {
  const config = loadJSON(path.join(PROVIDERS_DIR, `${provider}.json`))
  const envPath = path.join(process.cwd(), ".env.local")

  let envContent = ""

  if (fileExists(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8")
    envContent += "\n\n"
  }

  envContent += `# ${config.name} Configuration\n`
  envContent += `# Generated by Zory-Auth\n\n`

  config.envVariables.required.forEach((envVar) => {
    if (!envContent.includes(envVar.key)) {
      envContent += `${envVar.key}=${envVar.example || ""}\n`
    }
  })

  if (config.envVariables.optional) {
    envContent += "\n# Optional\n"
    config.envVariables.optional.forEach((envVar) => {
      if (!envContent.includes(envVar.key)) {
        envContent += `# ${envVar.key}=${envVar.default || ""}\n`
      }
    })
  }

  writeFile(envPath, envContent)
  return envPath
}

// =============================================================================
// INSTALAÇÃO DE DEPENDÊNCIAS
// =============================================================================

async function installDependencies(provider) {
  const config = loadJSON(path.join(PROVIDERS_DIR, `${provider}.json`))

  logStep("INSTALL", "Instalando dependências...")

  try {
    const { stdout, stderr } = await execAsync(config.installation.command)
    if (stderr && !stderr.includes("WARN")) {
      logWarning(stderr)
    }
    logSuccess("Dependências instaladas")
    return true
  } catch (error) {
    logError(`Erro ao instalar dependências: ${error.message}`)
    return false
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2)

  // Help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
${colors.bright}Zory-Auth - Configuração de Autenticação${colors.reset}

${colors.cyan}Uso:${colors.reset}
  node .zoryon/scripts/zory-auth.mjs [opções]

${colors.cyan}Opções:${colors.reset}
  --help, -h      Mostra esta ajuda
  --list          Lista providers disponíveis
  --provider=X    Define provider (clerk, nextauth, custom)
  --quick         Modo rápido com Clerk

${colors.cyan}Exemplos:${colors.reset}
  node .zoryon/scripts/zory-auth.mjs
  node .zoryon/scripts/zory-auth.mjs --provider=clerk
  node .zoryon/scripts/zory-auth.mjs --quick

${colors.cyan}Providers:${colors.reset}
  ${colors.green}clerk${colors.reset}      Solução completa (freemium)
  ${colors.green}nextauth${colors.reset}   Open-source, flexível
  ${colors.green}custom${colors.reset}     Custom JWT (máximo controle)
`)
    process.exit(0)
  }

  // List
  if (args.includes("--list")) {
    const config = loadJSON(path.join(AUTH_DIR, "config.json"))
    console.log(`
${colors.bright}Providers Disponíveis${colors.reset}

${colors.cyan}1. Clerk${colors.reset}
   ${config.providers.clerk.description}
   Pricing: ${config.providers.clerk.pricing}
   Complexidade: ${config.providers.clerk.complexity}

${colors.cyan}2. NextAuth.js v5${colors.reset}
   ${config.providers.nextauth.description}
   Pricing: ${config.providers.nextauth.pricing}
   Complexidade: ${config.providers.nextauth.complexity}

${colors.cyan}3. Custom Auth${colors.reset}
   ${config.providers.custom.description}
   Pricing: ${config.providers.custom.pricing}
   Complexidade: ${config.providers.custom.complexity}
`)
    process.exit(0)
  }

  // Banner
  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${colors.cyan}Zory-Auth${colors.reset}${colors.bright} - Configuração de Autenticação              ║
║                                                              ║
║   Next.js 16 • Clerk • NextAuth • Custom JWT                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`)

  // Verificar se está em projeto Next.js
  const packageJsonPath = path.join(process.cwd(), "package.json")
  if (!fileExists(packageJsonPath)) {
    logError("Não encontrado package.json. Execute este comando na raiz do projeto Next.js.")
    process.exit(1)
  }

  const packageJson = loadJSON(packageJsonPath)
  if (!packageJson.dependencies?.next) {
    logWarning("Next.js não detectado em dependencies. Continuando mesmo assim...")
  }

  // Coletar informações
  let provider
  let installDeps = true
  let generateEnv = true

  const providerArg = args.find((a) => a.startsWith("--provider="))
  const quickMode = args.includes("--quick")

  if (quickMode) {
    provider = "clerk"
    log("\nModo rápido: usando Clerk", "cyan")
  } else if (providerArg) {
    provider = providerArg.split("=")[1]
  } else {
    const providerOption = await questionWithOptions("Qual provider de autenticação você quer usar?", [
      { label: "Clerk", description: "Solução completa, UI pronta (freemium)" },
      { label: "NextAuth v5", description: "Open-source, flexível (grátis)" },
      { label: "Custom", description: "JWT customizado (máximo controle)" },
    ])
    provider = providerOption.label.toLowerCase().replace(" v5", "").replace(" ", "")
  }

  if (!["clerk", "nextauth", "custom"].includes(provider)) {
    logError(`Provider inválido: ${provider}`)
    process.exit(1)
  }

  const config = loadJSON(path.join(AUTH_DIR, "config.json"))
  const providerConfig = config.providers[provider]

  console.log(`
${colors.bright}Provider selecionado:${colors.reset} ${colors.cyan}${providerConfig.name}${colors.reset}
${colors.bright}Descrição:${colors.reset} ${providerConfig.description}
${colors.bright}Pricing:${colors.reset} ${providerConfig.pricing}
${colors.bright}Complexidade:${colors.reset} ${providerConfig.complexity}
`)

  if (!quickMode) {
    installDeps = await questionYesNo("Instalar dependências automaticamente?", true)
    generateEnv = await questionYesNo("Gerar arquivo .env.local?", true)
  }

  const confirm = await questionYesNo("\nIniciar configuração?", true)

  if (!confirm) {
    log("\nOperação cancelada.", "yellow")
    closeReadline()
    process.exit(0)
  }

  // Instalação
  if (installDeps) {
    await installDependencies(provider)
  }

  // Geração de arquivos
  logStep("FILES", "Gerando arquivos de configuração...")

  let generatedFiles = []

  if (provider === "clerk") {
    generatedFiles = generateClerkFiles({ updateLayout: true })
  } else if (provider === "nextauth") {
    const includePrisma = await questionYesNo("Incluir schema Prisma?", true)
    generatedFiles = generateNextAuthFiles({ includePrisma })
  } else if (provider === "custom") {
    logWarning("Custom auth requer implementação manual. Veja documentação.")
    generatedFiles = []
  }

  generatedFiles.forEach((file) => {
    if (file.status === "created") {
      logSuccess(`Criado: ${file.path}`)
    } else if (file.status.includes("manual")) {
      logWarning(`${file.status}: ${file.path}`)
    } else {
      log(`${file.status}: ${file.path}`, "blue")
    }
  })

  // Geração de .env
  if (generateEnv) {
    logStep("ENV", "Gerando variáveis de ambiente...")
    const envPath = generateEnvFile(provider)
    logSuccess(`Arquivo .env.local atualizado: ${envPath}`)
  }

  // Resumo final
  console.log(`
${colors.bright}${colors.green}✓ Configuração concluída!${colors.reset}

${colors.bright}Próximos passos:${colors.reset}
`)

  if (provider === "clerk") {
    console.log(`  ${colors.cyan}1.${colors.reset} Crie uma conta em https://clerk.com
  ${colors.cyan}2.${colors.reset} Crie uma aplicação no dashboard
  ${colors.cyan}3.${colors.reset} Copie as chaves para .env.local:
     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
     - CLERK_SECRET_KEY
  ${colors.cyan}4.${colors.reset} Adicione <ClerkProvider> no app/layout.tsx
  ${colors.cyan}5.${colors.reset} Configure rotas públicas no middleware.ts
  ${colors.cyan}6.${colors.reset} Rode: ${colors.green}pnpm dev${colors.reset}
`)
  } else if (provider === "nextauth") {
    console.log(`  ${colors.cyan}1.${colors.reset} Gere AUTH_SECRET: ${colors.green}openssl rand -base64 32${colors.reset}
  ${colors.cyan}2.${colors.reset} Configure providers OAuth (Google, GitHub)
  ${colors.cyan}3.${colors.reset} Adicione credenciais ao .env.local
  ${colors.cyan}4.${colors.reset} Se usar Prisma: ${colors.green}pnpm db:push${colors.reset}
  ${colors.cyan}5.${colors.reset} Customize callbacks em auth.ts
  ${colors.cyan}6.${colors.reset} Rode: ${colors.green}pnpm dev${colors.reset}
`)
  }

  console.log(`
${colors.bright}Documentação:${colors.reset}
  ${colors.cyan}.zoryon/docs/ZORY-AUTH.md${colors.reset}

${colors.magenta}Zoryon Genesis - O começo de tudo${colors.reset}
`)

  closeReadline()
}

main().catch((error) => {
  logError(`Erro: ${error.message}`)
  closeReadline()
  process.exit(1)
})
