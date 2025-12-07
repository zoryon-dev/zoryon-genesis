#!/usr/bin/env node

/**
 * Zory-Practices - Agente de Analise de Boas Praticas
 *
 * Analisa codigo React/TypeScript seguindo melhores praticas:
 * - Qualidade de codigo (DRY, dead code)
 * - TypeScript (tipagem, strict mode)
 * - Padroes React (hooks, componentes)
 * - Performance (memoizacao, bundle)
 * - Acessibilidade (WCAG 2.2)
 * - Testes (cobertura, qualidade)
 * - Tratamento de erros
 * - Arquitetura
 *
 * Uso:
 *   node .zoryon/scripts/zory-practices.mjs           # Modo interativo
 *   node .zoryon/scripts/zory-practices.mjs analyze   # Analise completa
 *   node .zoryon/scripts/zory-practices.mjs quick     # Analise rapida
 *   node .zoryon/scripts/zory-practices.mjs report    # Gerar relatorio
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { glob } from 'glob'
import {
  colors,
  getReadlineInterface,
  closeReadline,
} from './utils/common.mjs'

// Alias para cores (compatibilidade com código existente)
const c = {
  ...colors,
  bold: colors.bright,
  dim: '\x1b[2m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
}

// Paths
const ZORYON_DIR = path.join(process.cwd(), '.zoryon')
const PRACTICES_DIR = path.join(ZORYON_DIR, 'practices')
const RULES_DIR = path.join(PRACTICES_DIR, 'rules')
const REPORTS_DIR = path.join(ZORYON_DIR, 'reports')

// Carregar configuracao
function loadConfig() {
  const configPath = path.join(PRACTICES_DIR, 'config.json')
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }
  return null
}

// Carregar regras
function loadRules() {
  const rules = {}
  if (!fs.existsSync(RULES_DIR)) return rules

  const ruleFiles = fs.readdirSync(RULES_DIR).filter(f => f.endsWith('.json'))
  for (const file of ruleFiles) {
    const rulePath = path.join(RULES_DIR, file)
    const ruleId = path.basename(file, '.json')
    rules[ruleId] = JSON.parse(fs.readFileSync(rulePath, 'utf-8'))
  }
  return rules
}

// Encontrar arquivos para analise
async function findFiles(config) {
  const patterns = config?.scanPaths?.include || [
    'src/**/*.{ts,tsx,js,jsx}',
    'app/**/*.{ts,tsx,js,jsx}'
  ]
  const excludePatterns = config?.scanPaths?.exclude || [
    'node_modules/**',
    '.next/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.d.ts'
  ]

  const files = []
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: excludePatterns,
      cwd: process.cwd()
    })
    files.push(...matches)
  }

  return [...new Set(files)]
}

// Estrutura de issues encontradas
class IssueCollector {
  constructor() {
    this.issues = []
    this.stats = {
      files: 0,
      lines: 0,
      byCategory: {},
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      }
    }
  }

  add(issue) {
    this.issues.push(issue)
    const { category, severity } = issue

    if (!this.stats.byCategory[category]) {
      this.stats.byCategory[category] = 0
    }
    this.stats.byCategory[category]++
    this.stats.bySeverity[severity]++
  }

  calculateScore(config) {
    const severityScores = config?.severity || {
      critical: { score: 10 },
      high: { score: 7 },
      medium: { score: 4 },
      low: { score: 2 },
      info: { score: 1 }
    }

    let totalDeduction = 0
    for (const issue of this.issues) {
      totalDeduction += severityScores[issue.severity]?.score || 1
    }

    // Score base 100, deduz pontos por issue
    // Normaliza para que 100 issues criticas = 0
    const maxScore = 100
    const normalizedDeduction = Math.min(totalDeduction, maxScore)
    return Math.max(0, maxScore - normalizedDeduction)
  }

  getGrade(score, config) {
    const thresholds = config?.thresholds || {
      excellent: { min: 90, label: 'Excelente', emoji: '🏆' },
      good: { min: 75, label: 'Bom', emoji: '✅' },
      moderate: { min: 50, label: 'Moderado', emoji: '⚠️' },
      poor: { min: 0, label: 'Precisa Melhorar', emoji: '❌' }
    }

    if (score >= thresholds.excellent.min) return thresholds.excellent
    if (score >= thresholds.good.min) return thresholds.good
    if (score >= thresholds.moderate.min) return thresholds.moderate
    return thresholds.poor
  }
}

