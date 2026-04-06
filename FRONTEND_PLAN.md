# Plano de Implementação - Habit System Frontend (Fase 2)

## 📋 Objetivo
Criar o frontend do Habit System usando Next.js 14 (App Router) com TypeScript, consumindo a API já implementada no backend.

## 🎯 Escopo da Fase 2

### ✅ Incluído
- Setup do projeto Next.js 14 com TypeScript
- Integração com API backend (11 endpoints)
- 4 páginas principais (Dashboard, Habits, Analytics, Settings)
- Sistema de check-in interativo
- Visualização de scores e progresso
- Gerenciamento de hábitos (CRUD)
- Gráficos de evolução semanal
- Design responsivo (mobile-first)

### ❌ Fora do Escopo (Fase 3+)
- Autenticação/Login (ainda single-user)
- Notificações push
- PWA/Offline mode
- Dark mode
- Internacionalização (i18n)

## 🏗️ Estrutura do Projeto

```
/habit-system-front
  /app                    ← App Router (Next.js 14)
    /dashboard
      page.tsx            ← Dashboard principal
    /habits
      page.tsx            ← Lista de hábitos
      /new
        page.tsx          ← Criar hábito
      /[id]
        /edit
          page.tsx        ← Editar hábito
    /analytics
      page.tsx            ← Análise semanal/mensal
    layout.tsx            ← Layout global
    page.tsx              ← Redirect para /dashboard
      
  /components             ← Componentes React
    /ui                   ← Componentes base (shadcn/ui)
      button.tsx
      card.tsx
      dialog.tsx
      ...
    /habits
      HabitCard.tsx       ← Card de hábito com botão check-in
      HabitForm.tsx       ← Formulário criar/editar
      HabitList.tsx       ← Lista de hábitos
    /dashboard
      ScoreWidget.tsx     ← Widget de score do dia
      WeeklyChart.tsx     ← Gráfico da semana
      TodayCheckins.tsx   ← Check-ins de hoje
    /analytics
      WeeklyProgress.tsx  ← Progresso semanal
      HabitStats.tsx      ← Estatísticas por hábito
        
  /lib
    /api
      habits.ts           ← Funções de API para habits
      checkins.ts         ← Funções de API para check-ins
      scores.ts           ← Funções de API para scores
      client.ts           ← Axios client configurado
    /types
      habit.ts            ← TypeScript types do backend
      checkin.ts
      score.ts
    /utils
      date.ts             ← Helpers de data
      score.ts            ← Cálculos de score
        
  /hooks
    useHabits.ts          ← React Query hook para habits
    useCheckIns.ts        ← React Query hook para check-ins
    useScores.ts          ← React Query hook para scores
      
  /public
    /icons                ← Ícones do app
    
  .env.local              ← NEXT_PUBLIC_API_URL=http://localhost:5232
  next.config.js
  tailwind.config.ts
  tsconfig.json
  package.json
```

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.7.x",
    "date-fns": "^3.x",
    "recharts": "^2.x",
    "lucide-react": "^0.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
