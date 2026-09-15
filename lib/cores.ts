import { InterpretacaoNutriente } from '@/types';

export function corClasses(cor: InterpretacaoNutriente['cor']) {
  switch (cor) {
    case 'vermelho':
      return {
        badge: 'bg-red-100 text-red-700',
        bar: 'bg-red-500',
        border: 'border-red-200',
        dot: 'bg-red-500',
      };
    case 'laranja':
      return {
        badge: 'bg-orange-100 text-orange-700',
        bar: 'bg-orange-500',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
      };
    case 'amarelo':
      return {
        badge: 'bg-yellow-100 text-yellow-700',
        bar: 'bg-yellow-500',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
      };
    case 'verde':
      return {
        badge: 'bg-green-100 text-green-700',
        bar: 'bg-green-500',
        border: 'border-green-200',
        dot: 'bg-green-500',
      };
    case 'cinza':
    default:
      return {
        badge: 'bg-slate-100 text-slate-600',
        bar: 'bg-slate-300',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function formatarNivel(nivel: string): string {
  const mapa: Record<string, string> = {
    muito_baixo: 'Muito baixo',
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    muito_alto: 'Muito alto',
    adequado: 'Adequado',
    nao_informado: 'Não informado',
  };
  return mapa[nivel] ?? nivel;
}

export function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