// Verificadores por categoria

// BP-01: Qualidade de Codigo
async function checkCodeQuality(files, rules, collector) {
  const ruleSet = rules['code-quality']?.checks || []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Verificar arquivo grande
    const largeFileRule = ruleSet.find(r => r.id === 'large-file')
    if (largeFileRule && lines.length > (largeFileRule.threshold || 300)) {
      collector.add({
        category: 'code-quality',
        severity: largeFileRule.severity || 'medium',
        rule: 'large-file',
        file,
        message: `Arquivo com ${lines.length} linhas (max: ${largeFileRule.threshold || 300})`,
        fix: largeFileRule.fix
      })
    }

    // Verificar console statements
    const consoleRule = ruleSet.find(r => r.id === 'console-statements')
    if (consoleRule) {
      lines.forEach((line, idx) => {
        if (/console\.(log|debug|info)\(/.test(line) && !/\.test\.|\.spec\./.test(file)) {
          collector.add({
            category: 'code-quality',
            severity: consoleRule.severity || 'low',
            rule: 'console-statements',
            file,
            line: idx + 1,
            message: 'Console statement em codigo de producao',
            fix: consoleRule.fix
          })
        }
      })
    }

    // Verificar TODO/FIXME
    const todoRule = ruleSet.find(r => r.id === 'todo-fixme')
    if (todoRule) {
      lines.forEach((line, idx) => {
        if (/\/\/\s*(TODO|FIXME|HACK|XXX):/.test(line)) {
          collector.add({
            category: 'code-quality',
            severity: 'info',
            rule: 'todo-fixme',
            file,
            line: idx + 1,
            message: line.trim().substring(0, 80),
            fix: todoRule.fix
          })
        }
      })
    }

    // Verificar codigo comentado
    const deadCodeRule = ruleSet.find(r => r.id === 'dead-code')
    if (deadCodeRule) {
      lines.forEach((line, idx) => {
        if (/^\s*\/\/\s*(const|let|var|function|class|import|export|return)\s/.test(line)) {
          collector.add({
            category: 'code-quality',
            severity: 'low',
            rule: 'dead-code',
            file,
            line: idx + 1,
            message: 'Codigo comentado detectado',
            fix: 'Remova codigo comentado ou documente por que foi mantido'
          })
        }
      })
    }
  }
}

// BP-02: TypeScript
async function checkTypeScript(files, rules, collector) {
  const ruleSet = rules['typescript']?.checks || []

  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue

    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Verificar uso de 'any'
    const anyRule = ruleSet.find(r => r.id === 'explicit-any')
    if (anyRule) {
      lines.forEach((line, idx) => {
        if (/:\s*any\b|<any>|as\s+any/.test(line) && !/catch/.test(line)) {
          collector.add({
            category: 'typescript',
            severity: anyRule.severity || 'high',
            rule: 'explicit-any',
            file,
            line: idx + 1,
            message: 'Uso de tipo "any" detectado',
            fix: anyRule.fix
          })
        }
      })
    }

    // Verificar non-null assertion
    const nonNullRule = ruleSet.find(r => r.id === 'non-null-assertion')
    if (nonNullRule) {
      lines.forEach((line, idx) => {
        if (/\w+!\.\w+|\w+!\[/.test(line)) {
          collector.add({
            category: 'typescript',
            severity: nonNullRule.severity || 'medium',
            rule: 'non-null-assertion',
            file,
            line: idx + 1,
            message: 'Non-null assertion (!) detectado',
            fix: nonNullRule.fix
          })
        }
      })
    }
  }

  // Verificar tsconfig
  const strictModeRule = ruleSet.find(r => r.id === 'strict-mode-config')
  if (strictModeRule) {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
      if (!tsconfig.compilerOptions?.strict) {
        collector.add({
          category: 'typescript',
          severity: 'high',
          rule: 'strict-mode-config',
          file: 'tsconfig.json',
          message: 'Strict mode nao esta habilitado',
          fix: 'Adicione "strict": true em compilerOptions'
        })
      }
    }
  }
}

