import {
  DadosSolo,
  Diagnostico,
  InterpretacaoNutriente,
  Nivel,
  Recomendacao,
  RecomendacaoItem,
  EstimativaCusto,
  Propriedade,
  ResultadoCompleto,
  Cultura,
} from '@/types';
import { configCultura } from './culturas';

export const VERSAO_MOTOR = '1.1.0 — 10 culturas (Ceará/Nordeste)';

// =====================================================
// MOTOR DE DECISÃO - PROJETO AGRO
// Cobre 10 culturas do Ceará/Nordeste (ver lib/culturas.ts)
// Baseado em recomendações técnicas gerais (Embrapa e literatura
// regional). Todas as regras são explícitas e rastreáveis.
// =====================================================

function classificarPH(ph: number | null): InterpretacaoNutriente {
  if (ph === null) {
    return {
      parametro: 'pH',
      valor: null,
      unidade: '',
      nivel: 'nao_informado',
      cor: 'cinza',
      mensagem: 'Dado não informado',
    };
  }

  if (ph < 5.0) {
    return {
      parametro: 'pH',
      valor: ph,
      unidade: '',
      nivel: 'muito_baixo',
      cor: 'vermelho',
      mensagem: 'Acidez muito elevada',
    };
  }
  if (ph < 5.5) {
    return {
      parametro: 'pH',
      valor: ph,
      unidade: '',
      nivel: 'baixo',
      cor: 'laranja',
      mensagem: 'Acidez elevada',
    };
  }
  if (ph < 6.0) {
    return {
      parametro: 'pH',
      valor: ph,
      unidade: '',
      nivel: 'medio',
      cor: 'amarelo',
      mensagem: 'Acidez moderada',
    };
  }
  if (ph <= 6.5) {
    return {
      parametro: 'pH',
      valor: ph,
      unidade: '',
      nivel: 'adequado',
      cor: 'verde',
      mensagem: 'Faixa adequada para a maioria das culturas',
    };
  }
  return {
    parametro: 'pH',
    valor: ph,
    unidade: '',
    nivel: 'alto',
    cor: 'amarelo',
    mensagem: 'pH elevado (verificar)',
  };
}

function classificarFosforo(p: number | null): InterpretacaoNutriente {
  if (p === null) {
    return {
      parametro: 'Fósforo (P)',
      valor: null,
      unidade: 'mg/dm³',
      nivel: 'nao_informado',
      cor: 'cinza',
      mensagem: 'Dado não informado',
    };
  }

  if (p < 6) {
    return {
      parametro: 'Fósforo (P)',
      valor: p,
      unidade: 'mg/dm³',
      nivel: 'baixo',
      cor: 'vermelho',
      mensagem: 'Baixa disponibilidade',
    };
  }
  if (p < 12) {
    return {
      parametro: 'Fósforo (P)',
      valor: p,
      unidade: 'mg/dm³',
      nivel: 'medio',
      cor: 'laranja',
      mensagem: 'Disponibilidade intermediária',
    };
  }
  if (p < 20) {
    return {
      parametro: 'Fósforo (P)',
      valor: p,
      unidade: 'mg/dm³',
      nivel: 'adequado',
      cor: 'verde',
      mensagem: 'Nível adequado',
    };
  }
  return {
    parametro: 'Fósforo (P)',
    valor: p,
    unidade: 'mg/dm³',
    nivel: 'alto',
    cor: 'verde',
    mensagem: 'Alta disponibilidade',
  };
}

