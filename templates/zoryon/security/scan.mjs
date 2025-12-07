#!/usr/bin/env node
// Zoryon Security Scanner v0.0.3
// Verifica secrets e vulnerabilidades antes de commits
// Com suporte a whitelist para evitar falsos positivos
// Autor: Jonas Silva | Zoryon (https://zoryon.org/)

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Cores para terminal
const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  amarelo: '\x1b[33m',
  vermelho: '\x1b[31m',
  cinza: '\x1b[90m',
  azul: '\x1b[34m',
  negrito: '\x1b[1m',
}

// Padrões de secrets
const PATTERNS = {
  secrets: [
    {
      id: 'stripe-key',
      name: 'API Key Stripe',
      pattern: /sk_(live|test)_[a-zA-Z0-9]{24,}/g,
      severity: 'alta',
      fix: 'Mova para STRIPE_SECRET_KEY no .env'
    },
    {
      id: 'clerk-key',
      name: 'API Key Clerk',
      pattern: /sk_(live|test)_[a-zA-Z0-9]{20,}/g,
      severity: 'alta',
      fix: 'Mova para CLERK_SECRET_KEY no .env'
    },
    {
      id: 'supabase-jwt',
      name: 'Supabase JWT',
      pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
      severity: 'alta',
      fix: 'Mova para SUPABASE_SERVICE_ROLE_KEY no .env'
    },
    {
      id: 'github-token',
      name: 'GitHub Token',
      pattern: /gh[pousr]_[a-zA-Z0-9]{36,}/g,
      severity: 'alta',
      fix: 'Mova para GITHUB_TOKEN no .env'
    },
    {
      id: 'aws-key',
      name: 'AWS Key',
      pattern: /AKIA[0-9A-Z]{16}/g,
      severity: 'alta',
      fix: 'Mova para AWS_ACCESS_KEY_ID no .env'
    },
    {
      id: 'generic-api-key',
      name: 'Generic API Key',
      pattern: /(['"])(api[_-]?key|apikey|api_secret)['"]\s*[:=]\s*['"][a-zA-Z0-9]{16,}['"]/gi,
      severity: 'media',
      fix: 'Mova para variável de ambiente'
    },
    {
      id: 'password-hardcoded',
      name: 'Senha hardcoded',
      pattern: /(['"])(password|senha|pwd|secret)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      severity: 'alta',
      fix: 'Mova para variável de ambiente'
    },
    {
      id: 'connection-string',
      name: 'Connection String',
      pattern: /postgresql:\/\/[^:]+:[^@]+@[^/]+\/[^\s'"]+/gi,
      severity: 'alta',
      fix: 'Mova para DATABASE_URL no .env'
    },
    {
      id: 'private-key',
      name: 'Private Key',
      pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g,
      severity: 'critica',
      fix: 'Remova o arquivo e adicione ao .gitignore'
    }
  ],
  files: [
    { pattern: '.env', message: 'Arquivo de ambiente não deve ser commitado' },
    { pattern: '.env.local', message: 'Arquivo de ambiente local' },
    { pattern: '.env.production', message: 'Arquivo de ambiente de produção' },
    { pattern: 'credentials.json', message: 'Arquivo de credenciais' },
    { pattern: '*.pem', message: 'Chave privada' },
    { pattern: '*.key', message: 'Arquivo de chave' },
    { pattern: 'id_rsa', message: 'Chave SSH privada' },
  ]
}

// Extensões a verificar
const CHECK_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.json', '.env', '.yaml', '.yml',
  '.md', '.txt', '.html', '.css'
]

// Carregar whitelist
async function loadWhitelist() {
  const whitelistPath = path.join(__dirname, 'whitelist.json')

  try {
    const content = await fs.readFile(whitelistPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    // Whitelist padrão se arquivo não existir
    return {
      ignorarArquivos: ['**/*.md', '**/*.txt', '.env.example'],
      ignorarDiretorios: ['node_modules', '.git', '.next', 'dist', 'build', '.turbo', 'coverage'],
      ignorarRegras: {},
      ignorarPadroes: [],
      comentarioIgnore: 'zoryon-ignore'
    }
  }
}

// Verificar se arquivo deve ser ignorado
function shouldIgnoreFile(filePath, whitelist) {
  const relativePath = path.relative(process.cwd(), filePath)

  for (const pattern of whitelist.ignorarArquivos || []) {
    if (matchGlobPattern(relativePath, pattern)) {
      return true
    }
  }

  return false
}

// Verificar se diretório deve ser ignorado
function shouldIgnoreDir(dirName, whitelist) {
  return (whitelist.ignorarDiretorios || []).includes(dirName)
}

// Verificar se regra deve ser ignorada para um arquivo específico
function shouldIgnoreRule(filePath, ruleId, whitelist) {
  const relativePath = path.relative(process.cwd(), filePath)

  for (const [filePattern, rules] of Object.entries(whitelist.ignorarRegras || {})) {
    if (matchGlobPattern(relativePath, filePattern)) {
      if (rules.includes('*') || rules.includes(ruleId)) {
        return true
      }
    }
  }

  return false
}

// Verificar se o conteúdo encontrado é um padrão ignorado
function isIgnoredPattern(content, whitelist) {
  for (const item of whitelist.ignorarPadroes || []) {
    if (content.includes(item.pattern)) {
      return true
    }
    // Suporte a regex
    if (item.pattern.startsWith('/') && item.pattern.endsWith('/')) {
      const regex = new RegExp(item.pattern.slice(1, -1))
      if (regex.test(content)) {
        return true
      }
    }
  }

  return false
}

// Correspondência simples de glob pattern
function matchGlobPattern(filePath, pattern) {
  // Normalizar caminhos
  filePath = filePath.replace(/\\/g, '/')
  pattern = pattern.replace(/\\/g, '/')

  // ** = qualquer caminho
  // * = qualquer nome de arquivo

  // Escapar caracteres especiais de regex, exceto * e **
  let regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '{{DOUBLESTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\{\{DOUBLESTAR\}\}/g, '.*')

  // Permitir match no final ou com caminho completo
  const regex = new RegExp(`(^|/)${regexPattern}$`)
  return regex.test(filePath)
}

// Verificar linhas com comentário de ignore
function getIgnoredLines(content, ignoreComment) {
  const lines = content.split('\n')
  const ignoredLines = new Set()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // zoryon-ignore-file - ignora arquivo inteiro
    if (line.includes(`${ignoreComment}-file`)) {
      return 'all'
    }

    // zoryon-ignore-next-line - ignora próxima linha
    if (line.includes(`${ignoreComment}-next-line`)) {
      ignoredLines.add(i + 1)
    }

    // zoryon-ignore na mesma linha - ignora essa linha
    if (line.includes(ignoreComment) && !line.includes(`${ignoreComment}-`)) {
      ignoredLines.add(i)
    }
  }

  return ignoredLines
}

// Encontrar número da linha para um match
function getLineNumber(content, matchIndex) {
  const beforeMatch = content.substring(0, matchIndex)
  return beforeMatch.split('\n').length - 1
}

async function scanFile(filePath, whitelist) {
  const issues = []

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const ignoreComment = whitelist.comentarioIgnore || 'zoryon-ignore'
    const ignoredLines = getIgnoredLines(content, ignoreComment)

    // Se arquivo inteiro está ignorado
    if (ignoredLines === 'all') {
      return issues
    }

    // Verificar padrões de secrets
    for (const rule of PATTERNS.secrets) {
      // Verificar se regra está na whitelist para este arquivo
      if (shouldIgnoreRule(filePath, rule.id, whitelist)) {
        continue
      }

      // Resetar lastIndex do regex
      rule.pattern.lastIndex = 0

      let match
      while ((match = rule.pattern.exec(content)) !== null) {
        const lineNumber = getLineNumber(content, match.index)

        // Verificar se linha está ignorada
        if (ignoredLines.has(lineNumber)) {
          continue
        }

        // Verificar se é um padrão ignorado (ex: exemplo de documentação)
        if (isIgnoredPattern(match[0], whitelist)) {
          continue
        }

        issues.push({
          file: filePath,
          type: rule.name,
          severity: rule.severity,
          line: lineNumber + 1,
          preview: match[0].substring(0, 25) + (match[0].length > 25 ? '...' : ''),
          fix: rule.fix
        })
      }
    }
  } catch (error) {
    // Ignorar arquivos binários ou inacessíveis
  }

  return issues
}

async function scanDirectory(dir, whitelist, issues = []) {
  let entries

  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return issues
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    // Ignorar diretórios específicos
    if (entry.isDirectory()) {
      if (!shouldIgnoreDir(entry.name, whitelist)) {
        await scanDirectory(fullPath, whitelist, issues)
      }
      continue
    }

    // Verificar se arquivo deve ser ignorado
    if (shouldIgnoreFile(fullPath, whitelist)) {
      continue
    }

    // Verificar arquivos sensíveis pelo nome (não ignorados)
    for (const fileRule of PATTERNS.files) {
      const isMatch = entry.name === fileRule.pattern ||
        (fileRule.pattern.includes('*') &&
         entry.name.endsWith(fileRule.pattern.replace('*', '')))

      if (isMatch && !shouldIgnoreFile(fullPath, whitelist)) {
        issues.push({
          file: fullPath,
          type: 'Arquivo sensível',
          severity: 'alta',
          message: fileRule.message
        })
      }
    }

    // Verificar conteúdo de arquivos com extensões relevantes
    const ext = path.extname(entry.name).toLowerCase()
    if (CHECK_EXTENSIONS.includes(ext) || entry.name.startsWith('.env')) {
      const fileIssues = await scanFile(fullPath, whitelist)
      issues.push(...fileIssues)
    }
  }

  return issues
}

function getSeverityIcon(severity) {
  switch (severity) {
    case 'critica': return '🔴'
    case 'alta': return '🟠'
    case 'media': return '🟡'
    default: return '⚪'
  }
}

function getSeverityColor(severity) {
  switch (severity) {
    case 'critica': return cores.vermelho
    case 'alta': return cores.vermelho
    case 'media': return cores.amarelo
    default: return cores.cinza
  }
}

async function main() {
  console.log(`\n${cores.negrito}🔒 Zoryon Security Scanner${cores.reset}\n`)

  // Carregar whitelist
  const whitelist = await loadWhitelist()

  const startDir = process.cwd()
  console.log(`${cores.cinza}Escaneando: ${startDir}${cores.reset}`)
  console.log(`${cores.cinza}Whitelist: ${whitelist.ignorarArquivos?.length || 0} padrões de arquivo${cores.reset}\n`)

  const startTime = Date.now()
  const issues = await scanDirectory(startDir, whitelist)
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

  if (issues.length === 0) {
    console.log(`${cores.verde}✅ Nenhum problema de segurança encontrado!${cores.reset}`)
    console.log(`${cores.cinza}   Tempo: ${elapsed}s${cores.reset}\n`)
    process.exit(0)
  }

  // Agrupar por severidade
  const criticos = issues.filter(i => i.severity === 'critica')
  const altos = issues.filter(i => i.severity === 'alta')
  const medios = issues.filter(i => i.severity === 'media')

  console.log(`${cores.vermelho}❌ Encontrados ${issues.length} problemas:${cores.reset}\n`)

  // Mostrar resumo
  if (criticos.length > 0) {
    console.log(`   🔴 Críticos: ${criticos.length}`)
  }
  if (altos.length > 0) {
    console.log(`   🟠 Altos: ${altos.length}`)
  }
  if (medios.length > 0) {
    console.log(`   🟡 Médios: ${medios.length}`)
  }
  console.log('')

  // Mostrar detalhes
  for (const issue of issues) {
    const icon = getSeverityIcon(issue.severity)
    const color = getSeverityColor(issue.severity)

    console.log(`${icon} ${color}${issue.type}${cores.reset}`)
    console.log(`   ${cores.cinza}Arquivo: ${issue.file}${cores.reset}`)
    if (issue.line) {
      console.log(`   ${cores.cinza}Linha: ${issue.line}${cores.reset}`)
    }
    if (issue.message) {
      console.log(`   ${issue.message}`)
    }
    if (issue.preview) {
      console.log(`   Preview: ${issue.preview}`)
    }
    if (issue.fix) {
      console.log(`   ${cores.azul}💡 Fix: ${issue.fix}${cores.reset}`)
    }
    console.log('')
  }

  console.log(`${cores.cinza}Tempo: ${elapsed}s${cores.reset}`)

  // Dica sobre whitelist
  console.log(`\n${cores.amarelo}💡 Dica: Use ${cores.negrito}// zoryon-ignore${cores.reset}${cores.amarelo} para ignorar falsos positivos${cores.reset}`)
  console.log(`${cores.amarelo}   Ou configure em ${cores.negrito}.zoryon/security/whitelist.json${cores.reset}`)

  console.log(`\n${cores.amarelo}⚠️  Corrija os problemas antes de fazer commit!${cores.reset}\n`)

  // Retorna código de erro para bloquear commits
  process.exit(1)
}

main().catch((error) => {
  console.error(`${cores.vermelho}Erro no scanner: ${error.message}${cores.reset}`)
  process.exit(1)
})
