'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Modo = 'login' | 'cadastro';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, supabaseConfigurado, signIn, signUp } = useAuth();

  const [modo, setModo] = useState<Modo>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setEnviando(true);

    try {
      if (modo === 'login') {
        const { error } = await signIn(email, senha);
        if (error) {
          setErro(error);
        } else {
          router.push('/');
        }
      } else {
        if (!nome.trim()) {
          setErro('Informe seu nome.');
          return;
        }
        const { error, precisaConfirmarEmail } = await signUp(email, senha, nome.trim());
        if (error) {
          setErro(error);
        } else if (precisaConfirmarEmail) {
          setMensagem('Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.');
          setModo('login');
        } else {
          router.push('/');
        }
      }
    } finally {
      setEnviando(false);
    }
  }

  if (!supabaseConfigurado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-8 text-center">
          <div className="text-4xl mb-3">⚙️</div>
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Supabase não configurado</h1>
          <p className="text-sm text-slate-500 mb-4">
            Para habilitar cadastro e login, crie um projeto no Supabase, rode o script em{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code>{' '}
            e defina{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{' '}
            e{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{' '}
            no arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env.local</code>.
          </p>
          <p className="text-xs text-slate-400">Veja o README para o passo a passo completo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-3">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-slate-800">SoloFácil</h1>
          <p className="text-sm text-slate-500 mt-1">Análise de solo e manejo inteligente</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setErro(null);
                setMensagem(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                modo === 'login' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('cadastro');
                setErro(null);
                setMensagem(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                modo === 'cadastro' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
              }`}
            >
              Criar conta
            </button>
          </div>

          {mensagem && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              {mensagem}
            </div>
          )}
          {erro && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'cadastro' && (
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">Nome</span>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="login-input"
                />
              </label>
            )}

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="login-input"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Senha</span>
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="login-input"
              />
            </label>

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition text-sm mt-2"
            >
              {enviando
                ? 'Enviando...'
                : modo === 'login'
                ? 'Entrar'
                : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .login-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
        }
      `}</style>
    </div>
  );
}
