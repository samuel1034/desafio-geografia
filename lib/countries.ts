/**
 * Utilidad para obtener datos de paises desde la REST Countries API.
 *
 * Esta funcion se puede llamar tanto desde componentes del servidor
 * como desde el cliente (es fetch puro, sin dependencias de Node.js).
 */

import type { Country } from "@/lib/types";

// Continentes que tienen nombre legible y suficiente cantidad de paises
const CONTINENTES_VALIDOS = new Set([
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Antarctic",
]);

// Traducciones de continentes al espanol para mostrar en el juego
const CONTINENTE_ES: Record<string, string> = {
  Africa: "Africa",
  Americas: "America",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceania",
  Antarctic: "Antartica",
};

const API_URL =
  "https://restcountries.com/v3.1/all?fields=name,capital,continents,flags,flag";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsearPaises(raw: any[]): Country[] {
  return raw
    .filter((p) => {
      const continente = p.continents?.[0];
      const capital = p.capital?.[0];
      return capital && continente && CONTINENTES_VALIDOS.has(continente);
    })
    .map((p) => ({
      name: p.name.common,
      capital: p.capital[0],
      continent: CONTINENTE_ES[p.continents[0]] ?? p.continents[0],
      flagUrl: p.flags?.svg ?? p.flags?.png ?? "",
      flagEmoji: p.flag ?? "🏳️",
    }));
}

/**
 * Descarga y normaliza la lista de paises desde la REST Countries API.
 * Reintenta hasta 3 veces con timeout de 8s por intento.
 * Lanza error si tras 3 intentos no se obtienen al menos 50 paises.
 *
 * @returns Array de paises normalizados, mezclados aleatoriamente
 */
export async function obtenerPaises(): Promise<Country[]> {
  let lastError: unknown;

  for (let intento = 1; intento <= 3; intento++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(API_URL, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await resp.json();
      const raw = Array.isArray(data) ? data : [];
      const paises = parsearPaises(raw);

      if (paises.length < 50) {
        throw new Error(`Solo ${paises.length} paises recibidos, reintentando`);
      }

      return paises.sort(() => Math.random() - 0.5);
    } catch (err) {
      lastError = err;
      console.error(`[obtenerPaises] Intento ${intento}/3 fallido:`, err);
      if (intento < 3) await new Promise((r) => setTimeout(r, 1000 * intento));
    }
  }

  throw lastError;
}
