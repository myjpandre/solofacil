'use client';

import { useEffect, useState } from 'react';
import { criarTalhao, excluirTalhao, listarTalhoes } from '@/lib/db';
import { LISTA_CULTURAS, configCultura } from '@/lib/culturas';
import { Cultura, Talhao } from '@/types';

interface GerenciadorTalhoesProps {
  propriedadeId: string;
  propriedadeNome: string;
}

const TALHAO_VAZIO: Talhao = {
  propriedade_id: '',
  nome: '',
  area_hectares: 1,
  cultura_principal: 'milho',
  produtividade_esperada: configCultura('milho').produtividadePadrao,
  tipo_uso: '',
  observacoes: '',
};

export default function GerenciadorTalhoes({
  propriedadeId,
  propriedadeNome,
}: GerenciadorTalhoesProps) {
  const [talhoes, setTalhoes] = useState<Talhao[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<Talhao>({
    ...TALHAO_VAZIO,
    propriedade_id: propriedadeId,
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      const dados = await listarTalhoes(propriedadeId);
      setTalhoes(dados);
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível carregar os talhões.');
      setTalhoes([]);
    }
  }

  useEffect(() => {
    carregar();
  }, [propriedadeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.nome.trim()) {
      setErro('Informe o nome do talhão.');
      return;
    }
    if (form.area_hectares <= 0) {
      setErro('Área deve ser maior que zero.');
      return;
    }
    if (!form.cultura_principal) {
      setErro('Selecione uma cultura.');
      return;
    }
    if ((form.produtividade_esperada ?? 0) <= 0) {
      setErro('Informe a produtividade esperada (maior que zero).');
      return;
    }

    setSalvando(true);
    try {
      await criarTalhao(form);
      setForm({
        ...TALHAO_VAZIO,
        propriedade_id: propriedadeId,
      });
      setMostrarForm(false);
      await carregar();
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível salvar o talhão.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string | undefined) {
    if (!id) return;
    if (
      !confirm(
        'Tem certeza que deseja excluir este talhão? Todos os diagnósticos vinculados serão removidos.'
      )
    )
      return;

    try {
      await excluirTalhao(id);
      await carregar();
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível excluir o talhão.');
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800">Talhões de {propriedadeNome}</h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Talhão'}
        </button>
      </div>

      {erro && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {erro}
        </div>
      )}

      {/* Formulário */}
      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Nome do talhão">
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Área Norte"
                className="talh-input"
              />
            </Campo>

            <Campo label="Área (ha)">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={form.area_hectares}
                onChange={(e) => setForm((f) => ({ ...f, area_hectares: Number(e.target.value) }))}
                className="talh-input"
              />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Cultura">
              <select
                value={form.cultura_principal ?? ''}
                onChange={(e) => {
                  const cultura = e.target.value as Cultura;
                  const config = configCultura(cultura);
                  setForm((f) => ({
                    ...f,
                    cultura_principal: cultura,
                    produtividade_esperada: config.produtividadePadrao,
                  }));
                }}
                className="talh-input"
              >
                {LISTA_CULTURAS.map((c) => (
                  <option key={c.codigo} value={c.codigo}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              label={`Produtividade esperada (${
                configCultura(form.cultura_principal ?? 'milho').unidadeProdutividade
              })`}
            >
              <input
                type="number"
                min={1}
                step={100}
                value={form.produtividade_esperada ?? 0}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    produtividade_esperada: Number(e.target.value),
                  }))
                }
                className="talh-input"
              />
            </Campo>
          </div>

          <Campo label="Tipo de uso (opcional)">
            <input
              type="text"
              value={form.tipo_uso ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, tipo_uso: e.target.value }))}
              placeholder="Ex: Sequeiro, Irrigado"
              className="talh-input"
            />
          </Campo>

          <Campo label="Observações (opcional)">
            <textarea
              value={form.observacoes ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              placeholder="Ex: Próximo à água, solo arenoso..."
              rows={3}
              className="talh-input"
            />
          </Campo>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-lg transition text-sm"
            >
              {salvando ? 'Salvando...' : 'Salvar talhão'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de talhões */}
      {talhoes === null && <div className="text-sm text-slate-500">Carregando talhões...</div>}

      {talhoes && talhoes.length === 0 && !mostrarForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="text-4xl mb-3">🌾</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Nenhum talhão cadastrado</h3>
          <p className="text-sm text-slate-500 mb-5">
            Cadastre os talhões desta propriedade para organizar análises por área e cultura.
          </p>
          <button
            onClick={() => setMostrarForm(true)}
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg transition text-sm"
          >
            + Novo Talhão
          </button>
        </div>
      )}

      {talhoes && talhoes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {talhoes.map((t) => (
            <div
              key={t.id}
              className="p-5 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{t.nome}</div>
                  <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                    <div>
                      🌾 <strong>Cultura:</strong>{' '}
                      {t.cultura_principal
                        ? configCultura(t.cultura_principal).label
                        : 'Não definida'}
                    </div>
                    <div>
                      📐 <strong>Área:</strong> {t.area_hectares} ha
                    </div>
                    {t.produtividade_esperada && t.cultura_principal && (
                      <div>
                        📊 <strong>Produtividade:</strong> {t.produtividade_esperada}{' '}
                        {configCultura(t.cultura_principal).unidadeProdutividade}
                      </div>
                    )}
                    {t.tipo_uso && (
                      <div>
                        💧 <strong>Tipo:</strong> {t.tipo_uso}
                      </div>
                    )}
                    {t.observacoes && (
                      <div>
                        📝 <strong>Observações:</strong> {t.observacoes}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => remover(t.id)}
                  className="text-slate-400 hover:text-red-600 transition text-lg ml-4 flex-shrink-0"
                  title="Excluir talhão"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .talh-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .talh-input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
        }
      `}</style>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