function classificarPotassio(k: number | null): InterpretacaoNutriente {
  if (k === null) {
    return {
      parametro: 'Potássio (K)',
      valor: null,
      unidade: 'mg/dm³',
      nivel: 'nao_informado',
      cor: 'cinza',
      mensagem: 'Dado não informado',
    };
  }

  if (k < 40) {
    return {
      parametro: 'Potássio (K)',
      valor: k,
      unidade: 'mg/dm³',
      nivel: 'baixo',
      cor: 'vermelho',
      mensagem: 'Baixa disponibilidade',
    };
  }
  if (k < 80) {
    return {
      parametro: 'Potássio (K)',
      valor: k,
      unidade: 'mg/dm³',
      nivel: 'medio',
      cor: 'laranja',
      mensagem: 'Disponibilidade intermediária',
    };
  }
  if (k < 120) {
    return {
      parametro: 'Potássio (K)',
      valor: k,
      unidade: 'mg/dm³',
      nivel: 'adequado',
      cor: 'verde',
      mensagem: 'Nível adequado',
    };
  }
  return {
    parametro: 'Potássio (K)',
    valor: k,
    unidade: 'mg/dm³',
    nivel: 'alto',
    cor: 'verde',
    mensagem: 'Alta disponibilidade',
  };
}

function classificarCalcio(ca: number | null): InterpretacaoNutriente {
  if (ca === null) {
    return {
      parametro: 'Cálcio (Ca)',
      valor: null,
      unidade: 'cmolc/dm³',
      nivel: 'nao_informado',
      cor: 'cinza',
      mensagem: 'Dado não informado',
    };
  }

  if (ca < 1.5) {
    return {
      parametro: 'Cálcio (Ca)',
      valor: ca,
      unidade: 'cmolc/dm³',
      nivel: 'baixo',
      cor: 'laranja',
      mensagem: 'Baixo',
    };
  }
  if (ca < 3.0) {
    return {
      parametro: 'Cálcio (Ca)',
      valor: ca,
      unidade: 'cmolc/dm³',
      nivel: 'medio',
      cor: 'amarelo',
      mensagem: 'Médio',
    };
  }
  return {
    parametro: 'Cálcio (Ca)',
    valor: ca,
    unidade: 'cmolc/dm³',
    nivel: 'adequado',
    cor: 'verde',
    mensagem: 'Adequado',
  };
}

function classificarMagnesio(mg: number | null): InterpretacaoNutriente {
  if (mg === null) {
    return {
      parametro: 'Magnésio (Mg)',
      valor: null,
      unidade: 'cmolc/dm³',
      nivel: 'nao_informado',
      cor: 'cinza',
      mensagem: 'Dado não informado',
    };
  }

  if (mg < 0.5) {
    return {
      parametro: 'Magnésio (Mg)',
      valor: mg,
      unidade: 'cmolc/dm³',
      nivel: 'baixo',
      cor: 'laranja',
      mensagem: 'Baixo',
    };
  }
  if (mg < 1.0) {
    return {
      parametro: 'Magnésio (Mg)',
      valor: mg,
      unidade: 'cmolc/dm³',
      nivel: 'medio',
      cor: 'amarelo',
      mensagem: 'Médio',
    };
  }
  return {
    parametro: 'Magnésio (Mg)',
      valor: mg,
      unidade: 'cmolc/dm³',
      nivel: 'adequado',
      cor: 'verde',
      mensagem: 'Adequado',
  };
}

function classificarSaturacaoBases(v: number | null, metaV: number): InterpretacaoNutriente {
  if (v === null) {
    return {
      parametro: 'Saturação por Bases (V%)',
      valor: null,
      unidade: '%',
      nivel: 'nao_informado',
      cor: 'cinza',
      mensagem: 'Dado não informado',
    };
  }

  const diferenca = v - metaV;

  if (diferenca < -20) {
    return {
      parametro: 'Saturação por Bases (V%)',
      valor: v,
      unidade: '%',
      nivel: 'muito_baixo',
      cor: 'vermelho',
      mensagem: `Muito abaixo da meta desta cultura (${metaV}%) — calagem prioritária`,
    };
  }
  if (diferenca < -5) {
    return {
      parametro: 'Saturação por Bases (V%)',
      valor: v,
      unidade: '%',
      nivel: 'baixo',
      cor: 'laranja',
      mensagem: `Abaixo da meta desta cultura (${metaV}%) — calagem recomendada`,
    };
  }
  if (diferenca <= 10) {
    return {
      parametro: 'Saturação por Bases (V%)',
      valor: v,
      unidade: '%',
      nivel: 'adequado',
      cor: 'verde',
      mensagem: `Adequada para esta cultura (meta: ${metaV}%)`,
    };
  }
  return {
    parametro: 'Saturação por Bases (V%)',
    valor: v,
    unidade: '%',
    nivel: 'alto',
    cor: 'verde',
    mensagem: `Acima da meta desta cultura (${metaV}%) — calagem não é prioridade`,
  };
}

