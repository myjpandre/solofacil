'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface ResultadoAuth {
  error: string | null;
  precisaConfirmarEmail?: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabaseConfigurado: boolean;
  signIn: (email: string, password: string) => Promise<ResultadoAuth>;
  signUp: (email: string, password: string, nome: string) => Promise<ResultadoAuth>;
  signOut: () => Promise<void>;
  atualizarNome: (nome: string) => Promise<ResultadoAuth>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Mensagens de erro do Supabase traduzidas para as mais comuns
function traduzirErro(mensagem: string): string {
  const mapa: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'User already registered': 'Já existe uma conta com este e-mail.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
  };
  if (mapa[mensagem]) return mapa[mensagem];

  // Erros de rede (fetch falhou) não vêm com uma mensagem amigável do
  // Supabase — normalmente indicam URL/chave erradas no .env.local,
  // projeto pausado, ou falta de conexão.
  if (/failed to fetch|networkerror|load failed/i.test(mensagem)) {
    return 'Não foi possível conectar ao Supabase. Verifique sua internet e se NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local estão corretos.';
  }

  return mensagem;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch(() => {
        // Falha de rede ao restaurar a sessão: segue como deslogado
        // em vez de travar a tela em "Carregando..." para sempre.
        setSession(null);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      setSession(novaSessao);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<ResultadoAuth> {
    if (!supabase) return { error: 'Supabase não configurado.' };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? traduzirErro(error.message) : null };
    } catch (e: any) {
      return { error: traduzirErro(e?.message ?? 'Falha de conexão.') };
    }
  }

  async function signUp(email: string, password: string, nome: string): Promise<ResultadoAuth> {
    if (!supabase) return { error: 'Supabase não configurado.' };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } },
      });
      if (error) return { error: traduzirErro(error.message) };

      // Se a confirmação de e-mail estiver ativa no projeto Supabase,
      // `session` volta nula até o usuário confirmar o e-mail.
      const precisaConfirmarEmail = !data.session;
      return { error: null, precisaConfirmarEmail };
    } catch (e: any) {
      return { error: traduzirErro(e?.message ?? 'Falha de conexão.') };
    }
  }

  async function signOut() {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // Se der erro de rede ao sair, ainda assim limpamos a sessão local
      // para não deixar o usuário "preso" logado na UI.
      setSession(null);
    }
  }

  async function atualizarNome(nome: string): Promise<ResultadoAuth> {
    if (!supabase) return { error: 'Supabase não configurado.' };
    try {
      const { error } = await supabase.auth.updateUser({ data: { nome } });
      return { error: error ? traduzirErro(error.message) : null };
    } catch (e: any) {
      return { error: traduzirErro(e?.message ?? 'Falha de conexão.') };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        supabaseConfigurado: !!supabase,
        signIn,
        signUp,
        signOut,
        atualizarNome,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}
