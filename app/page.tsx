/**
 * PAGINA PRINCIPAL - Server Component
 *
 * - Si no hay sesion -> redirige a /auth
 * - Si es profesor   -> redirige a /profesor
 * - Si es estudiante -> muestra lobby de desafios
 *
 * El fetch de paises ocurre en el cliente (AppShell) para evitar
 * restricciones de red en Vercel serverless.
 */

import { obtenerSesion } from "@/lib/session";
import { obtenerDesafiosActivos } from "@/lib/actions";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";

export default async function HomePage() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/auth");
  if (sesion.rol === "profesor") redirect("/profesor");

  const desafios = await obtenerDesafiosActivos();
  return <AppShell desafios={desafios} sesion={sesion} />;
}
