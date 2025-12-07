# Comando: /revisar

Revise o código atual e sugira melhorias.

## O que fazer:

1. Execute `pnpm lint` para verificar erros de lint

2. Execute `pnpm typecheck` para verificar tipos

3. Execute `pnpm security:scan` para verificar segurança

4. Analise os resultados e identifique:
   - Erros críticos
   - Warnings importantes
   - Sugestões de melhoria

5. Para cada problema encontrado:
   - Explique o que está errado
   - Mostre como corrigir
   - Pergunte se deve aplicar a correção

6. Se tudo estiver OK:
   - Confirme que o código está pronto
   - Sugira fazer commit

## Áreas de revisão:
- Segurança (secrets expostos, SQL injection, XSS)
- Performance (loops desnecessários, re-renders)
- Legibilidade (nomes de variáveis, comentários)
- Tipagem (any, tipos faltando)

## Responda em português brasileiro.
