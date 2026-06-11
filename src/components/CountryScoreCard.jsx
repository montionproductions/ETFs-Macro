import {
  calculateCountryScore,
  getRating,
  getVerdict,
  getRiskLevel,
} from "../services/macroScore";

export default function CountryScoreCard({ country, etf }) {
  const score = calculateCountryScore(country);

  return (
    <article className="score-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">{etf?.ticker}</p>
          <h2>{country.country}</h2>
          <p>{etf?.name}</p>
        </div>

        <div className="score-badge">
          <span>{score}</span>
          <small>/100</small>
        </div>
      </div>

      <div className="card-grid">
        <div>
          <span>Rating</span>
          <strong>{getRating(score)}</strong>
        </div>
        <div>
          <span>Veredicto</span>
          <strong>{getVerdict(score)}</strong>
        </div>
        <div>
          <span>Riesgo</span>
          <strong>{getRiskLevel(score)}</strong>
        </div>
        <div>
          <span>Tema</span>
          <strong>{etf?.theme}</strong>
        </div>
      </div>

      <div className="thesis-box">
        <p>
          <strong>Catalizador:</strong> {country.mainCatalyst}
        </p>
        <p>
          <strong>Riesgo principal:</strong> {country.mainRisk}
        </p>
      </div>
    </article>
  );
}