# Implementação de Autenticação JWT - Frontend

## 📋 Resumo da Implementação

Sistema completo de autenticação JWT implementado no frontend do Habit System, incluindo login, registro, proteção de rotas e renovação automática de tokens.

## 🗂️ Arquivos Criados

### 1. Types e Interfaces
- **`lib/types/auth.ts`**: Interfaces TypeScript para autenticação
  - `LoginRequest`, `RegisterRequest`
  - `AuthResponse`, `UserProfile`
  - `RefreshRequest`, `RefreshResponse`

### 2. Serviços de API
- **`lib/api/auth.ts`**: Service de autenticação
  - Métodos: `register()`, `login()`, `getCurrentUser()`, `refreshToken()`, `logout()`
  - Gerenciamento de tokens no localStorage
  - Verificação de autenticação

- **`lib/api/client.ts`** (atualizado): Cliente Axios com interceptors
  - Request interceptor: adiciona token automaticamente
  - Response interceptor: renova token expirado (401)
  - Fila de requisições durante refresh
  - Redirecionamento automático em falha de autenticação

### 3. Contexto e Hooks
- **`lib/contexts/auth-context.tsx`**: Context Provider de autenticação
  - Estado global do usuário
  - Métodos: `login()`, `register()`, `logout()`
  - Loading state para inicialização
  - Hook: `useAuth()`

### 4. Componentes de Proteção
- **`components/shared/protected-route.tsx`**: Protege rotas autenticadas
  - Redireciona para `/login` se não autenticado
  - Loading state durante verificação

- **`components/shared/public-only-route.tsx`**: Protege rotas públicas
  - Redireciona para `/dashboard` se já autenticado
  - Útil para páginas de login/registro

### 5. Páginas
- **`app/login/page.tsx`**: Página de login
  - Formulário com email e senha
  - Validação e tratamento de erros
  - Link para página de registro
  - Protegida com `PublicOnlyRoute`

- **`app/register/page.tsx`**: Página de registro
  - Formulário completo (nome, email, senha, confirmação)
  - Validação de senha (mínimo 6 caracteres)
  - Confirmação de senha
  - Protegida com `PublicOnlyRoute`

- **`app/page.tsx`** (atualizado): Página inicial
  - Redireciona para `/dashboard` se autenticado
  - Redireciona para `/login` se não autenticado

### 6. Integrações
- **`components/providers.tsx`** (atualizado): Provider principal
  - Adicionado `AuthProvider` na árvore de providers

- **`components/layout/sidebar.tsx`** (atualizado): Sidebar
  - Exibe informações do usuário
  - Botão de logout
  - Avatar com iniciais

- **`app/settings/page.tsx`** (atualizado): Página de configurações
  - Card de perfil do usuário
  - Informações: nome, email, timezone, data de criação
  - Botão de logout destacado

### 7. Páginas Protegidas
Todas as páginas principais foram atualizadas com `ProtectedRoute`:
- `app/dashboard/page.tsx`
- `app/habits/page.tsx`
- `app/habits/new/page.tsx`
- `app/habits/[id]/edit/page.tsx`
- `app/analytics/page.tsx`
- `app/settings/page.tsx`

## 🔐 Funcionalidades Implementadas

### Autenticação
- ✅ Login com email e senha
- ✅ Registro de novo usuário
- ✅ Logout (limpa tokens e redireciona)
- ✅ Persistência de sessão (localStorage)

### Gerenciamento de Tokens
- ✅ Armazenamento seguro no localStorage
- ✅ Renovação automática de token expirado
- ✅ Interceptor para adicionar token em requisições
- ✅ Fila de requisições durante refresh
- ✅ Tratamento de erros de autenticação

### Proteção de Rotas
- ✅ Rotas protegidas (requer autenticação)
- ✅ Rotas públicas (redireciona se autenticado)
- ✅ Loading states durante verificação
- ✅ Redirecionamento automático

### UI/UX
- ✅ Formulários de login e registro estilizados
- ✅ Mensagens de erro amigáveis
- ✅ Loading states em formulários
- ✅ Informações do usuário no sidebar
- ✅ Perfil de usuário na página de settings
- ✅ Botão de logout visível

## 🔄 Fluxo de Autenticação

### Login/Registro
1. Usuário preenche formulário
2. Frontend envia requisição para API
3. API retorna `accessToken` e `refreshToken`
4. Tokens salvos no localStorage
5. Estado do usuário atualizado no context
6. Redirecionamento para `/dashboard`

### Requisições Autenticadas
1. Interceptor adiciona `Authorization: Bearer {token}` automaticamente
2. Se retornar 401 (token expirado):
   - Chama `/api/auth/refresh` automaticamente
   - Atualiza tokens no localStorage
   - Reenvia requisição original com novo token
   - Se refresh falhar, faz logout e redireciona

### Logout
1. Remove tokens do localStorage
2. Limpa estado do usuário no context
3. Redireciona para `/login`

## 📝 Variáveis de Ambiente

Certifique-se de configurar a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:5232
```

## 🧪 Como Testar

1. **Registro de Novo Usuário**
   - Acesse `/register`
   - Preencha nome, email, senha
   - Clique em "Criar conta"
   - Deve redirecionar para `/dashboard`

2. **Login**
   - Acesse `/login`
   - Entre com email e senha
   - Clique em "Entrar"
   - Deve redirecionar para `/dashboard`

3. **Proteção de Rotas**
   - Sem estar logado, tente acessar `/dashboard`
   - Deve redirecionar para `/login`
   - Já logado, tente acessar `/login`
   - Deve redirecionar para `/dashboard`

4. **Renovação de Token**
   - Deixe o token expirar (15 minutos)
   - Faça qualquer requisição
   - Token deve ser renovado automaticamente

5. **Logout**
   - Clique no botão "Sair" no sidebar ou settings
   - Deve limpar sessão e redirecionar para `/login`

## 🔒 Segurança

### Implementado
- ✅ Tokens JWT com expiração
- ✅ Refresh token para renovação
- ✅ Verificação de autenticação no frontend
- ✅ Proteção de rotas sensíveis
- ✅ Limpeza de tokens no logout

### Recomendações Futuras
- 🔄 Migrar para cookies HttpOnly (mais seguro que localStorage)
- 🔄 Implementar CSRF protection
- 🔄 Rate limiting no backend
- 🔄 2FA (autenticação de dois fatores)

## 🎯 Próximos Passos

1. Testar integração com backend real
2. Implementar recuperação de senha
3. Adicionar validação de email
4. Implementar edição de perfil
5. Adicionar foto de perfil
6. Melhorar feedback de erros

## 📚 Referências

- FRONTEND_AUTH_GUIDE.md - Guia completo de implementação
- Next.js 16 Documentation
- React Query para gerenciamento de estado
- Axios para requisições HTTP
