// ============================================================
// Tipos compartidos entre cliente y servidor
// ============================================================

export interface Country {
  name: string;
  capital: string;
  continent: string;
  flagUrl: string;
  flagEmoji: string;
}

export type QuestionType = "capital" | "continente";

export interface Question {
  country: Country;
  type: QuestionType;
  correctAnswer: string;
}

export interface ScoreEntry {
  id: number;
  nombre_usuario: string;
  puntaje: number;
  desafio_titulo: string;
  creado_en: string;
}

// ---- Auth ----

export type Rol = "estudiante" | "profesor";

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
}

// Payload del JWT guardado en la cookie de sesion
export interface SessionPayload {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
}

// ---- Desafios ----

export interface Desafio {
  id: number;
  titulo: string;
  descripcion: string;
  continente: string | null;   // null = todos los continentes
  num_preguntas: number;
  vidas: number;
  activo: boolean;
  profesor_id: number;
  profesor_nombre?: string;
  creado_en: string;
}

export type GameState = "lobby" | "playing" | "gameover";
