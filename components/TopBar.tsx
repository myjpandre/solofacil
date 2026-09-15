'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function TopBar() {
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-slate-800">{nome}</div>
          <div className="text-xs text-slate-500">Produtor</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-green-700 font-bold">
          {nome.charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={handleSair}
          className="text-sm text-slate-500 hover:text-red-600 font-medium transition"
        >
          Sair
        </button>
      </div>
    </header>
  );
}