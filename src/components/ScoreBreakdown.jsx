import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function ScoreBreakdown({ country }) {
  const data = [
    { factor: "Crecimiento", score: country.gdpGrowth },
    { factor: "Estabilidad", score: country.macroStability },
    { factor: "Instituciones", score: country.institutions },
    { factor: "Mercado", score: country.marketQuality },
    { factor: "Valuación", score: country.valuation },
    { factor: "Catalizadores", score: country.catalysts },
  ];

  return (
    <section className="panel">
      <h3>Desglose macroeconómico</h3>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="factor" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar dataKey="score" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}