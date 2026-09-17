'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, supabaseConfigurado } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && supabaseConfigurado && !user) {
      router.replace('/login');
    }
  }, [loading, user, supabaseConfigurado, router]);

  if (!supabaseConfigurado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-8 text-center">
          <div className="text-4xl mb-3">⚙️</div>
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Supabase não configurado</h1>
          <p className="text-sm text-slate-500 mb-4">
            Configure as variáveis de ambiente do Supabase para usar o SoloFácil. Veja o arquivo{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env.local.example</code>{' '}
            e o script{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code>.
          </p>
          <Link href="/login" className="text-green-700 text-sm font-medium hover:underline">
            Ver detalhes na tela de login →
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        {children}
      </div>
    </div>
  );
}