// BP-03: React Patterns
async function checkReactPatterns(files, rules, collector) {
  const ruleSet = rules['react-patterns']?.checks || []

  for (const file of files) {
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) continue

    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Verificar componente grande
    const largeComponentRule = ruleSet.find(r => r.id === 'large-component')
    if (largeComponentRule && lines.length > (largeComponentRule.threshold || 250)) {
      collector.add({
        category: 'react-patterns',
        severity: largeComponentRule.severity || 'medium',
        rule: 'large-component',
        file,
        message: `Componente com ${lines.length} linhas (max: ${largeComponentRule.threshold || 250})`,
        fix: largeComponentRule.fix
      })
    }

    // Verificar useEffect sem deps ou deps vazio
    const useEffectRule = ruleSet.find(r => r.id === 'useeffect-deps')
    if (useEffectRule) {
      const contentStr = content

      // useEffect sem array de deps
      if (/useEffect\([^,]+\)\s*[;\n]/.test(contentStr)) {
        collector.add({
          category: 'react-patterns',
          severity: 'high',
          rule: 'useeffect-deps',
          file,
          message: 'useEffect sem array de dependencias',
          fix: 'Adicione array de dependencias ao useEffect'
        })
      }
    }

    // Verificar index como key
    const keyRule = ruleSet.find(r => r.id === 'key-prop')
    if (keyRule) {
      lines.forEach((line, idx) => {
        if (/key=\{(?:index|i|idx)\}/.test(line) && /\.map\(/.test(content)) {
          collector.add({
            category: 'react-patterns',
            severity: 'high',
            rule: 'key-prop',
            file,
            line: idx + 1,
            message: 'Usando index como key em lista',
            fix: 'Use IDs unicos e estaveis como key'
          })
        }
      })
    }

    // Verificar hooks em componente client sem 'use client'
    const useClientRule = ruleSet.find(r => r.id === 'use-client-directive')
    if (useClientRule) {
      const hasHooks = /use(?:State|Effect|Context|Reducer|Callback|Memo|Ref)\(/.test(content)
      const hasUseClient = /['"]use client['"]/.test(content)
      const isAppRouter = file.includes('/app/')

      if (hasHooks && !hasUseClient && isAppRouter) {
        collector.add({
          category: 'react-patterns',
          severity: 'medium',
          rule: 'use-client-directive',
          file,
          message: 'Componente com hooks sem diretiva "use client" no App Router',
          fix: 'Adicione "use client" no topo do arquivo'
        })
      }
    }
  }
}

// BP-04: Performance
async function checkPerformance(files, rules, collector) {
  const ruleSet = rules['performance']?.checks || []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Verificar import completo do lodash
    const bundleRule = ruleSet.find(r => r.id === 'large-bundle')
    if (bundleRule) {
      lines.forEach((line, idx) => {
        if (/import\s+_\s+from\s+['"]lodash['"]/.test(line)) {
          collector.add({
            category: 'performance',
            severity: 'medium',
            rule: 'large-bundle',
            file,
            line: idx + 1,
            message: 'Import completo do lodash aumenta bundle',
            fix: 'Use import especifico: import { func } from "lodash/func"'
          })
        }
        if (/import\s+moment\s+from\s+['"]moment['"]/.test(line)) {
          collector.add({
            category: 'performance',
            severity: 'medium',
            rule: 'large-bundle',
            file,
            line: idx + 1,
            message: 'Moment.js e grande (300kb+)',
            fix: 'Considere date-fns ou dayjs'
          })
        }
      })
    }

    // Verificar <img> ao inves de next/image
    const imageRule = ruleSet.find(r => r.id === 'image-optimization')
    if (imageRule && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      lines.forEach((line, idx) => {
        if (/<img\s+[^>]*src=/.test(line)) {
          collector.add({
            category: 'performance',
            severity: 'medium',
            rule: 'image-optimization',
            file,
            line: idx + 1,
            message: 'Usando <img> ao inves de next/image',
            fix: 'Use next/image para otimizacao automatica'
          })
        }
      })
    }
  }
}

// BP-05: Acessibilidade
async function checkAccessibility(files, rules, collector) {
  const ruleSet = rules['accessibility']?.checks || []

  for (const file of files) {
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) continue

    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Verificar alt em imagens
    const altRule = ruleSet.find(r => r.id === 'missing-alt')
    if (altRule) {
      lines.forEach((line, idx) => {
        if (/<(?:img|Image)[^>]*(?!alt=)[^>]*\/>/.test(line) && !line.includes('alt=')) {
          collector.add({
            category: 'accessibility',
            severity: 'critical',
            rule: 'missing-alt',
            file,
            line: idx + 1,
            message: 'Imagem sem atributo alt',
            fix: altRule.fix
          })
        }
      })
    }

    // Verificar botao sem texto
    const buttonRule = ruleSet.find(r => r.id === 'missing-button-text')
    if (buttonRule) {
      lines.forEach((line, idx) => {
        if (/<(?:button|Button)[^>]*>\s*<(?:svg|Icon|img)/.test(line)) {
          collector.add({
            category: 'accessibility',
            severity: 'critical',
            rule: 'missing-button-text',
            file,
            line: idx + 1,
            message: 'Botao apenas com icone sem texto acessivel',
            fix: buttonRule.fix
          })
        }
      })
    }

    // Verificar onClick em div
    const semanticRule = ruleSet.find(r => r.id === 'semantic-html')
    if (semanticRule) {
      lines.forEach((line, idx) => {
        if (/<div[^>]*onClick/.test(line)) {
          collector.add({
            category: 'accessibility',
            severity: 'medium',
            rule: 'semantic-html',
            file,
            line: idx + 1,
            message: '<div> com onClick - use <button> para elementos interativos',
            fix: 'Use elementos semanticos apropriados'
          })
        }
      })
    }

    // Verificar outline:none
    const focusRule = ruleSet.find(r => r.id === 'focus-management')
    if (focusRule) {
      lines.forEach((line, idx) => {
        if (/outline:\s*(?:none|0)/.test(line)) {
          collector.add({
            category: 'accessibility',
            severity: 'high',
            rule: 'focus-management',
            file,
            line: idx + 1,
            message: 'outline:none remove indicador de foco',
            fix: 'Nunca remova outline sem alternativa visivel'
          })
        }
      })
    }
  }
}

// BP-06: Testes
async function checkTesting(files, rules, collector) {
  const ruleSet = rules['testing']?.checks || []

  // Verificar arquivos sem testes
  const missingTestsRule = ruleSet.find(r => r.id === 'missing-tests')
  if (missingTestsRule) {
    for (const file of files) {
      // Ignorar arquivos de teste
      if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file)) continue

      // Verificar se e um componente ou hook importante
      if (/components\/|hooks\/|lib\/|utils\//.test(file)) {
        const testFile1 = file.replace(/\.(ts|tsx)$/, '.test.$1')
        const testFile2 = file.replace(/\.(ts|tsx)$/, '.spec.$1')
        const dir = path.dirname(file)
        const testDir = path.join(dir, '__tests__', path.basename(file).replace(/\.(ts|tsx)$/, '.test.$1'))

        const hasTest = [testFile1, testFile2, testDir].some(f => fs.existsSync(f))

        if (!hasTest) {
          collector.add({
            category: 'testing',
            severity: 'low',
            rule: 'missing-tests',
            file,
            message: 'Arquivo sem teste correspondente',
            fix: 'Crie testes para logica importante'
          })
        }
      }
    }
  }
}

