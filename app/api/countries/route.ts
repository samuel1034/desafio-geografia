import { CONTINENTES_VALIDOS, CONTINENTE_ES } from "@/lib/countries";
import type { Country } from "@/lib/types";

// Fuentes en orden de prioridad. Si la primera falla se intenta la siguiente.
const SOURCES = [
  "https://restcountries.com/v3.1/all?fields=name,capital,continents,flags,flag",
  // Misma base de datos, CDN de GitHub — formato identico a v3.1
  "https://raw.githubusercontent.com/mledoze/countries/master/countries.json",
];

async function fetchJson(url: string, timeoutMs = 10000): Promise<unknown[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } finally {
    clearTimeout(timer);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsear(raw: unknown[]): Country[] {
  return (raw as any[])
    .filter((p) => {
      const c = p.continents?.[0];
      const cap = p.capital?.[0];
      return cap && c && CONTINENTES_VALIDOS.has(c);
    })
    .map((p) => ({
      name: p.name.common,
      capital: p.capital[0],
      continent: CONTINENTE_ES[p.continents[0]] ?? p.continents[0],
      flagUrl: p.flags?.svg ?? p.flags?.png ?? "",
      flagEmoji: p.flag ?? "🏳️",
    }));
}

export async function GET() {
  for (const url of SOURCES) {
    try {
      const raw = await fetchJson(url);
      const paises = parsear(raw);
      if (paises.length >= 50) {
        return Response.json(paises);
      }
      console.warn(`[/api/countries] Solo ${paises.length} paises desde ${url}`);
    } catch (err) {
      console.error(`[/api/countries] Fallo en ${url}:`, err);
    }
  }

  console.error("[/api/countries] Todas las fuentes fallaron");
  return Response.json(
    { error: "No se pudieron cargar los paises" },
    { status: 503 }
  );
}