export function gerarDiagnostico(dados: DadosSolo, cultura: Cultura): Diagnostico {
  const { metaV, label } = configCultura(cultura);

  const interpretacoes: InterpretacaoNutriente[] = [
    classificarPH(dados.ph),
    classificarFosforo(dados.p),
    classificarPotassio(dados.k),
    classificarCalcio(dados.ca),
    classificarMagnesio(dados.mg),
    classificarSaturacaoBases(dados.v_porcento, metaV),
  ];

  const problemas: string[] = [];

  interpretacoes.forEach((item) => {
    if (item.nivel === 'muito_baixo' || item.nivel === 'baixo') {
      problemas.push(`${item.parametro}: ${item.mensagem}`);
    }
  });

  let resumo = `Solo com características adequadas para o cultivo de ${label.toLowerCase()}.`;
  if (problemas.length > 0) {
    resumo = `Principais limitações identificadas para ${label.toLowerCase()}: ${problemas.join('; ')}.`;
  }

  return {
    interpretacoes,
    problemas_principais: problemas,
    resumo,
  };
}

export function gerarRecomendacao(
  dados: DadosSolo,
  propriedade: Propriedade
): Recomendacao {
  const itens: RecomendacaoItem[] = [];
  const observacoes: string[] = [];
  const config = configCultura(propriedade.cultura);

  // ---------- Calagem (meta de V% específica da cultura) ----------
  const vAtual = dados.v_porcento;
  const ctc = dados.ctc;

  if (vAtual !== null && ctc !== null) {
    if (vAtual < config.metaV) {
      const nc = ((config.metaV - vAtual) * ctc) / 10;

      if (nc > 0.3) {
        itens.push({
          acao: 'Calagem (correção da acidez)',
          quantidade_ha: Number(nc.toFixed(2)),
          unidade: 't/ha de calcário',
          observacao: `Cálculo: NC = (V%meta − V%atual) × CTC ÷ 10, com meta de ${config.metaV}% de saturação por bases para ${config.label.toLowerCase()}. Aplicar e incorporar preferencialmente 60–90 dias antes do plantio (ou início do ciclo, em perenes). Usar calcário com PRNT conhecido.`,
        });
      }
    } else {
      observacoes.push(
        `Saturação por bases atual (${vAtual}%) já está na meta ou acima da meta de ${config.metaV}% para ${config.label.toLowerCase()} — calagem não é prioridade neste momento.`
      );
    }
  } else {
    observacoes.push('Não foi possível calcular a necessidade de calagem (faltam V% ou CTC).');
  }

  // ---------- Fósforo (classe do solo × teto da cultura) ----------
  const p = dados.p;
  let doseP = 0;
  if (p !== null) {
    let fracaoTeto = 0;
    if (p < 6) fracaoTeto = 1;
    else if (p < 12) fracaoTeto = 0.67;
    else if (p < 20) fracaoTeto = 0.44;
    else fracaoTeto = 0.22;
    doseP = Math.round(config.tetoP * fracaoTeto);
  } else {
    observacoes.push('Fósforo não informado — recomendação de P não calculada.');
  }

  if (doseP > 0) {
    itens.push({
      acao: 'Adubação fosfatada (P₂O₅)',
      quantidade_ha: doseP,
      unidade: 'kg/ha de P₂O₅',
      observacao: `Teto de referência para ${config.label.toLowerCase()}: ${config.tetoP} kg/ha. Aplicar no plantio (ou na formação da cova, em perenes), preferencialmente próximo às raízes.`,
    });
  }

  // ---------- Potássio (classe do solo × teto da cultura) ----------
  const k = dados.k;
  let doseK = 0;
  if (k !== null) {
    let fracaoTeto = 0;
    if (k < 40) fracaoTeto = 1;
    else if (k < 80) fracaoTeto = 0.7;
    else if (k < 120) fracaoTeto = 0.4;
    else fracaoTeto = 0;
    doseK = Math.round(config.tetoK * fracaoTeto);
  } else {
    observacoes.push('Potássio não informado — recomendação de K não calculada.');
  }

  if (doseK > 0) {
    itens.push({
      acao: 'Adubação potássica (K₂O)',
      quantidade_ha: doseK,
      unidade: 'kg/ha de K₂O',
      observacao: `Teto de referência para ${config.label.toLowerCase()}: ${config.tetoK} kg/ha. Pode ser aplicado no plantio ou parcelado — em perenes, parcelar ao longo do ciclo produtivo.`,
    });
  }

  // ---------- Nitrogênio (produtividade esperada × fator da cultura) ----------
  if (config.fatorN > 0) {
    const prodEsperadaTon = propriedade.produtividade_esperada / 1000;
    const doseN = Math.round(prodEsperadaTon * config.fatorN);

    if (doseN > 0) {
      itens.push({
        acao: 'Adubação nitrogenada (N)',
        quantidade_ha: doseN,
        unidade: 'kg/ha de N',
        observacao:
          config.notaN ??
          'Parcelar: parte no plantio + cobertura(s). Ajustar conforme textura do solo e regime de chuvas/irrigação.',
      });
    }
  } else if (config.notaN) {
    observacoes.push(config.notaN);
  }

  if (config.grupo === 'perene') {
    observacoes.push(
      `${config.label} é uma cultura perene: as doses acima são uma estimativa anual/por ciclo e devem ser ajustadas conforme a idade do pomar e a fase (formação × produção).`
    );
  }

  observacoes.push(
    `Estimativa gerada por um motor de regras simplificado (base agronômica regional para o Ceará/Nordeste). Não substitui a recomendação de um engenheiro agrônomo com base em laudo completo e histórico da área.`
  );

  return { itens, observacoes };
}

