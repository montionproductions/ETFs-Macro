const weights = {
  gdpGrowth: 0.25,
  macroStability: 0.25,
  development: 0.15,
  marketSize: 0.15,
  valuation: 0.1,
  catalysts: 0.1,
};

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function scoreGdpGrowth(growth) {
  if (growth === null || growth === undefined) return 50;

  // -3% o menos = 0, 7% o más = 100
  return clamp(((growth + 3) / 10) * 100);
}

function scoreInflation(inflation) {
  if (inflation === null || inflation === undefined) return 50;

  // Mejor zona: 2% a 4%.
  // Castigamos inflación muy alta y también deflación.
  const distanceFromIdeal = Math.abs(inflation - 3);
  return clamp(100 - distanceFromIdeal * 10);
}

function scoreGdpPerCapita(gdpPerCapita) {
  if (gdpPerCapita === null || gdpPerCapita === undefined) return 50;

  // Escala simple: 0 a 80,000 USD per capita.
  return clamp((gdpPerCapita / 80000) * 100);
}

function scoreMarketSize(gdpCurrentUsd) {
  if (gdpCurrentUsd === null || gdpCurrentUsd === undefined) return 50;

  // Escala logarítmica aproximada para no hacer que EUA aplaste todo.
  const trillionUsd = gdpCurrentUsd / 1_000_000_000_000;
  return clamp((Math.log10(trillionUsd + 1) / Math.log10(30)) * 100);
}

export function calculateRealMacroScore(macroData, manualInputs = {}) {
  const latest = macroData?.latest ?? {};

  const gdpGrowthValue = latest.gdpGrowth?.value ?? null;
  const inflationValue = latest.inflation?.value ?? null;
  const gdpPerCapitaValue = latest.gdpPerCapita?.value ?? null;
  const gdpCurrentUsdValue = latest.gdpCurrentUsd?.value ?? null;

  const partialScores = {
    gdpGrowth: scoreGdpGrowth(gdpGrowthValue),
    macroStability: scoreInflation(inflationValue),
    development: scoreGdpPerCapita(gdpPerCapitaValue),
    marketSize: scoreMarketSize(gdpCurrentUsdValue),
    valuation: manualInputs.valuation ?? 60,
    catalysts: manualInputs.catalysts ?? 60,
  };

  const total =
    partialScores.gdpGrowth * weights.gdpGrowth +
    partialScores.macroStability * weights.macroStability +
    partialScores.development * weights.development +
    partialScores.marketSize * weights.marketSize +
    partialScores.valuation * weights.valuation +
    partialScores.catalysts * weights.catalysts;

  return {
    score: Math.round(total),
    partialScores: Object.fromEntries(
      Object.entries(partialScores).map(([key, value]) => [
        key,
        Math.round(value),
      ])
    ),
    rawValues: {
      gdpGrowth: latest.gdpGrowth,
      inflation: latest.inflation,
      gdpPerCapita: latest.gdpPerCapita,
      population: latest.population,
      gdpCurrentUsd: latest.gdpCurrentUsd,
    },
  };
}

export function getRating(score) {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bueno";
  if (score >= 55) return "Neutral";
  if (score >= 40) return "Riesgoso";
  return "Evitar";
}

export function getVerdict(score) {
  if (score >= 85) return "Comprar / Core holding";
  if (score >= 70) return "Comprar en caídas / Mantener";
  if (score >= 55) return "Esperar mejor precio";
  if (score >= 40) return "Solo táctico";
  return "Evitar";
}

export function getRiskLevel(score) {
  if (score >= 75) return "Medio-bajo";
  if (score >= 60) return "Medio";
  if (score >= 45) return "Alto";
  return "Muy alto";
}