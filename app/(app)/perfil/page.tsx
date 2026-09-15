'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const nome =
    (user?.user_metadata?.nome as string) ||
    user?.email?.split('@')[0] ||
    'Produtor';

  async function handleSair() {
    await signOut();
    router.replace('/login');
  }

  return (
    <main className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Perfil</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <div className="text-xs text-slate-500">Nome</div>
          <div className="font-semibold text-slate-800">{nome}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500">E-mail</div>
          <div className="font-semibold text-slate-800">{user?.email ?? '—'}</div>
        </div>

        <button
          type="button"
          onClick={handleSair}
          className="mt-4 w-full border border-red-200 text-red-700 hover:bg-red-50 font-semibold py-3 rounded-xl transition"
        >
          Sair da conta
        </button>
      </div>
    </main>
  );
}