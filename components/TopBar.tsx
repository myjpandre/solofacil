'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function TopBar() {
  const { user } = useAuth();

  const nome = (user?.user_metadata?.nome as string | undefined) || user?.email || 'Usuário';
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-slate-800">{nome}</div>
          <div className="text-xs text-slate-500">Produtor</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-green-700 font-bold">
          {inicial}
        </div>
      </div>
    </header>
  );
}
