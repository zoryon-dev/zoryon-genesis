#!/usr/bin/env node
// Zory-Security v0.0.3
// Agente de auditoria de seguranca para aplicacoes web
// Baseado em OWASP Top 10 2025 + melhores praticas
// Autor: Jonas Silva | Zoryon (https://zoryon.org/)

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'
import {
  colors,
  question as commonQuestion,
  closeReadline,
} from './utils/common.mjs'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ============================================
// Configuracao e Constantes
// ============================================

// Alias para cores em português (compatibilidade)
const cores = {
  reset: colors.reset,
  verde: colors.green,
  amarelo: colors.yellow,
  vermelho: colors.red,
  cinza: '\x1b[90m',
  azul: colors.blue,
  magenta: colors.magenta,
  ciano: colors.cyan,
  negrito: colors.bright,
  dim: '\x1b[2m',
}

const SEVERITY_ICONS = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
  info: '🔵',
}

const OWASP_2025 = {
  'A01': 'Broken Access Control',
  'A02': 'Cryptographic Failures',
  'A03': 'Injection',
  'A04': 'Insecure Design',
  'A05': 'Security Misconfiguration',
  'A06': 'Vulnerable Components',
  'A07': 'Auth Failures',
  'A08': 'Integrity Failures',
  'A09': 'Logging Failures',
  'A10': 'Exceptional Conditions',
}

// ============================================
// Utilitarios
// ============================================

function printBanner() {
  console.log(`
${cores.ciano}${cores.negrito}
  ______                       _____                      _ _
 |___  /                      / ____|                    (_) |
    / / ___  _ __ _   _ ______| (___   ___  ___ _   _ _ __ _| |_ _   _
   / / / _ \\| '__| | | |______|\___ \\ / _ \\/ __| | | | '__| | __| | | |
  / /_| (_) | |  | |_| |      ____) |  __/ (__| |_| | |  | | |_| |_| |
 /_____\\___/|_|   \\__, |     |_____/ \\___|\\___|\\__,_|_|  |_|\\__|\\__, |
                   __/ |                                         __/ |
                  |___/                                         |___/
${cores.reset}
  ${cores.dim}Agente de Auditoria de Seguranca | OWASP Top 10 2025${cores.reset}
  ${cores.dim}v0.0.3${cores.reset}
`)
}

function printHelp() {
  console.log(`
${cores.negrito}Uso:${cores.reset} node .zoryon/scripts/zory-security.mjs [comando] [opcoes]

${cores.negrito}Comandos:${cores.reset}
  ${cores.verde}scan${cores.reset}          Scanner rapido (secrets + vulnerabilidades)
  ${cores.verde}audit${cores.reset}         Auditoria completa (OWASP Top 10)
  ${cores.verde}deps${cores.reset}          Verifica dependencias (npm audit)
  ${cores.verde}headers${cores.reset}       Verifica security headers
  ${cores.verde}report${cores.reset}        Gera relatorio completo
  ${cores.verde}fix${cores.reset}           Sugestoes de correcao automatica
  ${cores.verde}--help${cores.reset}        Mostra esta ajuda

${cores.negrito}Opcoes:${cores.reset}
  ${cores.amarelo}--json${cores.reset}        Saida em formato JSON
  ${cores.amarelo}--fix${cores.reset}         Mostra sugestoes de correcao
  ${cores.amarelo}--verbose${cores.reset}     Saida detalhada
  ${cores.amarelo}--category=X${cores.reset}  Filtra por categoria

${cores.negrito}Exemplos:${cores.reset}
  ${cores.cinza}# Scanner rapido${cores.reset}
  node .zoryon/scripts/zory-security.mjs scan

  ${cores.cinza}# Auditoria completa com relatorio${cores.reset}
  node .zoryon/scripts/zory-security.mjs audit --verbose

  ${cores.cinza}# Verificar apenas dependencias${cores.reset}
  node .zoryon/scripts/zory-security.mjs deps

  ${cores.cinza}# Gerar relatorio em JSON${cores.reset}
  node .zoryon/scripts/zory-security.mjs report --json

${cores.negrito}Categorias OWASP 2025:${cores.reset}
  A01: Broken Access Control
  A02: Cryptographic Failures
  A03: Injection (SQL, XSS, Command)
  A04: Insecure Design
  A05: Security Misconfiguration
  A06: Vulnerable Components
  A07: Authentication Failures
  A08: Integrity Failures
  A09: Logging Failures
  A10: Exceptional Conditions
`)
}

async function question(prompt) {
  const answer = await commonQuestion(prompt)
  return answer.trim()
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

async function findFiles(dir, patterns, results = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      // Ignorar diretorios padrao
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', '.next', 'dist', 'build', '.turbo'].includes(entry.name)) {
          await findFiles(fullPath, patterns, results)
        }
        continue
      }

      // Verificar patterns
      for (const pattern of patterns) {
        if (matchPattern(entry.name, pattern) || matchPattern(fullPath, pattern)) {
          results.push(fullPath)
          break
        }
      }
    }
  } catch {
    // Ignorar erros de acesso
  }

  return results
}

