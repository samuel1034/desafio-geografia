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

/**
 * Descarga y normaliza la lista de paises desde la REST Countries API.
 * Filtra paises que no tienen capital o continente valido.
 *
 * @returns Array de paises normalizados, mezclados aleatoriamente
 */
export async function obtenerPaises(): Promise<Country[]> {
  const resp = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,capital,continents,flags,flag",
    {
      // En produccion (Vercel) recargamos los datos cada hora
      next: { revalidate: 3600 },
    }
  );

  if (!resp.ok) {
    throw new Error(`REST Countries API error: ${resp.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await resp.json();

  const paises: Country[] = raw
    .filter((p) => {
      // Descartamos paises sin capital o sin continente reconocido
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

  // Mezclamos el array para que el orden sea aleatorio cada vez
  return paises.sort(() => Math.random() - 0.5);
}
