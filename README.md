# SoloFácil

**Análise de solo e manejo inteligente**
MVP do Projeto Agro

Foco: **10 culturas do Ceará/Nordeste** (milho, feijão-caupi, mandioca, castanha-de-caju,
banana, coco, maracujá, tomate, batata-doce, mamão) — ver `ROADMAP.md` para os parâmetros
agronômicos de cada uma.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres) — cadastro/login e persistência dos dados
- Motor de regras agronômicas rastreável

## Como rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## Páginas principais

- `/login` → Cadastro e login (Supabase Auth)
- `/` → Dashboard inicial
- `/diagnostico/novo` → Nova análise (usa propriedade existente ou cadastra uma nova)
- `/diagnostico/resultado?id=...` → Tela de resultado (estilo do mockup)
- `/diagnosticos` → Histórico de diagnósticos do usuário logado
- `/propriedades` → Cadastro de propriedades (CRUD)
- `/perfil` → Dados da conta logada

## Arquitetura de dados

- `lib/motor.ts` — motor de regras agronômicas (puro, sem I/O), rastreável e testável.
- `lib/db.ts` — camada de acesso ao Supabase (propriedades e diagnósticos), sempre
  filtrada pelo usuário autenticado via Row Level Security.
- `contexts/AuthContext.tsx` — estado de sessão/usuário, login, cadastro e logout.
- `app/(app)/layout.tsx` — layout protegido: redireciona para `/login` se não houver
  sessão, e renderiza Sidebar/TopBar para todas as páginas internas.

## Roadmap

Veja `ROADMAP.md` para a análise completa de prioridades (P0–P3), a tabela de parâmetros
agronômicos por cultura (meta de V%, fator de N, tetos de P/K) e os próximos passos.
