#!/usr/bin/env node
/**
 * Zory-Test - Gerador de Testes
 * Versão: 0.0.10
 *
 * Gera testes automatizados para Next.js (unit, integration, e2e)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  colors,
  log,
  logSuccess,
  loadJSON,
  writeFile,
  question,
  questionChoice,
  closeReadline,
} from './utils/common.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ZORYON_DIR = path.join(__dirname, '..')
const TEST_DIR = path.join(ZORYON_DIR, 'test')

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {
    help: false,
    type: null,
    target: null,
    pattern: null,
    output: null,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      parsed.help = true
    } else if (arg === '--type') {
      parsed.type = args[++i]
    } else if (arg === '--target') {
      parsed.target = args[++i]
    } else if (arg === '--pattern') {
      parsed.pattern = args[++i]
    } else if (arg === '--output' || arg === '-o') {
      parsed.output = args[++i]
    }
  }

  return parsed
}

function showHelp() {
  console.log(`
${colors.bright}Zory-Test - Gerador de Testes${colors.reset}

${colors.cyan}Uso:${colors.reset}
  node .zoryon/scripts/zory-test.mjs [opções]

${colors.cyan}Opções:${colors.reset}
  --help, -h              Mostra esta ajuda
  --type <tipo>           Tipo de teste (unit, integration, e2e)
  --target <nome>         Nome do alvo (componente, página, etc)
  --pattern <padrão>      Padrão de teste (component, hook, api-route, etc)
  --output, -o <caminho>  Caminho de saída customizado

${colors.cyan}Exemplos:${colors.reset}

${colors.bright}Testes Unitários:${colors.reset}
  ${colors.green}# Componente${colors.reset}
  node .zoryon/scripts/zory-test.mjs --type=unit --pattern=component --target=Button

  ${colors.green}# Hook${colors.reset}
  node .zoryon/scripts/zory-test.mjs --type=unit --pattern=hook --target=useAuth

  ${colors.green}# Função utilitária${colors.reset}
  node .zoryon/scripts/zory-test.mjs --type=unit --pattern=utility --target=formatDate

${colors.bright}Testes de Integração:${colors.reset}
  ${colors.green}# Página${colors.reset}
  node .zoryon/scripts/zory-test.mjs --type=integration --pattern=page --target=login

  ${colors.green}# API Route${colors.reset}
  node .zoryon/scripts/zory-test.mjs --type=integration --pattern=api-route --target=users

${colors.bright}Testes E2E:${colors.reset}
  ${colors.green}# Fluxo de usuário${colors.reset}
  node .zoryon/scripts/zory-test.mjs --type=e2e --pattern=user-flow --target=checkout

${colors.cyan}Modo Interativo:${colors.reset}
  node .zoryon/scripts/zory-test.mjs
  ${colors.reset}(sem opções, o agente vai perguntar tudo)

${colors.magenta}Zoryon Genesis - O começo de tudo${colors.reset}
`)
}

function generateComponentTest(target, outputPath) {
  const template = loadJSON(path.join(TEST_DIR, 'templates', 'component.json'))
  if (!template) {
    log('Template não encontrado', 'red')
    return
  }

  const componentName = target.charAt(0).toUpperCase() + target.slice(1)
  const componentPath = target

  let content = template.template
    .replace(/\{\{COMPONENT_NAME\}\}/g, componentName)
    .replace(/\{\{COMPONENT_PATH\}\}/g, componentPath)
    .replace(/\{\{ROLE\}\}/g, 'button') // default role

  const fileName = `${componentName}.test.tsx`
  const filePath = outputPath || path.join(process.cwd(), 'tests', 'unit', fileName)

  writeFile(filePath, content)
  logSuccess(`Teste criado: ${filePath}`)

  return filePath
}

function generateHookTest(target, outputPath) {
  const template = loadJSON(path.join(TEST_DIR, 'templates', 'hook.json'))
  if (!template) {
    log('Template não encontrado', 'red')
    return
  }

  const hookName = target.startsWith('use') ? target : `use${target.charAt(0).toUpperCase()}${target.slice(1)}`
  const hookPath = hookName

  let content = template.template
    .replace(/\{\{HOOK_NAME\}\}/g, hookName)
    .replace(/\{\{HOOK_PATH\}\}/g, hookPath)

  const fileName = `${hookName}.test.tsx`
  const filePath = outputPath || path.join(process.cwd(), 'tests', 'unit', fileName)

  writeFile(filePath, content)
  logSuccess(`Teste criado: ${filePath}`)

  return filePath
}

function generateUtilityTest(target, outputPath) {
  const template = loadJSON(path.join(TEST_DIR, 'templates', 'utility.json'))
  if (!template) {
    log('Template não encontrado', 'red')
    return
  }

  const functionName = target
  const functionPath = target

  let content = template.template
    .replace(/\{\{FUNCTION_NAME\}\}/g, functionName)
    .replace(/\{\{FUNCTION_PATH\}\}/g, functionPath)

  const fileName = `${functionName}.test.ts`
  const filePath = outputPath || path.join(process.cwd(), 'tests', 'unit', fileName)

  writeFile(filePath, content)
  logSuccess(`Teste criado: ${filePath}`)

  return filePath
}

function generatePageTest(target, outputPath) {
  const template = loadJSON(path.join(TEST_DIR, 'templates', 'page.json'))
  if (!template) {
    log('Template não encontrado', 'red')
    return
  }

  const pageName = target.charAt(0).toUpperCase() + target.slice(1)
  const pagePath = target

  let content = template.template
    .replace(/\{\{PAGE_NAME\}\}/g, pageName)
    .replace(/\{\{PAGE_PATH\}\}/g, pagePath)

  const fileName = `${pageName}Page.integration.test.tsx`
  const filePath = outputPath || path.join(process.cwd(), 'tests', 'integration', fileName)

  writeFile(filePath, content)
  logSuccess(`Teste criado: ${filePath}`)

  return filePath
}

function generateAPITest(target, outputPath) {
  const template = loadJSON(path.join(TEST_DIR, 'templates', 'api-route.json'))
  if (!template) {
    log('Template não encontrado', 'red')
    return
  }

  const apiPath = target
  const model = target.charAt(0).toUpperCase() + target.slice(1)

  let content = template.template
    .replace(/\{\{API_PATH\}\}/g, apiPath)
    .replace(/\{\{MODEL\}\}/g, model)

  const fileName = `api-${target}.integration.test.ts`
  const filePath = outputPath || path.join(process.cwd(), 'tests', 'integration', fileName)

  writeFile(filePath, content)
  logSuccess(`Teste criado: ${filePath}`)

  return filePath
}

function generateE2ETest(target, outputPath) {
  const template = loadJSON(path.join(TEST_DIR, 'templates', 'e2e.json'))
  if (!template) {
    log('Template não encontrado', 'red')
    return
  }

  const flowName = target

  let content = template.template
    .replace(/\{\{FLOW_NAME\}\}/g, flowName)
    .replace(/\{\{BUTTON_TEXT\}\}/g, 'Get Started')
    .replace(/\{\{URL_PATTERN\}\}/g, flowName)
    .replace(/\{\{INPUT_NAME\}\}/g, 'email')
    .replace(/\{\{TEST_VALUE\}\}/g, 'test@example.com')
    .replace(/\{\{SUCCESS_MESSAGE\}\}/g, 'Success')
    .replace(/\{\{ERROR_MESSAGE\}\}/g, 'Required')

  const fileName = `${target}.spec.ts`
  const filePath = outputPath || path.join(process.cwd(), 'tests', 'e2e', fileName)

  writeFile(filePath, content)
  logSuccess(`Teste criado: ${filePath}`)

  return filePath
}

async function interactiveMode() {
  console.log(`\n${colors.bright}${colors.cyan}Zory-Test - Gerador de Testes${colors.reset}\n`)

  const type = await questionChoice(
    'Tipo de teste:',
    ['unit (componentes, hooks, funções)', 'integration (páginas, API routes)', 'e2e (fluxos de usuário)']
  )

  const testType = type.split(' ')[0]

  let pattern
  if (testType === 'unit') {
    pattern = await questionChoice(
      'Padrão de teste unitário:',
      ['component', 'hook', 'utility']
    )
  } else if (testType === 'integration') {
    pattern = await questionChoice(
      'Padrão de teste de integração:',
      ['page', 'api-route']
    )
  } else {
    pattern = 'user-flow'
  }

  const target = await question(`Nome do ${pattern === 'component' ? 'componente' : pattern === 'hook' ? 'hook' : pattern === 'utility' ? 'função' : pattern === 'page' ? 'página' : pattern === 'api-route' ? 'endpoint' : 'fluxo'}`)

  if (!target) {
    log('Nome é obrigatório', 'red')
    closeReadline()
    process.exit(1)
  }

  console.log(`\n${colors.bright}Gerando teste...${colors.reset}\n`)

  generateTest(testType, pattern, target, null)

  closeReadline()
}

function generateTest(type, pattern, target, output) {
  if (type === 'unit') {
    if (pattern === 'component') {
      generateComponentTest(target, output)
    } else if (pattern === 'hook') {
      generateHookTest(target, output)
    } else if (pattern === 'utility') {
      generateUtilityTest(target, output)
    }
  } else if (type === 'integration') {
    if (pattern === 'page') {
      generatePageTest(target, output)
    } else if (pattern === 'api-route') {
      generateAPITest(target, output)
    }
  } else if (type === 'e2e') {
    generateE2ETest(target, output)
  }

  console.log(`\n${colors.bright}${colors.green}✓ Teste gerado com sucesso!${colors.reset}\n`)

  log('Próximos passos:', 'cyan')
  console.log(`  1. Revise o teste gerado`)
  console.log(`  2. Customize conforme necessário`)
  console.log(`  3. Rode o teste: ${colors.green}pnpm test${colors.reset}`)
  console.log('')
}

async function main() {
  const args = parseArgs()

  if (args.help) {
    showHelp()
    process.exit(0)
  }

  // Modo com argumentos
  if (args.type && args.target) {
    const pattern = args.pattern || (args.type === 'unit' ? 'component' : args.type === 'integration' ? 'page' : 'user-flow')
    generateTest(args.type, pattern, args.target, args.output)
    process.exit(0)
  }

  // Modo interativo
  await interactiveMode()
}

main().catch((error) => {
  console.error(`${colors.red}Erro:${colors.reset} ${error.message}`)
  closeReadline()
  process.exit(1)
})