function matchPattern(str, pattern) {
  if (pattern.includes('*')) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\//g, '\\/'))
    return regex.test(str)
  }
  return str.includes(pattern)
}

async function searchInFiles(files, patterns) {
  const results = []

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8')
      const lines = content.split('\n')

      for (const pattern of patterns) {
        const regex = new RegExp(pattern.pattern || pattern, 'gi')

        for (let i = 0; i < lines.length; i++) {
          const match = lines[i].match(regex)
          if (match) {
            results.push({
              file,
              line: i + 1,
              content: lines[i].trim().substring(0, 100),
              pattern: pattern.name || pattern,
              message: pattern.message || null
            })
          }
        }
      }
    } catch {
      // Ignorar arquivos ilegíveis
    }
  }

  return results
}

// ============================================
// Verificacoes de Seguranca
// ============================================

async function checkSecrets() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.critical} Verificando Secrets & API Keys...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  const secretPatterns = [
    { pattern: /sk_(live|test)_[a-zA-Z0-9]{24,}/g, name: 'Stripe Key', severity: 'critical' },
    { pattern: /sk_(live|test)_[a-zA-Z0-9]{20,}/g, name: 'Clerk Key', severity: 'critical' },
    { pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, name: 'JWT Token', severity: 'high' },
    { pattern: /gh[pousr]_[a-zA-Z0-9]{36,}/g, name: 'GitHub Token', severity: 'critical' },
    { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Key', severity: 'critical' },
    { pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, name: 'Private Key', severity: 'critical' },
    { pattern: /postgresql:\/\/[^:]+:[^@]+@[^/]+\/[^\s'"]+/gi, name: 'Database URL', severity: 'high' },
    { pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^\s'"]+/gi, name: 'MongoDB URL', severity: 'high' },
  ]

  const files = await findFiles(projectRoot, ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json'])

  for (const file of files) {
    // Ignorar arquivos de config do agente
    if (file.includes('.zoryon/security/')) continue
    if (file.includes('node_modules')) continue

    try {
      const content = await fs.readFile(file, 'utf-8')

      // Ignorar arquivos com comentario de ignore
      if (content.includes('zoryon-ignore-file')) continue

      for (const { pattern, name, severity } of secretPatterns) {
        pattern.lastIndex = 0
        let match
        while ((match = pattern.exec(content)) !== null) {
          const lines = content.substring(0, match.index).split('\n')
          const lineNumber = lines.length
          const lineContent = content.split('\n')[lineNumber - 1]

          // Verificar se linha tem ignore
          if (lineContent.includes('zoryon-ignore')) continue

          issues.push({
            category: 'secrets',
            owasp: 'A02',
            severity,
            type: name,
            file: path.relative(projectRoot, file),
            line: lineNumber,
            preview: match[0].substring(0, 20) + '...',
            fix: `Mova para variavel de ambiente no .env`
          })
        }
      }
    } catch {
      // Ignorar arquivos ilegíveis
    }
  }

  // Verificar arquivos sensiveis
  const sensitiveFiles = ['.env', '.env.local', '.env.production', 'credentials.json', '*.pem', '*.key']
  for (const pattern of sensitiveFiles) {
    const found = await findFiles(projectRoot, [pattern])
    for (const file of found) {
      if (!file.includes('.env.example')) {
        issues.push({
          category: 'secrets',
          owasp: 'A02',
          severity: 'high',
          type: 'Sensitive File',
          file: path.relative(projectRoot, file),
          fix: 'Adicione ao .gitignore'
        })
      }
    }
  }

  return issues
}

async function checkVulnerabilities() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.critical} Verificando Vulnerabilidades de Codigo...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  const vulnPatterns = [
    { pattern: /eval\s*\(/g, name: 'eval() usage', severity: 'critical', owasp: 'A03', message: 'eval() pode executar codigo arbitrario' },
    { pattern: /innerHTML\s*=/g, name: 'innerHTML assignment', severity: 'high', owasp: 'A03', message: 'Pode causar XSS - use textContent' },
    { pattern: /dangerouslySetInnerHTML/g, name: 'dangerouslySetInnerHTML', severity: 'medium', owasp: 'A03', message: 'Sanitize com DOMPurify' },
    { pattern: /exec\s*\([^)]*\$\{/g, name: 'Command Injection', severity: 'critical', owasp: 'A03', message: 'Use array args em vez de string' },
    { pattern: /\$\{[^}]+\}.*(?:SELECT|INSERT|UPDATE|DELETE)/gi, name: 'SQL Injection', severity: 'critical', owasp: 'A03', message: 'Use queries parametrizadas' },
    { pattern: /document\.write\s*\(/g, name: 'document.write', severity: 'medium', owasp: 'A03', message: 'Evite document.write' },
    { pattern: /new\s+Function\s*\(/g, name: 'new Function()', severity: 'high', owasp: 'A03', message: 'Pode executar codigo arbitrario' },
  ]

  const files = await findFiles(projectRoot, ['*.ts', '*.tsx', '*.js', '*.jsx'])

  for (const file of files) {
    if (file.includes('node_modules')) continue
    if (file.includes('.zoryon/')) continue

    try {
      const content = await fs.readFile(file, 'utf-8')

      if (content.includes('zoryon-ignore-file')) continue

      for (const vuln of vulnPatterns) {
        vuln.pattern.lastIndex = 0
        let match
        while ((match = vuln.pattern.exec(content)) !== null) {
          const lines = content.substring(0, match.index).split('\n')
          const lineNumber = lines.length
          const lineContent = content.split('\n')[lineNumber - 1]

          if (lineContent.includes('zoryon-ignore')) continue

          issues.push({
            category: 'vulnerabilities',
            owasp: vuln.owasp,
            severity: vuln.severity,
            type: vuln.name,
            file: path.relative(projectRoot, file),
            line: lineNumber,
            preview: lineContent.trim().substring(0, 60),
            fix: vuln.message
          })
        }
      }
    } catch {
      // Ignorar
    }
  }

  return issues
}

async function checkDependencies() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.high} Verificando Dependencias...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  // Verificar se package.json existe
  const packageJsonPath = path.join(projectRoot, 'package.json')
  if (!await fileExists(packageJsonPath)) {
    console.log(`${cores.cinza}  Nenhum package.json encontrado${cores.reset}`)
    return issues
  }

  // Verificar lockfile
  const hasLockfile = await fileExists(path.join(projectRoot, 'package-lock.json')) ||
                      await fileExists(path.join(projectRoot, 'pnpm-lock.yaml')) ||
                      await fileExists(path.join(projectRoot, 'yarn.lock'))

  if (!hasLockfile) {
    issues.push({
      category: 'dependencies',
      owasp: 'A06',
      severity: 'high',
      type: 'Missing Lockfile',
      file: 'package.json',
      fix: 'Execute npm install ou pnpm install para gerar lockfile'
    })
  }

  // Executar npm audit
  try {
    console.log(`${cores.cinza}  Executando npm audit...${cores.reset}`)
    const { stdout } = await execAsync('npm audit --json 2>/dev/null || true', { cwd: projectRoot })

    try {
      const auditResult = JSON.parse(stdout)

      if (auditResult.vulnerabilities) {
        const vulns = auditResult.vulnerabilities

        for (const [pkg, data] of Object.entries(vulns)) {
          const severity = data.severity || 'medium'
          issues.push({
            category: 'dependencies',
            owasp: 'A06',
            severity: severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium',
            type: `Vulnerable Package: ${pkg}`,
            file: 'package.json',
            fix: data.fixAvailable ? `npm audit fix` : `Atualize ${pkg} manualmente`
          })
        }
      }

      if (auditResult.metadata) {
        const { critical = 0, high = 0, moderate = 0, low = 0 } = auditResult.metadata.vulnerabilities || {}
        console.log(`${cores.cinza}  Encontradas: ${critical} criticas, ${high} altas, ${moderate} moderadas, ${low} baixas${cores.reset}`)
      }
    } catch {
      // JSON parse falhou, npm audit nao encontrou nada ou erro
      console.log(`${cores.verde}  ✓ Nenhuma vulnerabilidade encontrada pelo npm audit${cores.reset}`)
    }
  } catch (error) {
    console.log(`${cores.amarelo}  ⚠ npm audit nao disponivel ou falhou${cores.reset}`)
  }

  // Verificar pacotes conhecidamente vulneraveis
  const packageJson = await readJsonFile(packageJsonPath)
  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    const knownVulnerable = [
      { name: 'lodash', badVersions: ['<4.17.21'], cve: 'CVE-2021-23337' },
      { name: 'axios', badVersions: ['<0.21.1'], cve: 'CVE-2020-28168' },
      { name: 'minimist', badVersions: ['<1.2.6'], cve: 'CVE-2021-44906' },
    ]

    for (const vuln of knownVulnerable) {
      if (deps[vuln.name]) {
        // Verificacao simplificada de versao
        const version = deps[vuln.name].replace(/[\^~]/g, '')
        issues.push({
          category: 'dependencies',
          owasp: 'A06',
          severity: 'medium',
          type: `Check ${vuln.name} version`,
          file: 'package.json',
          fix: `Verifique se ${vuln.name}@${version} nao e afetado por ${vuln.cve}`
        })
      }
    }
  }

  return issues
}

async function checkSecurityHeaders() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.medium} Verificando Security Headers...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  const requiredHeaders = [
    { name: 'Content-Security-Policy', severity: 'high', owasp: 'A05' },
    { name: 'Strict-Transport-Security', severity: 'high', owasp: 'A02' },
    { name: 'X-Frame-Options', severity: 'medium', owasp: 'A05' },
    { name: 'X-Content-Type-Options', severity: 'medium', owasp: 'A05' },
    { name: 'Referrer-Policy', severity: 'low', owasp: 'A05' },
  ]

  // Verificar next.config
  const nextConfigPaths = ['next.config.js', 'next.config.mjs', 'next.config.ts']
  let nextConfigContent = null
  let nextConfigPath = null

  for (const configPath of nextConfigPaths) {
    const fullPath = path.join(projectRoot, configPath)
    if (await fileExists(fullPath)) {
      nextConfigContent = await fs.readFile(fullPath, 'utf-8')
      nextConfigPath = configPath
      break
    }
  }

  if (nextConfigContent) {
    console.log(`${cores.cinza}  Verificando ${nextConfigPath}...${cores.reset}`)

    for (const header of requiredHeaders) {
      if (!nextConfigContent.includes(header.name)) {
        issues.push({
          category: 'security-headers',
          owasp: header.owasp,
          severity: header.severity,
          type: `Missing ${header.name}`,
          file: nextConfigPath,
          fix: `Adicione header ${header.name} na configuracao`
        })
      }
    }

    // Verificar se tem funcao headers()
    if (!nextConfigContent.includes('headers()') && !nextConfigContent.includes('headers:')) {
      issues.push({
        category: 'security-headers',
        owasp: 'A05',
        severity: 'high',
        type: 'Missing headers() config',
        file: nextConfigPath,
        fix: 'Configure security headers no next.config'
      })
    }
  } else {
    console.log(`${cores.amarelo}  ⚠ next.config nao encontrado${cores.reset}`)
  }

  // Verificar middleware.ts
  const middlewarePath = path.join(projectRoot, 'src/middleware.ts')
  if (await fileExists(middlewarePath)) {
    const middlewareContent = await fs.readFile(middlewarePath, 'utf-8')

    if (!middlewareContent.includes('Content-Security-Policy') &&
        !middlewareContent.includes('response.headers')) {
      issues.push({
        category: 'security-headers',
        owasp: 'A05',
        severity: 'info',
        type: 'Consider middleware headers',
        file: 'src/middleware.ts',
        fix: 'Considere adicionar headers via middleware para maior controle'
      })
    }
  }

  // Verificar vercel.json
  const vercelJsonPath = path.join(projectRoot, 'vercel.json')
  if (await fileExists(vercelJsonPath)) {
    const vercelJson = await readJsonFile(vercelJsonPath)
    if (vercelJson && !vercelJson.headers) {
      issues.push({
        category: 'security-headers',
        owasp: 'A05',
        severity: 'low',
        type: 'Consider Vercel headers',
        file: 'vercel.json',
        fix: 'Configure headers no vercel.json para deploy'
      })
    }
  }

  return issues
}

