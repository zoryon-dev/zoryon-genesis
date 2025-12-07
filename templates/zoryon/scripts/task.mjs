#!/usr/bin/env node
// Zoryon Tasks - Sistema de gestão de tarefas com dependências e auto priorização
// Autor: Jonas Silva | Zoryon (https://zoryon.org/)
// Versão: 0.0.9 - Auto Priorização com Score

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TASKS_FILE = path.resolve(__dirname, '../tasks/tasks.json')

// Cores para terminal
const cores = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  verde: '\x1b[32m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  vermelho: '\x1b[31m',
  cinza: '\x1b[90m',
  ciano: '\x1b[36m',
  magenta: '\x1b[35m',
}

// ========================================
// FUNÇÕES DE DADOS
// ========================================

async function carregarTarefas() {
  try {
    const conteudo = await fs.readFile(TASKS_FILE, 'utf-8')
    const dados = JSON.parse(conteudo)
    // Garantir que todas as tarefas tenham o campo dependencias
    dados.tarefas = dados.tarefas.map(t => ({
      ...t,
      dependencias: t.dependencias || []
    }))
    return dados
  } catch {
    const inicial = {
      projeto: path.basename(process.cwd()),
      criadoEm: new Date().toISOString().split('T')[0],
      tarefas: []
    }
    await salvarTarefas(inicial)
    return inicial
  }
}

async function salvarTarefas(dados) {
  await fs.mkdir(path.dirname(TASKS_FILE), { recursive: true })
  await fs.writeFile(TASKS_FILE, JSON.stringify(dados, null, 2))
}

// ========================================
// FUNÇÕES DE DEPENDÊNCIAS
// ========================================

/**
 * Verifica se todas as dependências de uma tarefa estão concluídas
 */
function dependenciasProntas(tarefa, tarefas) {
  if (!tarefa.dependencias || tarefa.dependencias.length === 0) return true

  return tarefa.dependencias.every(depId => {
    const dep = tarefas.find(t => t.id === depId)
    return dep && dep.status === 'concluida'
  })
}

/**
 * Retorna as tarefas que uma tarefa bloqueia
 */
function getTarefasBloqueadas(tarefaId, tarefas) {
  return tarefas.filter(t => t.dependencias && t.dependencias.includes(tarefaId))
}

/**
 * Detecta ciclos no grafo de dependências usando DFS
 */
function detectarCiclo(tarefaId, novaDepId, tarefas) {
  const visitados = new Set()
  const pilha = [novaDepId]

  while (pilha.length > 0) {
    const atual = pilha.pop()

    // Se chegamos de volta à tarefa original, há um ciclo
    if (atual === tarefaId) return true

    if (visitados.has(atual)) continue
    visitados.add(atual)

    const tarefa = tarefas.find(t => t.id === atual)
    if (tarefa && tarefa.dependencias) {
      pilha.push(...tarefa.dependencias)
    }
  }

  return false
}

/**
 * Ordena tarefas por dependências (ordenação topológica)
 */
function ordenarPorDependencias(tarefas) {
  const resultado = []
  const visitados = new Set()
  const pendentes = [...tarefas]

  while (pendentes.length > 0) {
    let encontrouAlguma = false

    for (let i = pendentes.length - 1; i >= 0; i--) {
      const tarefa = pendentes[i]
      const depsProntas = !tarefa.dependencias ||
        tarefa.dependencias.every(d => visitados.has(d))

      if (depsProntas) {
        resultado.push(tarefa)
        visitados.add(tarefa.id)
        pendentes.splice(i, 1)
        encontrouAlguma = true
      }
    }

    // Se não encontrou nenhuma, há ciclos - adiciona as restantes
    if (!encontrouAlguma) {
      resultado.push(...pendentes)
      break
    }
  }

  return resultado
}

/**
 * Calcula profundidade de uma tarefa no grafo (para visualização)
 */
function calcularProfundidade(tarefaId, tarefas, cache = new Map()) {
  if (cache.has(tarefaId)) return cache.get(tarefaId)

  const tarefa = tarefas.find(t => t.id === tarefaId)
  if (!tarefa || !tarefa.dependencias || tarefa.dependencias.length === 0) {
    cache.set(tarefaId, 0)
    return 0
  }

  const maxDepProfundidade = Math.max(
    ...tarefa.dependencias.map(d => calcularProfundidade(d, tarefas, cache))
  )

  const profundidade = maxDepProfundidade + 1
  cache.set(tarefaId, profundidade)
  return profundidade
}