// BP-07: Error Handling
async function checkErrorHandling(files, rules, collector) {
  const ruleSet = rules['error-handling']?.checks || []

  // Verificar error.tsx
  const errorBoundaryRule = ruleSet.find(r => r.id === 'error-boundary')
  if (errorBoundaryRule) {
    const hasErrorTsx = fs.existsSync(path.join(process.cwd(), 'src/app/error.tsx')) ||
                        fs.existsSync(path.join(process.cwd(), 'app/error.tsx'))

    if (!hasErrorTsx) {
      collector.add({
        category: 'error-handling',
        severity: 'high',
        rule: 'error-boundary',
        file: 'app/',
        message: 'Arquivo error.tsx nao encontrado',
        fix: 'Crie app/error.tsx para tratamento de erros'
      })
    }
  }

  // Verificar not-found.tsx
  const notFoundRule = ruleSet.find(r => r.id === 'not-found')
  if (notFoundRule) {
    const hasNotFound = fs.existsSync(path.join(process.cwd(), 'src/app/not-found.tsx')) ||
                        fs.existsSync(path.join(process.cwd(), 'app/not-found.tsx'))

    if (!hasNotFound) {
      collector.add({
        category: 'error-handling',
        severity: 'medium',
        rule: 'not-found',
        file: 'app/',
        message: 'Arquivo not-found.tsx nao encontrado',
        fix: 'Crie app/not-found.tsx para pagina 404 customizada'
      })
    }
  }

  // Verificar API routes sem try-catch
  const tryCatchRule = ruleSet.find(r => r.id === 'try-catch-api')
  if (tryCatchRule) {
    for (const file of files) {
      if (!file.includes('/api/') || !file.endsWith('route.ts')) continue

      const content = fs.readFileSync(file, 'utf-8')

      if (/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/.test(content)) {
        if (!content.includes('try {') && !content.includes('try{')) {
          collector.add({
            category: 'error-handling',
            severity: 'high',
            rule: 'try-catch-api',
            file,
            message: 'API route sem try-catch',
            fix: 'Envolva o corpo da funcao em try-catch'
          })
        }
      }
    }
  }
}

