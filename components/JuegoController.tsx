"use client";

/**
 * JuegoController - Orquestador del juego para estudiantes.
 *
 * Estados:
 *   lobby    -> el jugador elige un desafio
 *   playing  -> juego en curso
 *   gameover -> resultados y leaderboard
 */

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LobbyDesafios from "./LobbyDesafios";
import PantallaJuego from "./PantallaJuego";
import PantallaGameOver from "./PantallaGameOver";
import type { Country, Desafio, GameState, SessionPayload } from "@/lib/types";

interface Props {
  paises: Country[];
  desafios: Desafio[];
  sesion: SessionPayload;
}

export default function JuegoController({ paises, desafios, sesion }: Props) {
  const [gameState, setGameState]       = useState<GameState>("lobby");
  const [desafioActual, setDesafioActual] = useState<Desafio | null>(null);
  const [puntajeFinal, setPuntajeFinal] = useState(0);

  function handleStart(desafio: Desafio) {
    setDesafioActual(desafio);
    setGameState("playing");
  }

  function handleGameOver(puntaje: number) {
    setPuntajeFinal(puntaje);
    setGameState("gameover");
  }

  function handleReiniciar() {
    setDesafioActual(null);
    setPuntajeFinal(0);
    setGameState("lobby");
  }

  // Filtra paises segun el continente del desafio
  function paisesDelDesafio(desafio: Desafio): Country[] {
    if (!desafio.continente) return paises;
    const continenteBuscado = desafio.continente.toLowerCase().trim();
    const lista = paises.filter(
      (p) => p.continent.toLowerCase().trim() === continenteBuscado
    );
    if (lista.length === 0) {
      console.warn(`[JuegoController] Continente "${desafio.continente}" sin paises. Usando todos.`);
      return [...paises];
    }
    return lista;
  }

  return (
    <div className="w-full flex justify-center">
      <AnimatePresence mode="wait">
        {gameState === "lobby" && (
          <div key="lobby" className="w-full max-w-2xl">
            <LobbyDesafios
              desafios={desafios}
              sesion={sesion}
              onStart={handleStart}
            />
          </div>
        )}

        {gameState === "playing" && desafioActual && (
          <div key="playing" className="w-full max-w-md">
            <PantallaJuego
              paises={paisesDelDesafio(desafioActual)}
              desafio={desafioActual}
              nombreJugador={sesion.nombre}
              onGameOver={handleGameOver}
            />
          </div>
        )}

        {gameState === "gameover" && desafioActual && (
          <div key="gameover" className="w-full max-w-md">
            <PantallaGameOver
              nombreJugador={sesion.nombre}
              puntaje={puntajeFinal}
              desafio={desafioActual}
              onReiniciar={handleReiniciar}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