async function checkAuthentication() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.critical} Verificando Autenticacao & Autorizacao...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  // Detectar provider de auth
  const authProviders = {
    clerk: ['@clerk/nextjs', 'clerkMiddleware', 'ClerkProvider'],
    nextauth: ['next-auth', 'NextAuth', 'getServerSession'],
    supabase: ['@supabase/auth-helpers', 'createClientComponentClient'],
    auth0: ['@auth0/nextjs-auth0'],
  }

  let detectedProvider = null
  const packageJson = await readJsonFile(path.join(projectRoot, 'package.json'))

  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    for (const [provider, markers] of Object.entries(authProviders)) {
      for (const marker of markers) {
        if (deps[marker]) {
          detectedProvider = provider
          break
        }
      }
      if (detectedProvider) break
    }
  }

  if (detectedProvider) {
    console.log(`${cores.verde}  ✓ Provider detectado: ${detectedProvider}${cores.reset}`)
  } else {
    issues.push({
      category: 'authentication',
      owasp: 'A07',
      severity: 'info',
      type: 'No auth provider detected',
      file: 'package.json',
      fix: 'Considere implementar autenticacao (Clerk, NextAuth, etc.)'
    })
  }

  // Verificar middleware de auth
  const middlewarePath = path.join(projectRoot, 'src/middleware.ts')
  if (await fileExists(middlewarePath)) {
    const content = await fs.readFile(middlewarePath, 'utf-8')

    const authMiddlewarePatterns = ['clerkMiddleware', 'authMiddleware', 'withAuth', 'getToken']
    const hasAuthMiddleware = authMiddlewarePatterns.some(p => content.includes(p))

    if (!hasAuthMiddleware) {
      issues.push({
        category: 'authentication',
        owasp: 'A07',
        severity: 'high',
        type: 'No auth middleware detected',
        file: 'src/middleware.ts',
        fix: 'Configure middleware de autenticacao'
      })
    }
  } else {
    issues.push({
      category: 'authentication',
      owasp: 'A01',
      severity: 'medium',
      type: 'No middleware.ts',
      file: 'src/middleware.ts',
      fix: 'Crie middleware.ts para proteger rotas'
    })
  }

  // Verificar API routes sem auth
  const apiFiles = await findFiles(path.join(projectRoot, 'src/app/api'), ['*.ts', '*.tsx'])

  for (const file of apiFiles) {
    if (file.includes('webhook') || file.includes('health')) continue

    try {
      const content = await fs.readFile(file, 'utf-8')

      // Verificar se tem verificacao de auth
      const authPatterns = ['auth', 'session', 'getServerSession', 'currentUser', 'getAuth', 'clerkClient']
      const hasAuth = authPatterns.some(p => content.includes(p))

      if (!hasAuth && content.includes('export')) {
        issues.push({
          category: 'authentication',
          owasp: 'A01',
          severity: 'medium',
          type: 'API route without auth check',
          file: path.relative(projectRoot, file),
          fix: 'Adicione verificacao de autenticacao'
        })
      }
    } catch {
      // Ignorar
    }
  }

  // Verificar rate limiting
  const files = await findFiles(projectRoot, ['middleware.ts', '*.ts'])
  let hasRateLimiting = false

  for (const file of files.slice(0, 20)) { // Limitar busca
    try {
      const content = await fs.readFile(file, 'utf-8')
      if (content.includes('rateLimit') || content.includes('upstash/ratelimit')) {
        hasRateLimiting = true
        break
      }
    } catch {
      // Ignorar
    }
  }

  if (!hasRateLimiting) {
    issues.push({
      category: 'authentication',
      owasp: 'A07',
      severity: 'medium',
      type: 'No rate limiting detected',
      file: 'src/middleware.ts',
      fix: 'Implemente rate limiting (ex: @upstash/ratelimit)'
    })
  }

  return issues
}

