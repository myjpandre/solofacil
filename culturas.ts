import { Cultura } from '@/types';

// =====================================================
// PARÂMETROS AGRONÔMICOS POR CULTURA (MVP — Ceará/Nordeste)
//
// Estes números são uma ORDEM DE GRANDEZA para viabilizar um
// motor de regras simplificado e rastreável, no espírito de
// recomendações técnicas gerais (Embrapa/IPA e literatura
// regional para sequeiro/irrigado no Nordeste). NÃO reproduzem
// tabelas de nenhuma publicação específica e NÃO substituem
// uma recomendação de adubação feita por engenheiro agrônomo
// com base em laudo completo e histórico da área.
//
// metaV            → saturação por bases (V%) alvo da calagem
// fatorN            → kg de N por tonelada de produto esperado
//                      (0 = cultura fixadora, N não é a prioridade)
// tetoP / tetoK     → teto de dose (kg/ha) de P2O5 / K2O no MVP,
//                      evita recomendar doses fora de escala quando
//                      o solo está muito pobre
// produtividadePadrao → valor sugerido ao selecionar a cultura,
//                      só para não começar do zero; o produtor edita
// grupo             → 'anual' (ciclo curto) ou 'perene' (dose de N
//                      tratada como estimativa por ano/ciclo)
// =====================================================

export interface ConfigCultura {
  codigo: Cultura;
  label: string;
  grupo: 'anual' | 'perene';
  metaV: number;
  fatorN: number;
  tetoP: number;
  tetoK: number;
  produtividadePadrao: number;
  unidadeProdutividade: string;
  notaN?: string;
}

export const CULTURAS: Record<Cultura, ConfigCultura> = {
  milho: {
    codigo: 'milho',
    label: 'Milho',
    grupo: 'anual',
    metaV: 62,
    fatorN: 16.5,
    tetoP: 90,
    tetoK: 70,
    produtividadePadrao: 5000,
    unidadeProdutividade: 'kg/ha',
  },
  feijao_caupi: {
    codigo: 'feijao_caupi',
    label: 'Feijão-caupi',
    grupo: 'anual',
    metaV: 55,
    fatorN: 0,
    tetoP: 60,
    tetoK: 50,
    produtividadePadrao: 1200,
    unidadeProdutividade: 'kg/ha',
    notaN:
      'Leguminosa fixadora de N₂ — adubação nitrogenada geralmente dispensável, exceto uma dose de arranque em solos muito pobres.',
  },
  mandioca: {
    codigo: 'mandioca',
    label: 'Mandioca',
    grupo: 'anual',
    metaV: 47,
    fatorN: 4,
    tetoP: 50,
    tetoK: 60,
    produtividadePadrao: 18000,
    unidadeProdutividade: 'kg/ha',
    notaN: 'Baixa exigência relativa de N comparada a outras culturas.',
  },
  caju: {
    codigo: 'caju',
    label: 'Castanha-de-caju',
    grupo: 'perene',
    metaV: 55,
    fatorN: 2,
    tetoP: 60,
    tetoK: 60,
    produtividadePadrao: 900,
    unidadeProdutividade: 'kg/ha/ano',
    notaN: 'Cultura perene: dose é uma estimativa anual de manutenção; ajustar por idade do pomar.',
  },
  banana: {
    codigo: 'banana',
    label: 'Banana',
    grupo: 'perene',
    metaV: 65,
    fatorN: 6,
    tetoP: 100,
    tetoK: 150,
    produtividadePadrao: 20000,
    unidadeProdutividade: 'kg/ha/ano',
    notaN: 'Cultura perene, muito responsiva a K; irrigação muda bastante a exigência.',
  },
  coco: {
    codigo: 'coco',
    label: 'Coco',
    grupo: 'perene',
    metaV: 65,
    fatorN: 3,
    tetoP: 90,
    tetoK: 120,
    produtividadePadrao: 12000,
    unidadeProdutividade: 'kg/ha/ano',
    notaN: 'Cultura perene: dose é uma estimativa anual de manutenção.',
  },
  maracuja: {
    codigo: 'maracuja',
    label: 'Maracujá',
    grupo: 'perene',
    metaV: 65,
    fatorN: 6,
    tetoP: 120,
    tetoK: 140,
    produtividadePadrao: 20000,
    unidadeProdutividade: 'kg/ha/ano',
    notaN: 'Frutífera exigente; parcelar bastante ao longo do ciclo produtivo.',
  },
  tomate: {
    codigo: 'tomate',
    label: 'Tomate',
    grupo: 'anual',
    metaV: 75,
    fatorN: 8,
    tetoP: 150,
    tetoK: 180,
    produtividadePadrao: 60000,
    unidadeProdutividade: 'kg/ha',
    notaN: 'Olerícola de alta exigência nutricional; geralmente cultivado irrigado.',
  },
  batata_doce: {
    codigo: 'batata_doce',
    label: 'Batata-doce',
    grupo: 'anual',
    metaV: 55,
    fatorN: 3,
    tetoP: 70,
    tetoK: 80,
    produtividadePadrao: 12000,
    unidadeProdutividade: 'kg/ha',
  },
  mamao: {
    codigo: 'mamao',
    label: 'Mamão',
    grupo: 'perene',
    metaV: 65,
    fatorN: 6,
    tetoP: 110,
    tetoK: 130,
    produtividadePadrao: 40000,
    unidadeProdutividade: 'kg/ha/ano',
    notaN: 'Cultura perene de ciclo curto a médio; dose é uma estimativa anual.',
  },
};

export const LISTA_CULTURAS: ConfigCultura[] = Object.values(CULTURAS);

export function configCultura(cultura: Cultura): ConfigCultura {
  return CULTURAS[cultura] ?? CULTURAS.milho;
}
