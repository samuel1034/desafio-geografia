"use server";

/**
 * SERVER ACTIONS
 * Toda la logica de base de datos y autenticacion corre aqui (solo servidor).
 */

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import db, { initDB } from "@/lib/db";
import { crearSesion, eliminarSesion, obtenerSesion } from "@/lib/session";
import type { Desafio, ScoreEntry, SessionPayload } from "@/lib/types";

// ================================================================
// AUTH
// ================================================================

/** Registra un nuevo usuario */
export async function registrarUsuario(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const email  = (formData.get("email")  as string).trim().toLowerCase();
  const nombre = (formData.get("nombre") as string).trim();
  const pass   = formData.get("password") as string;
  const rol    = (formData.get("rol") as string) === "profesor" ? "profesor" : "estudiante";

  if (!email || !nombre || !pass) return { error: "Todos los campos son obligatorios." };
  if (pass.length < 6)            return { error: "La contrasena debe tener al menos 6 caracteres." };

  // Verificamos si el email ya existe
  const existe = await db.execute({ sql: "SELECT id FROM usuarios WHERE email = ?", args: [email] });
  if (existe.rows.length > 0) return { error: "Ya existe una cuenta con ese email." };

  const hash = await bcrypt.hash(pass, 10);
  const res  = await db.execute({
    sql:  "INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, ?)",
    args: [email, nombre, hash, rol],
  });

  const payload: SessionPayload = {
    id:     Number(res.lastInsertRowid),
    email,
    nombre,
    rol: rol as "estudiante" | "profesor",
  };
  await crearSesion(payload);
  redirect(rol === "profesor" ? "/profesor?flash=registered" : "/?flash=registered");
}

/** Inicia sesion */
export async function iniciarSesion(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const pass  = formData.get("password") as string;

  if (!email || !pass) return { error: "Completa todos los campos." };

  const res = await db.execute({ sql: "SELECT * FROM usuarios WHERE email = ?", args: [email] });
  if (res.rows.length === 0) return { error: "Email o contrasena incorrectos." };

  const user = res.rows[0];
  const ok   = await bcrypt.compare(pass, user.password as string);
  if (!ok) return { error: "Email o contrasena incorrectos." };

  await crearSesion({
    id:     user.id as number,
    email:  user.email as string,
    nombre: user.nombre as string,
    rol:    user.rol as "estudiante" | "profesor",
  });
  redirect(user.rol === "profesor" ? "/profesor?flash=loggedin" : "/?flash=loggedin");
}

/** Cierra sesion */
export async function cerrarSesion() {
  await eliminarSesion();
  redirect("/auth?flash=loggedout");
}

// ================================================================
// DESAFIOS (CRUD del profesor)
// ================================================================

/** Crea un nuevo desafio */
export async function crearDesafio(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") return { error: "Acceso denegado." };

  const titulo        = (formData.get("titulo")       as string).trim();
  const descripcion   = (formData.get("descripcion")  as string).trim();
  const continente    = (formData.get("continente")   as string) || null;
  const num_preguntas = parseInt(formData.get("num_preguntas") as string) || 10;
  const vidas         = parseInt(formData.get("vidas") as string) || 3;

  if (!titulo) return { error: "El titulo es obligatorio." };

  await db.execute({
    sql:  "INSERT INTO desafios (titulo, descripcion, continente, num_preguntas, vidas, profesor_id) VALUES (?,?,?,?,?,?)",
    args: [titulo, descripcion, continente, num_preguntas, vidas, sesion.id],
  });
  redirect("/profesor?flash=created");
}

