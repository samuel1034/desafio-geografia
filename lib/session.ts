/**
 * Gestion de sesion con JWT firmado guardado en cookie HttpOnly.
 * Usa la libreria 'jose' (puro JS, compatible con Edge y Node.js).
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "./types";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production-32chars!"
);

const COOKIE_NAME = "geo_session";
const DURACION   = "7d";

/** Crea un JWT firmado y lo guarda en una cookie HttpOnly */
export async function crearSesion(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(DURACION)
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias en segundos
    path: "/",
  });
}

/** Lee y verifica el JWT de la cookie. Retorna null si es invalido o no existe */
export async function obtenerSesion(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Elimina la cookie de sesion (logout) */
export async function eliminarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
