import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCountryMacroData } from "../hooks/useCountryMacroData";
import {
  calculateRealMacroScore,
  getRating,
  getRiskLevel,
  getVerdict,
} from "../services/macroScore";
import "../styles/global.css";

const etfUniverse = [
  {
    code: "MEX",
    country: "México",
    ticker: "EWW / NAFTRAC",
    name: "México ETF",
    marketType: "Emergente",
    valuation: 74,
    catalysts: 86,
    thesis: "Nearshoring, manufactura y consumo interno.",
  },
  {
    code: "USA",
    country: "Estados Unidos",
    ticker: "IVV / VOO / SPY",
    name: "S&P 500 ETF",
    marketType: "Desarrollado",
    valuation: 48,
    catalysts: 82,
    thesis: "Tecnología, productividad, dólar y mercado profundo.",
  },
  {
    code: "IND",
    country: "India",
    ticker: "INDA",
    name: "India ETF",
    marketType: "Emergente",
    valuation: 42,
    catalysts: 92,
    thesis: "Demografía, digitalización y crecimiento estructural.",
  },
  {
    code: "BRA",
    country: "Brasil",
    ticker: "EWZ",
    name: "Brasil ETF",
    marketType: "Emergente",
    valuation: 80,
    catalysts: 68,
    thesis: "Commodities, bancos, dividendos y tasas reales.",
  },
  {
    code: "CHN",
    country: "China",
    ticker: "MCHI / FXI",
    name: "China ETF",
    marketType: "Emergente",
    valuation: 76,
    catalysts: 58,
    thesis: "Manufactura, consumo interno y tecnología.",
  },
  {
    code: "CAN",
    country: "Canadá",
    ticker: "EWC",
    name: "Canadá ETF",
    marketType: "Desarrollado",
    valuation: 62,
    catalysts: 64,
    thesis: "Energía, bancos, recursos naturales y estabilidad.",
  },
  {
    code: "CHE",
    country: "Suiza",
    ticker: "EWL",
    name: "Suiza ETF",
    marketType: "Desarrollado",
    valuation: 50,
    catalysts: 58,
    thesis: "Mercado defensivo, salud, consumo premium y estabilidad.",
  },
];

function formatNumber(value) {
  if (value === null || value === undefined) return "N/D";

  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(item) {
  if (!item) return "N/D";
  return `${formatNumber(item.value)}%`;
}

function formatUsd(value) {
  if (value === null || value === undefined) return "N/D";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatUsdPlain(item) {
  if (!item) return "N/D";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(item.value);
}

function ETFSelector({ label, value, onChange, usedCodes }) {
  return (
    <label className="compare-selector">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {etfUniverse.map((etf) => (
          <option
            key={etf.code}
            value={etf.code}
            disabled={usedCodes.includes(etf.code) && etf.code !== value}
          >
            {etf.country} — {etf.ticker}
          </option>
        ))}
      </select>
    </label>
  );
}

function ETFCompareCard({ item }) {
  const score = item.scoreResult.score;

  return (
    <article className="compare-card">
      <div className="compare-card-top">
        <div>
          <p className="eyebrow">{item.etf.ticker}</p>
          <h2>{item.etf.country}</h2>
          <p>{item.etf.thesis}</p>
        </div>

        <div className="mini-score">
          <span>{score}</span>
          <small>/100</small>
        </div>
      </div>

      <div className="compare-tags">
        <span>{item.etf.marketType}</span>
        <span>{getRating(score)}</span>
        <span>Riesgo {getRiskLevel(score)}</span>
      </div>

      <div className="mini-metrics-grid">
        <div>
          <span>PIB real</span>
          <strong>{formatPercent(item.scoreResult.rawValues.gdpGrowth)}</strong>
        </div>
        <div>
          <span>Inflación</span>
          <strong>{formatPercent(item.scoreResult.rawValues.inflation)}</strong>
        </div>
        <div>
          <span>PIB total</span>
          <strong>
            {formatUsd(item.scoreResult.rawValues.gdpCurrentUsd?.value)}
          </strong>
        </div>
      </div>

      <p className="verdict-text">{getVerdict(score)}</p>
    </article>
  );
}

function LoadingState() {
  return (
    <section className="panel">
      <h3>Cargando datos reales...</h3>
      <p>Consultando World Bank API para los 3 países seleccionados.</p>
    </section>
  );
}

function ErrorState({ errors }) {
  return (
    <section className="panel error-panel">
      <h3>Error cargando datos</h3>
      <p>Uno o más ETFs no pudieron cargar datos reales.</p>

      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error?.message ?? "Error desconocido"}</li>
        ))}
      </ul>
    </section>
  );
}

