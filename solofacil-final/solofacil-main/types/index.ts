export type Cultura = 'milho';

export interface Propriedade {
  id?: string;
  user_id?: string;
  nome: string;
  municipio: string;
  area_ha: number;
  cultura: Cultura;
  produtividade_esperada: number; // kg/ha
}

export interface DadosSolo {
  ph: number | null;
  p: number | null;          // mg/dm³
  k: number | null;          // mg/dm³
  ca: number | null;         // cmolc/dm³
  mg: number | null;         // cmolc/dm³
  al: number | null;         // cmolc/dm³
  h_al: number | null;       // cmolc/dm³
  mo: number | null;         // g/dm³
  ctc: number | null;        // cmolc/dm³
  v_porcento: number | null; // %
}

export type Nivel = 'muito_baixo' | 'baixo' | 'medio' | 'alto' | 'muito_alto' | 'adequado' | 'nao_informado';

export interface InterpretacaoNutriente {
  parametro: string;
  valor: number | null;
  unidade: string;
  nivel: Nivel;
  cor: 'vermelho' | 'laranja' | 'amarelo' | 'verde' | 'cinza';
  mensagem: string;
}

export interface Diagnostico {
  interpretacoes: InterpretacaoNutriente[];
  problemas_principais: string[];
  resumo: string;
}

export interface RecomendacaoItem {
  acao: string;
  quantidade_ha: number;
  unidade: string;
  observacao?: string;
}

export interface Recomendacao {
  itens: RecomendacaoItem[];
  observacoes: string[];
}

export interface EstimativaCusto {
  itens: {
    descricao: string;
    quantidade_total: number;
    unidade: string;
    preco_unitario: number;
    custo_total: number;
  }[];
  custo_total_area: number;
  custo_por_ha: number;
}

export interface ResultadoCompleto {
  propriedade: Propriedade;
  dados_solo: DadosSolo;
  diagnostico: Diagnostico;
  recomendacao: Recomendacao;
  custo: EstimativaCusto;
  gerado_em: string;
}