// BP-08: Arquitetura
async function checkArchitecture(files, rules, collector) {
  const ruleSet = rules['architecture']?.checks || []

  // Verificar .env.example
  const envRule = ruleSet.find(r => r.id === 'env-management')
  if (envRule) {
    if (!fs.existsSync(path.join(process.cwd(), '.env.example'))) {
      collector.add({
        category: 'architecture',
        severity: 'medium',
        rule: 'env-management',
        file: '.env.example',
        message: 'Arquivo .env.example nao encontrado',
        fix: 'Crie .env.example documentando variaveis necessarias'
      })
    }
  }

  // Verificar imports desorganizados (simplificado)
  const importRule = ruleSet.find(r => r.id === 'import-organization')
  if (importRule) {
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      // Verificar imports relativos longos
      lines.forEach((line, idx) => {
        if (/from\s+['"]\.\.\/\.\.\/\.\.\//.test(line)) {
          collector.add({
            category: 'architecture',
            severity: 'info',
            rule: 'import-organization',
            file,
            line: idx + 1,
            message: 'Import relativo profundo - considere path alias',
            fix: 'Use @/ para imports absolutos'
          })
        }
      })
    }
  }
}

// Executar todas as verificacoes
async function runAnalysis(options = {}) {
  const config = loadConfig()
  const rules = loadRules()
  const collector = new IssueCollector()

  console.log(`\n${c.cyan}${c.bold}Zory-Practices${c.reset} - Analise de Boas Praticas\n`)
  console.log(`${c.dim}Carregando arquivos...${c.reset}`)

  const files = await findFiles(config)
  collector.stats.files = files.length

  let totalLines = 0
  for (const file of files) {
    totalLines += fs.readFileSync(file, 'utf-8').split('\n').length
  }
  collector.stats.lines = totalLines

  console.log(`${c.green}✓${c.reset} ${files.length} arquivos encontrados (${totalLines.toLocaleString()} linhas)\n`)

  const categories = options.categories || ['all']
  const checkAll = categories.includes('all')

  // Executar verificacoes
  const checks = [
    { name: 'Qualidade de Codigo', fn: checkCodeQuality, cat: 'code-quality' },
    { name: 'TypeScript', fn: checkTypeScript, cat: 'typescript' },
    { name: 'Padroes React', fn: checkReactPatterns, cat: 'react-patterns' },
    { name: 'Performance', fn: checkPerformance, cat: 'performance' },
    { name: 'Acessibilidade', fn: checkAccessibility, cat: 'accessibility' },
    { name: 'Testes', fn: checkTesting, cat: 'testing' },
    { name: 'Tratamento de Erros', fn: checkErrorHandling, cat: 'error-handling' },
    { name: 'Arquitetura', fn: checkArchitecture, cat: 'architecture' },
  ]

  for (const check of checks) {
    if (checkAll || categories.includes(check.cat)) {
      process.stdout.write(`${c.dim}Verificando ${check.name}...${c.reset}`)
      await check.fn(files, rules, collector)
      console.log(` ${c.green}✓${c.reset}`)
    }
  }

  return { config, collector }
}