```

**Design System:** Tailwind CSS + shadcn/ui (componentes copiáveis, não lib)

## 🎨 Páginas e Funcionalidades

### 1. Dashboard (`/dashboard`) - PÁGINA PRINCIPAL

**Seções:**
- **Hero Section:**
  - Score do dia (número grande + porcentagem)
  - Frase motivacional baseada no score
  - Botão "Ver semana"

- **Check-ins de Hoje:**
  - Cards dos hábitos esperados hoje
  - Botões: ✅ Feito | ⚡ Parcial | ⏭️ Pular
  - Visual state: done (verde), partial (amarelo), pending (cinza)
  
- **Progresso Semanal:**
  - Gráfico de barras (7 dias)
  - Cada barra mostra score earned vs possible
  - Hover mostra detalhes do dia

**Endpoints usados:**
- `GET /api/habits?activeOnly=true` → hábitos ativos
- `GET /api/checkins/today` → check-ins já feitos
- `GET /api/scores/today` → score atual
- `GET /api/scores/week` → dados do gráfico
- `POST /api/checkins` → fazer check-in

**Layout:**
```
┌─────────────────────────────────┐
│  Score: 15/25 (60%) 🔥          │
│  "Bom trabalho! Continue assim" │
└─────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Exercise │ │ Reading  │ │ Coding   │
│  ✅ ⚡ ⏭️  │ │  ✅ ⚡ ⏭️  │ │  ✅ ⚡ ⏭️  │
│ (Feito)  │ │ (Pending)│ │ (Pending)│
└──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────┐
│  📊 Progresso da Semana         │
│  [Gráfico de barras]            │
└─────────────────────────────────┘
```

### 2. Hábitos (`/habits`) - GERENCIAMENTO

**Features:**
- Lista de todos os hábitos (ativos + arquivados tabs)
- Card por hábito com:
  - Nome, descrição, weight, frequência
  - Botões: ✏️ Editar | 🗑️ Arquivar
  - Badge de frequência (Daily, 3x/week, Seg/Qua/Sex)
- Botão flutuante "+ Novo Hábito"
- Search/filtro simples

**Endpoints usados:**
- `GET /api/habits?activeOnly=true/false`
- `DELETE /api/habits/{id}` → arquivar

**Modal/Página de Criar/Editar:**
- Formulário com React Hook Form + Zod
- Campos:
  - Nome* (max 100 chars)
  - Descrição (max 280 chars, textarea)
  - Weight* (1-10, slider)
  - Partial Weight* (0-10, slider)
  - Frequência*: Radio buttons
    - Daily
    - Specific Days (checkboxes: D S T Q Q S S)
    - X Times/Week (número 1-7)
- Validação client-side antes de enviar

**Endpoints:**
- `POST /api/habits` → criar
- `PUT /api/habits/{id}` → atualizar
- `GET /api/habits/{id}` → carregar para edição

### 3. Analytics (`/analytics`) - ANÁLISE

**Seções:**
- **Resumo do Mês:**
  - Média do score mensal
  - Dias acima de 80%
  - Melhor dia do mês
  
- **Evolução Semanal:**
  - Gráfico de linha (últimas 4 semanas)
  - Mostra tendência (subindo/descendo)
  
- **Por Hábito:**
  - Tabela ou cards
  - Nome | Completados | Taxa de sucesso | Última vez
  - Ordenável

**Endpoints usados:**
- `GET /api/scores/week?date=X` → múltiplas semanas
- `GET /api/checkins?startDate=X&endDate=Y` → check-ins do período
- `GET /api/habits` → lista de hábitos

### 4. Settings (Futuro, placeholder por enquanto)

Placeholder simples com:
- Sobre o app
- Versão
- Link para repositório

## 🎨 Design System & UI/UX

### Paleta de Cores

```css
/* Baseado em score/status */
--color-primary: #3B82F6;      /* Azul - principal */
--color-success: #10B981;      /* Verde - done */
--color-warning: #F59E0B;      /* Amarelo - partial */
--color-danger: #EF4444;       /* Vermelho - skipped */
--color-neutral: #6B7280;      /* Cinza - pending */

--color-bg: #F9FAFB;           /* Background */
--color-surface: #FFFFFF;      /* Cards */
--color-text: #111827;         /* Texto principal */
--color-text-muted: #6B7280;   /* Texto secundário */
```

### Componentes Base (shadcn/ui)

Instalar via CLI do shadcn:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog form input label select slider tabs badge
```

### Mobile-First Approach

- Breakpoints: sm (640px), md (768px), lg (1024px)
- Dashboard: 1 coluna mobile, 2-3 colunas desktop
- Navegação: Bottom nav mobile, Sidebar desktop

## 🔄 Fluxos Principais

### Fluxo 1: Check-in Diário

```
User entra no app
  ↓
Dashboard carrega
  ↓
GET /api/habits + GET /api/checkins/today + GET /api/scores/today
  ↓
Mostra hábitos esperados hoje
  ↓
User clica "✅ Feito" no habit "Exercise"
  ↓
POST /api/checkins { habitId, date: today, status: "Done" }
  ↓
Backend recalcula score (automático)
  ↓
React Query invalida cache de scores
  ↓
UI atualiza score em tempo real (15/25 → 23/25)
  ↓
Card do hábito muda para verde (Done)
```

### Fluxo 2: Criar Hábito

```
User clica "+ Novo Hábito"
  ↓
Modal/página abre com formulário vazio
  ↓
User preenche:
  - Nome: "Beber água"
  - Weight: 4
  - Partial: 2
  - Frequência: Daily
  ↓
Submit → validação Zod
  ↓
POST /api/habits { ... }
  ↓
React Query invalida cache de habits
  ↓
Redirect para /habits ou fecha modal
  ↓
Lista atualiza com novo hábito
```

### Fluxo 3: Ver Progresso Semanal

```
User clica "Ver semana" ou vai em /analytics
  ↓
GET /api/scores/week?date=today
  ↓
Recebe array de 7 DailyScores
  ↓
Recharts renderiza gráfico de barras
  ↓
User hover na barra de "Terça"
  ↓
Tooltip mostra: "Terça: 18/25 (72%)"
```

