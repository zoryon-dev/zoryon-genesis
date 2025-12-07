# Zory-Roles: Sistema RBAC

Agente para gerar sistema de permissões e roles (RBAC - Role-Based Access Control).

---

## Como Usar

```bash
# Modo interativo
node .zoryon/scripts/zory-roles.mjs

# Modo rápido (gera tudo)
node .zoryon/scripts/zory-roles.mjs --quick
```

---

## O que Gera

1. **Schema Prisma** - Models para User, Role, Permission
2. **Hook usePermissions()** - Verificar permissões no client
3. **Componente <Can>** - Controle de acesso declarativo
4. **Utilitários** - Funções helpers

---

## Conceitos

- **Role**: Grupo de permissões (ex: ADMIN, EDITOR, VIEWER)
- **Permission**: Ação específica (ex: posts:create, users:delete)
- **Resource**: Entidade protegida (ex: post, user, comment)

---

## Formato de Permissões

```
<resource>:<action>

Exemplos:
posts:create
posts:read
posts:update
posts:delete
posts:*        (todas ações em posts)
*:*            (admin - todas permissões)
```

---

## Uso

### Componente <Can>

```tsx
import { Can } from '@/components/Can'

<Can permission="posts:create">
  <CreatePostButton />
</Can>

<Can role="ADMIN" fallback={<div>Admin only</div>}>
  <AdminPanel />
</Can>
```

### Hook usePermissions()

```tsx
import { usePermissions } from '@/hooks/usePermissions'

function Component() {
  const { hasPermission, hasRole } = usePermissions()

  if (hasPermission('posts:delete')) {
    return <DeleteButton />
  }

  if (hasRole('ADMIN')) {
    return <AdminPanel />
  }

  return null
}
```

### API Route Protection

```ts
import { auth } from '@/auth'
import { hasPermission } from '@/lib/permissions'

export async function DELETE(req: Request) {
  const session = await auth()

  if (!hasPermission(session.user.role, 'posts:delete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete logic...
}
```

---

## Roles Padrão

| Role | Permissões |
|------|------------|
| ADMIN | *:* (todas) |
| EDITOR | posts:*, comments:moderate |
| VIEWER | posts:read, comments:read |
| USER | posts:read, comments:create |

---

## Setup

1. Gere arquivos: `node .zoryon/scripts/zory-roles.mjs --quick`
2. Merge `schema-rbac.prisma` com `schema.prisma`
3. Rode: `pnpm db:push`
4. Seed roles e permissões iniciais
5. Use nos componentes!

---

*Zoryon Genesis - O começo de tudo*