// Exibir resultado
function displayResults(config, collector) {
  const score = collector.calculateScore(config)
  const grade = collector.getGrade(score, config)

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`\n${c.bold}Score: ${score}/100 ${grade.emoji} ${grade.label}${c.reset}\n`)

  // Resumo por severidade
  console.log(`${c.bold}Por Severidade:${c.reset}`)
  const severityConfig = config?.severity || {}
  const severityLabels = {
    critical: { icon: '🔴', label: 'Critico' },
    high: { icon: '🟠', label: 'Alto' },
    medium: { icon: '🟡', label: 'Medio' },
    low: { icon: '🟢', label: 'Baixo' },
    info: { icon: '🔵', label: 'Info' }
  }

  for (const [sev, count] of Object.entries(collector.stats.bySeverity)) {
    if (count > 0) {
      const label = severityLabels[sev] || { icon: '•', label: sev }
      console.log(`  ${label.icon} ${label.label}: ${count}`)
    }
  }

  // Resumo por categoria
  if (Object.keys(collector.stats.byCategory).length > 0) {
    console.log(`\n${c.bold}Por Categoria:${c.reset}`)
    const categoryLabels = config?.categories || {}
    for (const [cat, count] of Object.entries(collector.stats.byCategory)) {
      const label = categoryLabels[cat]?.name || cat
      console.log(`  • ${label}: ${count}`)
    }
  }

  // Top issues
  if (collector.issues.length > 0) {
    console.log(`\n${c.bold}Issues Encontradas (${collector.issues.length}):${c.reset}\n`)

    // Agrupar por severidade para mostrar criticos primeiro
    const byPriority = collector.issues.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
      return order[a.severity] - order[b.severity]
    })

    const maxShow = 15
    const toShow = byPriority.slice(0, maxShow)

    for (const issue of toShow) {
      const icon = severityLabels[issue.severity]?.icon || '•'
      const loc = issue.line ? `${issue.file}:${issue.line}` : issue.file
      console.log(`${icon} ${c.dim}[${issue.rule}]${c.reset} ${issue.message}`)
      console.log(`  ${c.dim}${loc}${c.reset}`)
      if (issue.fix) {
        console.log(`  ${c.cyan}Fix: ${issue.fix}${c.reset}`)
      }
      console.log()
    }

    if (collector.issues.length > maxShow) {
      console.log(`${c.dim}... e mais ${collector.issues.length - maxShow} issues${c.reset}\n`)
    }
  } else {
    console.log(`\n${c.green}✓ Nenhuma issue encontrada! Otimo trabalho!${c.reset}\n`)
  }
}

