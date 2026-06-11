import { useMemo, useState } from "react";
import { countryMacroData } from "../data/countries.seed";
import { countryEtfs } from "../data/etfs.seed";
import CountryScoreCard from "../components/CountryScoreCard";
import ScoreBreakdown from "../components/ScoreBreakdown";
import CountryRankingChart from "../components/CountryRankingChart";
import "../styles/global.css";

export default function App() {
  const [selectedCode, setSelectedCode] = useState("MX");

  const selectedCountry = useMemo(() => {
    return countryMacroData.find((item) => item.countryCode === selectedCode);
  }, [selectedCode]);

  const selectedEtf = useMemo(() => {
    return countryEtfs.find((item) => item.countryCode === selectedCode);
  }, [selectedCode]);

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Macro ETF Lab</p>
        <h1>Análisis macroeconómico para ETFs indexados</h1>
        <p>
          Compara países, evalúa riesgos macroeconómicos y convierte datos en
          una calificación visual para tomar mejores decisiones.
        </p>
      </header>

      <section className="toolbar">
        <label>
          Selecciona país
          <select
            value={selectedCode}
            onChange={(event) => setSelectedCode(event.target.value)}
          >
            {countryMacroData.map((country) => (
              <option key={country.countryCode} value={country.countryCode}>
                {country.country}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="dashboard-grid">
        <CountryScoreCard country={selectedCountry} etf={selectedEtf} />
        <ScoreBreakdown country={selectedCountry} />
      </div>

      <CountryRankingChart countries={countryMacroData} />
    </main>
  );
}