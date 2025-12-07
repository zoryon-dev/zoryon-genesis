#!/usr/bin/env node
/**
 * Zory-Guard - Gerador de Middlewares de Proteção
 * Versão: 0.0.6
 *
 * Gera middlewares de proteção para Next.js:
 * - Rate limiting
 * - Security headers
 * - Auth middleware
 * - IP filtering
 * - API key validation
 */

import path from "path"
import { fileURLToPath } from "url"
import {
  colors,
  log,
  logSuccess,
  logError,
  loadJSON,
  writeFile,
  question,
  questionWithOptions,
  questionYesNo,
  closeReadline,
} from "./utils/common.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ZORYON_DIR = path.join(__dirname, "..")
const GUARD_DIR = path.join(ZORYON_DIR, "guard")
const PATTERNS_DIR = path.join(GUARD_DIR, "patterns")

function generateRateLimitMiddleware(provider = "upstash") {
  const config = loadJSON(path.join(PATTERNS_DIR, "ratelimit.json"))
  return config.templates[provider] || config.templates.upstash
}

function generateSecurityMiddleware() {
  const config = loadJSON(path.join(PATTERNS_DIR, "security.json"))
  return config.templates.basic
}

function generateAuthMiddleware(provider = "clerk") {
  const config = loadJSON(path.join(PATTERNS_DIR, "auth.json"))
  return config.providers[provider].template
}

