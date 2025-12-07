# Prompts Úteis para Cursor

Copie e cole estes prompts no chat do Cursor.

---

## Início de Sessão

### Entender o Projeto

```
@.zoryon/docs/COMECE-AQUI.md

Leia este arquivo e me dê um resumo do projeto.
Em seguida, execute `pnpm task list` para ver as tarefas pendentes.
```

### Ver Próxima Tarefa

```
Execute `pnpm task next` e me ajude a implementar a tarefa.
Explique o que precisa ser feito e quais arquivos serão modificados.
```

---

## Desenvolvimento

### Criar Componente

```
Crie um componente [NOME] em src/components/[PASTA]/[nome].tsx

Requisitos:
- TypeScript com tipos explícitos
- Tailwind CSS para estilos
- Responsivo (mobile-first)
- Acessível (aria-labels quando necessário)
- Comentários em português explicando lógica complexa
```

### Criar API Route

```
Crie uma API route em src/app/api/[ROTA]/route.ts

Requisitos:
- Validação de input
- Tratamento de erros
- Tipos TypeScript para request e response
- Comentários explicando a lógica
```

### Criar Hook

```
Crie um hook use[NOME] em src/hooks/use[NOME].ts

O hook deve:
- [DESCREVA A FUNCIONALIDADE]
- Ter tipos TypeScript
- Incluir tratamento de erros
- Ter comentários explicando o uso
```

---

## Refatoração

### Melhorar Componente

```
@src/components/[ARQUIVO]

Analise este componente e sugira melhorias:
- Performance
- Legibilidade
- Tipagem
- Acessibilidade
```

### Extrair Lógica

```
@src/[ARQUIVO]

A lógica [DESCRIÇÃO] está muito acoplada.
Extraia para um hook ou utilitário separado.
```

---

## Debugging

### Resolver Erro

```
Estou com este erro:

[COLE O ERRO AQUI]

Me ajude a:
1. Entender a causa
2. Encontrar onde está o problema
3. Implementar a solução
```

### Verificar Código

```
Execute:
- pnpm lint
- pnpm typecheck
- pnpm security:scan

Me mostre os erros e sugira correções.
```

---

## Git

### Preparar Commit

```
Revise as alterações atuais e sugira uma mensagem de commit seguindo o padrão:

tipo: descrição

Tipos: feat, fix, docs, style, refactor, test, chore
```

### Criar Branch

```
Vou trabalhar na feature [DESCRIÇÃO].
Sugira um nome de branch seguindo o padrão:
feature/[nome-descritivo]
```

---

## Documentação

### Documentar Função

```
@src/[ARQUIVO]

Adicione JSDoc a todas as funções deste arquivo.
Inclua:
- Descrição
- @param para cada parâmetro
- @returns para o retorno
- @example com uso básico
```

### Atualizar README

```
Atualize o README.md com:
- Nova feature que implementamos
- Comandos adicionados
- Configurações necessárias
```

---

## Tarefas

### Adicionar Tarefa

```
Execute: pnpm task add "[TÍTULO DA TAREFA]"

Depois, use pnpm task edit [ID] para adicionar uma descrição detalhada.
```

### Concluir Tarefa

```
A tarefa #[ID] foi concluída.
Execute `pnpm task done [ID]` e sugira a próxima tarefa.
```

---

## Dicas

1. Use `@arquivo` para referenciar arquivos específicos
2. Use `@pasta/` para referenciar pastas inteiras
3. Seja específico nas instruções
4. Peça explicações quando não entender

---

*Zoryon Genesis - O começo de tudo*