/** Actualiza un desafio existente */
export async function actualizarDesafio(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") return { error: "Acceso denegado." };

  const id            = parseInt(formData.get("id") as string);
  const titulo        = (formData.get("titulo")      as string).trim();
  const descripcion   = (formData.get("descripcion") as string).trim();
  const continente    = (formData.get("continente")  as string) || null;
  const num_preguntas = parseInt(formData.get("num_preguntas") as string) || 10;
  const vidas         = parseInt(formData.get("vidas") as string) || 3;
  const activo        = formData.get("activo") === "1" ? 1 : 0;

  await db.execute({
    sql:  "UPDATE desafios SET titulo=?, descripcion=?, continente=?, num_preguntas=?, vidas=?, activo=? WHERE id=? AND profesor_id=?",
    args: [titulo, descripcion, continente, num_preguntas, vidas, activo, id, sesion.id],
  });
  redirect("/profesor?flash=updated");
}

/** Elimina un desafio (solo el profesor dueno) */
export async function eliminarDesafio(id: number): Promise<void> {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") return;
  await db.execute({ sql: "DELETE FROM desafios WHERE id=? AND profesor_id=?", args: [id, sesion.id] });
  redirect("/profesor?flash=deleted");
}

/** Lista todos los desafios activos (para estudiantes) */
export async function obtenerDesafiosActivos(): Promise<Desafio[]> {
  await initDB();
  const res = await db.execute(`
    SELECT d.*, u.nombre as profesor_nombre
    FROM desafios d
    LEFT JOIN usuarios u ON u.id = d.profesor_id
    WHERE d.activo = 1
    ORDER BY d.creado_en DESC
  `);
  return res.rows.map(rowToDesafio);
}

/** Lista los desafios del profesor logueado */
export async function obtenerMisDesafios(): Promise<Desafio[]> {
  await initDB();
  const sesion = await obtenerSesion();
  if (!sesion) return [];
  const res = await db.execute({
    sql:  "SELECT * FROM desafios WHERE profesor_id = ? ORDER BY creado_en DESC",
    args: [sesion.id],
  });
  return res.rows.map(rowToDesafio);
}

function rowToDesafio(row: Record<string, unknown>): Desafio {
  return {
    id:            row.id as number,
    titulo:        row.titulo as string,
    descripcion:   (row.descripcion as string) ?? "",
    continente:    row.continente as string | null,
    num_preguntas: row.num_preguntas as number,
    vidas:         row.vidas as number,
    activo:        (row.activo as number) === 1,
    profesor_id:   row.profesor_id as number,
    profesor_nombre: row.profesor_nombre as string | undefined,
    creado_en:     row.creado_en as string,
  };
}

// ================================================================
// PUNTAJES
// ================================================================

export async function guardarPuntaje(
  desafio_id: number,
  puntaje: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    await initDB();
    const sesion = await obtenerSesion();
    if (!sesion) return { ok: false, error: "No autenticado." };

    await db.execute({
      sql:  "INSERT INTO clasificacion (usuario_id, desafio_id, nombre_usuario, puntaje) VALUES (?,?,?,?)",
      args: [sesion.id, desafio_id, sesion.nombre, puntaje],
    });
    return { ok: true };
  } catch (err) {
    console.error("[guardarPuntaje]", err);
    return { ok: false, error: "No se pudo guardar el puntaje." };
  }
}

export async function obtenerClasificacion(desafio_id: number): Promise<ScoreEntry[]> {
  try {
    await initDB();
    const res = await db.execute({
      sql: `
        SELECT c.id, c.nombre_usuario, c.puntaje, c.creado_en, d.titulo as desafio_titulo
        FROM clasificacion c
        JOIN desafios d ON d.id = c.desafio_id
        WHERE c.desafio_id = ?
        ORDER BY c.puntaje DESC
        LIMIT 10
      `,
      args: [desafio_id],
    });
    return res.rows.map((r) => ({
      id:             r.id as number,
      nombre_usuario: r.nombre_usuario as string,
      puntaje:        r.puntaje as number,
      desafio_titulo: r.desafio_titulo as string,
      creado_en:      r.creado_en as string,
    }));
  } catch (err) {
    console.error("[obtenerClasificacion]", err);
    return [];
  }
}
