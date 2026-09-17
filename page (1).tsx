'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DiagnosticoSalvo, excluirDiagnostico, listarDiagnosticos } from '@/lib/db';
import { configCultura } from '@/lib/culturas';
import { formatarData, formatarMoeda } from '@/lib/cores';

export default function DiagnosticosPage() {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoSalvo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      setDiagnosticos(await listarDiagnosticos());
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível carregar os diagnósticos.');
      setDiagnosticos([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function remover(id: string) {
    try {
      await excluirDiagnostico(id);
      await carregar();
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível excluir o diagnóstico.');
    }
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Meus Diagnósticos</h1>
        <Link
          href="/diagnostico/novo"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          + Nova Análise
        </Link>
      </div>

      {erro && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {erro}
        </div>
      )}

      {diagnosticos === null && (
        <div className="text-sm text-slate-500">Carregando...</div>
      )}

      {diagnosticos && diagnosticos.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            Nenhum diagnóstico ainda
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Faça sua primeira análise de solo para ver o diagnóstico e as recomendações aqui.
          </p>
          <Link
            href="/diagnostico/novo"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            + Nova Análise
          </Link>
        </div>
      )}

      {diagnosticos && diagnosticos.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {diagnosticos.map((d) => (
            <div
              key={d.id}
              className="p-5 border-b last:border-b-0 border-slate-100 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div>
                <div className="font-semibold text-slate-800">
                  {d.propriedade.nome} · {configCultura(d.propriedade.cultura).label}
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {d.propriedade.municipio} · {d.propriedade.area_ha} ha ·{' '}
                  {formatarData(d.gerado_em)} · Custo estimado:{' '}
                  {formatarMoeda(d.custo.custo_total_area)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Concluído
                </span>
                <Link
                  href={`/diagnostico/resultado?id=${d.id}`}
                  className="text-green-700 hover:underline text-sm font-medium"
                >
                  Ver detalhes →
                </Link>
                <button
                  onClick={() => remover(d.id)}
                  className="text-slate-400 hover:text-red-600 text-sm transition"
                  title="Excluir"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
