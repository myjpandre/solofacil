import { supabase } from './supabase';
import {
  DadosSolo,
  Diagnostico,
  EstimativaCusto,
  Propriedade,
  Recomendacao,
  ResultadoCompleto,
} from '@/types';

// =====================================================
// ACESSO A DADOS (Supabase)
// Cada diagnóstico e propriedade pertence a um usuário
// autenticado (RLS garante isso no banco também).
// Ver supabase/schema.sql para a estrutura das tabelas.
// =====================================================

export interface PropriedadeSalva extends Propriedade {
  id: string;
}

export interface DiagnosticoSalvo {
  id: string;
  propriedade: PropriedadeSalva;
  dados_solo: DadosSolo;
  diagnostico: Diagnostico;
  recomendacao: Recomendacao;
  custo: EstimativaCusto;
  gerado_em: string;
}

function db() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Confira o arquivo .env.local.');
  }
  return supabase;
}

function mapPropriedade(row: any): PropriedadeSalva {
  return {
    id: row.id,
    nome: row.nome,
    municipio: row.municipio,
    area_ha: Number(row.area_ha),
    cultura: row.cultura,
    produtividade_esperada: Number(row.produtividade_esperada),
  };
}

function mapDiagnostico(row: any): DiagnosticoSalvo {
  return {
    id: row.id,
    propriedade: mapPropriedade(row.propriedades),
    dados_solo: row.dados_solo,
    diagnostico: row.diagnostico,
    recomendacao: row.recomendacao,
    custo: row.custo,
    gerado_em: row.gerado_em,
  };
}

// ---------- Propriedades ----------

export async function listarPropriedades(): Promise<PropriedadeSalva[]> {
  const { data, error } = await db()
    .from('propriedades')
    .select('*')
    .order('nome', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapPropriedade);
}

export async function criarPropriedade(propriedade: Propriedade): Promise<PropriedadeSalva> {
  const sb = db();
  const { data: userData, error: userError } = await sb.auth.getUser();
  if (userError || !userData.user) throw new Error('Usuário não autenticado.');

  const { data, error } = await sb
    .from('propriedades')
    .insert({
      user_id: userData.user.id,
      nome: propriedade.nome,
      municipio: propriedade.municipio,
      area_ha: propriedade.area_ha,
      cultura: propriedade.cultura,
      produtividade_esperada: propriedade.produtividade_esperada,
    })
    .select()
    .single();
  if (error) throw error;
  return mapPropriedade(data);
}

export async function excluirPropriedade(id: string): Promise<void> {
  const { error } = await db().from('propriedades').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Diagnósticos ----------

export async function salvarDiagnostico(
  resultado: ResultadoCompleto,
  propriedadeId: string
): Promise<DiagnosticoSalvo> {
  const sb = db();
  const { data: userData, error: userError } = await sb.auth.getUser();
  if (userError || !userData.user) throw new Error('Usuário não autenticado.');

  const { data, error } = await sb
    .from('diagnosticos')
    .insert({
      user_id: userData.user.id,
      propriedade_id: propriedadeId,
      dados_solo: resultado.dados_solo,
      diagnostico: resultado.diagnostico,
      recomendacao: resultado.recomendacao,
      custo: resultado.custo,
      gerado_em: resultado.gerado_em,
    })
    .select('*, propriedades(*)')
    .single();
  if (error) throw error;
  return mapDiagnostico(data);
}

export async function listarDiagnosticos(): Promise<DiagnosticoSalvo[]> {
  const { data, error } = await db()
    .from('diagnosticos')
    .select('*, propriedades(*)')
    .order('gerado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDiagnostico);
}

export async function obterDiagnostico(id: string): Promise<DiagnosticoSalvo | null> {
  const { data, error } = await db()
    .from('diagnosticos')
    .select('*, propriedades(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDiagnostico(data) : null;
}

export async function excluirDiagnostico(id: string): Promise<void> {
  const { error } = await db().from('diagnosticos').delete().eq('id', id);
  if (error) throw error;
}
