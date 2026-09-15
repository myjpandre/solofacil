import { ResultadoCompleto } from '@/types';

// =====================================================
// PERSISTÊNCIA LOCAL (MVP)
// Enquanto a integração com Supabase não está configurada
// (faltam as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e
// NEXT_PUBLIC_SUPABASE_ANON_KEY), os diagnósticos são salvos
// no localStorage do navegador. A estrutura dos dados já é
// compatível com `ResultadoCompleto`, então migrar para o
// Supabase depois é só trocar as funções abaixo.
// =====================================================

const STORAGE_KEY = 'solofacil_diagnosticos';

export interface DiagnosticoSalvo extends ResultadoCompleto {
  id: string;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function listarDiagnosticos(): DiagnosticoSalvo[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const dados = JSON.parse(raw) as DiagnosticoSalvo[];
    return dados.sort(
      (a, b) => new Date(b.gerado_em).getTime() - new Date(a.gerado_em).getTime()
    );
  } catch {
    return [];
  }
}

export function obterDiagnostico(id: string): DiagnosticoSalvo | null {
  const todos = listarDiagnosticos();
  return todos.find((d) => d.id === id) ?? null;
}

export function salvarDiagnostico(resultado: ResultadoCompleto): DiagnosticoSalvo {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `diag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const salvo: DiagnosticoSalvo = { ...resultado, id };

  if (isBrowser()) {
    const todos = listarDiagnosticos();
    todos.push(salvo);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  return salvo;
}

export function excluirDiagnostico(id: string): void {
  if (!isBrowser()) return;
  const todos = listarDiagnosticos().filter((d) => d.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