// ========================================
// FUNÇÕES DE AUTO PRIORIZAÇÃO (SCORE)
// ========================================

/**
 * Calcula quantas tarefas dependem diretamente desta tarefa
 */
function contarDependentes(tarefaId, tarefas) {
  return tarefas.filter(t => t.dependencias && t.dependencias.includes(tarefaId)).length
}

/**
 * Calcula quantos dias desde a criação da tarefa
 */
function diasDesdeCriacao(tarefa) {
  const hoje = new Date()
  const criacao = new Date(tarefa.criadoEm)

  // Verifica se a data é válida (não é NaN e não é placeholder)
  if (isNaN(criacao.getTime()) || tarefa.criadoEm?.includes('{{')) {
    return 0 // Data inválida ou placeholder
  }

  const diff = Math.floor((hoje - criacao) / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.min(diff, 10)) // Cap em 0-10 dias
}

/**
 * Converte prioridade para valor numérico
 */
function valorPrioridade(prioridade) {
  switch (prioridade) {
    case 'alta': return 10
    case 'media': return 5
    case 'baixa': return 2
    default: return 5
  }
}

/**
 * Calcula score de priorização automática
 * Fórmula: (urgência × 2) + (prioridade × 3) + (dependentes × 4) + (profundidade × 1)
 *
 * - Urgência: dias desde criação (max 10) × 2
 * - Prioridade: alta=10, média=5, baixa=2 × 3
 * - Dependentes: quantas tarefas dependem desta × 4
 * - Profundidade: nível no grafo (raiz=0, maior=bloqueador importante) × 1
 *
 * Quanto MAIOR o score, MAIS prioritária a tarefa
 */
function calcularScore(tarefa, tarefas, cacheProf = new Map()) {
  const urgencia = diasDesdeCriacao(tarefa)
  const prioridade = valorPrioridade(tarefa.prioridade)
  const dependentes = contarDependentes(tarefa.id, tarefas)
  const profundidade = calcularProfundidade(tarefa.id, tarefas, cacheProf)

  // Fórmula: pesos ajustados para equilíbrio
  const score = (urgencia * 2) + (prioridade * 3) + (dependentes * 4) + (profundidade * 1)

  return {
    total: score,
    detalhes: {
      urgencia: { valor: urgencia, peso: 2, pontos: urgencia * 2 },
      prioridade: { valor: prioridade, peso: 3, pontos: prioridade * 3 },
      dependentes: { valor: dependentes, peso: 4, pontos: dependentes * 4 },
      profundidade: { valor: profundidade, peso: 1, pontos: profundidade * 1 }
    }
  }
}

/**
 * Ordena tarefas por score (maior primeiro), respeitando dependências
 */
function ordenarPorScore(tarefas, todasTarefas) {
  const cacheProf = new Map()
  return [...tarefas].sort((a, b) => {
    const scoreA = calcularScore(a, todasTarefas, cacheProf).total
    const scoreB = calcularScore(b, todasTarefas, cacheProf).total
    return scoreB - scoreA // Maior score primeiro
  })
}

// ========================================
// FUNÇÕES DE EXIBIÇÃO
// ========================================

function formatarStatus(status) {
  switch (status) {
    case 'concluida': return `${cores.verde}✓${cores.reset}`
    case 'em-progresso': return `${cores.amarelo}→${cores.reset}`
    case 'bloqueada': return `${cores.vermelho}⊘${cores.reset}`
    default: return `${cores.cinza}○${cores.reset}`
  }
}

function formatarPrioridade(prioridade) {
  switch (prioridade) {
    case 'alta': return `${cores.vermelho}alta${cores.reset}`
    case 'media': return `${cores.amarelo}média${cores.reset}`
    case 'baixa': return `${cores.cinza}baixa${cores.reset}`
    default: return prioridade
  }
}

