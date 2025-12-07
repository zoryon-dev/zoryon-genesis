# Como Usar MCP (Model Context Protocol)

MCP permite que IAs acessem ferramentas externas como banco de dados, arquivos e APIs.

---

## Configuração Rápida

### Passo 1: Criar arquivo

Crie `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {}
}
```

### Passo 2: Adicionar MCPs

Copie a configuração dos templates desta pasta.

### Passo 3: Reiniciar IA

Reinicie o Claude Code ou sua IA para carregar as configurações.

---

## Templates Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `filesystem.json` | Acesso a arquivos do projeto |
| `memory.json` | Memória persistente entre sessões |
| `context7.json` | Documentação atualizada de bibliotecas |
| `supabase.json` | Acesso ao banco Supabase |
| `github.json` | Gerenciamento de repositórios |

---

## Exemplo de Uso

### Configuração Básica

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
    }
  }
}
```

### Configuração Completa

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
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJ..."
      }
    }
  }
}
```

---

## Segurança

⚠️ **Nunca commite chaves secretas!**

Adicione ao `.gitignore`:

```
.mcp.json
```

Use um template para compartilhar:

```bash
cp .mcp.json .mcp.json.example
# Remova as chaves do .example
```

---

## Referências

- [Documentação MCP](https://modelcontextprotocol.io/)
- [Tutorial Completo](../tutoriais/11-adicionar-mcp.md)

---

*Zoryon Genesis - O começo de tudo*
