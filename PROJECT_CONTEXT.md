# Contexto do projeto — Arco (frontend)

Estado atual: **v1.0.0**. Next.js 16.2 + React 19, TypeScript, Tailwind 4, React Query, Axios,
React Hook Form + Zod, Recharts. Toda a interface é em pt-BR.

## Rotas

- `/` — redireciona para `/dashboard` ou `/login`.
- Públicas: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`.
- Protegidas: `/dashboard` (Início), `/habits`, `/habits/new`, `/habits/[id]/edit`,
  `/analytics`, `/history`, `/settings`.
- Cada rota tem um `layout.tsx` só com `metadata` (título "X · Arco"), já que as páginas são client components.
- `app/robots.ts`, `app/manifest.ts`, `app/favicon.ico`.

## Autenticação

- JWT: access token (15 min) + refresh token (7 dias) em `localStorage` (`lib/api/tokens.ts`).
- `lib/api/client.ts`: anexa o token, faz refresh em 401 com Web Locks entre abas; se outra aba já
  rotacionou o token, reutiliza o novo. Só encerra a sessão se o refresh for rejeitado (4xx);
  falhas de rede/5xx não apagam tokens.
- `lib/contexts/auth-context.tsx`: carrega `/api/auth/me`, mantém perfil em cache para falhas
  transitórias, sincroniza login/logout entre abas via evento `storage`. Logout chama
  `POST /api/auth/logout` (melhor esforço) antes de limpar os tokens.
- `ProtectedRoute` preserva o destino em `?next=` (validado em `lib/utils/redirect.ts`).
- Verificação de e-mail é opcional: banner não bloqueante no `AppLayout`.

## Erros

O backend responde `{ error, code? }`. O interceptor lança `ApiError` (`status`, `code`) e a UI usa
`getErrorMessage()` de `lib/api/errors.ts` — nunca exibe a mensagem crua do backend.

## Regras de domínio no cliente

- `frequencyDays`: 0 = domingo … 6 = sábado (mesma convenção de `Date.getDay()` e do backend).
- Semana começa na segunda-feira (igual ao `GetWeeklyScores` do backend); hábitos "X vezes por
  semana" mostram "x/N nesta semana" no Início (conta check-ins feitos/parciais).
- Check-ins podem ser alterados no Início e no Histórico; datas futuras são bloqueadas.
- Sem limite de hábitos (não há planos pagos). Hábitos arquivados podem ser restaurados.

## PWA

- `public/sw.js`: cache versionado (`CACHE_VERSION`), navegação network-first com fallback para
  `public/offline.html`, cache-first para assets estáticos; nunca intercepta a API nem outras origens.
- Ícones gerados a partir da arte original: `icon-192/512.png`, `icon-maskable-512.png`,
  `apple-touch-icon.png`, `favicon-32/48.png` e `app/favicon.ico`.

## Configuração

- `NEXT_PUBLIC_API_URL` obrigatório em produção (build falha sem ele); `NEXT_PUBLIC_SITE_URL` opcional.
- `next.config.ts`: cabeçalhos de segurança (CSP só em produção) e `NEXT_PUBLIC_APP_VERSION` lido do `package.json`.

## Documentos

- `README.md` — visão geral, variáveis, scripts e deploy.
- `AUTH_IMPLEMENTATION.md`, `FRONTEND_AUTH_GUIDE.md`, `FRONTEND_PLAN.md` — históricos.
