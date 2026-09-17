'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DiagnosticoSalvo, obterDiagnostico } from '@/lib/db';
import { configCultura } from '@/lib/culturas';
import { VERSAO_MOTOR } from '@/lib/motor';
import { corClasses, formatarData, formatarMoeda, formatarNivel } from '@/lib/cores';
import { buscarClimaMunicipio, type PrevisaoClima } from '@/lib/clima';

export default function ResultadoPage() {
  return (
    <Suspense fallback={null}>
      <ResultadoConteudo />
    </Suspense>
  );
}

function ResultadoConteudo() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [resultado, setResultado] = useState<DiagnosticoSalvo | null | undefined>(undefined);
  const [exportando, setExportando] = useState(false);
  const [clima, setClima] = useState<PrevisaoClima | null>(null);

  useEffect(() => {
    if (!id) {
      setResultado(null);
      return;
    }
    obterDiagnostico(id)
      .then(setResultado)
      .catch(() => setResultado(null));
  }, [id]);

  useEffect(() => {
    if (resultado?.propriedade?.municipio) {
      buscarClimaMunicipio(resultado.propriedade.municipio).then(setClima);
    }
  }, [resultado]);

  async function exportarPDF() {
    if (!resultado) return;
    setExportando(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const { propriedade, dados_solo, diagnostico, recomendacao, custo, gerado_em } = resultado;

      doc.setFontSize(16);
      doc.setTextColor(15, 61, 46);
      doc.text('SoloFácil - Relatório de Diagnóstico', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Propriedade: ${propriedade.nome}`, 14, 27);
      doc.text(`Município: ${propriedade.municipio} · Área: ${propriedade.area_ha} ha`, 14, 33);
      doc.text(
        `Cultura: ${configCultura(propriedade.cultura).label} · Gerado em: ${formatarData(gerado_em)}`,
        14,
        39
      );

      autoTable(doc, {
        startY: 46,
        head: [['Parâmetro', 'Valor', 'Nível', 'Observação']],
        body: diagnostico.interpretacoes.map((i) => [
          i.parametro,
          i.valor !== null ? `${i.valor} ${i.unidade}`.trim() : '—',
          formatarNivel(i.nivel),
          i.mensagem,
        ]),
        headStyles: { fillColor: [15, 61, 46] },
        styles: { fontSize: 9 },
      });

      const posApósSolo = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('Resumo do diagnóstico', 14, posApósSolo);
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      const resumoLinhas = doc.splitTextToSize(diagnostico.resumo, 180);
      doc.text(resumoLinhas, 14, posApósSolo + 6);

      autoTable(doc, {
        startY: posApósSolo + 6 + resumoLinhas.length * 5 + 6,
        head: [['Ação recomendada', 'Dose', 'Observação']],
        body: recomendacao.itens.map((i) => [
          i.acao,
          `${i.quantidade_ha} ${i.unidade}`,
          i.observacao ?? '',
        ]),
        headStyles: { fillColor: [15, 61, 46] },
        styles: { fontSize: 9 },
      });

      const posApósRecomendacao = (doc as any).lastAutoTable.finalY + 10;
      autoTable(doc, {
        startY: posApósRecomendacao,
        head: [['Insumo', 'Quantidade total', 'Preço unit. (R$)', 'Custo total (R$)']],
        body: custo.itens.map((i) => [
          i.descricao,
          `${i.quantidade_total} ${i.unidade}`,
          i.preco_unitario.toFixed(2),
          i.custo_total.toFixed(2),
        ]),
        foot: [['', '', 'Total', formatarMoeda(custo.custo_total_area)]],
        headStyles: { fillColor: [15, 61, 46] },
        footStyles: { fillColor: [240, 240, 240], textColor: [30, 41, 59] },
        styles: { fontSize: 9 },
      });

      const posFinal = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const aviso = doc.splitTextToSize(
        `As recomendações são estimativas de um motor de regras simplificado, com base agronômica regional para ${configCultura(propriedade.cultura).label.toLowerCase()} no Ceará/Nordeste. Devem ser validadas por profissional habilitado e ajustadas às condições locais.`,
        180
      );
      doc.text(aviso, 14, posFinal);

      doc.save(`diagnostico-${propriedade.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } finally {
      setExportando(false);
    }
  }

  return (
    <main className="p-8 max-w-5xl">
      {resultado === undefined && (
            <div className="text-sm text-slate-500">Carregando diagnóstico...</div>
          )}

          {resultado === null && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h1 className="text-lg font-semibold text-slate-800 mb-1">
                Diagnóstico não encontrado
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                O link pode estar incorreto ou os dados foram limpos deste navegador.
              </p>
              <Link
                href="/diagnostico/novo"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
              >
                Fazer nova análise
              </Link>
            </div>
          )}

          {resultado && (
            <>
              <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-semibold text-green-700 bg-green-50 inline-block px-2.5 py-1 rounded-full mb-2">
                    {configCultura(resultado.propriedade.cultura).label} · {resultado.propriedade.municipio}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {resultado.propriedade.nome}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {resultado.propriedade.area_ha} ha · Produtividade esperada:{' '}
                    {resultado.propriedade.produtividade_esperada.toLocaleString('pt-BR')}{' '}
                    {configCultura(resultado.propriedade.cultura).unidadeProdutividade} ·
                    Gerado em {formatarData(resultado.gerado_em)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/diagnosticos"
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition text-sm"
                  >
                    ← Voltar
                  </Link>
                  <button
                    onClick={exportarPDF}
                    disabled={exportando}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm"
                  >
                    {exportando ? 'Exportando...' : '⬇ Exportar PDF'}
                  </button>
                </div>
              </div>

              {/* Clima */}
              {clima && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      Clima agora em {clima.municipio}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-800">
                        {clima.temperatura_atual}°C
                      </span>
                      <span className="text-sm text-slate-500">{clima.condicao}</span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <div className="text-xs text-slate-400">Sensação</div>
                      <div className="font-semibold text-slate-700">
                        {clima.sensacao_termica}°C
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Umidade</div>
                      <div className="font-semibold text-slate-700">{clima.umidade}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Chance de chuva hoje</div>
                      <div className="font-semibold text-slate-700">
                        {clima.chance_chuva_hoje}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Chuva prevista</div>
                      <div className="font-semibold text-slate-700">
                        {clima.precipitacao_prevista_mm} mm
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumo */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                <h2 className="font-semibold text-slate-800 mb-2">Resumo do diagnóstico</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{resultado.diagnostico.resumo}</p>

                {resultado.diagnostico.problemas_principais.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resultado.diagnostico.problemas_principais.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full"
                      >
                        ⚠ {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Interpretação por nutriente */}
              <div className="mb-6">
                <h2 className="font-semibold text-slate-800 mb-3">Interpretação da análise de solo</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {resultado.diagnostico.interpretacoes.map((item, idx) => {
                    const cores = corClasses(item.cor);
                    return (
                      <div
                        key={idx}
                        className={`bg-white rounded-2xl border ${cores.border} p-5`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700">
                            {item.parametro}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cores.badge}`}>
                            {formatarNivel(item.nivel)}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-1">
                          {item.valor !== null ? item.valor : '—'}{' '}
                          <span className="text-sm font-normal text-slate-400">{item.unidade}</span>
                        </div>
                        <p className="text-xs text-slate-500">{item.mensagem}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recomendações */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">Recomendações de manejo</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {resultado.recomendacao.itens.map((item, idx) => (
                    <div key={idx} className="p-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{item.acao}</div>
                        {item.observacao && (
                          <p className="text-xs text-slate-500 mt-1 max-w-xl">{item.observacao}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-green-700">{item.quantidade_ha}</div>
                        <div className="text-xs text-slate-500">{item.unidade}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {resultado.recomendacao.observacoes.length > 0 && (
                  <div className="bg-amber-50 border-t border-amber-100 p-5 space-y-1.5">
                    {resultado.recomendacao.observacoes.map((obs, idx) => (
                      <p key={idx} className="text-xs text-amber-900">
                        ℹ {obs}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Transparência do cálculo (rastreabilidade) */}
              <details className="bg-white rounded-2xl border border-slate-200 mb-6 group">
                <summary className="p-5 cursor-pointer text-sm font-semibold text-slate-700 flex items-center justify-between">
                  Como calculamos essa recomendação?
                  <span className="text-slate-400 text-xs group-open:hidden">mostrar</span>
                  <span className="text-slate-400 text-xs hidden group-open:inline">ocultar</span>
                </summary>
                <div className="px-5 pb-5 text-xs text-slate-500 space-y-2 border-t border-slate-100 pt-4">
                  <p>
                    <strong className="text-slate-700">Calagem:</strong> NC (t/ha) = (V%meta −
                    V%atual) × CTC ÷ 10, com meta de{' '}
                    {configCultura(resultado.propriedade.cultura).metaV}% de saturação por bases
                    para {configCultura(resultado.propriedade.cultura).label.toLowerCase()}.
                  </p>
                  <p>
                    <strong className="text-slate-700">Fósforo e Potássio:</strong> dose
                    proporcional à classe de teor do solo (baixo/médio/adequado), limitada a um
                    teto de referência por cultura (
                    {configCultura(resultado.propriedade.cultura).tetoP} kg/ha de P₂O₅ e{' '}
                    {configCultura(resultado.propriedade.cultura).tetoK} kg/ha de K₂O).
                  </p>
                  <p>
                    <strong className="text-slate-700">Nitrogênio:</strong> produtividade esperada
                    (t) × fator da cultura (
                    {configCultura(resultado.propriedade.cultura).fatorN} kg de N por tonelada).
                  </p>
                  <p className="pt-1 text-slate-400">
                    Motor de regras {VERSAO_MOTOR} — valores de ordem de grandeza para um MVP;
                    não reproduzem tabela de nenhuma publicação específica e não substituem laudo
                    e recomendação de um engenheiro agrônomo.
                  </p>
                </div>
              </details>

              {/* Estimativa de custo */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">Estimativa de custo</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                        <th className="px-5 py-3 font-medium">Insumo</th>
                        <th className="px-5 py-3 font-medium">Quantidade total</th>
                        <th className="px-5 py-3 font-medium">Preço unitário</th>
                        <th className="px-5 py-3 font-medium text-right">Custo total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resultado.custo.itens.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-5 py-3 text-slate-700">{item.descricao}</td>
                          <td className="px-5 py-3 text-slate-600">
                            {item.quantidade_total} {item.unidade}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {formatarMoeda(item.preco_unitario)}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-slate-800">
                            {formatarMoeda(item.custo_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50">
                        <td className="px-5 py-3 font-semibold text-slate-800" colSpan={3}>
                          Total da área ({resultado.propriedade.area_ha} ha) · R$/ha:{' '}
                          {formatarMoeda(resultado.custo.custo_por_ha)}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-green-700">
                          {formatarMoeda(resultado.custo.custo_total_area)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
                <strong>Aviso:</strong> As recomendações são estimativas geradas por um motor de
                regras simplificado, com base agronômica regional para{' '}
                {configCultura(resultado.propriedade.cultura).label.toLowerCase()} no Ceará/Nordeste.
                Devem ser validadas por profissional habilitado e ajustadas às condições locais.
              </div>
            </>
          )}
    </main>
  );
}