async function checkInputValidation() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.high} Verificando Validacao de Input...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  // Verificar uso de Zod ou similar
  const packageJson = await readJsonFile(path.join(projectRoot, 'package.json'))
  let hasValidationLib = false

  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    hasValidationLib = deps['zod'] || deps['yup'] || deps['joi'] || deps['valibot']
  }

  if (hasValidationLib) {
    console.log(`${cores.verde}  ✓ Biblioteca de validacao detectada${cores.reset}`)
  } else {
    issues.push({
      category: 'input-validation',
      owasp: 'A03',
      severity: 'medium',
      type: 'No validation library',
      file: 'package.json',
      fix: 'Instale Zod para validacao: pnpm add zod'
    })
  }

  // Verificar API routes
  const apiFiles = await findFiles(path.join(projectRoot, 'src/app/api'), ['*.ts', '*.tsx'])

  for (const file of apiFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8')

      // Verificar se usa req.json() sem validacao
      if (content.includes('req.json()') || content.includes('request.json()')) {
        const hasValidation = content.includes('z.') ||
                             content.includes('safeParse') ||
                             content.includes('parse(') ||
                             content.includes('validate')

        if (!hasValidation) {
          issues.push({
            category: 'input-validation',
            owasp: 'A03',
            severity: 'high',
            type: 'JSON parsing without validation',
            file: path.relative(projectRoot, file),
            fix: 'Valide input com Zod antes de usar'
          })
        }
      }
    } catch {
      // Ignorar
    }
  }

  return issues
}

