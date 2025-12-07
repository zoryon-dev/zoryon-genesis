#!/usr/bin/env node
// Zory-Pages - Agente Especializado para Landing Pages
// Autor: Jonas Silva | Zoryon (https://zoryon.org/)
// Versão: 1.0.0

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  colors,
  getReadlineInterface,
  closeReadline,
} from './utils/common.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAGES_DIR = path.resolve(__dirname, '../pages')
const OUTPUT_DIR = path.resolve(PAGES_DIR, 'output')

// Alias para cores em português (compatibilidade)
const cores = {
  reset: colors.reset,
  bold: colors.bright,
  dim: '\x1b[2m',
  verde: colors.green,
  amarelo: colors.yellow,
  azul: colors.blue,
  vermelho: colors.red,
  cinza: '\x1b[90m',
  ciano: colors.cyan,
  magenta: colors.magenta,
}

// ========================================
// FUNÇÕES DE UTILIDADE
// ========================================

async function carregarJSON(arquivo) {
  try {
    const conteudo = await fs.readFile(path.join(PAGES_DIR, arquivo), 'utf-8')
    return JSON.parse(conteudo)
  } catch (error) {
    console.error(`${cores.vermelho}Erro ao carregar ${arquivo}:${cores.reset}`, error.message)
    return null
  }
}

async function perguntar(rl, pergunta) {
  return new Promise((resolve) => {
    rl.question(pergunta, (resposta) => {
      resolve(resposta.trim())
    })
  })
}

function exibirOpcoes(opcoes, selecionada = null) {
  opcoes.forEach((op, i) => {
    const marcador = selecionada === op.value ? `${cores.verde}●${cores.reset}` : `${cores.cinza}○${cores.reset}`
    console.log(`  ${marcador} ${cores.bold}${i + 1}${cores.reset} - ${op.label}`)
  })
}

// ========================================
// BANNER E AJUDA
// ========================================

function exibirBanner() {
  console.log(`
${cores.magenta}${cores.bold}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ███████╗ ██████╗ ██████╗ ██╗   ██╗    ██████╗  █████╗  ██████╗ ███████╗███████╗  ║
║   ╚══███╔╝██╔═══██╗██╔══██╗╚██╗ ██╔╝    ██╔══██╗██╔══██╗██╔════╝ ██╔════╝██╔════╝  ║
║     ███╔╝ ██║   ██║██████╔╝ ╚████╔╝     ██████╔╝███████║██║  ███╗█████╗  ███████╗  ║
║    ███╔╝  ██║   ██║██╔══██╗  ╚██╔╝      ██╔═══╝ ██╔══██║██║   ██║██╔══╝  ╚════██║  ║
║   ███████╗╚██████╔╝██║  ██║   ██║       ██║     ██║  ██║╚██████╔╝███████╗███████║  ║
║   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝  ║
║                                                               ║
║          Agente Especializado para Landing Pages              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${cores.reset}
`)
}

function exibirAjuda() {
  console.log(`
${cores.azul}${cores.bold}Zory-Pages - Gerador de Landing Pages${cores.reset}

${cores.verde}Comandos:${cores.reset}

  ${cores.amarelo}pnpm zory pages${cores.reset}              Inicia o briefing interativo
  ${cores.amarelo}pnpm zory pages --quick${cores.reset}       Modo rápido com padrões SaaS
  ${cores.amarelo}pnpm zory pages --prompt${cores.reset}      Apenas gera o prompt (não o código)
  ${cores.amarelo}pnpm zory pages --list${cores.reset}        Lista estilos e indústrias disponíveis

${cores.ciano}Opções:${cores.reset}

  ${cores.amarelo}--style=<estilo>${cores.reset}    Define o estilo visual
                       minimalism, glassmorphism, gradient, brutalism

  ${cores.amarelo}--industry=<ind>${cores.reset}    Define a indústria
                       saas, fintech, ecommerce, healthcare, education

${cores.cinza}Exemplos:${cores.reset}
  pnpm zory pages
  pnpm zory pages --style=glassmorphism --industry=fintech
  pnpm zory pages --quick --prompt
`)
}

