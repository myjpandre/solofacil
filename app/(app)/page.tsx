'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const nome = (user?.user_metadata?.nome as string | undefined) || user?.email?.split('@')[0] || '';

  return (
    <main className="p-8">
      <div className="relative rounded-2xl overflow-hidden mb-8 h-48 bg-gradient-to-r from-green-800 to-green-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200')] bg-cover bg-center opacity-40" />
        <div className="relative h-full flex flex-col justify-center px-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Olá{nome ? `, ${nome}` : ''}!</h2>
          <p className="text-green-100 max-w-xl">
            Aqui estão os resultados da análise do seu solo e as recomendações personalizadas para a sua propriedade.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <Link
          href="/diagnostico/novo"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-green-300 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
            ➕
          </div>
          <h3 className="font-semibold text-lg mb-1">Nova Análise</h3>
          <p className="text-sm text-slate-500">
            Informe os dados do solo e receba diagnóstico + recomendação.
          </p>
        </Link>

        <Link
          href="/diagnosticos"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-green-300 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
            📋
          </div>
          <h3 className="font-semibold text-lg mb-1">Meus Diagnósticos</h3>
          <p className="text-sm text-slate-500">
            Acesse o histórico de análises e recomendações geradas.
          </p>
        </Link>

        <Link
          href="/propriedades"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-green-300 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
            🏡
          </div>
          <h3 className="font-semibold text-lg mb-1">Propriedades</h3>
          <p className="text-sm text-slate-500">
            Gerencie as propriedades cadastradas.
          </p>
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
        <strong>Aviso:</strong> As recomendações são estimativas baseadas em critérios técnicos.
        Devem ser validadas com profissional habilitado e análise laboratorial completa.
      </div>
    </main>
  );
}