function RankingChart({ comparedEtfs }) {
  const data = comparedEtfs
    .map((item) => ({
      etf: item.etf.ticker,
      country: item.etf.country,
      score: item.scoreResult.score,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <section className="panel">
      <h3>Ranking por score macro</h3>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical" margin={{ left: 32 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="country" type="category" width={110} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function FactorComparisonChart({ comparedEtfs }) {
  const labels = {
    gdpGrowth: "Crecimiento",
    macroStability: "Estabilidad",
    development: "Desarrollo",
    marketSize: "Tamaño mercado",
    valuation: "Valuación",
    catalysts: "Catalizadores",
  };

  const data = Object.entries(labels).map(([key, label]) => {
    const row = { factor: label };

    comparedEtfs.forEach((item) => {
      row[item.etf.country] = item.scoreResult.partialScores[key];
    });

    return row;
  });

  return (
    <section className="panel">
      <h3>Comparación por factores</h3>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="factor" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {comparedEtfs.map((item) => (
              <Bar
                key={item.etf.code}
                dataKey={item.etf.country}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ComparisonTable({ comparedEtfs }) {
  return (
    <section className="panel">
      <h3>Resumen de datos reales</h3>

      <div className="table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>ETF</th>
              <th>País</th>
              <th>Score</th>
              <th>PIB real</th>
              <th>Inflación</th>
              <th>PIB per cápita</th>
              <th>PIB total</th>
              <th>Veredicto</th>
            </tr>
          </thead>

          <tbody>
            {comparedEtfs.map((item) => {
              const score = item.scoreResult.score;
              const raw = item.scoreResult.rawValues;

              return (
                <tr key={item.etf.code}>
                  <td>{item.etf.ticker}</td>
                  <td>{item.etf.country}</td>
                  <td>
                    <strong>{score}/100</strong>
                  </td>
                  <td>
                    {formatPercent(raw.gdpGrowth)}
                    <small>{raw.gdpGrowth ? raw.gdpGrowth.year : ""}</small>
                  </td>
                  <td>
                    {formatPercent(raw.inflation)}
                    <small>{raw.inflation ? raw.inflation.year : ""}</small>
                  </td>
                  <td>
                    {formatUsdPlain(raw.gdpPerCapita)}
                    <small>{raw.gdpPerCapita ? raw.gdpPerCapita.year : ""}</small>
                  </td>
                  <td>
                    {formatUsdPlain(raw.gdpCurrentUsd)}
                    <small>{raw.gdpCurrentUsd ? raw.gdpCurrentUsd.year : ""}</small>
                  </td>
                  <td>{getVerdict(score)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function App() {
  const [selectedCodes, setSelectedCodes] = useState(["MEX", "USA", "IND"]);

  const firstQuery = useCountryMacroData(selectedCodes[0]);
  const secondQuery = useCountryMacroData(selectedCodes[1]);
  const thirdQuery = useCountryMacroData(selectedCodes[2]);

  const queries = [firstQuery, secondQuery, thirdQuery];

  const selectedEtfs = useMemo(() => {
    return selectedCodes.map((code) =>
      etfUniverse.find((etf) => etf.code === code)
    );
  }, [selectedCodes]);

  const comparedEtfs = useMemo(() => {
    if (queries.some((query) => !query.data)) return [];

    return selectedEtfs.map((etf, index) => {
      const macroData = queries[index].data;

      return {
        etf,
        macroData,
        scoreResult: calculateRealMacroScore(macroData, {
          valuation: etf.valuation,
          catalysts: etf.catalysts,
        }),
      };
    });
  }, [
    selectedEtfs,
    firstQuery.data,
    secondQuery.data,
    thirdQuery.data,
  ]);

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errors = queries
    .filter((query) => query.isError)
    .map((query) => query.error);

  function updateSelectedCode(index, newCode) {
    setSelectedCodes((current) => {
      const next = [...current];
      next[index] = newCode;
      return next;
    });
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Macro ETF Lab</p>
        <h1>Comparador visual de ETFs por país</h1>
        <p>
          Compara 3 ETFs indexados usando datos macroeconómicos reales,
          indicadores normalizados y una capa propia de scoring.
        </p>
      </header>

      <section className="compare-toolbar">
        <ETFSelector
          label="ETF 1"
          value={selectedCodes[0]}
          onChange={(value) => updateSelectedCode(0, value)}
          usedCodes={selectedCodes}
        />

        <ETFSelector
          label="ETF 2"
          value={selectedCodes[1]}
          onChange={(value) => updateSelectedCode(1, value)}
          usedCodes={selectedCodes}
        />

        <ETFSelector
          label="ETF 3"
          value={selectedCodes[2]}
          onChange={(value) => updateSelectedCode(2, value)}
          usedCodes={selectedCodes}
        />
      </section>

      {isLoading && <LoadingState />}

      {isError && <ErrorState errors={errors} />}

      {!isLoading && !isError && comparedEtfs.length === 3 && (
        <>
          <section className="compare-grid">
            {comparedEtfs.map((item) => (
              <ETFCompareCard key={item.etf.code} item={item} />
            ))}
          </section>

          <section className="charts-grid">
            <RankingChart comparedEtfs={comparedEtfs} />
            <FactorComparisonChart comparedEtfs={comparedEtfs} />
          </section>

          <ComparisonTable comparedEtfs={comparedEtfs} />
        </>
      )}
    </main>
  );
}