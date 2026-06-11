import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateCountryScore } from "../services/macroScore";

export default function CountryRankingChart({ countries }) {
  const data = countries
    .map((country) => ({
      country: country.country,
      score: calculateCountryScore(country),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <section className="panel">
      <h3>Ranking de países</h3>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} layout="vertical" margin={{ left: 32 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="country" type="category" width={90} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}