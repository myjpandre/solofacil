# SoloFácil

**Análise de solo e manejo inteligente**
MVP do Projeto Agro (futura vertical da Labzetta)

Foco: **Milho no Ceará**

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres) — cadastro/login e persistência dos dados
- Motor de regras agronômicas rastreável

## Configuração do Supabase (obrigatória)

O app precisa de um projeto Supabase para autenticação e para salvar propriedades e
diagnósticos. Sem isso, as telas mostram um aviso de "Supabase não configurado" em vez
de funcionar.

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor** do projeto, cole e rode todo o conteúdo de `supabase/schema.sql`
   (cria as tabelas `propriedades` e `diagnosticos` com RLS por usuário).
3. Em **Authentication → Providers**, confirme que o provedor **Email** está habilitado.
4. (Recomendado em desenvolvimento) Em **Authentication → Settings**, desative
   **"Confirm email"** para poder logar imediatamente após criar a conta. Em produção,
   deixe a confirmação ativa.
5. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
6. Copie `.env.local.example` para `.env.local` e preencha:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```

## Como rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000 (você será redirecionado para `/login` se não estiver
autenticado).

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

## Próximos passos sugeridos

- CRUD completo de propriedades com edição (hoje: criar, listar, excluir)
- Suporte a outras culturas além de milho
- Micronutrientes (Zn, B, Cu) no motor de diagnóstico
- Histórico comparativo entre análises da mesma propriedade
- Dashboard com gráficos de evolução de custo e indicadores de solo

## Observação

A tela de resultado (`/diagnostico/resultado`) foi construída para ficar o mais próxima
possível do design de referência (SoloFácil).
