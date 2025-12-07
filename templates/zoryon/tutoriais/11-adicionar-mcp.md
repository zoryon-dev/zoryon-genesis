# Tutorial 11: Adicionar MCP

Configure Model Context Protocol para potencializar suas IAs.

---

## O Que Você Vai Aprender

- O que é MCP
- Configurar MCPs úteis
- Usar com Claude Code
- Templates prontos

---

## O Que é MCP?

MCP (Model Context Protocol) permite que IAs acessem ferramentas externas:

- 📂 **Filesystem:** Ler/escrever arquivos
- 🗄️ **Supabase:** Acessar banco de dados
- 📝 **Memory:** Lembrar informações
- 🐙 **GitHub:** Gerenciar repositórios
- 📚 **Context7:** Documentação atualizada

---

## Passo 1: Criar Arquivo de Configuração

Crie `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {}
}
```

---

## Passo 2: Adicionar MCPs

### Filesystem (Acesso a Arquivos)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "."]
    }
  }
}
```

### Memory (Memória Persistente)

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    }
  }
}
```

### Context7 (Documentação Atualizada)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

### Supabase (Banco de Dados)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJ..."
      }
    }
  }
}
```

> **Atenção:** Nunca commite chaves secretas! Use variáveis de ambiente.

### GitHub (Repositórios)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    }
  }
}
```

---

## Passo 3: Configuração Completa

Exemplo de `.mcp.json` com múltiplos MCPs:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "."]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

---

## Passo 4: Usar com Claude Code

### Reiniciar Claude Code

Após configurar o `.mcp.json`, reinicie o Claude Code:

```bash
claude
```

### Verificar MCPs Ativos

Digite no Claude:

```
Quais MCPs estão disponíveis?
```

### Usar Filesystem

```
Leia o arquivo src/app/page.tsx
```

### Usar Memory

```
Lembre que o projeto usa Tailwind CSS 4 e React 19
```

### Usar Context7

```
Busque a documentação atualizada do Next.js 16 sobre App Router
```

---

## Templates Prontos

### Template Mínimo

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "."]
    }
  }
}
```

### Template Desenvolvimento

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "."]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

### Template Completo

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "."]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## Segurança

### Não Commite Secrets

Adicione ao `.gitignore`:

```
.mcp.json
```

Ou use variáveis de ambiente:

```json
{
  "mcpServers": {
    "supabase": {
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}"
      }
    }
  }
}
```

### Template para Commitar

Crie `.mcp.json.example`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "."]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "SUA_URL_AQUI",
        "SUPABASE_SERVICE_ROLE_KEY": "SUA_CHAVE_AQUI"
      }
    }
  }
}
```

---

## Casos de Uso

### Desenvolvimento com Supabase

```
Configure o MCP do Supabase.
Crie uma tabela 'posts' com id, title, content, created_at.
Insira alguns dados de teste.
```

### Pesquisa de Documentação

```
Use o Context7 para buscar como usar Server Actions no Next.js 16.
```

### Memória de Projeto

```
Lembre as decisões de arquitetura:
- Usamos Zustand para estado global
- API routes para backend
- Prisma com PostgreSQL
```

### Gerenciamento GitHub

```
Crie uma issue no repositório:
Título: "Adicionar dark mode"
Descrição: "Implementar toggle de tema claro/escuro"
Labels: enhancement
```

---

## Solução de Problemas

### MCP Não Conecta

1. Verifique se o `.mcp.json` está na raiz
2. Reinicie o Claude Code
3. Verifique erros no terminal

### Comando Não Encontrado

```bash
# Instale o MCP globalmente
npm install -g @anthropic-ai/mcp-server-filesystem
```

### Permissão Negada

Verifique se o diretório está acessível:

```bash
ls -la .
```

---

## MCPs Disponíveis

| MCP | Descrição | Repo |
|-----|-----------|------|
| filesystem | Acesso a arquivos | @anthropic-ai/mcp-server-filesystem |
| memory | Memória persistente | @anthropic-ai/mcp-server-memory |
| context7 | Documentação | @context7/mcp-server |
| supabase | Banco de dados | @supabase/mcp-server |
| github | Repositórios | @anthropic-ai/mcp-server-github |
| postgres | PostgreSQL | @anthropic-ai/mcp-server-postgres |
| sqlite | SQLite | @anthropic-ai/mcp-server-sqlite |

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [Executar com IA](./02-executar-com-ia.md) | Usar MCPs no workflow |
| [Banco com Supabase](./07-banco-supabase.md) | Configurar Supabase |

---

*Zoryon Genesis - O começo de tudo*
