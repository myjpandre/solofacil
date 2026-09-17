'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  PropriedadeSalva,
  criarPropriedade,
  excluirPropriedade,
  listarPropriedades,
} from '@/lib/db';
import { LISTA_CULTURAS, configCultura } from '@/lib/culturas';
import { Cultura, Propriedade } from '@/types';

const PROPRIEDADE_VAZIA: Propriedade = {
  nome: '',
  municipio: '',
  area_ha: 1,
  cultura: 'milho',
  produtividade_esperada: configCultura('milho').produtividadePadrao,
};

export default function PropriedadesPage() {
  const [propriedades, setPropriedades] = useState<PropriedadeSalva[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<Propriedade>(PROPRIEDADE_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      const dados = await listarPropriedades();
      setPropriedades(dados);
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível carregar as propriedades.');
      setPropriedades([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.nome.trim() || !form.municipio.trim()) {
      setErro('Preencha nome e município.');
      return;
    }
    if (form.area_ha <= 0 || form.produtividade_esperada <= 0) {
      setErro('Área e produtividade esperada devem ser maiores que zero.');
      return;
    }

    setSalvando(true);
    try {
      await criarPropriedade(form);
      setForm(PROPRIEDADE_VAZIA);
      setMostrarForm(false);
      await carregar();
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível salvar a propriedade.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    try {
      await excluirPropriedade(id);
      await carregar();
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível excluir a propriedade.');
    }
  }

  return (
    <main className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Propriedades</h1>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          {mostrarForm ? 'Cancelar' : '+ Nova Propriedade'}
        </button>
      </div>

      {erro && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {erro}
        </div>
      )}

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-4"
        >
          <Campo label="Nome da propriedade">
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Fazenda Boa Esperança"
              className="prop-input"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Município">
              <input
                type="text"
                value={form.municipio}
                onChange={(e) => setForm((f) => ({ ...f, municipio: e.target.value }))}
                placeholder="Ex: Redenção - CE"
                className="prop-input"
              />
            </Campo>
            <Campo label="Área (ha)">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={form.area_ha}
                onChange={(e) => setForm((f) => ({ ...f, area_ha: Number(e.target.value) }))}
                className="prop-input"
              />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Cultura">
              <select
                value={form.cultura}
                onChange={(e) => {
                  const cultura = e.target.value as Cultura;
                  const config = configCultura(cultura);
                  setForm((f) => ({
                    ...f,
                    cultura,
                    produtividade_esperada: config.produtividadePadrao,
                  }));
                }}
                className="prop-input"
              >
                {LISTA_CULTURAS.map((c) => (
                  <option key={c.codigo} value={c.codigo}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label={`Produtividade esperada (${configCultura(form.cultura).unidadeProdutividade})`}>
              <input
                type="number"
                min={1}
                step={100}
                value={form.produtividade_esperada}
                onChange={(e) =>
                  setForm((f) => ({ ...f, produtividade_esperada: Number(e.target.value) }))
                }
                className="prop-input"
              />
            </Campo>
          </div>

          <p className="text-xs text-slate-400 -mt-2">
            Valor padrão sugerido ao trocar a cultura — ajuste conforme a realidade da sua
            propriedade.
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
            >
              {salvando ? 'Salvando...' : 'Salvar propriedade'}
            </button>
          </div>
        </form>
      )}

      {propriedades === null && <div className="text-sm text-slate-500">Carregando...</div>}

      {propriedades && propriedades.length === 0 && !mostrarForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="text-4xl mb-3">🏡</div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            Nenhuma propriedade cadastrada
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Cadastre sua primeira propriedade para agilizar a criação de novas análises.
          </p>
          <button
            onClick={() => setMostrarForm(true)}
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            + Nova Propriedade
          </button>
        </div>
      )}

      {propriedades && propriedades.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {propriedades.map((p) => (
            <div
              key={p.id}
              className="p-5 border-b last:border-b-0 border-slate-100 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div>
                <div className="font-semibold text-slate-800">
                  {p.nome} · {configCultura(p.cultura).label}
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {p.municipio} · {p.area_ha} ha · {p.produtividade_esperada.toLocaleString('pt-BR')}{' '}
                  {configCultura(p.cultura).unidadeProdutividade} esperado
                </div>
              </div>
              <button
                onClick={() => remover(p.id)}
                className="text-slate-400 hover:text-red-600 text-sm transition"
                title="Excluir"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .prop-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .prop-input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
        }
      `}</style>
    </main>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
