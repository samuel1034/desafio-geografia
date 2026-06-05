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
import { Globe2, AlertCircle } from "lucide-react";
import AppShell from "@/components/AppShell";

export default async function HomePage() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/auth");
  if (sesion.rol === "profesor") redirect("/profesor");

  // Cargamos paises y desafios en paralelo
  let paises;
  let desafios;

  try {
    [paises, desafios] = await Promise.all([
      obtenerPaises(),
      obtenerDesafiosActivos(),
    ]);
  } catch (error) {
    console.error("[HomePage]", error);
    return (
      <main className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Error al cargar</h1>
          <p className="text-slate-400 text-sm">Recarga la pagina para intentar de nuevo.</p>
        </div>
      </main>
    );
  }

  return <AppShell paises={paises} desafios={desafios} sesion={sesion} />;
}
