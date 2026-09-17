'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { processarDiagnosticoCompleto } from '@/lib/motor';
import { PropriedadeSalva, criarPropriedade, listarPropriedades, salvarDiagnostico } from '@/lib/db';
import { LISTA_CULTURAS, configCultura } from '@/lib/culturas';
import { Cultura, DadosSolo, Propriedade } from '@/types';

type CampoSolo = keyof DadosSolo;

interface CampoConfig {
  campo: CampoSolo;
  label: string;
  unidade: string;
  placeholder: string;
  step?: string;
}

const CAMPOS_SOLO: CampoConfig[] = [
  { campo: 'ph', label: 'pH (CaCl₂ ou H₂O)', unidade: '', placeholder: 'Ex: 5.4', step: '0.1' },
  { campo: 'p', label: 'Fósforo (P)', unidade: 'mg/dm³', placeholder: 'Ex: 8' },
  { campo: 'k', label: 'Potássio (K)', unidade: 'mg/dm³', placeholder: 'Ex: 55' },
  { campo: 'ca', label: 'Cálcio (Ca)', unidade: 'cmolc/dm³', placeholder: 'Ex: 2.1', step: '0.1' },
  { campo: 'mg', label: 'Magnésio (Mg)', unidade: 'cmolc/dm³', placeholder: 'Ex: 0.8', step: '0.1' },
  { campo: 'al', label: 'Alumínio (Al)', unidade: 'cmolc/dm³', placeholder: 'Ex: 0.2', step: '0.1' },
  { campo: 'h_al', label: 'H+Al', unidade: 'cmolc/dm³', placeholder: 'Ex: 3.5', step: '0.1' },
  { campo: 'mo', label: 'Matéria Orgânica (MO)', unidade: 'g/dm³', placeholder: 'Ex: 18' },
  { campo: 'ctc', label: 'CTC (T)', unidade: 'cmolc/dm³', placeholder: 'Ex: 6.8', step: '0.1' },
  { campo: 'v_porcento', label: 'Saturação por Bases (V%)', unidade: '%', placeholder: 'Ex: 52' },
];

const DADOS_SOLO_INICIAL: DadosSolo = {
  ph: null,
  p: null,
  k: null,
  ca: null,
  mg: null,
  al: null,
  h_al: null,
  mo: null,
  ctc: null,
  v_porcento: null,
};

const PROPRIEDADE_VAZIA: Propriedade = {
  nome: '',
  municipio: '',
  area_ha: 1,
  cultura: 'milho',
  produtividade_esperada: configCultura('milho').produtividadePadrao,
};

type ModoPropriedade = 'existente' | 'nova';