async function checkLogging() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.medium} Verificando Logging & Monitoring...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  // Verificar biblioteca de logging
  const packageJson = await readJsonFile(path.join(projectRoot, 'package.json'))
  let hasLoggingLib = false

  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    hasLoggingLib = deps['pino'] || deps['winston'] || deps['bunyan'] || deps['@sentry/nextjs']
  }

  if (!hasLoggingLib) {
    issues.push({
      category: 'logging',
      owasp: 'A09',
      severity: 'medium',
      type: 'No logging library',
      file: 'package.json',
      fix: 'Instale biblioteca de logging: pnpm add pino pino-pretty'
    })
  }

  // Verificar console.log com dados sensiveis
  const badPatterns = [
    { pattern: /console\.log\([^)]*password/gi, message: 'Nunca logue senhas' },
    { pattern: /console\.log\([^)]*token/gi, message: 'Nunca logue tokens' },
    { pattern: /console\.log\([^)]*secret/gi, message: 'Nunca logue secrets' },
    { pattern: /console\.log\([^)]*apiKey/gi, message: 'Nunca logue API keys' },
  ]

  const files = await findFiles(projectRoot, ['*.ts', '*.tsx', '*.js', '*.jsx'])

  for (const file of files) {
    if (file.includes('node_modules')) continue
    if (file.includes('.zoryon/')) continue

    try {
      const content = await fs.readFile(file, 'utf-8')

      for (const { pattern, message } of badPatterns) {
        pattern.lastIndex = 0
        if (pattern.test(content)) {
          issues.push({
            category: 'logging',
            owasp: 'A09',
            severity: 'critical',
            type: 'Sensitive data in logs',
            file: path.relative(projectRoot, file),
            fix: message
          })
        }
      }
    } catch {
      // Ignorar
    }
  }

  return issues
}