// Gerar relatorio
async function generateReport(config, collector, format = 'md') {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true })
  }

  const score = collector.calculateScore(config)
  const grade = collector.getGrade(score, config)
  const timestamp = new Date().toISOString()

  if (format === 'json') {
    const report = {
      timestamp,
      score,
      grade: grade.label,
      stats: collector.stats,
      issues: collector.issues
    }
    const reportPath = path.join(REPORTS_DIR, 'practices-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n${c.green}✓${c.reset} Relatorio salvo em: ${reportPath}`)
    return reportPath
  }

  // Markdown
  let md = `# Zory-Practices Report\n\n`
  md += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n\n`
  md += `## Score: ${score}/100 ${grade.emoji} ${grade.label}\n\n`

  md += `### Estatisticas\n\n`
  md += `- Arquivos analisados: ${collector.stats.files}\n`
  md += `- Linhas de codigo: ${collector.stats.lines.toLocaleString()}\n`
  md += `- Issues encontradas: ${collector.issues.length}\n\n`

  md += `### Por Severidade\n\n`
  md += `| Severidade | Quantidade |\n|------------|------------|\n`
  for (const [sev, count] of Object.entries(collector.stats.bySeverity)) {
    if (count > 0) {
      md += `| ${sev} | ${count} |\n`
    }
  }

  md += `\n### Por Categoria\n\n`
  md += `| Categoria | Issues |\n|-----------|--------|\n`
  for (const [cat, count] of Object.entries(collector.stats.byCategory)) {
    md += `| ${cat} | ${count} |\n`
  }

  if (collector.issues.length > 0) {
    md += `\n### Detalhes das Issues\n\n`

    // Agrupar por categoria
    const byCategory = {}
    for (const issue of collector.issues) {
      if (!byCategory[issue.category]) {
        byCategory[issue.category] = []
      }
      byCategory[issue.category].push(issue)
    }

    for (const [cat, issues] of Object.entries(byCategory)) {
      md += `#### ${cat}\n\n`
      for (const issue of issues) {
        const loc = issue.line ? `${issue.file}:${issue.line}` : issue.file
        md += `- **[${issue.severity}]** ${issue.message}\n`
        md += `  - Arquivo: \`${loc}\`\n`
        if (issue.fix) {
          md += `  - Fix: ${issue.fix}\n`
        }
      }
      md += `\n`
    }
  }

  md += `\n---\n*Gerado por Zory-Practices - Zoryon Genesis*\n`

  const reportPath = path.join(REPORTS_DIR, 'practices-report.md')
  fs.writeFileSync(reportPath, md)
  console.log(`\n${c.green}✓${c.reset} Relatorio salvo em: ${reportPath}`)
  return reportPath
}

