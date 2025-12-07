#!/usr/bin/env node
/**
 * Common Utilities - Módulo Compartilhado
 * Versão: 1.0.0
 *
 * Funções compartilhadas entre todos os agentes Zoryon.
 * Elimina duplicação de código e centraliza utilidades.
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'

// =============================================================================
// CORES
// =============================================================================

export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
}

// =============================================================================
// LOGGING
// =============================================================================

/**
 * Log genérico com cor
 */
export function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * Log de step/etapa
 */
export function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`)
}

/**
 * Log de sucesso (✓)
 */
export function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`)
}

/**
 * Log de erro (✗)
 */
export function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`)
}

/**
 * Log de warning (⚠)
 */
export function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`)
}

// =============================================================================
// FILE SYSTEM
// =============================================================================

/**
 * Carrega e parseia arquivo JSON
 * @param {string} filePath - Caminho do arquivo
 * @returns {object|null} - Objeto parseado ou null se erro
 */
export function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return null
  }
}

/**
 * Escreve arquivo (cria diretórios se necessário)
 * @param {string} filePath - Caminho do arquivo
 * @param {string} content - Conteúdo a escrever
 */
export function writeFile(filePath, content) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, content, 'utf-8')
}

/**
 * Verifica se arquivo existe
 * @param {string} filePath - Caminho do arquivo
 * @returns {boolean}
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath)
}

/**
 * Verifica se diretório existe
 * @param {string} dirPath - Caminho do diretório
 * @returns {boolean}
 */
export function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
}

/**
 * Verifica se tem permissão de escrita
 * @param {string} dirPath - Caminho do diretório
 * @returns {boolean}
 */
export function hasWritePermission(dirPath) {
  try {
    fs.accessSync(dirPath, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

// =============================================================================
// READLINE INTERFACE
// =============================================================================

let rlInstance = null

/**
 * Cria ou retorna readline interface singleton
 */
export function getReadlineInterface() {
  if (!rlInstance) {
    rlInstance = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
  }
  return rlInstance
}

/**
 * Fecha readline interface
 */
export function closeReadline() {
  if (rlInstance) {
    rlInstance.close()
    rlInstance = null
  }
}

// =============================================================================
// PROMPTS
// =============================================================================

/**
 * Pergunta simples
 * @param {string} prompt - Texto do prompt
 * @returns {Promise<string>}
 */
export function question(prompt) {
  const rl = getReadlineInterface()
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${prompt}${colors.reset} `, resolve)
  })
}

/**
 * Pergunta com opções múltiplas
 * @param {string} prompt - Texto do prompt
 * @param {Array} options - Array de opções {label, description?}
 * @returns {Promise<object>}
 */
export function questionWithOptions(prompt, options) {
  const rl = getReadlineInterface()
  return new Promise((resolve) => {
    console.log(`\n${colors.bright}${prompt}${colors.reset}`)
    options.forEach((opt, i) => {
      console.log(`  ${colors.cyan}${i + 1}.${colors.reset} ${opt.label}`)
      if (opt.description) {
        console.log(`     ${colors.magenta}${opt.description}${colors.reset}`)
      }
    })
    rl.question(
      `\n${colors.yellow}Escolha (1-${options.length}): ${colors.reset}`,
      (answer) => {
        const index = parseInt(answer) - 1
        if (index >= 0 && index < options.length) {
          resolve(options[index])
        } else {
          resolve(options[0])
        }
      }
    )
  })
}

/**
 * Pergunta Sim/Não
 * @param {string} prompt - Texto do prompt
 * @param {boolean} defaultYes - Default é sim?
 * @returns {Promise<boolean>}
 */
export function questionYesNo(prompt, defaultYes = true) {
  const rl = getReadlineInterface()
  return new Promise((resolve) => {
    const hint = defaultYes ? '(S/n)' : '(s/N)'
    rl.question(
      `${colors.yellow}${prompt} ${hint}: ${colors.reset}`,
      (answer) => {
        if (!answer) {
          resolve(defaultYes)
        } else {
          resolve(
            answer.toLowerCase() === 's' || answer.toLowerCase() === 'y'
          )
        }
      }
    )
  })
}

/**
 * Pergunta com escolha de lista (arrow keys)
 * @param {string} prompt - Texto do prompt
 * @param {Array<string>} choices - Lista de escolhas
 * @param {number} defaultChoice - Índice da escolha padrão
 * @returns {Promise<string>}
 */
export function questionChoice(prompt, choices, defaultChoice = 0) {
  const rl = getReadlineInterface()
  return new Promise((resolve) => {
    console.log(`${colors.yellow}${prompt}${colors.reset}`)
    choices.forEach((choice, index) => {
      const marker = index === defaultChoice ? '→' : ' '
      console.log(`  ${marker} ${index + 1}. ${choice}`)
    })
    rl.question(
      `${colors.yellow}Escolha (1-${choices.length}): ${colors.reset}`,
      (answer) => {
        const index = parseInt(answer) - 1
        if (index >= 0 && index < choices.length) {
          resolve(choices[index])
        } else {
          resolve(choices[defaultChoice])
        }
      }
    )
  })
}

// =============================================================================
// VALIDAÇÃO
// =============================================================================

/**
 * Valida nome de arquivo/componente (kebab-case ou PascalCase)
 * @param {string} name - Nome a validar
 * @returns {boolean}
 */
export function validateName(name) {
  if (!name || name.trim() === '') return false
  // Aceita kebab-case, PascalCase, camelCase
  return /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(name)
}

/**
 * Valida se é nome de componente React (PascalCase)
 * @param {string} name - Nome a validar
 * @returns {boolean}
 */
export function validateComponentName(name) {
  if (!name || name.trim() === '') return false
  // Deve começar com maiúscula (PascalCase)
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

/**
 * Valida path/slug (kebab-case)
 * @param {string} path - Path a validar
 * @returns {boolean}
 */
export function validatePath(path) {
  if (!path || path.trim() === '') return false
  // Aceita kebab-case e /
  return /^[a-z0-9-/]+$/.test(path)
}

// =============================================================================
// PARSING DE ARGUMENTOS
// =============================================================================

/**
 * Parse argumentos --key=value
 * @param {Array<string>} args - process.argv.slice(2)
 * @returns {object} - {flags: Set, options: Map}
 */
export function parseArgs(args) {
  const flags = new Set()
  const options = new Map()

  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.substring(2).split('=')
        options.set(key, value)
      } else {
        flags.add(arg.substring(2))
      }
    } else if (arg.startsWith('-')) {
      flags.add(arg.substring(1))
    }
  })

  return { flags, options }
}

/**
 * Verifica se flag está presente
 */
export function hasFlag(args, ...flagNames) {
  return flagNames.some((flag) => args.includes(`--${flag}`) || args.includes(`-${flag}`))
}

/**
 * Obtém valor de opção --key=value
 */
export function getOption(args, optionName) {
  const option = args.find((arg) => arg.startsWith(`--${optionName}=`))
  return option ? option.split('=')[1] : null
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Capitaliza primeira letra
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Converte kebab-case para PascalCase
 */
export function kebabToPascal(str) {
  return str
    .split('-')
    .map((word) => capitalize(word))
    .join('')
}

/**
 * Converte PascalCase para kebab-case
 */
export function pascalToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

/**
 * Aguarda X milissegundos
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Formata path relativo
 */
export function formatRelativePath(absolutePath, basePath = process.cwd()) {
  return path.relative(basePath, absolutePath)
}
