# Roadmap — SoloFácil

Este documento consolida a análise de prioridades para o MVP e o estado atual de cada item.
Baseado numa revisão técnica do projeto (setembro/2026), atualizado conforme as entregas.

## 1. Status por prioridade

| Prioridade | Item | Status |
|------------|------|--------|
| P0 | Login estável (sem "Failed to fetch" travando a tela) | ✅ Feito — `AuthContext` agora trata falhas de rede com try/catch e mensagem amigável |
| P0 | Botão **Sair** | ✅ Já presente no `Sidebar` |
| P0 | **10 culturas** no formulário e no tipo `Cultura` | ✅ Feito — `types/index.ts` + `lib/culturas.ts` |
| P0 | **Motor por cultura** (V%, N, tetos P/K, textos) | ✅ Feito — `lib/motor.ts` generalizado |
| P1 | Histórico mostrar cultura real (não "Milho" fixo) | ✅ Feito |
| P1 | Produtividade padrão ao trocar cultura | ✅ Feito (formulário de propriedade e de nova análise) |
| P1 | Deploy Vercel + URLs no Supabase | ⏳ Pendente — depende de decisão de hospedagem |
| P2 | PDF do relatório | ✅ Já existia (jsPDF), atualizado para mostrar a cultura real |
| P2 | Transparência do cálculo (rastreabilidade) na tela | ✅ Feito — seção "Como calculamos essa recomendação?" |
| P2 | Municípios CE no clima / geocoding fino | ⏳ Geocoding genérico (Open-Meteo) já funciona; refinar depois |
| P2 | Fonte/versão das regras no relatório | ✅ Feito — `VERSAO_MOTOR` exibida no relatório e no PDF |
| P3 | Validação por agrônomo / painel de regras | 🔜 Fora do MVP curto |
| P3 | IoT, mapa, marketplace | 🔜 Depois |

**Ordem prática seguida:** P0 login → P0 culturas + motor regional → P1 histórico → P2 transparência/PDF.
Deploy (P1) fica como próximo passo natural.

---

## 2. Culturas suportadas (Ceará / Nordeste)

| Código | Nome | Grupo |
|--------|------|-------|
| `milho` | Milho | Anual |
| `feijao_caupi` | Feijão-caupi | Anual |
| `mandioca` | Mandioca | Anual |
| `caju` | Castanha-de-caju | Perene |
| `banana` | Banana | Perene |
| `coco` | Coco | Perene |
| `maracuja` | Maracujá | Perene |
| `tomate` | Tomate | Anual |
| `batata_doce` | Batata-doce | Anual |
| `mamao` | Mamão | Perene |

Implementado em `types/index.ts` (`Cultura`) e `lib/culturas.ts` (`CULTURAS`, `LISTA_CULTURAS`,
`configCultura`).

---

## 3. Algoritmo com base agronômica regional (implementado em `lib/motor.ts`)

### Princípios (MVP rastreável)

1. **Interpretação do solo** (pH, P, K, Ca, Mg, V%, CTC) — classes em faixas simples.
2. **Calagem** pela saturação por bases, com **meta de V% por cultura**:
   `NC (t/ha) = (V%_meta − V%_atual) × CTC / 10`
3. **P e K** por classe de teor no solo (baixo/médio/adequado) × **teto por cultura**.
4. **N** por produtividade esperada (t) × **fator da cultura** (0 no feijão-caupi, que é
   leguminosa fixadora).
5. **Clima** (Open-Meteo) só orienta *quando* aplicar — não altera a dose no MVP.
6. Toda recomendação carrega no rodapé: *"motor de regras simplificado; validar com
   profissional e laudo completo"*, mais a versão do motor (`VERSAO_MOTOR`).

Referências de espírito (não copiadas literalmente no código): recomendações Embrapa/IPA e
literatura de sequeiro/irrigado no Nordeste — o app declara explicitamente "regras
simplificadas para MVP" na própria tela de resultado.

### Metas de V%, fator de N e tetos de P/K por cultura

| Cultura | V% meta | Fator N (kg/t) | Teto P₂O₅ (kg/ha) | Teto K₂O (kg/ha) |
|---------|---------|----------------|--------------------|--------------------|
| Milho | 62 | 16,5 | 90 | 70 |
| Feijão-caupi | 55 | 0 (fixadora) | 60 | 50 |
| Mandioca | 47 | 4 | 50 | 60 |
| Castanha-de-caju | 55 | 2 (perene) | 60 | 60 |
| Banana | 65 | 6 (perene) | 100 | 150 |
| Coco | 65 | 3 (perene) | 90 | 120 |
| Maracujá | 65 | 6 (perene) | 120 | 140 |
| Tomate | 75 | 8 | 150 | 180 |
| Batata-doce | 55 | 3 | 70 | 80 |
| Mamão | 65 | 6 (perene) | 110 | 130 |

Perenes (caju, banana, coco, maracujá, mamão): a dose de N é tratada como estimativa
**anual/por ciclo**, com observação explícita para ajustar conforme a idade do pomar e a fase
(formação × produção) — isso já está implementado nas observações da recomendação.

### Produtividade padrão sugerida ao trocar a cultura no formulário

| Cultura | Padrão implementado | Unidade |
|---------|---------------------|---------|
| Milho | 5.000 | kg/ha |
| Feijão-caupi | 1.200 | kg/ha |
| Mandioca | 18.000 | kg/ha |
| Castanha-de-caju | 900 | kg/ha/ano |
| Banana | 20.000 | kg/ha/ano |
| Coco | 12.000 | kg/ha/ano |
| Maracujá | 20.000 | kg/ha/ano |
| Tomate | 60.000 | kg/ha |
| Batata-doce | 12.000 | kg/ha |
| Mamão | 40.000 | kg/ha/ano |

O produtor pode editar livremente; o padrão só evita começar do zero ao trocar a cultura.

### Fluxo do algoritmo

```text
Dados solo + propriedade (cultura, área, produtividade, município)
        ↓
Diagnóstico (interpretação por parâmetro, V% comparada à meta da cultura)
        ↓
Recomendação:
  calagem (V% meta da cultura)
  + P (classe solo × teto cultura)
  + K (classe solo × teto cultura)
  + N (produtividade × fator cultura, 0 se fixadora)
        ↓
Custo estimado (preços unitários MVP)
        ↓
Clima (Open-Meteo) — só sugestão de janela de aplicação
        ↓
Relatório + seção "Como calculamos" + aviso legal + versão do motor
```

### O que o algoritmo ainda **não** promete (fica como próximo passo)

- Dose fina por textura/argila de cada gleba
- Micronutrientes (Zn, B, Cu) em escala
- Diferenciar sequeiro vs. irrigado com sensor
- Substituição do engenheiro agrônomo — o app é uma ferramenta de apoio, não um laudo técnico

---

## 4. Próximos passos sugeridos

1. Deploy em produção (Vercel) + configurar URLs de redirecionamento no Supabase Auth.
2. Edição de propriedades já cadastradas (hoje: criar, listar, excluir).
3. Micronutrientes (Zn, B, Cu) no motor de diagnóstico.
4. Histórico comparativo entre análises da mesma propriedade ao longo do tempo.
5. Dashboard com gráficos de evolução de custo e indicadores de solo.
6. Painel/versão para revisão das regras por um engenheiro agrônomo antes de publicar updates
   do motor.
