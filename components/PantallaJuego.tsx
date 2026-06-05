"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ArrowRight, HelpCircle, Map } from "lucide-react";
import type { Country, Question, QuestionType, Desafio } from "@/lib/types";

interface Props {
  paises: Country[];
  desafio: Desafio;
  nombreJugador: string;
  onGameOver: (puntaje: number) => void;
}

function generarPregunta(paises: Country[], usados: Set<string>): Question | null {
  const disponibles = paises.filter((p) => !usados.has(p.name));
  if (disponibles.length === 0) return null;
  const pais = disponibles[Math.floor(Math.random() * disponibles.length)];
  const tipo: QuestionType = Math.random() > 0.5 ? "capital" : "continente";
  return {
    country: pais,
    type: tipo,
    correctAnswer: tipo === "capital" ? pais.capital : pais.continent,
  };
}

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export default function PantallaJuego({ paises, desafio, nombreJugador, onGameOver }: Props) {
  const [puntaje, setPuntaje]       = useState(0);
  const [vidas, setVidas]           = useState(desafio.vidas);
  const [preguntaNum, setPreguntaNum] = useState(0);
  const [respuesta, setRespuesta]   = useState("");
  const [pregunta, setPregunta]     = useState<Question | null>(null);
  const [usados, setUsados]         = useState<Set<string>>(new Set());
  const [feedback, setFeedback]     = useState<"correcto" | "incorrecto" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paises.length === 0) { onGameOver(0); return; }
    setPregunta(generarPregunta(paises, new Set()));
  }, [paises, onGameOver]);

  useEffect(() => {
    if (!feedback) setTimeout(() => inputRef.current?.focus(), 100);
  }, [pregunta, feedback]);

  function avanzarPregunta(puntajeActual: number) {
    const nuevosUsados = new Set(usados);
    if (pregunta) nuevosUsados.add(pregunta.country.name);
    setUsados(nuevosUsados);

    // Verificamos si llegamos al limite de preguntas del desafio
    if (preguntaNum + 1 >= desafio.num_preguntas) {
      onGameOver(puntajeActual);
      return;
    }

    const siguiente = generarPregunta(paises, nuevosUsados);
    if (!siguiente) { onGameOver(puntajeActual); return; }

    setPregunta(siguiente);
    setPreguntaNum((n) => n + 1);
    setRespuesta("");
    setFeedback(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pregunta || feedback) return;

    const esCorrecto = normalizar(respuesta) === normalizar(pregunta.correctAnswer);

    if (esCorrecto) {
      const nuevoPuntaje = puntaje + 1;
      setPuntaje(nuevoPuntaje);
      setFeedback("correcto");
      setTimeout(() => avanzarPregunta(nuevoPuntaje), 1200);
    } else {
      const nuevasVidas = vidas - 1;
      setVidas(nuevasVidas);
      setFeedback("incorrecto");
      if (nuevasVidas <= 0) {
        setTimeout(() => onGameOver(puntaje), 1500);
      } else {
        setTimeout(() => avanzarPregunta(puntaje), 1500);
      }
    }
  }

  if (!pregunta) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const textosPregunta: Record<QuestionType, string> = {
    capital:    `Capital de ${pregunta.country.name}`,
    continente: `Continente de ${pregunta.country.name}`,
  };

  const progreso = ((preguntaNum) / desafio.num_preguntas) * 100;

  return (
    <motion.div
      key={pregunta.country.name}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-5 w-full max-w-md"
    >
      {/* Header del desafio */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Map className="w-3.5 h-3.5" />
        <span className="truncate">{desafio.titulo}</span>
      </div>

      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: desafio.vidas }).map((_, i) => (
            <motion.div key={i} animate={vidas <= i ? { scale: [1, 1.4, 0] } : { scale: 1 }}>
              <Heart className={`w-5 h-5 ${i < vidas ? "text-red-400 fill-red-400" : "text-slate-700 fill-slate-700"}`} />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-white font-bold text-sm">{puntaje}</span>
        </div>

        <span className="text-slate-500 text-xs">{preguntaNum + 1}/{desafio.num_preguntas}</span>
      </div>

      {/* Barra de progreso */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Tarjeta del pais */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
        <motion.div
          key={pregunta.country.flagUrl}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="w-36 h-24 rounded-lg overflow-hidden border border-slate-600 shadow-lg"
        >
          {pregunta.country.flagUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pregunta.country.flagUrl}
              alt={`Bandera de ${pregunta.country.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-700">
              {pregunta.country.flagEmoji}
            </div>
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-white">{pregunta.country.name}</h2>

        <div className="flex items-center gap-2 text-cyan-400">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <p className="font-medium text-center">{textosPregunta[pregunta.type]}</p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            disabled={!!feedback}
            placeholder="Tu respuesta..."
            className={`w-full rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all border ${
              feedback === "correcto"
                ? "bg-emerald-900/40 border-emerald-500"
                : feedback === "incorrecto"
                ? "bg-red-900/40 border-red-500"
                : "bg-slate-800 border-slate-600 focus:border-cyan-500"
            }`}
          />
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute -bottom-6 left-1 text-xs font-medium ${
                  feedback === "correcto" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {feedback === "correcto" ? "Correcto! +1" : `Era: ${pregunta.correctAnswer}`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={!respuesta.trim() || !!feedback}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl px-5 py-3.5 transition-all"
        >
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>
    </motion.div>
  );
}