// ========================================
// BRIEFING INTERATIVO
// ========================================

async function executarBriefing(rl, briefingConfig, presets = {}) {
  const respostas = { ...presets }

  console.log(`\n${cores.azul}${cores.bold}📋 Briefing da Landing Page${cores.reset}`)
  console.log(`${cores.cinza}Responda as perguntas para gerar sua landing page perfeita${cores.reset}\n`)

  for (const step of briefingConfig.steps) {
    // Pular se já tiver preset
    if (respostas[step.id]) {
      console.log(`${cores.cinza}✓ ${step.question}: ${respostas[step.id]}${cores.reset}`)
      continue
    }

    console.log(`\n${cores.ciano}${step.question}${cores.reset}`)

    if (step.type === 'select') {
      exibirOpcoes(step.options)
      const resposta = await perguntar(rl, `\n${cores.amarelo}Escolha (1-${step.options.length}): ${cores.reset}`)
      const index = parseInt(resposta) - 1
      if (index >= 0 && index < step.options.length) {
        respostas[step.id] = step.options[index].value
        console.log(`${cores.verde}✓${cores.reset} ${step.options[index].label}`)
      } else {
        respostas[step.id] = briefingConfig.defaults[step.id] || step.options[0].value
        console.log(`${cores.cinza}Usando padrão: ${respostas[step.id]}${cores.reset}`)
      }
    } else if (step.type === 'multiselect') {
      exibirOpcoes(step.options)
      console.log(`${cores.dim}(digite números separados por vírgula, ex: 1,2,4,5)${cores.reset}`)
      const resposta = await perguntar(rl, `\n${cores.amarelo}Escolha: ${cores.reset}`)
      const indices = resposta.split(',').map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < step.options.length)
      if (indices.length > 0) {
        respostas[step.id] = indices.map(i => step.options[i].value)
        console.log(`${cores.verde}✓${cores.reset} ${indices.map(i => step.options[i].label).join(', ')}`)
      } else {
        respostas[step.id] = briefingConfig.defaults[step.id] || []
        console.log(`${cores.cinza}Usando padrões${cores.reset}`)
      }
    } else if (step.type === 'text') {
      console.log(`${cores.dim}${step.placeholder}${cores.reset}`)
      const resposta = await perguntar(rl, `${cores.amarelo}> ${cores.reset}`)
      respostas[step.id] = resposta || ''
      if (resposta) {
        console.log(`${cores.verde}✓${cores.reset} Salvo`)
      }
    }
  }

  return respostas
}

// ========================================
// GERADOR DE PROMPT
// ========================================

