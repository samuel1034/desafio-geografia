/**
 * PAGINA PRINCIPAL - Server Component
 *
 * - Si no hay sesion -> redirige a /auth
 * - Si es profesor   -> redirige a /profesor
 * - Si es estudiante -> muestra lobby de desafios
 */

import { obtenerSesion } from "@/lib/session";
import { obtenerPaises } from "@/lib/countries";
import { obtenerDesafiosActivos } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Globe2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import type { Country, Desafio } from "@/lib/types";

function PantallaError() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <Globe2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Error al cargar paises</h1>
        <p className="text-slate-400 text-sm mb-4">
          No se pudo conectar con la API de geografia. Intenta recargar la pagina.
        </p>
        <a
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition-colors"
        >
          Recargar
        </a>
      </div>
    </main>
  );
}

export default async function HomePage() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/auth");
  if (sesion.rol === "profesor") redirect("/profesor");

  let paises: Country[] = [];
  let desafios: Desafio[] = [];
  let errorCarga = false;

  try {
    [paises, desafios] = await Promise.all([
      obtenerPaises(),
      obtenerDesafiosActivos(),
    ]);
  } catch (err) {
    console.error("[HomePage] Error cargando datos:", err);
    errorCarga = true;
  }

  if (errorCarga || paises.length === 0) {
    return <PantallaError />;
  }

  return <AppShell paises={paises} desafios={desafios} sesion={sesion} />;
}