export default function NovaAnalisePage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [propriedadesExistentes, setPropriedadesExistentes] = useState<PropriedadeSalva[] | null>(
    null
  );
  const [modoPropriedade, setModoPropriedade] = useState<ModoPropriedade>('nova');
  const [propriedadeSelecionadaId, setPropriedadeSelecionadaId] = useState<string>('');
  const [novaPropriedade, setNovaPropriedade] = useState<Propriedade>(PROPRIEDADE_VAZIA);

  const [dadosSolo, setDadosSolo] = useState<DadosSolo>(DADOS_SOLO_INICIAL);

  useEffect(() => {
    listarPropriedades()
      .then((dados) => {
        setPropriedadesExistentes(dados);
        if (dados.length > 0) {
          setModoPropriedade('existente');
          setPropriedadeSelecionadaId(dados[0].id);
        }
      })
      .catch(() => setPropriedadesExistentes([]));
  }, []);

  function atualizarSolo(campo: CampoSolo, valor: string) {
    setDadosSolo((prev) => ({
      ...prev,
      [campo]: valor === '' ? null : Number(valor),
    }));
  }

  function validarEtapa1(): boolean {
    if (modoPropriedade === 'existente') {
      if (!propriedadeSelecionadaId) {
        setErro('Selecione uma propriedade.');
        return false;
      }
      setErro(null);
      return true;
    }

    if (!novaPropriedade.nome.trim()) {
      setErro('Informe o nome da propriedade.');
      return false;
    }
    if (!novaPropriedade.municipio.trim()) {
      setErro('Informe o município.');
      return false;
    }
    if (!novaPropriedade.area_ha || novaPropriedade.area_ha <= 0) {
      setErro('Informe uma área válida (em hectares).');
      return false;
    }
    if (!novaPropriedade.produtividade_esperada || novaPropriedade.produtividade_esperada <= 0) {
      setErro('Informe a produtividade esperada.');
      return false;
    }
    setErro(null);
    return true;
  }

  function avancar() {
    if (validarEtapa1()) setEtapa(2);
  }

  function voltar() {
    setErro(null);
    setEtapa(1);
  }

  async function gerarDiagnostico() {
    const algumDadoInformado = Object.values(dadosSolo).some((v) => v !== null);
    if (!algumDadoInformado) {
      setErro('Informe pelo menos um dado da análise de solo.');
      return;
    }

    setErro(null);
    setEnviando(true);

    try {
      let propriedadeId: string;
      let propriedadeCompleta: Propriedade;

      if (modoPropriedade === 'existente') {
        const selecionada = propriedadesExistentes?.find((p) => p.id === propriedadeSelecionadaId);
        if (!selecionada) throw new Error('Propriedade selecionada não encontrada.');
        propriedadeId = selecionada.id;
        propriedadeCompleta = selecionada;
      } else {
        const criada = await criarPropriedade(novaPropriedade);
        propriedadeId = criada.id;
        propriedadeCompleta = criada;
      }

      const resultado = processarDiagnosticoCompleto(propriedadeCompleta, dadosSolo);
      const salvo = await salvarDiagnostico(resultado, propriedadeId);
      router.push(`/diagnostico/resultado?id=${salvo.id}`);
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível gerar o diagnóstico. Verifique os dados informados.');
      setEnviando(false);
    }
  }

  return (
    <main className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Nova Análise</h1>
        <p className="text-sm text-slate-500 mt-1">
          Informe os dados da propriedade e do laudo de solo para gerar o diagnóstico.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <StepPill numero={1} titulo="Propriedade" ativa={etapa === 1} concluida={etapa > 1} />
        <div className="flex-1 h-px bg-slate-200" />
        <StepPill numero={2} titulo="Análise de solo" ativa={etapa === 2} concluida={false} />
      </div>

      {erro && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {erro}
        </div>
      )}

      {etapa === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          {propriedadesExistentes === null && (
            <div className="text-sm text-slate-500">Carregando propriedades...</div>
          )}

          {propriedadesExistentes && propriedadesExistentes.length > 0 && (
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setModoPropriedade('existente')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  modoPropriedade === 'existente' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                }`}
              >
                Usar propriedade existente
              </button>
              <button
                type="button"
                onClick={() => setModoPropriedade('nova')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  modoPropriedade === 'nova' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                }`}
              >
                Cadastrar nova
              </button>
            </div>
          )}

          {modoPropriedade === 'existente' && propriedadesExistentes && propriedadesExistentes.length > 0 && (
            <Campo label="Propriedade">
              <select
                value={propriedadeSelecionadaId}
                onChange={(e) => setPropriedadeSelecionadaId(e.target.value)}
                className="input"
              >
                {propriedadesExistentes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} · {configCultura(p.cultura).label} · {p.municipio} · {p.area_ha} ha
                  </option>
                ))}
              </select>
            </Campo>
          )}

          {modoPropriedade === 'nova' && (
            <>
              <Campo label="Nome da propriedade">
                <input
                  type="text"
                  value={novaPropriedade.nome}
                  onChange={(e) => setNovaPropriedade((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Fazenda Boa Esperança"
                  className="input"
                />
              </Campo>

              <div className="grid grid-cols-2 gap-5">
                <Campo label="Município">
                  <input
                    type="text"
                    value={novaPropriedade.municipio}
                    onChange={(e) =>
                      setNovaPropriedade((p) => ({ ...p, municipio: e.target.value }))
                    }
                    placeholder="Ex: Redenção - CE"
                    className="input"
                  />
                </Campo>

                <Campo label="Área (ha)">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={novaPropriedade.area_ha}
                    onChange={(e) =>
                      setNovaPropriedade((p) => ({ ...p, area_ha: Number(e.target.value) }))
                    }
                    className="input"
                  />
                </Campo>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Campo label="Cultura">
                  <select
                    value={novaPropriedade.cultura}
                    onChange={(e) => {
                      const cultura = e.target.value as Cultura;
                      const config = configCultura(cultura);
                      setNovaPropriedade((p) => ({
                        ...p,
                        cultura,
                        produtividade_esperada: config.produtividadePadrao,
                      }));
                    }}
                    className="input"
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
                    configCultura(novaPropriedade.cultura).unidadeProdutividade
                  })`}
                >
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={novaPropriedade.produtividade_esperada}
                    onChange={(e) =>
                      setNovaPropriedade((p) => ({
                        ...p,
                        produtividade_esperada: Number(e.target.value),
                      }))
                    }
                    className="input"
                  />
                </Campo>
              </div>

              <p className="text-xs text-slate-400 -mt-2">
                Valor padrão sugerido ao trocar a cultura — ajuste conforme a realidade da sua
                propriedade.
              </p>
            </>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={avancar}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {etapa === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-5">
            Informe os valores do laudo de análise de solo. Campos não preenchidos serão
            marcados como &ldquo;não informado&rdquo; no diagnóstico.
          </p>

          <div className="grid grid-cols-2 gap-5">
            {CAMPOS_SOLO.map(({ campo, label, unidade, placeholder, step }) => (
              <Campo key={campo} label={unidade ? `${label} (${unidade})` : label}>
                <input
                  type="number"
                  step={step ?? '1'}
                  value={dadosSolo[campo] ?? ''}
                  onChange={(e) => atualizarSolo(campo, e.target.value)}
                  placeholder={placeholder}
                  className="input"
                />
              </Campo>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={voltar}
              className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2.5 text-sm"
            >
              ← Voltar
            </button>
            <button
              onClick={gerarDiagnostico}
              disabled={enviando}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
            >
              {enviando ? 'Gerando diagnóstico...' : 'Gerar diagnóstico'}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
        }
      `}</style>
    </main>
  );
}

function StepPill({
  numero,
  titulo,
  ativa,
  concluida,
}: {
  numero: number;
  titulo: string;
  ativa: boolean;
  concluida: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          concluida
            ? 'bg-green-600 text-white'
            : ativa
            ? 'bg-green-100 text-green-700 border-2 border-green-600'
            : 'bg-slate-100 text-slate-400'
        }`}
      >
        {concluida ? '✓' : numero}
      </div>
      <span
        className={`text-sm font-medium ${
          ativa || concluida ? 'text-slate-800' : 'text-slate-400'
        }`}
      >
        {titulo}
      </span>
    </div>
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
