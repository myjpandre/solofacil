export type Cultura = 'milho' | 'feijao' | 'sorgo' | 'mandioca';

export const CULTURAS_LABEL: Record<Cultura, string> = {
  milho: 'Milho',
  feijao: 'Feijão',
  sorgo: 'Sorgo',
  mandioca: 'Mandioca',
};

export const CULTURAS_OPCOES: { value: Cultura; label: string }[] = [
  { value: 'milho', label: 'Milho' },
  { value: 'feijao', label: 'Feijão' },
  { value: 'sorgo', label: 'Sorgo' },
  { value: 'mandioca', label: 'Mandioca' },
];

export interface Propriedade {
  id?: string;
  user_id?: string;
  nome: string;
  municipio: string;
  area_ha: number;
  cultura: Cultura;
  produtividade_esperada: number;
}

export interface DadosSolo {
  ph: number | null;
  p: number | null;
  k: number | null;
  ca: number | null;
  mg: number | null;
  al: number | null;
  h_al: number | null;
  mo: number | null;
  ctc: number | null;
  v_porcento: number | null;
}

export type Nivel =
  | 'muito_baixo'
  | 'baixo'
  | 'medio'
  | 'alto'
  | 'muito_alto'
  | 'adequado'
  | 'nao_informado';

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