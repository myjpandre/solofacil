'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilPage() {
  const { user, atualizarNome } = useAuth();
  const nomeAtual = (user?.user_metadata?.nome as string | undefined) ?? '';

  const [nome, setNome] = useState(nomeAtual);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!nome.trim()) {
      setErro('Informe um nome.');
      return;
    }

    setSalvando(true);
    try {
      const { error } = await atualizarNome(nome.trim());
      if (error) {
        setErro(error);
      } else {
        setMensagem('Perfil atualizado com sucesso.');
      }
    } finally {
      setSalvando(false);
    }
  }

  const inicial = (nomeAtual || user?.email || '?').charAt(0).toUpperCase();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Perfil</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-green-700 font-bold text-2xl">
            {inicial}
          </div>
          <div>
            <div className="font-semibold text-slate-800">{nomeAtual || 'Sem nome cadastrado'}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
          </div>
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

        <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-5 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Nome</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="perfil-input"
            />
          </label>

          <button
            type="submit"
            disabled={salvando}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-5">
          A troca de e-mail e senha, além de autenticação social, estão planejadas para uma
          próxima versão.
        </p>
      </div>

      <style jsx global>{`
        .perfil-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .perfil-input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
        }
      `}</style>
    </main>
  );
}