function exibirTarefaDetalhada(tarefa, tarefas) {
  const bloqueadas = getTarefasBloqueadas(tarefa.id, tarefas)
  const depsOk = dependenciasProntas(tarefa, tarefas)

  console.log(`\n${cores.azul}┌─────────────────────────────────────────────────┐${cores.reset}`)
  console.log(`${cores.azul}│${cores.reset} ${cores.bold}#${tarefa.id} ${tarefa.titulo}${cores.reset}`)
  console.log(`${cores.azul}├─────────────────────────────────────────────────┤${cores.reset}`)
  console.log(`${cores.azul}│${cores.reset} Status: ${formatarStatus(tarefa.status)} ${tarefa.status}`)
  console.log(`${cores.azul}│${cores.reset} Prioridade: ${formatarPrioridade(tarefa.prioridade)}`)

  if (tarefa.descricao) {
    console.log(`${cores.azul}│${cores.reset}`)
    console.log(`${cores.azul}│${cores.reset} ${cores.dim}${tarefa.descricao}${cores.reset}`)
  }

  if (tarefa.dependencias && tarefa.dependencias.length > 0) {
    console.log(`${cores.azul}│${cores.reset}`)
    console.log(`${cores.azul}│${cores.reset} ${cores.ciano}Dependências:${cores.reset}`)
    for (const depId of tarefa.dependencias) {
      const dep = tarefas.find(t => t.id === depId)
      if (dep) {
        const statusIcon = dep.status === 'concluida' ? `${cores.verde}✓${cores.reset}` : `${cores.vermelho}○${cores.reset}`
        console.log(`${cores.azul}│${cores.reset}   ${statusIcon} #${dep.id} ${dep.titulo}`)
      }
    }
    if (!depsOk) {
      console.log(`${cores.azul}│${cores.reset}   ${cores.vermelho}⚠ Aguardando dependências${cores.reset}`)
    }
  }

  if (bloqueadas.length > 0) {
    console.log(`${cores.azul}│${cores.reset}`)
    console.log(`${cores.azul}│${cores.reset} ${cores.magenta}Desbloqueia:${cores.reset}`)
    for (const b of bloqueadas) {
      console.log(`${cores.azul}│${cores.reset}   → #${b.id} ${b.titulo}`)
    }
  }

  console.log(`${cores.azul}│${cores.reset}`)
  console.log(`${cores.azul}│${cores.reset} ${cores.dim}Criada: ${tarefa.criadoEm}${cores.reset}`)
  if (tarefa.concluidoEm) {
    console.log(`${cores.azul}│${cores.reset} ${cores.dim}Concluída: ${tarefa.concluidoEm}${cores.reset}`)
  }
  console.log(`${cores.azul}└─────────────────────────────────────────────────┘${cores.reset}\n`)
}

// ========================================
// COMANDOS
// ========================================

const [,, comando, ...args] = process.argv