function generateCombinedMiddleware(patterns) {
  let imports = `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'\n\n`

  let functions = ""
  let mainMiddleware = `export async function middleware(request: NextRequest) {\n`

  if (patterns.includes("security")) {
    imports += `// Security headers já incluídos inline\n\n`
    mainMiddleware += `  // Security Headers\n`
    mainMiddleware += `  const response = NextResponse.next()\n`
    mainMiddleware += `  response.headers.set('X-Frame-Options', 'DENY')\n`
    mainMiddleware += `  response.headers.set('X-Content-Type-Options', 'nosniff')\n`
    mainMiddleware += `  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')\n\n`
  }

  if (patterns.includes("ratelimit")) {
    imports += `import { Ratelimit } from '@upstash/ratelimit'\nimport { Redis } from '@upstash/redis'\n\n`
    functions += `const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})\n\n`
    mainMiddleware += `  // Rate Limiting\n`
    mainMiddleware += `  const ip = request.ip ?? '127.0.0.1'\n`
    mainMiddleware += `  const { success } = await ratelimit.limit(ip)\n`
    mainMiddleware += `  if (!success) {\n`
    mainMiddleware += `    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })\n`
    mainMiddleware += `  }\n\n`
  }

  mainMiddleware += `  return NextResponse.next()\n}\n\n`
  mainMiddleware += `export const config = {\n`
  mainMiddleware += `  matcher: [\n`
  mainMiddleware += `    '/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',\n`
  mainMiddleware += `    '/(api|trpc)(.*)',\n`
  mainMiddleware += `  ],\n}\n`

  return imports + functions + mainMiddleware
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
${colors.bright}Zory-Guard - Gerador de Middlewares de Proteção${colors.reset}

${colors.cyan}Uso:${colors.reset}
  node .zoryon/scripts/zory-guard.mjs [opções]

${colors.cyan}Opções:${colors.reset}
  --help, -h      Mostra esta ajuda
  --list          Lista patterns disponíveis
  --pattern=X     Gera pattern específico
  --quick         Modo rápido (security + rate limit)

${colors.cyan}Patterns:${colors.reset}
  ${colors.green}ratelimit${colors.reset}   Rate limiting com Upstash
  ${colors.green}security${colors.reset}    Security headers
  ${colors.green}auth${colors.reset}        Authentication middleware
  ${colors.green}combined${colors.reset}    Combina múltiplos patterns
`)
    process.exit(0)
  }

  if (args.includes("--list")) {
    const config = loadJSON(path.join(GUARD_DIR, "config.json"))
    console.log(`\n${colors.bright}Patterns Disponíveis${colors.reset}\n`)
    Object.entries(config.patterns).forEach(([key, value]) => {
      console.log(`${colors.cyan}${key}${colors.reset}`)
      console.log(`  ${value.description}`)
      console.log(`  Use cases: ${value.use_cases.join(", ")}\n`)
    })
    process.exit(0)
  }

  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${colors.cyan}Zory-Guard${colors.reset}${colors.bright} - Middlewares de Proteção                  ║
║                                                              ║
║   Next.js 16 • Edge Runtime • Security • Rate Limiting      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`)

  const patternArg = args.find((a) => a.startsWith("--pattern="))
  const quickMode = args.includes("--quick")

  let patterns = []

  if (quickMode) {
    patterns = ["security", "ratelimit"]
    log("\nModo rápido: Security + Rate Limiting", "cyan")
  } else if (patternArg) {
    patterns = [patternArg.split("=")[1]]
  } else {
    const patternOption = await questionWithOptions(
      "Qual pattern você quer gerar?",
      [
        { label: "Security Headers", description: "CSP, HSTS, X-Frame-Options" },
        { label: "Rate Limiting", description: "Limita requisições (requer Upstash)" },
        { label: "Combined", description: "Combina múltiplos patterns" },
      ]
    )

    if (patternOption.label === "Combined") {
      const addSecurity = await questionYesNo("Incluir Security Headers?", true)
      const addRateLimit = await questionYesNo("Incluir Rate Limiting?", true)

      if (addSecurity) patterns.push("security")
      if (addRateLimit) patterns.push("ratelimit")
    } else {
      patterns = [patternOption.label.toLowerCase().replace(" ", "")]
    }
  }

  const confirm = await questionYesNo("\nGerar middleware?", true)

  if (!confirm) {
    log("\nOperação cancelada.", "yellow")
    closeReadline()
    process.exit(0)
  }

  const middlewarePath = path.join(process.cwd(), "middleware.ts")
  let code

  if (patterns.length > 1) {
    code = generateCombinedMiddleware(patterns)
  } else if (patterns[0] === "ratelimit") {
    code = generateRateLimitMiddleware()
  } else if (patterns[0] === "security") {
    code = generateSecurityMiddleware()
  }

  writeFile(middlewarePath, code)
  logSuccess(`Middleware criado: ${middlewarePath}`)

  console.log(`
${colors.bright}${colors.green}✓ Middleware gerado!${colors.reset}

${colors.bright}Próximos passos:${colors.reset}
`)

  if (patterns.includes("ratelimit")) {
    console.log(`  ${colors.cyan}1.${colors.reset} Instale: ${colors.green}pnpm add @upstash/ratelimit @upstash/redis${colors.reset}
  ${colors.cyan}2.${colors.reset} Configure Upstash Redis em https://upstash.com
  ${colors.cyan}3.${colors.reset} Adicione ao .env.local:
     - UPSTASH_REDIS_REST_URL
     - UPSTASH_REDIS_REST_TOKEN
`)
  }

  if (patterns.includes("security")) {
    console.log(`  ${colors.cyan}•${colors.reset} Teste headers em: ${colors.green}https://securityheaders.com${colors.reset}
  ${colors.cyan}•${colors.reset} Ajuste CSP conforme necessário
`)
  }

  console.log(`  ${colors.cyan}•${colors.reset} Rode: ${colors.green}pnpm dev${colors.reset}
  ${colors.cyan}•${colors.reset} Documentação: ${colors.cyan}.zoryon/docs/ZORY-GUARD.md${colors.reset}

${colors.magenta}Zoryon Genesis - O começo de tudo${colors.reset}
`)

  closeReadline()
}

main().catch((error) => {
  logError(`Erro: ${error.message}`)
  process.exit(1)
})
