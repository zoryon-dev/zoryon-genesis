#!/usr/bin/env node
/**
 * Zory-Roles - Gerador de Sistema RBAC
 * Versão: 0.0.7
 *
 * Gera sistema de permissões e roles para Next.js
 */

import path from "path"
import { fileURLToPath } from "url"
import {
  colors,
  log,
  logSuccess,
  loadJSON,
  writeFile,
  questionYesNo,
  closeReadline,
} from "./utils/common.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ZORYON_DIR = path.join(__dirname, "..")
const ROLES_DIR = path.join(ZORYON_DIR, "roles")

async function main() {
  const args = process.argv.slice(2)

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
${colors.bright}Zory-Roles - Sistema RBAC${colors.reset}

${colors.cyan}Uso:${colors.reset}
  node .zoryon/scripts/zory-roles.mjs [opções]

${colors.cyan}Opções:${colors.reset}
  --help, -h      Mostra esta ajuda
  --quick         Modo rápido (gera tudo)

${colors.cyan}Gera:${colors.reset}
  - Schema Prisma para RBAC
  - Hook usePermissions()
  - Componente <Can>
  - Utilitários de permissão
`)
    process.exit(0)
  }

  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${colors.cyan}Zory-Roles${colors.reset}${colors.bright} - Sistema RBAC                             ║
║                                                              ║
║   Roles • Permissions • Access Control                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`)

  const quickMode = args.includes("--quick")

  let generatePrisma = true
  let generateHooks = true
  let generateComponents = true

  if (!quickMode) {
    generatePrisma = await questionYesNo("Gerar schema Prisma?", true)
    generateHooks = await questionYesNo("Gerar hook usePermissions()?", true)
    generateComponents = await questionYesNo("Gerar componente <Can>?", true)
  }

  const confirm = await questionYesNo("\nIniciar geração?", true)

  if (!confirm) {
    log("\nOperação cancelada.", "yellow")
    closeReadline()
    process.exit(0)
  }

  // Prisma Schema
  if (generatePrisma) {
    const schemaConfig = loadJSON(path.join(ROLES_DIR, "schemas/rbac.json"))
    const prismaPath = path.join(process.cwd(), "prisma/schema-rbac.prisma")
    writeFile(prismaPath, schemaConfig.template)
    logSuccess(`Schema criado: ${prismaPath}`)
  }

  // Hooks
  if (generateHooks) {
    const hooksConfig = loadJSON(path.join(ROLES_DIR, "patterns/hooks.json"))
    const hookPath = path.join(process.cwd(), "hooks/usePermissions.tsx")
    writeFile(hookPath, hooksConfig.templates.usePermissions)
    logSuccess(`Hook criado: ${hookPath}`)
  }

  // Components
  if (generateComponents) {
    const componentsConfig = loadJSON(path.join(ROLES_DIR, "patterns/components.json"))
    const canPath = path.join(process.cwd(), "components/Can.tsx")
    writeFile(canPath, componentsConfig.templates.Can)
    logSuccess(`Componente criado: ${canPath}`)
  }

  console.log(`
${colors.bright}${colors.green}✓ Sistema RBAC gerado!${colors.reset}

${colors.bright}Próximos passos:${colors.reset}
  ${colors.cyan}1.${colors.reset} Merge schema-rbac.prisma com schema.prisma
  ${colors.cyan}2.${colors.reset} Rode: ${colors.green}pnpm db:push${colors.reset}
  ${colors.cyan}3.${colors.reset} Seed roles e permissões iniciais
  ${colors.cyan}4.${colors.reset} Use <Can> e usePermissions() nos componentes

${colors.bright}Exemplos:${colors.reset}

${colors.cyan}// Componente${colors.reset}
<Can permission="posts:create">
  <CreateButton />
</Can>

${colors.cyan}// Hook${colors.reset}
const { hasPermission } = usePermissions()
if (hasPermission('posts:delete')) {
  // ...
}

${colors.magenta}Zoryon Genesis - O começo de tudo${colors.reset}
`)

  closeReadline()
}

main().catch((error) => {
  console.error(`${colors.red}Erro:${colors.reset} ${error.message}`)
  process.exit(1)
})
