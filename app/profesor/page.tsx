import { obtenerSesion } from "@/lib/session";
import { obtenerMisDesafios } from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfesorDashboard from "@/components/ProfesorDashboard";

export default async function ProfesorPage() {
  const sesion = await obtenerSesion();
  if (!sesion)               redirect("/auth");
  if (sesion.rol !== "profesor") redirect("/");

  const desafios = await obtenerMisDesafios();

  return <ProfesorDashboard desafios={desafios} sesion={sesion} />;
}
