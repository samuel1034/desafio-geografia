/**
 * Constantes de continentes compartidas.
 * El fetch de paises se hace en el cliente (AppShell) para evitar
 * restricciones de red en Vercel serverless — no exportar obtenerPaises
 * desde Server Components.
 */

// Continentes validos segun la REST Countries API v3.1
export const CONTINENTES_VALIDOS = new Set([
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Antarctic",
]);

// Mapeo de nombres en ingles (API) a espanol (BD / UI)
export const CONTINENTE_ES: Record<string, string> = {
  Africa: "Africa",
  Americas: "America",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceania",
  Antarctic: "Antartica",
};