async function checkErrorHandling() {
  console.log(`\n${cores.negrito}${SEVERITY_ICONS.medium} Verificando Error Handling...${cores.reset}\n`)

  const issues = []
  const projectRoot = process.cwd()

  // Verificar error.tsx global
  const errorFiles = [
    'src/app/error.tsx',
    'src/app/global-error.tsx',
    'app/error.tsx',
    'app/global-error.tsx'
  ]

  let hasErrorBoundary = false
  for (const errorFile of errorFiles) {
    if (await fileExists(path.join(projectRoot, errorFile))) {
      hasErrorBoundary = true
      break
    }
  }

  if (!hasErrorBoundary) {
    issues.push({
      category: 'error-handling',
      owasp: 'A10',
      severity: 'medium',
      type: 'No error boundary',
      file: 'src/app/error.tsx',
      fix: 'Crie error.tsx para tratar erros de forma segura'
    })
  }

  // Verificar not-found.tsx
  const notFoundFiles = ['src/app/not-found.tsx', 'app/not-found.tsx']
  let hasNotFound = false
  for (const nfFile of notFoundFiles) {
    if (await fileExists(path.join(projectRoot, nfFile))) {
      hasNotFound = true
      break
    }
  }

  if (!hasNotFound) {
    issues.push({
      category: 'error-handling',
      owasp: 'A10',
      severity: 'low',
      type: 'No not-found page',
      file: 'src/app/not-found.tsx',
      fix: 'Crie not-found.tsx para paginas 404 customizadas'
    })
  }

  // Verificar API routes com try-catch
  const apiFiles = await findFiles(path.join(projectRoot, 'src/app/api'), ['*.ts', '*.tsx'])

  for (const file of apiFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8')

      // Verificar se tem export sem try-catch
      if ((content.includes('export async function') || content.includes('export function')) &&
          !content.includes('try') && !content.includes('catch')) {
        issues.push({
          category: 'error-handling',
          owasp: 'A10',
          severity: 'medium',
          type: 'API route without error handling',
          file: path.relative(projectRoot, file),
          fix: 'Adicione try-catch para tratar erros'
        })
      }
    } catch {
      // Ignorar
    }
  }

  return issues
}

// ============================================
// Geracao de Relatorio
// ============================================

function generateMarkdownReport(allIssues, metadata) {
  const timestamp = new Date().toISOString()

  let md = `# Zoryon Security Audit Report

**Gerado em:** ${timestamp}
**Projeto:** ${metadata.projectName || 'Unknown'}
**Total de Issues:** ${allIssues.length}

## Resumo por Severidade

| Severidade | Quantidade |
|------------|------------|
| ${SEVERITY_ICONS.critical} Critica | ${allIssues.filter(i => i.severity === 'critical').length} |
| ${SEVERITY_ICONS.high} Alta | ${allIssues.filter(i => i.severity === 'high').length} |
| ${SEVERITY_ICONS.medium} Media | ${allIssues.filter(i => i.severity === 'medium').length} |
| ${SEVERITY_ICONS.low} Baixa | ${allIssues.filter(i => i.severity === 'low').length} |
| ${SEVERITY_ICONS.info} Info | ${allIssues.filter(i => i.severity === 'info').length} |

## Resumo por OWASP Top 10

`

  const owaspCount = {}
  for (const issue of allIssues) {
    const owasp = issue.owasp || 'N/A'
    owaspCount[owasp] = (owaspCount[owasp] || 0) + 1
  }

  for (const [code, name] of Object.entries(OWASP_2025)) {
    const count = owaspCount[code] || 0
    md += `- **${code}:** ${name} - ${count} issues\n`
  }

  md += `\n## Detalhes das Issues\n\n`

  // Agrupar por categoria
  const byCategory = {}
  for (const issue of allIssues) {
    const cat = issue.category || 'other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(issue)
  }

  for (const [category, issues] of Object.entries(byCategory)) {
    md += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`

    for (const issue of issues) {
      md += `#### ${SEVERITY_ICONS[issue.severity]} ${issue.type}\n\n`
      md += `- **Severidade:** ${issue.severity}\n`
      md += `- **OWASP:** ${issue.owasp || 'N/A'}\n`
      md += `- **Arquivo:** \`${issue.file}\`\n`
      if (issue.line) md += `- **Linha:** ${issue.line}\n`
      if (issue.fix) md += `- **Fix:** ${issue.fix}\n`
      md += '\n'
    }
  }

  md += `---
*Gerado por Zory-Security v0.0.3*
*Zoryon Genesis - O comeco de tudo*
`

  return md
}

