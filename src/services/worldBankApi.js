const WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2";

export const WORLD_BANK_INDICATORS = {
  gdpGrowth: "NY.GDP.MKTP.KD.ZG",
  inflation: "FP.CPI.TOTL.ZG",
  gdpPerCapita: "NY.GDP.PCAP.CD",
  population: "SP.POP.TOTL",
  gdpCurrentUsd: "NY.GDP.MKTP.CD",
};

function withTimeout(promise, ms = 10000) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("La consulta tardó demasiado. Revisa conexión o CORS."));
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

async function fetchWorldBankIndicator(countryCode, indicatorCode) {
  const url = `${WORLD_BANK_BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=30`;

  console.log("[WorldBank] Fetching:", url);

  const response = await withTimeout(fetch(url), 10000);

  if (!response.ok) {
    throw new Error(`World Bank API error ${response.status}: ${indicatorCode}`);
  }

  const json = await response.json();

  const rows = json?.[1];

  if (!Array.isArray(rows)) {
    console.warn("[WorldBank] Respuesta inesperada:", json);
    return [];
  }

  const validRows = rows
    .filter((row) => row.value !== null && row.value !== undefined)
    .map((row) => ({
      year: Number(row.date),
      value: Number(row.value),
      indicator: row.indicator?.value,
      country: row.country?.value,
      countryCode: row.countryiso3code,
    }))
    .sort((a, b) => b.year - a.year);

  console.log("[WorldBank] Result:", indicatorCode, validRows[0]);

  return validRows;
}

export async function fetchCountryMacroData(countryCode) {
  console.log("[WorldBank] Starting country fetch:", countryCode);

  const indicatorEntries = Object.entries(WORLD_BANK_INDICATORS);

  const results = await Promise.allSettled(
    indicatorEntries.map(async ([key, indicatorCode]) => {
      const data = await fetchWorldBankIndicator(countryCode, indicatorCode);

      return [key, data];
    })
  );

  const indicators = {};

  results.forEach((result, index) => {
    const [key] = indicatorEntries[index];

    if (result.status === "fulfilled") {
      indicators[key] = result.value[1];
    } else {
      console.error(`[WorldBank] Failed indicator ${key}:`, result.reason);
      indicators[key] = [];
    }
  });

  return {
    countryCode,
    indicators,
    latest: {
      gdpGrowth: indicators.gdpGrowth?.[0] ?? null,
      inflation: indicators.inflation?.[0] ?? null,
      gdpPerCapita: indicators.gdpPerCapita?.[0] ?? null,
      population: indicators.population?.[0] ?? null,
      gdpCurrentUsd: indicators.gdpCurrentUsd?.[0] ?? null,
    },
  };
}