async function gerarPrompt(respostas) {
  // Carregar configurações de estilo e indústria
  const estilo = await carregarJSON(`styles/${respostas.estilo}.json`) || {}
  const industria = await carregarJSON(`industries/${respostas.industria}.json`) || {}
  const sections = await carregarJSON('templates/sections.json') || {}

  // Determinar cor primária
  const corPrimaria = respostas.cores === 'custom' ? respostas.corCustom : getCorHex(respostas.cores)

  // Montar lista de seções
  const secoesTexto = (respostas.secoes || []).map(s => {
    const sectionConfig = sections[s]
    return sectionConfig ? `- ${sectionConfig.name}: ${sectionConfig.description}` : `- ${s}`
  }).join('\n')

  // Determinar nível de animação
  const animacaoTexto = {
    'none': 'No animations, static content only',
    'subtle': 'Subtle animations: fade in on scroll, hover effects',
    'moderate': 'Moderate animations: scroll-triggered reveals, smooth transitions',
    'rich': 'Rich animations: MagicUI components, Framer Motion, animated gradients'
  }[respostas.animacoes] || 'Moderate animations'

  // Construir prompt em inglês
  const prompt = `
## Role

You are a senior frontend designer and developer specialized in creating high-converting landing pages. You work with TypeScript, React, Next.js (App Router), Tailwind CSS, shadcn/ui, and Framer Motion.

## Tech Stack

- Next.js 16 with App Router
- React 19 with Server Components
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- shadcn/ui components
- Framer Motion for animations
${respostas.animacoes === 'rich' ? '- MagicUI for advanced effects' : ''}

## Project Context

**Industry:** ${industria.name || respostas.industria}
**Goal:** ${getObjetivoTexto(respostas.objetivo)}
**Target Audience:** ${respostas.publico || 'Not specified'}

## Value Proposition

${respostas.proposta || 'To be defined based on the product/service'}

## Visual Style: ${estilo.name || respostas.estilo}

${estilo.description || ''}

**Key Characteristics:**
${estilo.promptKeywords ? estilo.promptKeywords.map(k => `- ${k}`).join('\n') : `- ${respostas.estilo} design style`}

## Color Palette

- Primary Color: ${corPrimaria}
- Background: ${estilo.palette?.background || '#FFFFFF'}
- Text: ${estilo.palette?.text || '#111827'}
- Accent: ${estilo.palette?.accent || corPrimaria}

## Required Sections

${secoesTexto}

## Animation Level

${animacaoTexto}

## Primary CTA

"${respostas.cta || 'Get Started'}"

${respostas.referencias ? `## Visual References\n\n${respostas.referencias}` : ''}

## Conversion Best Practices to Apply

1. Clear value proposition above the fold
2. Single primary CTA that stands out
3. Social proof near conversion points
4. Trust indicators (badges, logos, testimonials)
5. Mobile-first responsive design
6. Fast loading, optimized images

${industria.promptEnhancements ? `## Industry-Specific Enhancements\n\n${industria.promptEnhancements.map(e => `- ${e}`).join('\n')}` : ''}

${estilo.doNot ? `## Avoid\n\n${estilo.doNot.map(d => `- ${d}`).join('\n')}` : ''}

## Output Requirements

Generate a complete, production-ready landing page with:

1. **Main Page Component** (src/app/page.tsx or similar)
2. **Reusable Section Components** for each section
3. **Full TypeScript types** - no 'any' types
4. **Responsive design** - mobile-first approach
5. **shadcn/ui components** as building blocks
6. **Tailwind CSS** for styling
7. **Proper accessibility** - semantic HTML, ARIA labels, proper contrast
8. **SEO-ready structure** - proper heading hierarchy, meta-ready

Include helpful comments in Portuguese explaining each section.

Start with the hero section and work down. Each component should be self-contained and reusable.
`.trim()

  return prompt
}

function getCorHex(cor) {
  const cores = {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    green: '#22C55E',
    orange: '#F97316',
    red: '#EF4444',
    teal: '#14B8A6',
    pink: '#EC4899'
  }
  return cores[cor] || '#3B82F6'
}

function getObjetivoTexto(objetivo) {
  const objetivos = {
    'lead-gen': 'Capture leads (emails, contacts) for nurturing',
    'product': 'Present and showcase a product or service',
    'saas-trial': 'Convert visitors to trial signups or free accounts',
    'app-download': 'Drive mobile app downloads',
    'event': 'Get registrations for an event or webinar',
    'community': 'Grow community membership',
    'ecommerce': 'Direct sales conversion'
  }
  return objetivos[objetivo] || objetivo
}

// ========================================
// SALVAR E EXIBIR RESULTADO
// ========================================

async function salvarPrompt(prompt, respostas) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const nomeArquivo = `landing-${respostas.industria}-${respostas.estilo}-${timestamp}`

  // Salvar prompt
  await fs.writeFile(
    path.join(OUTPUT_DIR, `${nomeArquivo}.md`),
    `# Landing Page Prompt\n\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\n${prompt}`
  )

  // Salvar briefing
  await fs.writeFile(
    path.join(OUTPUT_DIR, `${nomeArquivo}-briefing.json`),
    JSON.stringify(respostas, null, 2)
  )

  return nomeArquivo
}