// ============================================
// Modos de Execucao
// ============================================

async function runQuickScan(options = {}) {
  console.log(`${cores.negrito}Modo: Quick Scan${cores.reset}`)

  const allIssues = []

  const secretIssues = await checkSecrets()
  allIssues.push(...secretIssues)

  const vulnIssues = await checkVulnerabilities()
  allIssues.push(...vulnIssues)

  return allIssues
}

async function runFullAudit(options = {}) {
  console.log(`${cores.negrito}Modo: Full Audit (OWASP Top 10 2025)${cores.reset}`)

  const allIssues = []

  // SEC-01: Secrets
  const secretIssues = await checkSecrets()
  allIssues.push(...secretIssues)

  // SEC-02: Vulnerabilities
  const vulnIssues = await checkVulnerabilities()
  allIssues.push(...vulnIssues)

  // SEC-03: Dependencies
  const depIssues = await checkDependencies()
  allIssues.push(...depIssues)

  // SEC-04: Authentication
  const authIssues = await checkAuthentication()
  allIssues.push(...authIssues)

  // SEC-05: Input Validation
  const inputIssues = await checkInputValidation()
  allIssues.push(...inputIssues)

  // SEC-06: Security Headers
  const headerIssues = await checkSecurityHeaders()
  allIssues.push(...headerIssues)

  // SEC-07: Logging
  const logIssues = await checkLogging()
  allIssues.push(...logIssues)

  // SEC-10: Error Handling
  const errorIssues = await checkErrorHandling()
  allIssues.push(...errorIssues)

  return allIssues
}

async function runDepsCheck(options = {}) {
  console.log(`${cores.negrito}Modo: Dependency Check${cores.reset}`)
  return await checkDependencies()
}

async function runHeadersCheck(options = {}) {
  console.log(`${cores.negrito}Modo: Security Headers Check${cores.reset}`)
  return await checkSecurityHeaders()
}

async function generateReport(options = {}) {
  console.log(`${cores.negrito}Modo: Generate Report${cores.reset}`)

  const allIssues = await runFullAudit(options)

  const packageJson = await readJsonFile(path.join(process.cwd(), 'package.json'))
  const metadata = {
    projectName: packageJson?.name || path.basename(process.cwd()),
    timestamp: new Date().toISOString()
  }

  if (options.json) {
    const report = {
      metadata,
      summary: {
        total: allIssues.length,
        critical: allIssues.filter(i => i.severity === 'critical').length,
        high: allIssues.filter(i => i.severity === 'high').length,
        medium: allIssues.filter(i => i.severity === 'medium').length,
        low: allIssues.filter(i => i.severity === 'low').length,
        info: allIssues.filter(i => i.severity === 'info').length,
      },
      issues: allIssues
    }

    const outputPath = path.join(process.cwd(), '.zoryon/reports/security-audit.json')
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2))
    console.log(`\n${cores.verde}✓ Relatorio JSON salvo em: ${outputPath}${cores.reset}`)

    return allIssues
  }

  // Markdown report
  const mdReport = generateMarkdownReport(allIssues, metadata)
  const outputPath = path.join(process.cwd(), '.zoryon/reports/security-audit.md')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, mdReport)
  console.log(`\n${cores.verde}✓ Relatorio Markdown salvo em: ${outputPath}${cores.reset}`)

  return allIssues
}

// ============================================
// Interface Interativa
// ============================================

async function runInteractive() {
  printBanner()

  console.log(`${cores.negrito}Selecione o modo de verificacao:${cores.reset}\n`)
  console.log(`  ${cores.verde}1${cores.reset} - Quick Scan (secrets + vulnerabilidades)`)
  console.log(`  ${cores.verde}2${cores.reset} - Full Audit (OWASP Top 10 2025)`)
  console.log(`  ${cores.verde}3${cores.reset} - Dependency Check (npm audit)`)
  console.log(`  ${cores.verde}4${cores.reset} - Security Headers Check`)
  console.log(`  ${cores.verde}5${cores.reset} - Generate Full Report`)
  console.log(`  ${cores.verde}0${cores.reset} - Sair\n`)

  const choice = await question(`${cores.ciano}Opcao: ${cores.reset}`)

  let issues = []

  switch (choice) {
    case '1':
      issues = await runQuickScan()
      break
    case '2':
      issues = await runFullAudit()
      break
    case '3':
      issues = await runDepsCheck()
      break
    case '4':
      issues = await runHeadersCheck()
      break
    case '5':
      issues = await generateReport()
      break
    case '0':
      console.log(`\n${cores.cinza}Ate logo!${cores.reset}\n`)
      process.exit(0)
    default:
      console.log(`\n${cores.vermelho}Opcao invalida${cores.reset}\n`)
      process.exit(1)
  }

  return issues
}

