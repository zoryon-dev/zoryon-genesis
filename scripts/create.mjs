#!/usr/bin/env node

import { intro, outro, text, select, confirm, spinner, isCancel, cancel, note } from '@clack/prompts'
import { generateProject } from './generator.mjs'
import pc from 'picocolors'
import path from 'path'
import fs from 'fs'

async function main() {
  console.clear()

  intro(pc.bgCyan(pc.black(' Zoryon Genesis ')))

  // ============================================
  // FASE 1: CONFIGURAÇÃO TÉCNICA
  // ============================================

  const projectName = await text({
    message: 'Nome do projeto:',
    placeholder: 'meu-app',
    defaultValue: 'meu-app',
    validate(value) {
      if (!value) return 'Nome do projeto é obrigatório'
      if (!/^[a-z0-9-]+$/.test(value)) return 'Use apenas letras minúsculas, números e hífens'
    },
  })

  if (isCancel(projectName)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  // Validar se projeto já existe
  const projectPath = path.join(process.cwd(), projectName)
  if (fs.existsSync(projectPath)) {
    cancel(`❌ Diretório "${projectName}" já existe! Escolha outro nome ou remova o diretório existente.`)
    process.exit(1)
  }

  const structure = await select({
    message: 'Estrutura do projeto:',
    options: [
      { value: 'single', label: 'Projeto único', hint: 'Simples e direto' },
      { value: 'turborepo', label: 'Turborepo', hint: 'Monorepo com cache' },
      { value: 'workspaces', label: 'pnpm workspaces', hint: 'Monorepo simples' },
    ],
  })

  if (isCancel(structure)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  const auth = await select({
    message: 'Autenticação:',
    options: [
      { value: 'clerk', label: 'Clerk', hint: 'Auth gerenciado com UI pronta' },
      { value: 'supabase', label: 'Supabase Auth', hint: 'Integrado com Supabase' },
      { value: 'none', label: 'Nenhuma', hint: 'Configuro depois' },
    ],
  })

  if (isCancel(auth)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  const database = await select({
    message: 'Banco de dados:',
    options: [
      { value: 'prisma', label: 'Prisma + PostgreSQL', hint: 'ORM com tipos' },
      { value: 'supabase', label: 'Supabase', hint: 'PostgreSQL gerenciado' },
      { value: 'none', label: 'Nenhum', hint: 'Configuro depois' },
    ],
  })

  if (isCancel(database)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  const testing = await confirm({
    message: 'Incluir testes? (Vitest + Playwright)',
    initialValue: true,
  })

  if (isCancel(testing)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  const ci = await confirm({
    message: 'Incluir GitHub Actions (CI/CD)?',
    initialValue: true,
  })

  if (isCancel(ci)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  const gitHooks = await confirm({
    message: 'Incluir Git Hooks (Husky)?',
    initialValue: true,
  })

  if (isCancel(gitHooks)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  // ============================================
  // FASE 2: SOBRE A IDEIA DO PROJETO
  // ============================================

  const hasIdea = await select({
    message: 'Você já sabe o que vai construir?',
    options: [
      { value: 'yes', label: 'Sim', hint: 'Vou responder algumas perguntas' },
      { value: 'no', label: 'Não ainda', hint: 'Cria o projeto em branco' },
    ],
  })

  if (isCancel(hasIdea)) {
    cancel('Operação cancelada')
    process.exit(0)
  }

  // Dados da ideia (se o usuário tiver)
  let ideaData = null

  if (hasIdea === 'yes') {
    note(
      'Vou fazer algumas perguntas rápidas para entender sua ideia.\nDepois, sua IA vai expandir isso em documentação completa.',
      'Briefing do Projeto'
    )

    const whatIsIt = await text({
      message: 'Em uma frase, o que é seu app?',
      placeholder: 'Ex: Um app para gerenciar finanças pessoais',
      validate(value) {
        if (!value || value.length < 10) return 'Descreva um pouco mais (mínimo 10 caracteres)'
      },
    })

    if (isCancel(whatIsIt)) {
      cancel('Operação cancelada')
      process.exit(0)
    }

    const targetAudience = await text({
      message: 'Quem vai usar?',
      placeholder: 'Ex: Pessoas que querem controlar gastos',
      validate(value) {
        if (!value || value.length < 5) return 'Descreva o público (mínimo 5 caracteres)'
      },
    })

    if (isCancel(targetAudience)) {
      cancel('Operação cancelada')
      process.exit(0)
    }

    const problemSolved = await text({
      message: 'Qual problema resolve?',
      placeholder: 'Ex: Não saber para onde vai o dinheiro',
      validate(value) {
        if (!value || value.length < 5) return 'Descreva o problema (mínimo 5 caracteres)'
      },
    })

    if (isCancel(problemSolved)) {
      cancel('Operação cancelada')
      process.exit(0)
    }

    const mainFeatures = await text({
      message: 'Liste 3-5 funcionalidades principais (separadas por vírgula):',
      placeholder: 'Ex: Cadastrar gastos, ver relatórios, definir metas',
      validate(value) {
        if (!value || value.length < 10) return 'Liste pelo menos algumas funcionalidades'
      },
    })

    if (isCancel(mainFeatures)) {
      cancel('Operação cancelada')
      process.exit(0)
    }

    const references = await text({
      message: 'Tem referência de app similar? (opcional)',
      placeholder: 'Ex: Mobills, Organizze',
      defaultValue: '',
    })

    if (isCancel(references)) {
      cancel('Operação cancelada')
      process.exit(0)
    }

    const extraNotes = await text({
      message: 'Algo mais que quer registrar? (opcional)',
      placeholder: 'Ex: Quero ter plano premium com Stripe',
      defaultValue: '',
    })

    if (isCancel(extraNotes)) {
      cancel('Operação cancelada')
      process.exit(0)
    }

    ideaData = {
      whatIsIt,
      targetAudience,
      problemSolved,
      mainFeatures,
      references: references || null,
      extraNotes: extraNotes || null,
    }
  }

  // ============================================
  // FASE 3: GERAR PROJETO
  // ============================================

  const options = {
    projectName,
    structure,
    auth,
    database,
    testing,
    ci,
    gitHooks,
    ideaData,
  }

  const s = spinner()
  s.start('Criando projeto...')

  try {
    const projectPath = path.resolve(process.cwd(), projectName)
    await generateProject(options, projectPath)
    s.stop('Projeto criado!')

    // ============================================
    // INSTRUÇÕES FINAIS
    // ============================================

    if (ideaData) {
      note(
        `Seu briefing foi salvo em:\n` +
        `  ${pc.cyan('.zoryon/flow/BRIEFING.md')}\n\n` +
        `Quando abrir sua IA, peça para ela ler:\n` +
        `  ${pc.cyan('.zoryon/flow/PARA-IA-LER.md')}\n\n` +
        `A IA vai expandir seu briefing em PRD,\n` +
        `user stories e tarefas práticas.`,
        'Próximo passo: Ativar IA'
      )
    }

    outro(pc.green('Pronto! Para começar:'))

    console.log()
    console.log(pc.cyan(`  cd ${projectName}`))
    console.log(pc.cyan('  pnpm install'))
    console.log(pc.cyan('  cp .env.example .env'))

    if (database === 'prisma') {
      console.log(pc.cyan('  pnpm db:push'))
    }

    console.log(pc.cyan('  pnpm dev'))
    console.log()

    if (ideaData) {
      console.log(pc.dim('  Depois, abra sua IA e peça:'))
      console.log(pc.dim('  "Leia .zoryon/flow/PARA-IA-LER.md e me ajude a começar"'))
      console.log()
    } else {
      console.log(pc.dim('  Dica: Leia .zoryon/docs/COMECE-AQUI.md'))
      console.log()
    }

  } catch (error) {
    s.stop('Erro ao criar projeto')
    console.error(pc.red(error.message))
    process.exit(1)
  }
}

main().catch(console.error)
