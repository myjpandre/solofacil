// =====================================================
// CLIMA (Open-Meteo)
// API pública, gratuita e sem necessidade de chave.
// 1. Geocoding: nome do município -> latitude/longitude
// 2. Forecast: latitude/longitude -> condições atuais e do dia
// https://open-meteo.com/
// =====================================================

export interface PrevisaoClima {
  municipio: string;
  temperatura_atual: number;
  sensacao_termica: number;
  umidade: number;
  chance_chuva_hoje: number;
  precipitacao_prevista_mm: number;
  condicao: string;
  atualizado_em: string;
}

const CODIGOS_TEMPO: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Poucas nuvens',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa forte',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  95: 'Trovoadas',
};

export async function buscarClimaMunicipio(municipio: string): Promise<PrevisaoClima | null> {
  try {
    const nomeBusca = municipio.split(/[-,]/)[0].trim();
    if (!nomeBusca) return null;

    const geoResp = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        nomeBusca
      )}&count=1&language=pt&country=BR`
    );
    if (!geoResp.ok) return null;
    const geoData = await geoResp.json();
    const local = geoData?.results?.[0];
    if (!local) return null;

    const climaResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code` +
        `&daily=precipitation_probability_max,precipitation_sum&timezone=auto`
    );
    if (!climaResp.ok) return null;
    const climaData = await climaResp.json();

    const codigo = climaData?.current?.weather_code as number | undefined;

    return {
      municipio: local.name,
      temperatura_atual: Math.round(climaData.current.temperature_2m),
      sensacao_termica: Math.round(climaData.current.apparent_temperature),
      umidade: Math.round(climaData.current.relative_humidity_2m),
      chance_chuva_hoje: climaData.daily?.precipitation_probability_max?.[0] ?? 0,
      precipitacao_prevista_mm: climaData.daily?.precipitation_sum?.[0] ?? 0,
      condicao: (codigo !== undefined && CODIGOS_TEMPO[codigo]) || 'Condição não identificada',
      atualizado_em: climaData.current.time,
    };
  } catch {
    return null;
  }
}