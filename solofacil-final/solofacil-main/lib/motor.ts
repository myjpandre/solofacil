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
} from '@/types';

// =====================================================
// MOTOR DE DECISÃO - PROJETO AGRO
// Foco: Milho no Ceará
// Baseado em recomendações técnicas (Embrapa e literatura regional)
// Todas as regras são explícitas e rastreáveis
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
      mensagem: 'Faixa adequada para milho',
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

function classificarSaturacaoBases(v: number | null): InterpretacaoNutriente {
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

  if (v < 40) {
    return {
      parametro: 'Saturação por Bases (V%)',
      valor: v,
      unidade: '%',
      nivel: 'baixo',
      cor: 'vermelho',
      mensagem: 'Baixa (calagem recomendada)',
    };
  }
  if (v < 60) {
    return {
      parametro: 'Saturação por Bases (V%)',
      valor: v,
      unidade: '%',
      nivel: 'medio',
      cor: 'laranja',
      mensagem: 'Média',
    };
  }
  if (v <= 70) {
    return {
      parametro: 'Saturação por Bases (V%)',
      valor: v,
      unidade: '%',
      nivel: 'adequado',
      cor: 'verde',
      mensagem: 'Adequada para milho',
    };
  }
  return {
    parametro: 'Saturação por Bases (V%)',
    valor: v,
    unidade: '%',
    nivel: 'alto',
    cor: 'verde',
    mensagem: 'Alta',
  };
}

export function gerarDiagnostico(dados: DadosSolo): Diagnostico {
  const interpretacoes: InterpretacaoNutriente[] = [
    classificarPH(dados.ph),
    classificarFosforo(dados.p),
    classificarPotassio(dados.k),
    classificarCalcio(dados.ca),
    classificarMagnesio(dados.mg),
    classificarSaturacaoBases(dados.v_porcento),
  ];

  const problemas: string[] = [];

  interpretacoes.forEach((item) => {
    if (item.nivel === 'muito_baixo' || item.nivel === 'baixo') {
      problemas.push(`${item.parametro}: ${item.mensagem}`);
    }
  });

  let resumo = 'Solo com características adequadas para o cultivo de milho.';
  if (problemas.length > 0) {
    resumo = `Principais limitações identificadas: ${problemas.join('; ')}.`;
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

  const vAtual = dados.v_porcento;
  const ctc = dados.ctc;

  if (vAtual !== null && ctc !== null && vAtual < 60) {
    const vDesejada = 65;
    const nc = ((vDesejada - vAtual) * ctc) / 10;

    if (nc > 0.3) {
      itens.push({
        acao: 'Calagem (correção da acidez)',
        quantidade_ha: Number(nc.toFixed(2)),
        unidade: 't/ha de calcário',
        observacao: 'Aplicar e incorporar preferencialmente 60 dias antes do plantio. Usar calcário com PRNT conhecido.',
      });
    }
  } else if (vAtual === null || ctc === null) {
    observacoes.push('Não foi possível calcular a necessidade de calagem (faltam V% ou CTC).');
  }

  const p = dados.p;
  let doseP = 0;
  if (p !== null) {
    if (p < 6) doseP = 90;
    else if (p < 12) doseP = 60;
    else if (p < 20) doseP = 40;
    else doseP = 20;
  } else {
    observacoes.push('Fósforo não informado — recomendação de P não calculada.');
  }

  if (doseP > 0) {
    itens.push({
      acao: 'Adubação fosfatada (P₂O₅)',
      quantidade_ha: doseP,
      unidade: 'kg/ha de P₂O₅',
      observacao: 'Aplicar no plantio, preferencialmente no sulco.',
    });
  }

  const k = dados.k;
  let doseK = 0;
  if (k !== null) {
    if (k < 40) doseK = 70;
    else if (k < 80) doseK = 50;
    else if (k < 120) doseK = 30;
    else doseK = 0;
  } else {
    observacoes.push('Potássio não informado — recomendação de K não calculada.');
  }

  if (doseK > 0) {
    itens.push({
      acao: 'Adubação potássica (K₂O)',
      quantidade_ha: doseK,
      unidade: 'kg/ha de K₂O',
      observacao: 'Pode ser aplicado no plantio ou parcelado.',
    });
  }

  const prodEsperadaTon = propriedade.produtividade_esperada / 1000;
  const doseN = Math.round(prodEsperadaTon * 17);

  itens.push({
    acao: 'Adubação nitrogenada (N)',
    quantidade_ha: doseN,
    unidade: 'kg/ha de N',
    observacao: 'Parcelar: parte no plantio + cobertura(s). Ajustar conforme textura do solo e chuvas.',
  });

  observacoes.push(
    'As recomendações são estimativas baseadas em critérios técnicos gerais para milho no Nordeste. Devem ser validadas por profissional habilitado e ajustadas às condições locais.'
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
  const diagnostico = gerarDiagnostico(dadosSolo);
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
