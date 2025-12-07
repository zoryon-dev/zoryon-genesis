# Zory-Pages: Agente de Landing Pages

O Zory-Pages é um agente especializado que gera prompts otimizados para criar landing pages de alta conversão.

---

## Como Usar

### Executar o Briefing

```bash
node .zoryon/scripts/zory-pages.mjs
```

### Modo Rápido (SaaS)

```bash
node .zoryon/scripts/zory-pages.mjs --quick
```

### Com Presets

```bash
node .zoryon/scripts/zory-pages.mjs --style=glassmorphism --industry=fintech
```

---

## Fluxo de Trabalho

```
1. BRIEFING        →  Responde perguntas sobre objetivo, estilo, público
2. STYLE GUIDE     →  Sistema define paleta, tipografia, componentes
3. PROMPT          →  Gera prompt em inglês para v0.dev/Claude/Cursor
4. GERAÇÃO         →  Cole o prompt na ferramenta de IA e obtenha o código
5. IMPLEMENTAÇÃO   →  Salve em src/app/page.tsx e ajuste
```

---

## Estilos Visuais Disponíveis

| Estilo | Descrição | Ideal para |
|--------|-----------|------------|
| **minimalism** | Clean, muito espaço branco | SaaS, portfolios |
| **glassmorphism** | Efeito vidro fosco, moderno | Fintech, apps |
| **gradient** | Dark mode com gradientes vibrantes | Startups, tech |
| **brutalism** | Bold, raw, impactante | Criativos, agências |
| **neumorphism** | Soft UI, 3D sutil | Apps, interfaces |
| **material** | Cards, sombras, Google | Enterprise, B2B |

---

## Indústrias Suportadas

| Indústria | Foco | Seções Recomendadas |
|-----------|------|---------------------|
| **SaaS** | Trial/signup | Hero, logos, features, pricing |
| **Fintech** | Confiança + inovação | Security, app mockup, compliance |
| **E-commerce** | Vendas | Produto, reviews, urgência |
| **Healthcare** | Confiança | Trust badges, testimonials |
| **Education** | Inscrições | Curriculum, instructor, FAQs |

---

## Arquitetura dos Arquivos

```
.zoryon/pages/
├── briefing.json          # Perguntas do briefing
├── styles/
│   ├── minimalism.json    # Configs de estilo
│   ├── glassmorphism.json
│   └── gradient.json
├── industries/
│   ├── saas.json          # Configs por indústria
│   └── fintech.json
├── templates/
│   ├── prompt-system.md   # Template do prompt
│   └── sections.json      # Configs das seções
└── output/                # Prompts gerados
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `--quick` | Modo rápido com padrões SaaS |
| `--style=X` | Define estilo visual |
| `--industry=X` | Define indústria |
| `--prompt` | Apenas gera o prompt |
| `--list` | Lista opções disponíveis |
| `--help` | Mostra ajuda |

---

## Seções Disponíveis

| Seção | Descrição |
|-------|-----------|
| **hero** | Primeira impressão, headline + CTA |
| **logos** | Social proof com logos de clientes |
| **features** | Benefícios com ícones |
| **how-it-works** | Passos numerados |
| **testimonials** | Depoimentos de clientes |
| **pricing** | Tabela de preços |
| **faq** | Perguntas frequentes |
| **cta-final** | Chamada final para ação |
| **stats** | Números impressionantes |
| **form** | Formulário de captura |

---

## Exemplo de Uso

### 1. Execute o briefing

```bash
node .zoryon/scripts/zory-pages.mjs
```

### 2. Responda as perguntas

```
Qual o objetivo principal da landing page?
> 3 (SaaS Trial)

Qual a indústria?
> 1 (SaaS)

Qual estilo visual?
> 1 (Minimalism)

...
```

### 3. Copie o prompt gerado

O sistema gera um prompt estruturado em inglês, otimizado para:
- v0.dev
- Claude
- Cursor
- ChatGPT

### 4. Cole na ferramenta de IA

Acesse [v0.dev](https://v0.dev) ou use o Claude e cole o prompt.

### 5. Implemente

Salve o código gerado em `src/app/page.tsx` e ajuste conforme necessário.

---

## Melhores Práticas de Conversão

O prompt já inclui as melhores práticas:

1. **Above the fold**: Headline, subheadline e CTA visíveis sem scroll
2. **Social proof**: Logos, testimonials, números
3. **CTA claro**: Texto de ação, cor contrastante
4. **Benefícios > Features**: Foco em resultados
5. **Mobile-first**: 83% do tráfego é mobile
6. **Carregamento rápido**: Imagens otimizadas

---

## Fontes de Pesquisa

O sistema foi desenvolvido baseado em:

- [Unbounce Landing Page Best Practices](https://unbounce.com)
- [Landingi 25 Best Practices 2025](https://landingi.com)
- [v0.dev by Vercel](https://v0.dev)
- [Magic UI Components](https://magicui.design)
- [ShadCN UI](https://ui.shadcn.com)

---

## Próximos Passos

Após gerar a landing page:

1. **Teste mobile**: Verifique responsividade
2. **Otimize imagens**: Use Next/Image
3. **Adicione analytics**: Google Analytics, Plausible
4. **Teste A/B**: Experimente headlines diferentes
5. **Deploy**: Use `pnpm build && pnpm start`

---

*Zoryon Genesis - O começo de tudo*
