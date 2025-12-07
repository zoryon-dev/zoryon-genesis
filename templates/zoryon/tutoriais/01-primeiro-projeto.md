# Tutorial 01: Primeiro Projeto

Aprenda a criar e rodar seu primeiro projeto com Zoryon Genesis.

---

## O Que Você Vai Aprender

- Criar um novo projeto
- Entender a estrutura de pastas
- Rodar o servidor de desenvolvimento
- Fazer sua primeira modificação

---

## Pré-requisitos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Editor de código (VS Code recomendado)

---

## Passo 1: Criar o Projeto

Se você clonou o Zoryon Genesis:

```bash
cd zoryon-genesis
pnpm install
pnpm create
```

O assistente vai te guiar para escolher:
- Nome do projeto
- Estrutura (Turborepo, workspaces ou single)
- Autenticação (Clerk, Supabase ou nenhum)
- Banco de dados (Prisma, Supabase ou nenhum)
- Testes e CI/CD

---

## Passo 2: Entrar no Projeto

```bash
cd meu-projeto
```

---

## Passo 3: Configurar Ambiente

```bash
cp .env.example .env
```

Abra o `.env` no seu editor e configure as variáveis necessárias.

---

## Passo 4: Instalar Dependências

```bash
pnpm install
```

---

## Passo 5: Iniciar Servidor

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Estrutura do Projeto

### Projeto Único

```
meu-projeto/
├── src/
│   ├── app/              # Páginas (App Router)
│   │   ├── layout.tsx    # Layout principal
│   │   └── page.tsx      # Página inicial
│   ├── components/       # Componentes React
│   └── lib/              # Utilitários
├── public/               # Arquivos estáticos
├── .zoryon/              # Configurações Zoryon
├── .env.example          # Template de variáveis
└── package.json          # Dependências
```

### Turborepo

```
meu-projeto/
├── apps/
│   └── web/              # Aplicação Next.js
├── packages/
│   ├── ui/               # Componentes compartilhados
│   └── database/         # Prisma
├── turbo.json            # Config Turborepo
└── pnpm-workspace.yaml   # Config workspaces
```

---

## Passo 6: Primeira Modificação

Abra `src/app/page.tsx` (ou `apps/web/src/app/page.tsx` se Turborepo):

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">
        Meu Primeiro Projeto!
      </h1>
    </main>
  )
}
```

Salve e veja a mudança automaticamente no browser.

---

## Passo 7: Usar Zoryon Tasks

```bash
# Ver tarefas iniciais
pnpm task list

# Iniciar próxima tarefa
pnpm task next

# Quando terminar
pnpm task done 1
```

---

## Próximos Passos

| Tutorial | Descrição |
|----------|-----------|
| [Executar com IA](./02-executar-com-ia.md) | Use Claude ou Cursor para desenvolver |
| [Deploy na Vercel](./03-deploy-vercel.md) | Publique na internet |
| [Auth com Clerk](./04-auth-clerk.md) | Adicione login |

---

## Dicas

1. **Hot Reload:** Alterações são aplicadas automaticamente
2. **TypeScript:** Erros aparecem em tempo real
3. **Tailwind:** Classes CSS utilitárias prontas para usar
4. **Zoryon Tasks:** Use para organizar seu trabalho

---

*Zoryon Genesis - O começo de tudo*
