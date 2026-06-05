"use client";

/**
 * AppShell - Envoltorio principal para estudiantes.
 * Incluye header con info de sesion y el JuegoController.
 */

import { cerrarSesion } from "@/lib/actions";
import { Globe2, LogOut, GraduationCap } from "lucide-react";
import JuegoController from "@/components/JuegoController";
import type { Country, Desafio, SessionPayload } from "@/lib/types";

interface Props {
  paises: Country[];
  desafios: Desafio[];
  sesion: SessionPayload;
}

export default function AppShell({ paises, desafios, sesion }: Props) {
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
        <JuegoController paises={paises} desafios={desafios} sesion={sesion} />
      </div>

      <footer className="text-center py-3 text-slate-800 text-xs">
        Datos: REST Countries API v3.1
      </footer>
    </div>
  );
}
