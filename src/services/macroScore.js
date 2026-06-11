const weights = {
  gdpGrowth: 0.2,
  macroStability: 0.2,
  institutions: 0.15,
  marketQuality: 0.15,
  valuation: 0.2,
  catalysts: 0.1,
};

export function calculateCountryScore(country) {
  const score =
    country.gdpGrowth * weights.gdpGrowth +
    country.macroStability * weights.macroStability +
    country.institutions * weights.institutions +
    country.marketQuality * weights.marketQuality +
    country.valuation * weights.valuation +
    country.catalysts * weights.catalysts;

  return Math.round(score);
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