// ============================================
// Exibicao de Resultados
// ============================================

function displayResults(issues) {
  console.log(`\n${cores.negrito}${'='.repeat(60)}${cores.reset}`)
  console.log(`${cores.negrito}RESULTADOS${cores.reset}`)
  console.log(`${cores.negrito}${'='.repeat(60)}${cores.reset}\n`)

  if (issues.length === 0) {
    console.log(`${cores.verde}✅ Nenhum problema de seguranca encontrado!${cores.reset}\n`)
    return
  }

  // Resumo
  const critical = issues.filter(i => i.severity === 'critical').length
  const high = issues.filter(i => i.severity === 'high').length
  const medium = issues.filter(i => i.severity === 'medium').length
  const low = issues.filter(i => i.severity === 'low').length
  const info = issues.filter(i => i.severity === 'info').length

  console.log(`${cores.vermelho}Encontrados ${issues.length} problemas:${cores.reset}\n`)
  console.log(`  ${SEVERITY_ICONS.critical} Criticos: ${critical}`)
  console.log(`  ${SEVERITY_ICONS.high} Altos: ${high}`)
  console.log(`  ${SEVERITY_ICONS.medium} Medios: ${medium}`)
  console.log(`  ${SEVERITY_ICONS.low} Baixos: ${low}`)
  console.log(`  ${SEVERITY_ICONS.info} Info: ${info}`)

  console.log(`\n${cores.negrito}Detalhes:${cores.reset}\n`)

  // Ordenar por severidade
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  for (const issue of issues) {
    const icon = SEVERITY_ICONS[issue.severity]
    const color = issue.severity === 'critical' || issue.severity === 'high'
      ? cores.vermelho
      : issue.severity === 'medium'
        ? cores.amarelo
        : cores.cinza

    console.log(`${icon} ${color}${issue.type}${cores.reset}`)
    console.log(`   ${cores.cinza}Arquivo: ${issue.file}${cores.reset}`)
    if (issue.line) console.log(`   ${cores.cinza}Linha: ${issue.line}${cores.reset}`)
    if (issue.owasp) console.log(`   ${cores.cinza}OWASP: ${issue.owasp} - ${OWASP_2025[issue.owasp] || ''}${cores.reset}`)
    if (issue.fix) console.log(`   ${cores.azul}💡 Fix: ${issue.fix}${cores.reset}`)
    console.log('')
  }

  // Dicas
  console.log(`${cores.amarelo}💡 Dicas:${cores.reset}`)
  console.log(`   ${cores.cinza}• Use ${cores.negrito}// zoryon-ignore${cores.reset}${cores.cinza} para ignorar falsos positivos${cores.reset}`)
  console.log(`   ${cores.cinza}• Execute ${cores.negrito}pnpm zory security report${cores.reset}${cores.cinza} para relatorio completo${cores.reset}`)
  console.log(`   ${cores.cinza}• Configure whitelist em ${cores.negrito}.zoryon/security/whitelist.json${cores.reset}`)
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  const options = {
    json: args.includes('--json'),
    verbose: args.includes('--verbose'),
    fix: args.includes('--fix'),
  }

  const command = args.find(a => !a.startsWith('--'))

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    printBanner()
    printHelp()
    process.exit(0)
  }

  let issues = []

  // Executar comando
  switch (command) {
    case 'scan':
      printBanner()
      issues = await runQuickScan(options)
      break
    case 'audit':
      printBanner()
      issues = await runFullAudit(options)
      break
    case 'deps':
      printBanner()
      issues = await runDepsCheck(options)
      break
    case 'headers':
      printBanner()
      issues = await runHeadersCheck(options)
      break
    case 'report':
      printBanner()
      issues = await generateReport(options)
      break
    default:
      // Modo interativo
      issues = await runInteractive()
  }

  // Exibir resultados (exceto se ja gerou relatorio)
  if (command !== 'report' || !options.json) {
    displayResults(issues)
  }

  // Exit code baseado em issues criticas/altas
  const criticalOrHigh = issues.filter(i =>
    i.severity === 'critical' || i.severity === 'high'
  ).length

  if (criticalOrHigh > 0) {
    console.log(`\n${cores.vermelho}⚠️  Encontrados ${criticalOrHigh} problemas criticos/altos!${cores.reset}\n`)
    process.exit(1)
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(`${cores.vermelho}Erro: ${error.message}${cores.reset}`)
  process.exit(1)
})
