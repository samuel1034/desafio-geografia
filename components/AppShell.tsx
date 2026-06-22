"use client";

/**
 * AppShell - Envoltorio principal para estudiantes.
 * Incluye header con info de sesion y el JuegoController.
 * Hace el fetch de paises desde el navegador (no desde Vercel).
 */

import { useState, useEffect } from "react";
import { cerrarSesion } from "@/lib/actions";
import { Globe2, LogOut, GraduationCap, Loader2 } from "lucide-react";
import JuegoController from "@/components/JuegoController";
import type { Country, Desafio, SessionPayload } from "@/lib/types";

interface Props {
  desafios: Desafio[];
  sesion: SessionPayload;
}

const CONTINENTES_VALIDOS = new Set([
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Antarctic",
]);

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
function parsear(raw: any[]): Country[] {
  return raw
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

export default function AppShell({ desafios, sesion }: Props) {
  const [paises, setPaises]   = useState<Country[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((raw) => {
        const lista = Array.isArray(raw) ? parsear(raw) : [];
        if (lista.length < 50) throw new Error("Respuesta incompleta de la API");
        setPaises(lista.sort(() => Math.random() - 0.5));
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center gap-3 shrink-0">
        <Globe2 className="w-5 h-5 text-emerald-400" />
        <span className="text-white font-bold text-sm">GeoDesafio</span>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            {sesion.nombre}
          </div>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </header>

      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-start md:items-center justify-center p-6 pt-4">
        {cargando ? (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-sm">Cargando paises...</span>
          </div>
        ) : error ? (
          <div className="text-center max-w-sm">
            <Globe2 className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-white font-bold mb-2">No se pudieron cargar los paises</h2>
            <p className="text-slate-400 text-sm mb-4">
              Verifica tu conexion y vuelve a intentarlo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <JuegoController paises={paises} desafios={desafios} sesion={sesion} />
        )}
      </div>

      <footer className="text-center py-3 text-slate-800 text-xs">
        Datos: REST Countries API v3.1
      </footer>
    </div>
  );
}
