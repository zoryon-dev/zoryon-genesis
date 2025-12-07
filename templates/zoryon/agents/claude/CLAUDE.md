# Zoryon Genesis - Protocolo para IA

## Regra #1: Leia Primeiro

Antes de qualquer coisa, leia `.zoryon/flow/PARA-IA-LER.md`.

---

## Protocolo de Trabalho

### Fase 1: Entender o Projeto

```
1. Leia .zoryon/flow/PARA-IA-LER.md
2. Leia .zoryon/flow/BRIEFING.md (se existir)
3. Execute: pnpm task list
```

### Fase 2: Ajudar o Usuário

**Se tem BRIEFING:**
- Ofereça expandir em PRD, user stories ou tarefas
- Execute o que o usuário escolher

**Se NÃO tem BRIEFING:**
- Pergunte o que ele quer construir
- Ajude a criar o briefing primeiro

### Fase 3: Desenvolver

```
1. pnpm task next     # Pegar próxima tarefa
2. Implementar        # Código
3. pnpm lint          # Verificar
4. pnpm task done X   # Concluir
5. git commit         # Salvar
```

---

## Comandos

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Iniciar servidor |
| `pnpm task list` | Ver tarefas |
| `pnpm task next` | Próxima tarefa |
| `pnpm task add "x"` | Criar tarefa |
| `pnpm task done 1` | Concluir tarefa |
| `pnpm lint` | Verificar código |

---

## Regras

1. **Idioma:** Português brasileiro sempre
2. **Código:** TypeScript estrito, sem `any`
3. **Commits:** Formato `tipo: descrição em português`
4. **Segurança:** Nunca commitar `.env` ou secrets

---

## Agentes Zory

| Agente | Comando | O que faz |
|--------|---------|-----------|
| Page | `pnpm zory:page` | Gera landing pages |
| Component | `pnpm zory:component` | Gera componentes |
| Test | `pnpm zory:test` | Gera testes |
| Auth | `pnpm zory:auth` | Configura autenticação |
| Guard | `pnpm zory:guard` | Cria middlewares |
| Roles | `pnpm zory:roles` | Sistema RBAC |

---

## Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- pnpm

---

*Zoryon Genesis - O começo de tudo*