async function main() {
  const dados = await carregarTarefas()

  switch (comando) {
    // ========================================
    // ADD - Adicionar nova tarefa
    // ========================================
    case 'add': {
      const titulo = args.join(' ')
      if (!titulo) {
        console.log(`${cores.vermelho}❌ Uso: pnpm task add "Título da tarefa"${cores.reset}`)
        break
      }
      const id = dados.tarefas.length > 0
        ? Math.max(...dados.tarefas.map(t => t.id)) + 1
        : 1
      dados.tarefas.push({
        id,
        titulo,
        descricao: '',
        status: 'pendente',
        prioridade: 'media',
        dependencias: [],
        criadoEm: new Date().toISOString().split('T')[0],
        concluidoEm: null
      })
      await salvarTarefas(dados)
      console.log(`${cores.verde}✅ Tarefa #${id} adicionada: ${titulo}${cores.reset}`)
      break
    }

    // ========================================
    // LIST - Listar tarefas
    // ========================================
    case 'list': {
      if (dados.tarefas.length === 0) {
        console.log(`${cores.amarelo}📋 Nenhuma tarefa encontrada${cores.reset}`)
        console.log(`${cores.cinza}   Use "pnpm task add" para criar uma${cores.reset}`)
        break
      }

      console.log(`\n${cores.azul}${cores.bold}📋 Lista de Tarefas - ${dados.projeto}${cores.reset}\n`)

      const emProgresso = dados.tarefas.filter(t => t.status === 'em-progresso')
      const pendentes = dados.tarefas.filter(t => t.status === 'pendente')
      const concluidas = dados.tarefas.filter(t => t.status === 'concluida')

      // Ordenar pendentes por dependências
      const pendentesOrdenadas = ordenarPorDependencias(pendentes)

      if (emProgresso.length > 0) {
        console.log(`${cores.amarelo}🔄 Em progresso:${cores.reset}`)
        for (const t of emProgresso) {
          const depsInfo = t.dependencias.length > 0 ? ` ${cores.dim}(deps: ${t.dependencias.join(', ')})${cores.reset}` : ''
          console.log(`   ${formatarStatus(t.status)} #${t.id} [${formatarPrioridade(t.prioridade)}] ${t.titulo}${depsInfo}`)
        }
        console.log('')
      }

      if (pendentesOrdenadas.length > 0) {
        console.log(`${cores.azul}⏳ Pendentes:${cores.reset}`)
        for (const t of pendentesOrdenadas) {
          const depsOk = dependenciasProntas(t, dados.tarefas)
          const statusIcon = depsOk ? formatarStatus(t.status) : `${cores.vermelho}⊘${cores.reset}`
          const depsInfo = t.dependencias.length > 0
            ? ` ${cores.dim}(deps: ${t.dependencias.map(d => {
                const dep = dados.tarefas.find(x => x.id === d)
                return dep?.status === 'concluida' ? `${cores.verde}${d}${cores.reset}${cores.dim}` : `${cores.vermelho}${d}${cores.reset}${cores.dim}`
              }).join(', ')})${cores.reset}`
            : ''
          const bloqueadaInfo = !depsOk ? ` ${cores.vermelho}[BLOQUEADA]${cores.reset}` : ''
          console.log(`   ${statusIcon} #${t.id} [${formatarPrioridade(t.prioridade)}] ${t.titulo}${depsInfo}${bloqueadaInfo}`)
        }
        console.log('')
      }

      if (concluidas.length > 0) {
        console.log(`${cores.verde}✅ Concluídas:${cores.reset}`)
        for (const t of concluidas) {
          console.log(`   ${cores.cinza}${formatarStatus(t.status)} #${t.id} ${t.titulo}${cores.reset}`)
        }
        console.log('')
      }
      break
    }

    // ========================================
    // NEXT - Próxima tarefa disponível (com auto priorização)
    // ========================================
    case 'next': {
      // Verifica se há tarefa em progresso
      const emProgresso = dados.tarefas.find(t => t.status === 'em-progresso')
      if (emProgresso) {
        const scoreInfo = calcularScore(emProgresso, dados.tarefas)
        exibirTarefaDetalhada(emProgresso, dados.tarefas)
        console.log(`${cores.cinza}Score: ${cores.ciano}${scoreInfo.total}${cores.reset}${cores.cinza} pontos${cores.reset}`)
        console.log(`${cores.cinza}Use "pnpm task done ${emProgresso.id}" quando terminar${cores.reset}\n`)
        break
      }

      // Busca tarefas pendentes com dependências resolvidas
      const pendentes = dados.tarefas.filter(t => t.status === 'pendente')
      const disponiveis = pendentes.filter(t => dependenciasProntas(t, dados.tarefas))

      if (disponiveis.length === 0) {
        // Verifica se há tarefas bloqueadas
        const bloqueadas = pendentes.filter(t => !dependenciasProntas(t, dados.tarefas))
        if (bloqueadas.length > 0) {
          console.log(`\n${cores.amarelo}⚠️  Todas as tarefas pendentes estão bloqueadas!${cores.reset}\n`)
          console.log(`${cores.cinza}Tarefas bloqueadas:${cores.reset}`)
          for (const t of bloqueadas) {
            const depsPendentes = t.dependencias.filter(d => {
              const dep = dados.tarefas.find(x => x.id === d)
              return dep && dep.status !== 'concluida'
            })
            console.log(`   #${t.id} ${t.titulo} ${cores.dim}(aguarda: #${depsPendentes.join(', #')})${cores.reset}`)
          }
          console.log('')
        } else {
          console.log(`${cores.verde}🎉 Todas as tarefas foram concluídas!${cores.reset}`)
        }
        break
      }

      // Ordena por score (maior primeiro) e pega a primeira
      const ordenadas = ordenarPorScore(disponiveis, dados.tarefas)
      const proxima = ordenadas[0]
      const scoreInfo = calcularScore(proxima, dados.tarefas)

      // Marca como em progresso
      proxima.status = 'em-progresso'
      await salvarTarefas(dados)

      exibirTarefaDetalhada(proxima, dados.tarefas)

      // Mostra score e detalhes
      console.log(`${cores.ciano}📊 Score: ${cores.bold}${scoreInfo.total}${cores.reset}${cores.ciano} pontos${cores.reset}`)
      console.log(`${cores.dim}   Urgência: ${scoreInfo.detalhes.urgencia.pontos} | Prioridade: ${scoreInfo.detalhes.prioridade.pontos} | Dependentes: ${scoreInfo.detalhes.dependentes.pontos} | Profundidade: ${scoreInfo.detalhes.profundidade.pontos}${cores.reset}`)

      // Mostra outras tarefas disponíveis se houver
      if (ordenadas.length > 1) {
        console.log(`\n${cores.dim}Outras disponíveis:${cores.reset}`)
        for (let i = 1; i < Math.min(ordenadas.length, 4); i++) {
          const t = ordenadas[i]
          const s = calcularScore(t, dados.tarefas).total
          console.log(`${cores.dim}   #${t.id} ${t.titulo} (score: ${s})${cores.reset}`)
        }
      }

      console.log(`\n${cores.cinza}Use "pnpm task done ${proxima.id}" quando terminar${cores.reset}`)
      console.log(`${cores.cinza}Use "pnpm task scores" para ver todos os scores${cores.reset}\n`)
      break
    }

    // ========================================
    // DONE - Marcar como concluída
    // ========================================
    case 'done': {
      const id = parseInt(args[0])
      if (!id) {
        console.log(`${cores.vermelho}❌ Uso: pnpm task done <id>${cores.reset}`)
        break
      }
      const tarefa = dados.tarefas.find(t => t.id === id)
      if (!tarefa) {
        console.log(`${cores.vermelho}❌ Tarefa #${id} não encontrada${cores.reset}`)
        break
      }
      tarefa.status = 'concluida'
      tarefa.concluidoEm = new Date().toISOString().split('T')[0]
      await salvarTarefas(dados)
      console.log(`${cores.verde}✅ Tarefa #${id} concluída!${cores.reset}`)

      // Mostra tarefas desbloqueadas
      const desbloqueadas = getTarefasBloqueadas(id, dados.tarefas)
        .filter(t => t.status === 'pendente' && dependenciasProntas(t, dados.tarefas))

      if (desbloqueadas.length > 0) {
        console.log(`\n${cores.verde}🔓 Tarefas desbloqueadas:${cores.reset}`)
        for (const t of desbloqueadas) {
          console.log(`   → #${t.id} ${t.titulo}`)
        }
      }

      // Mostra próxima tarefa
      const proxima = dados.tarefas.find(t =>
        t.status === 'pendente' && dependenciasProntas(t, dados.tarefas)
      )
      if (proxima) {
        console.log(`\n${cores.cinza}Próxima: #${proxima.id} - ${proxima.titulo}${cores.reset}`)
        console.log(`${cores.cinza}Use "pnpm task next" para iniciar${cores.reset}`)
      }
      break
    }

    // ========================================
    // DEPENDS - Adicionar dependência
    // ========================================
    case 'depends': {
      const tarefaId = parseInt(args[0])
      const onIndex = args.indexOf('--on')
      const depId = onIndex !== -1 ? parseInt(args[onIndex + 1]) : null

      if (!tarefaId || !depId) {
        console.log(`${cores.vermelho}❌ Uso: pnpm task depends <id> --on <id-dependencia>${cores.reset}`)
        console.log(`${cores.cinza}   Exemplo: pnpm task depends 5 --on 2${cores.reset}`)
        console.log(`${cores.cinza}   (Tarefa 5 passa a depender da tarefa 2)${cores.reset}`)
        break
      }

      const tarefa = dados.tarefas.find(t => t.id === tarefaId)
      const dependencia = dados.tarefas.find(t => t.id === depId)

      if (!tarefa) {
        console.log(`${cores.vermelho}❌ Tarefa #${tarefaId} não encontrada${cores.reset}`)
        break
      }
      if (!dependencia) {
        console.log(`${cores.vermelho}❌ Tarefa #${depId} não encontrada${cores.reset}`)
        break
      }
      if (tarefaId === depId) {
        console.log(`${cores.vermelho}❌ Uma tarefa não pode depender de si mesma${cores.reset}`)
        break
      }
      if (tarefa.dependencias.includes(depId)) {
        console.log(`${cores.amarelo}⚠️  Tarefa #${tarefaId} já depende de #${depId}${cores.reset}`)
        break
      }

      // Verifica ciclo
      if (detectarCiclo(tarefaId, depId, dados.tarefas)) {
        console.log(`${cores.vermelho}❌ Erro: Isso criaria uma dependência circular!${cores.reset}`)
        console.log(`${cores.cinza}   #${depId} já depende (direta ou indiretamente) de #${tarefaId}${cores.reset}`)
        break
      }

      tarefa.dependencias.push(depId)
      await salvarTarefas(dados)
      console.log(`${cores.verde}✅ Dependência adicionada: #${tarefaId} depende de #${depId}${cores.reset}`)
      console.log(`${cores.cinza}   ${tarefa.titulo} → ${dependencia.titulo}${cores.reset}`)
      break
    }

    // ========================================
    // UNDEPENDS - Remover dependência
    // ========================================
    case 'undepends': {
      const tarefaId = parseInt(args[0])
      const fromIndex = args.indexOf('--from')
      const depId = fromIndex !== -1 ? parseInt(args[fromIndex + 1]) : null

      if (!tarefaId || !depId) {
        console.log(`${cores.vermelho}❌ Uso: pnpm task undepends <id> --from <id-dependencia>${cores.reset}`)
        console.log(`${cores.cinza}   Exemplo: pnpm task undepends 5 --from 2${cores.reset}`)
        break
      }

      const tarefa = dados.tarefas.find(t => t.id === tarefaId)
      if (!tarefa) {
        console.log(`${cores.vermelho}❌ Tarefa #${tarefaId} não encontrada${cores.reset}`)
        break
      }

      const index = tarefa.dependencias.indexOf(depId)
      if (index === -1) {
        console.log(`${cores.amarelo}⚠️  Tarefa #${tarefaId} não depende de #${depId}${cores.reset}`)
        break
      }

      tarefa.dependencias.splice(index, 1)
      await salvarTarefas(dados)
      console.log(`${cores.verde}✅ Dependência removida: #${tarefaId} não depende mais de #${depId}${cores.reset}`)
      break
    }

    // ========================================
    // GRAPH - Visualização do grafo
    // ========================================
    case 'graph': {
      if (dados.tarefas.length === 0) {
        console.log(`${cores.amarelo}📋 Nenhuma tarefa encontrada${cores.reset}`)
        break
      }

      console.log(`\n${cores.azul}${cores.bold}┌─────────────────────────────────────────────────┐${cores.reset}`)
      console.log(`${cores.azul}${cores.bold}│             GRAFO DE DEPENDÊNCIAS               │${cores.reset}`)
      console.log(`${cores.azul}${cores.bold}├─────────────────────────────────────────────────┤${cores.reset}`)

      // Agrupa por profundidade
      const cache = new Map()
      const porProfundidade = new Map()

      for (const t of dados.tarefas) {
        const prof = calcularProfundidade(t.id, dados.tarefas, cache)
        if (!porProfundidade.has(prof)) {
          porProfundidade.set(prof, [])
        }
        porProfundidade.get(prof).push(t)
      }

      // Exibe por nível
      const profundidades = [...porProfundidade.keys()].sort((a, b) => a - b)

      for (const prof of profundidades) {
        const tarefas = porProfundidade.get(prof)
        const indent = '  '.repeat(prof)

        for (const t of tarefas) {
          const status = formatarStatus(t.status)
          const bloqueadas = getTarefasBloqueadas(t.id, dados.tarefas)
          const seta = bloqueadas.length > 0 ? ` ${cores.dim}──► [${bloqueadas.map(b => b.id).join(', ')}]${cores.reset}` : ''

          console.log(`${cores.azul}│${cores.reset} ${indent}${status} [${t.id}] ${t.titulo}${seta}`)
        }
      }

      console.log(`${cores.azul}${cores.bold}├─────────────────────────────────────────────────┤${cores.reset}`)
      console.log(`${cores.azul}│${cores.reset} ${cores.dim}Legenda: ○ pendente  → em progresso  ✓ concluída${cores.reset}`)
      console.log(`${cores.azul}│${cores.reset} ${cores.dim}         ──► desbloqueia tarefa(s)${cores.reset}`)
      console.log(`${cores.azul}${cores.bold}└─────────────────────────────────────────────────┘${cores.reset}\n`)
      break
    }

    // ========================================
    // STATUS - Status geral
    // ========================================
    case 'status': {
      const total = dados.tarefas.length
      const concluidas = dados.tarefas.filter(t => t.status === 'concluida').length
      const pendentes = dados.tarefas.filter(t => t.status === 'pendente').length
      const emProgresso = dados.tarefas.filter(t => t.status === 'em-progresso').length
      const bloqueadas = dados.tarefas.filter(t =>
        t.status === 'pendente' && !dependenciasProntas(t, dados.tarefas)
      ).length
      const disponiveis = pendentes - bloqueadas
      const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0

      console.log(`\n${cores.azul}${cores.bold}📊 Status do Projeto: ${dados.projeto}${cores.reset}\n`)
      console.log(`   Total: ${total} tarefas`)
      console.log(`   ${cores.verde}✅ Concluídas: ${concluidas}${cores.reset}`)
      console.log(`   ${cores.amarelo}🔄 Em progresso: ${emProgresso}${cores.reset}`)
      console.log(`   ${cores.azul}○  Disponíveis: ${disponiveis}${cores.reset}`)
      console.log(`   ${cores.vermelho}⊘  Bloqueadas: ${bloqueadas}${cores.reset}`)

      // Barra de progresso
      const barraCheia = Math.round(progresso / 5)
      const barraVazia = 20 - barraCheia
      const barra = `${'█'.repeat(barraCheia)}${'░'.repeat(barraVazia)}`
      console.log(`\n   ${cores.verde}${barra}${cores.reset} ${progresso}%\n`)

      // Mostra dependências se houver
      const comDeps = dados.tarefas.filter(t => t.dependencias && t.dependencias.length > 0)
      if (comDeps.length > 0) {
        console.log(`   ${cores.dim}${comDeps.length} tarefa(s) com dependências configuradas${cores.reset}`)
        console.log(`   ${cores.dim}Use "pnpm task graph" para visualizar${cores.reset}\n`)
      }
      break
    }

    // ========================================
    // EDIT - Ver/editar tarefa
    // ========================================
    case 'edit': {
      const id = parseInt(args[0])
      if (!id) {
        console.log(`${cores.vermelho}❌ Uso: pnpm task edit <id> "nova descrição"${cores.reset}`)
        break
      }
      const tarefa = dados.tarefas.find(t => t.id === id)
      if (!tarefa) {
        console.log(`${cores.vermelho}❌ Tarefa #${id} não encontrada${cores.reset}`)
        break
      }
      const novaDescricao = args.slice(1).join(' ')
      if (novaDescricao) {
        tarefa.descricao = novaDescricao
        await salvarTarefas(dados)
        console.log(`${cores.verde}✅ Descrição da tarefa #${id} atualizada${cores.reset}`)
      } else {
        exibirTarefaDetalhada(tarefa, dados.tarefas)
      }
      break
    }

    // ========================================
    // PRIORITY - Mudar prioridade
    // ========================================
    case 'priority': {
      const id = parseInt(args[0])
      const novaPrioridade = args[1]

      if (!id || !novaPrioridade) {
        console.log(`${cores.vermelho}❌ Uso: pnpm task priority <id> <alta|media|baixa>${cores.reset}`)
        break
      }

      if (!['alta', 'media', 'baixa'].includes(novaPrioridade)) {
        console.log(`${cores.vermelho}❌ Prioridade inválida. Use: alta, media ou baixa${cores.reset}`)
        break
      }

      const tarefa = dados.tarefas.find(t => t.id === id)
      if (!tarefa) {
        console.log(`${cores.vermelho}❌ Tarefa #${id} não encontrada${cores.reset}`)
        break
      }

      tarefa.prioridade = novaPrioridade
      await salvarTarefas(dados)
      console.log(`${cores.verde}✅ Prioridade da tarefa #${id} alterada para ${formatarPrioridade(novaPrioridade)}${cores.reset}`)
      break
    }

    // ========================================
    // SCORES - Visualizar scores de todas as tarefas
    // ========================================
    case 'scores': {
      const pendentes = dados.tarefas.filter(t => t.status !== 'concluida')

      if (pendentes.length === 0) {
        console.log(`${cores.verde}🎉 Todas as tarefas foram concluídas!${cores.reset}`)
        break
      }

      console.log(`\n${cores.azul}${cores.bold}📊 Scores de Priorização Automática${cores.reset}\n`)

      // Calcula e ordena por score
      const cacheProf = new Map()
      const comScore = pendentes.map(t => ({
        tarefa: t,
        score: calcularScore(t, dados.tarefas, cacheProf),
        disponivel: dependenciasProntas(t, dados.tarefas)
      })).sort((a, b) => b.score.total - a.score.total)

      // Cabeçalho da tabela
      console.log(`${cores.dim}  #ID  │ Score │ Urg │ Pri │ Dep │ Prof │ Status       │ Tarefa${cores.reset}`)
      console.log(`${cores.dim}───────┼───────┼─────┼─────┼─────┼──────┼──────────────┼───────────────${cores.reset}`)

      for (const { tarefa, score, disponivel } of comScore) {
        const d = score.detalhes
        const statusIcon = tarefa.status === 'em-progresso'
          ? `${cores.amarelo}em-progresso${cores.reset}`
          : disponivel
            ? `${cores.verde}disponível${cores.reset}  `
            : `${cores.vermelho}bloqueada${cores.reset}   `

        const scoreColor = score.total >= 30 ? cores.vermelho :
                          score.total >= 20 ? cores.amarelo : cores.cinza

        console.log(`  ${cores.bold}#${String(tarefa.id).padEnd(3)}${cores.reset} │ ${scoreColor}${String(score.total).padStart(5)}${cores.reset} │ ${String(d.urgencia.pontos).padStart(3)} │ ${String(d.prioridade.pontos).padStart(3)} │ ${String(d.dependentes.pontos).padStart(3)} │ ${String(d.profundidade.pontos).padStart(4)} │ ${statusIcon} │ ${tarefa.titulo.substring(0, 25)}${tarefa.titulo.length > 25 ? '...' : ''}`)
      }

      console.log(`\n${cores.dim}Legenda: Urg=Urgência, Pri=Prioridade, Dep=Dependentes, Prof=Profundidade${cores.reset}`)
      console.log(`${cores.dim}Fórmula: (Urg×2) + (Pri×3) + (Dep×4) + (Prof×1)${cores.reset}`)
      console.log(`${cores.dim}Maior score = maior prioridade${cores.reset}\n`)
      break
    }

    // ========================================
    // HELP - Ajuda
    // ========================================
    default:
      console.log(`
${cores.azul}${cores.bold}📋 Zoryon Tasks - Gestão de Tarefas com Auto Priorização${cores.reset}

${cores.verde}Comandos básicos:${cores.reset}

  ${cores.amarelo}pnpm task add "titulo"${cores.reset}      Adicionar nova tarefa
  ${cores.amarelo}pnpm task list${cores.reset}              Listar todas as tarefas
  ${cores.amarelo}pnpm task next${cores.reset}              Iniciar próxima tarefa (por score)
  ${cores.amarelo}pnpm task done <id>${cores.reset}         Marcar tarefa como concluída
  ${cores.amarelo}pnpm task status${cores.reset}            Ver status geral do projeto
  ${cores.amarelo}pnpm task edit <id>${cores.reset}         Ver/editar detalhes da tarefa
  ${cores.amarelo}pnpm task priority <id> <p>${cores.reset} Mudar prioridade (alta/media/baixa)

${cores.ciano}Comandos de dependências:${cores.reset}

  ${cores.amarelo}pnpm task depends <id> --on <dep-id>${cores.reset}     Adicionar dependência
  ${cores.amarelo}pnpm task undepends <id> --from <dep-id>${cores.reset} Remover dependência
  ${cores.amarelo}pnpm task graph${cores.reset}                          Visualizar grafo de dependências

${cores.magenta}Auto priorização:${cores.reset}

  ${cores.amarelo}pnpm task scores${cores.reset}                         Ver scores de todas as tarefas

  ${cores.dim}Score = (Urgência×2) + (Prioridade×3) + (Dependentes×4) + (Profundidade×1)${cores.reset}
  ${cores.dim}Maior score = tarefa sugerida primeiro pelo "task next"${cores.reset}

${cores.cinza}Exemplos:${cores.reset}
  pnpm task add "Implementar login"
  pnpm task depends 3 --on 1     ${cores.dim}# Tarefa 3 depende da 1${cores.reset}
  pnpm task scores               ${cores.dim}# Ver scores calculados${cores.reset}
  pnpm task next                 ${cores.dim}# Inicia tarefa com maior score${cores.reset}
      `)
  }
}

main().catch(console.error)