## 📱 Responsividade

### Layout Mobile (< 768px)

```
┌─────────────────┐
│  Header         │
├─────────────────┤
│                 │
│  Score Card     │
│  (Full Width)   │
│                 │
├─────────────────┤
│  Habit Card 1   │
│  (Stack)        │
├─────────────────┤
│  Habit Card 2   │
├─────────────────┤
│  Chart          │
│  (Full Width)   │
└─────────────────┘
│  Bottom Nav     │
└─────────────────┘
```

### Layout Desktop (≥ 768px)

```
┌──────┬──────────────────────────┐
│      │  Header                  │
│ Side ├──────────────────────────┤
│ bar  │  ┌───────┐  ┌──────────┐ │
│      │  │ Score │  │  Chart   │ │
│      │  └───────┘  └──────────┘ │
│      │                          │
│      │  ┌────┐ ┌────┐ ┌────┐   │
│      │  │ H1 │ │ H2 │ │ H3 │   │
│      │  └────┘ └────┘ └────┘   │
└──────┴──────────────────────────┘
```

## ✅ Progresso da Implementação

### Fase 2.1: Setup do Projeto ✅ DONE

- [x] Criar projeto Next.js 14 com TypeScript
- [x] Configurar Tailwind CSS
- [x] Instalar dependências (React Query, Axios, etc)
- [x] Criar estrutura de pastas
- [x] Setup de variáveis de ambiente (.env.local)
- [x] Configurar React Query Provider

### Fase 2.2: API Layer & Types ✅ DONE

- [x] Criar types TypeScript espelhando backend
- [x] Configurar Axios client
- [x] Criar API functions (habits, checkins, scores)
- [x] Criar React Query hooks

### Fase 2.3: Componentes Base ✅ DONE

- [x] Criar componentes UI (button, card, badge, input, dialog, tabs, etc)
- [x] Criar HabitCard component
- [x] Criar ScoreWidget component
- [x] Criar Loading states (skeletons)
- [x] Criar Error states

### Fase 2.4: Dashboard Page ✅ DONE

- [x] Criar layout da página (Sidebar + Bottom Nav)
- [x] Integrar useHabits, useCheckIns, useScores
- [x] Renderizar score do dia
- [x] Renderizar cards de hábitos com botões
- [x] Implementar ação de check-in
- [x] Adicionar feedback visual (toast)
- [x] Implementar gráfico semanal (Recharts)

### Fase 2.5: Habits Management Page ✅ DONE

- [x] Criar página /habits
- [x] Listar hábitos (tabs: ativos/arquivados)
- [x] Criar HabitForm component
- [x] Implementar página de criar (/habits/new)
- [x] Implementar edição de hábito (/habits/[id]/edit)
- [x] Implementar arquivar hábito
- [x] Adicionar validação Zod + React Hook Form

### Fase 2.6: Analytics Page ✅ DONE

- [x] Criar página /analytics
- [x] Criar resumo mensal (cards de estatísticas)
- [x] Criar gráfico de evolução (linha)
- [x] Criar estatísticas por hábito
- [x] Adicionar filtros de período (7d, 30d, 3m)

### Fase 2.7: Polish & UX ✅ DONE

- [x] Adicionar loading skeletons
- [x] Implementar error handling com retry
- [x] Configurar responsividade (mobile-first)
- [x] Adicionar toasts de feedback (sucesso/erro)
- [x] Criar página Settings (placeholder)
- [ ] Otimizar performance

## 🧪 Checklist de QA

**Dashboard:**
- [ ] Score carrega corretamente
- [ ] Hábitos do dia aparecem
- [ ] Check-in atualiza score em tempo real
- [ ] Check-in duplicado é impedido
- [ ] Gráfico semanal renderiza
- [ ] Loading states funcionam
- [ ] Responsivo mobile/desktop

**Habits:**
- [ ] Lista carrega
- [ ] Criar hábito funciona
- [ ] Validação de formulário funciona
- [ ] Editar hábito funciona
- [ ] Arquivar hábito funciona
- [ ] Tabs ativos/arquivados funcionam

**Analytics:**
- [ ] Gráficos carregam
- [ ] Dados corretos
- [ ] Responsivo

## 🔮 Próximas Fases (Fase 3+)

**Fase 3 - Streaks:**
- Backend: implementar lógica de streaks
- Frontend: badges, animações, gamificação

**Fase 4 - Autenticação:**
- Backend: JWT + multi-tenant
- Frontend: login, registro, proteção de rotas

**Fase 5 - Features Avançadas:**
- Notificações
- PWA
- Dark mode
- Compartilhamento de progresso