// Menu interativo
async function runInteractive() {
  const rl = getReadlineInterface()

  const ask = (question) => new Promise(resolve => rl.question(question, resolve))

  console.log(`\n${c.cyan}${c.bold}Zory-Practices${c.reset} - Agente de Boas Praticas\n`)
  console.log(`${c.dim}Analisa seu codigo React/TypeScript seguindo melhores praticas${c.reset}\n`)

  console.log(`${c.bold}Selecione o modo:${c.reset}`)
  console.log(`  ${c.cyan}1.${c.reset} Analise Completa (todas as categorias)`)
  console.log(`  ${c.cyan}2.${c.reset} Analise Rapida (code-quality, typescript, react)`)
  console.log(`  ${c.cyan}3.${c.reset} Apenas TypeScript`)
  console.log(`  ${c.cyan}4.${c.reset} Apenas React Patterns`)
  console.log(`  ${c.cyan}5.${c.reset} Apenas Acessibilidade`)
  console.log(`  ${c.cyan}6.${c.reset} Gerar Relatorio Completo`)
  console.log(`  ${c.cyan}0.${c.reset} Sair\n`)

  const choice = await ask(`${c.cyan}>${c.reset} `)

  let categories = ['all']
  let generateReportAfter = false

  switch (choice.trim()) {
    case '1':
      categories = ['all']
      break
    case '2':
      categories = ['code-quality', 'typescript', 'react-patterns']
      break
    case '3':
      categories = ['typescript']
      break
    case '4':
      categories = ['react-patterns', 'performance']
      break
    case '5':
      categories = ['accessibility']
      break
    case '6':
      categories = ['all']
      generateReportAfter = true
      break
    case '0':
      closeReadline()
      process.exit(0)
    default:
      console.log(`${c.red}Opcao invalida${c.reset}`)
      closeReadline()
      return runInteractive()
  }

  closeReadline()

  const { config, collector } = await runAnalysis({ categories })
  displayResults(config, collector)

  if (generateReportAfter) {
    const format = await new Promise(resolve => {
      const rl2 = getReadlineInterface()
      rl2.question(`\n${c.cyan}Formato do relatorio (md/json):${c.reset} `, answer => {
        closeReadline()
        resolve(answer.trim().toLowerCase() === 'json' ? 'json' : 'md')
      })
    })
    await generateReport(config, collector, format)
  }
}

// CLI principal
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const options = {
    json: args.includes('--json'),
    verbose: args.includes('--verbose'),
    help: args.includes('--help') || args.includes('-h')
  }

  if (options.help) {
    console.log(`
${c.cyan}${c.bold}Zory-Practices${c.reset} - Agente de Analise de Boas Praticas

${c.bold}Uso:${c.reset}
  node .zoryon/scripts/zory-practices.mjs [comando] [opcoes]

${c.bold}Comandos:${c.reset}
  ${c.cyan}(sem comando)${c.reset}  Modo interativo
  ${c.cyan}analyze${c.reset}       Analise completa
  ${c.cyan}quick${c.reset}         Analise rapida (code-quality, typescript, react)
  ${c.cyan}typescript${c.reset}    Apenas verificacoes TypeScript
  ${c.cyan}react${c.reset}         Apenas padroes React e performance
  ${c.cyan}a11y${c.reset}          Apenas acessibilidade
  ${c.cyan}report${c.reset}        Gerar relatorio completo

${c.bold}Opcoes:${c.reset}
  ${c.cyan}--json${c.reset}        Saida em formato JSON
  ${c.cyan}--verbose${c.reset}     Saida detalhada
  ${c.cyan}--help, -h${c.reset}    Mostra esta ajuda

${c.bold}Exemplos:${c.reset}
  node .zoryon/scripts/zory-practices.mjs
  node .zoryon/scripts/zory-practices.mjs analyze
  node .zoryon/scripts/zory-practices.mjs quick
  node .zoryon/scripts/zory-practices.mjs report --json
`)
    return
  }

  switch (command) {
    case 'analyze': {
      const { config, collector } = await runAnalysis({ categories: ['all'] })
      displayResults(config, collector)
      break
    }
    case 'quick': {
      const { config, collector } = await runAnalysis({
        categories: ['code-quality', 'typescript', 'react-patterns']
      })
      displayResults(config, collector)
      break
    }
    case 'typescript': {
      const { config, collector } = await runAnalysis({ categories: ['typescript'] })
      displayResults(config, collector)
      break
    }
    case 'react': {
      const { config, collector } = await runAnalysis({
        categories: ['react-patterns', 'performance']
      })
      displayResults(config, collector)
      break
    }
    case 'a11y': {
      const { config, collector } = await runAnalysis({ categories: ['accessibility'] })
      displayResults(config, collector)
      break
    }
    case 'report': {
      const { config, collector } = await runAnalysis({ categories: ['all'] })
      displayResults(config, collector)
      await generateReport(config, collector, options.json ? 'json' : 'md')
      break
    }
    default:
      await runInteractive()
  }
}

main().catch(console.error)