function exibirPrompt(prompt) {
  console.log(`\n${cores.azul}${'═'.repeat(60)}${cores.reset}`)
  console.log(`${cores.bold}PROMPT GERADO (copie e use no Claude, v0.dev, ou Cursor)${cores.reset}`)
  console.log(`${cores.azul}${'═'.repeat(60)}${cores.reset}\n`)

  console.log(prompt)

  console.log(`\n${cores.azul}${'═'.repeat(60)}${cores.reset}`)
}

// ========================================
// LISTAR OPÇÕES
// ========================================

async function listarOpcoes() {
  console.log(`\n${cores.azul}${cores.bold}Estilos Disponíveis:${cores.reset}\n`)

  const estilos = ['minimalism', 'glassmorphism', 'gradient']
  for (const e of estilos) {
    const config = await carregarJSON(`styles/${e}.json`)
    if (config) {
      console.log(`  ${cores.ciano}${e}${cores.reset} - ${config.description}`)
    }
  }

  console.log(`\n${cores.azul}${cores.bold}Indústrias Disponíveis:${cores.reset}\n`)

  const industrias = ['saas', 'fintech']
  for (const i of industrias) {
    const config = await carregarJSON(`industries/${i}.json`)
    if (config) {
      console.log(`  ${cores.ciano}${i}${cores.reset} - ${config.description}`)
    }
  }

  console.log('')
}

// ========================================
// COMANDO PRINCIPAL
// ========================================

async function main() {
  const args = process.argv.slice(2)

  // Verificar flags
  if (args.includes('--help') || args.includes('-h')) {
    exibirAjuda()
    return
  }

  if (args.includes('--list')) {
    await listarOpcoes()
    return
  }

  exibirBanner()

  // Carregar configuração de briefing
  const briefingConfig = await carregarJSON('briefing.json')
  if (!briefingConfig) {
    console.error(`${cores.vermelho}Erro: Não foi possível carregar briefing.json${cores.reset}`)
    process.exit(1)
  }

  // Processar presets dos argumentos
  const presets = {}
  for (const arg of args) {
    if (arg.startsWith('--style=')) {
      presets.estilo = arg.split('=')[1]
    } else if (arg.startsWith('--industry=')) {
      presets.industria = arg.split('=')[1]
    }
  }

  // Modo rápido
  if (args.includes('--quick')) {
    presets.objetivo = 'saas-trial'
    presets.industria = presets.industria || 'saas'
    presets.estilo = presets.estilo || 'minimalism'
    presets.cores = 'blue'
    presets.animacoes = 'moderate'
    presets.secoes = ['hero', 'logos', 'features', 'testimonials', 'pricing', 'faq', 'cta-final']
  }

  const rl = getReadlineInterface()

  try {
    // Executar briefing
    const respostas = await executarBriefing(rl, briefingConfig, presets)

    // Gerar prompt
    console.log(`\n${cores.amarelo}⏳ Gerando prompt otimizado...${cores.reset}`)
    const prompt = await gerarPrompt(respostas)

    // Salvar arquivos
    const nomeArquivo = await salvarPrompt(prompt, respostas)

    // Exibir resultado
    exibirPrompt(prompt)

    console.log(`\n${cores.verde}✅ Prompt salvo em:${cores.reset}`)
    console.log(`   ${cores.cinza}${path.join(OUTPUT_DIR, nomeArquivo)}.md${cores.reset}`)

    console.log(`\n${cores.ciano}${cores.bold}Próximos passos:${cores.reset}`)
    console.log(`${cores.cinza}1. Copie o prompt acima`)
    console.log(`2. Cole no Claude, v0.dev, ou Cursor`)
    console.log(`3. Revise e ajuste o código gerado`)
    console.log(`4. Salve em src/app/page.tsx${cores.reset}\n`)

    if (!args.includes('--prompt')) {
      console.log(`${cores.amarelo}💡 Dica: Use o prompt com v0.dev para gerar código visual rapidamente!${cores.reset}`)
      console.log(`${cores.cinza}   https://v0.dev${cores.reset}\n`)
    }

  } catch (error) {
    console.error(`${cores.vermelho}Erro:${cores.reset}`, error.message)
  } finally {
    closeReadline()
  }
}

main().catch(console.error)