export function gerarEstimativaCusto(
  recomendacao: Recomendacao,
  areaHa: number
): EstimativaCusto {
  const precos: Record<string, number> = {
    't/ha de calcário': 180,
    'kg/ha de P₂O₅': 8.5,
    'kg/ha de K₂O': 6.0,
    'kg/ha de N': 7.5,
  };

  const itensCusto = recomendacao.itens.map((item) => {
    const precoUnit = precos[item.unidade] ?? 0;
    const quantidadeTotal = item.quantidade_ha * areaHa;
    const custoTotal = quantidadeTotal * precoUnit;

    return {
      descricao: item.acao,
      quantidade_total: Number(quantidadeTotal.toFixed(2)),
      unidade: item.unidade.replace('/ha', ''),
      preco_unitario: precoUnit,
      custo_total: Number(custoTotal.toFixed(2)),
    };
  });

  const custoTotalArea = itensCusto.reduce((acc, i) => acc + i.custo_total, 0);

  return {
    itens: itensCusto,
    custo_total_area: Number(custoTotalArea.toFixed(2)),
    custo_por_ha: Number((custoTotalArea / areaHa).toFixed(2)),
  };
}

export function processarDiagnosticoCompleto(
  propriedade: Propriedade,
  dadosSolo: DadosSolo
): ResultadoCompleto {
  const diagnostico = gerarDiagnostico(dadosSolo, propriedade.cultura);
  const recomendacao = gerarRecomendacao(dadosSolo, propriedade);
  const custo = gerarEstimativaCusto(recomendacao, propriedade.area_ha);

  return {
    propriedade,
    dados_solo: dadosSolo,
    diagnostico,
    recomendacao,
    custo,
    gerado_em: new Date().toISOString(),
  };
}
