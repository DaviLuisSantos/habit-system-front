# Arco — Frontend

Arco é um rastreador de hábitos: você cadastra hábitos com peso e frequência
(diário, dias específicos ou X vezes por semana), registra check-ins diários
(feito, parcial ou pulado) e acompanha sua pontuação, histórico e evolução.

Este repositório contém o frontend web (PWA instalável). A API fica no projeto
`HabitSystem` (.NET 9 + SQLite).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- TanStack React Query (estado do servidor) e Axios (HTTP + refresh de token)
- React Hook Form + Zod (formulários)
- Recharts (gráficos) e date-fns (datas, `pt-BR`)

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Sim em produção | URL base da API (ex.: `https://api.seudominio.com`). Em desenvolvimento, o padrão é `http://localhost:5232`. O build de produção falha se não estiver definida. Também é usada no `connect-src` da CSP. |
| `NEXT_PUBLIC_SITE_URL` | Não | URL pública do frontend. Habilita `metadataBase` e a imagem Open Graph. |

As variáveis `NEXT_PUBLIC_*` são embutidas no bundle **no momento do build** — altere-as e gere um novo build.

## Scripts

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
npm run start   # serve o build de produção
```

## Deploy

1. Defina `NEXT_PUBLIC_API_URL` (e opcionalmente `NEXT_PUBLIC_SITE_URL`) no ambiente de build.
2. `npm ci && npm run build && npm run start` (ou use a plataforma de sua preferência com suporte a Next.js).
3. Na API, libere o CORS para a origem do frontend.
4. Ao lançar uma nova versão, atualize `version` no `package.json` (exibida em Configurações)
   e `CACHE_VERSION` em `public/sw.js` para invalidar o cache do service worker.

Cabeçalhos de segurança (CSP, `X-Frame-Options`, `Referrer-Policy` etc.) são definidos em
`next.config.ts`; a CSP é aplicada apenas em produção.

## Estrutura

- `app/` — rotas (App Router). Páginas são client components; títulos vêm de `layout.tsx` por rota.
- `components/` — componentes por funcionalidade; `components/ui/` tem os primitivos compartilhados.
- `hooks/` — hooks do React Query (hábitos, check-ins, pontuações).
- `lib/api/` — cliente Axios, refresh de token entre abas, tradução de erros (`errors.ts`).
- `lib/contexts/` — `AuthContext` (sessão, sincronização entre abas).
- `public/` — ícones, `sw.js` (service worker) e `offline.html`.
