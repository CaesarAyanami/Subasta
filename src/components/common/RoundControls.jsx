import React, { useState } from "react";
import { ArrowRight, RotateCcw, AlertTriangle, Sparkles, CheckCircle2, Clock, Check } from "lucide-react";
import sounds from "../../services/soundEffects";

export default function RoundControls({
  userRole = "spectator", // 'both' | 'player1' | 'player2' | 'spectator'
  players,
  roundVotes = { player1: null, player2: null },
  onVote,
  onCancelVote,
  onDirectAction,
  poolStats = { available: 0, used: 0, discarded: 0 }
}) {
  const isDualMode = userRole === "both";
  const p1 = players?.player1;
  const p2 = players?.player2;

  const [dualResetConfirm, setDualResetConfirm] = useState(false);

  // Acción seleccionada por cada jugador
  const p1Vote = roundVotes?.player1 || null;
  const p2Vote = roundVotes?.player2 || null;

  // Comprobar si el usuario actual ya votó
  const myVote = userRole === "player1" ? p1Vote : userRole === "player2" ? p2Vote : null;
  const isSpectator = userRole === "spectator";

  const getActionLabel = (actionKey) => {
    switch (actionKey) {
      case "next": return "Siguiente Ronda";
      case "next_discarded": return "Siguiente + Desechos";
      case "reset": return "Resetear Todo";
      default: return "Sin voto";
    }
  };

  const handleActionClick = (actionKey) => {
    sounds.playClick();
    if (isDualMode) {
      // Modo Dual: ejecución directa
      if (actionKey === "reset") {
        setDualResetConfirm(true);
      } else {
        onDirectAction(actionKey);
      }
    } else {
      // Modo Online: votar / consensuar
      if (myVote === actionKey) {
        onCancelVote(userRole);
      } else {
        onVote(userRole, actionKey);
      }
    }
  };

  return (
    <div className="bg-[#111422] border-4 border-yellow-400 rounded-2xl p-4 sm:p-5 shadow-[6px_6px_0_#000] animate-fade-in">
      
      {/* Cabecera y Resumen de Pools */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b-2 border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} />
          <div>
            <h3 className="font-['Press_Start_2P'] text-xs text-yellow-400">
              ¡EQUIPOS COMPLETOS (4/4)!
            </h3>
            <p className="text-[11px] font-['Chakra_Petch'] text-slate-300">
              {isDualMode 
                ? "Modo Dual: Selecciona una acción para avanzar o reiniciar." 
                : "Modo Online: Ambos jugadores deben confirmar la misma opción para continuar."}
            </p>
          </div>
        </div>

        {/* Indicadores de Personajes */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-['Chakra_Petch'] font-bold">
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300">
            Disponibles: {poolStats.available}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-300">
            Usados: {poolStats.used}
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300">
            Desechados: {poolStats.discarded}
          </span>
        </div>
      </div>

      {/* ESTADO DE CONSENSO EN MODO ONLINE */}
      {!isDualMode && (
        <div className="mb-4 p-3 rounded-xl bg-black/60 border-2 border-slate-700">
          <div className="text-[11px] font-['Press_Start_2P'] text-yellow-300 mb-2 flex items-center justify-between">
            <span>ESTADO DE CONFIRMACIÓN:</span>
            {p1Vote && p2Vote && p1Vote !== p2Vote && (
              <span className="text-rose-400 text-[10px] animate-pulse">
                ⚠️ Opciones distintas seleccionadas
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Jugador 1 */}
            <div className={`p-2 rounded-lg border flex items-center justify-between text-xs font-['Chakra_Petch'] ${
              p1Vote 
                ? "bg-cyan-950/60 border-cyan-400 text-cyan-200" 
                : "bg-black/30 border-slate-800 text-slate-500"
            }`}>
              <div className="flex items-center gap-1.5 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{p1?.name || "Jugador 1"}:</span>
              </div>
              <span className="font-['Press_Start_2P'] text-[9px] uppercase">
                {p1Vote ? getActionLabel(p1Vote) : "Esperando..."}
              </span>
            </div>

            {/* Jugador 2 */}
            <div className={`p-2 rounded-lg border flex items-center justify-between text-xs font-['Chakra_Petch'] ${
              p2Vote 
                ? "bg-rose-950/60 border-rose-400 text-rose-200" 
                : "bg-black/30 border-slate-800 text-slate-500"
            }`}>
              <div className="flex items-center gap-1.5 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{p2?.name || "Jugador 2"}:</span>
              </div>
              <span className="font-['Press_Start_2P'] text-[9px] uppercase">
                {p2Vote ? getActionLabel(p2Vote) : "Esperando..."}
              </span>
            </div>
          </div>

          {isSpectator && (
            <p className="text-[10px] text-center text-slate-400 font-['Chakra_Petch'] mt-2 italic">
              (Estás en modo espectador. Los jugadores activos deciden el avance).
            </p>
          )}
        </div>
      )}

      {/* BOTONERA DE ACCIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* 1. Botón "Siguiente" */}
        <button
          onClick={() => handleActionClick("next")}
          disabled={poolStats.available === 0 || isSpectator}
          className={`group py-3 px-4 rounded-xl border-4 border-black text-black font-['Press_Start_2P'] text-[10px] sm:text-[11px] shadow-[4px_4px_0_#000] transition text-left sm:text-center active:translate-y-1 ${
            !isDualMode && myVote === "next"
              ? "bg-emerald-300 ring-4 ring-emerald-400 animate-pulse"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
          } ${isSpectator || poolStats.available === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            <span>
              {!isDualMode && myVote === "next" ? "✓ CONFIRMADO" : "SIGUIENTE"}
            </span>
          </div>
          <div className="text-[9px] font-['Chakra_Petch'] font-bold text-emerald-950 mt-1">
            Pasa a usados + reinicia 20 monedas
          </div>
        </button>

        {/* 2. Botón "Siguiente con Desechos" */}
        <button
          onClick={() => handleActionClick("next_discarded")}
          disabled={isSpectator}
          className={`group py-3 px-4 rounded-xl border-4 border-black text-black font-['Press_Start_2P'] text-[10px] sm:text-[11px] shadow-[4px_4px_0_#000] transition text-left sm:text-center active:translate-y-1 ${
            !isDualMode && myVote === "next_discarded"
              ? "bg-cyan-300 ring-4 ring-cyan-400 animate-pulse"
              : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400"
          } ${isSpectator ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4 text-black group-hover:-rotate-90 transition-transform" />
            <span>
              {!isDualMode && myVote === "next_discarded" ? "✓ CONFIRMADO" : "+ DESECHOS"}
            </span>
          </div>
          <div className="text-[9px] font-['Chakra_Petch'] font-bold text-blue-950 mt-1">
            Recupera desechados al pool
          </div>
        </button>

        {/* 3. Botón "Resetear Todo" */}
        {isDualMode && dualResetConfirm ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setDualResetConfirm(false);
                onDirectAction("reset");
              }}
              className="flex-1 py-3 px-2 rounded-xl border-4 border-black bg-rose-600 hover:bg-rose-500 text-white font-['Press_Start_2P'] text-[10px] shadow-[3px_3px_0_#000]"
            >
              ¿CONFIRMAR?
            </button>
            <button
              onClick={() => setDualResetConfirm(false)}
              className="py-3 px-3 rounded-xl border-2 border-slate-600 bg-slate-800 text-slate-300 text-xs"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleActionClick("reset")}
            disabled={isSpectator}
            className={`group py-3 px-4 rounded-xl border-4 border-black text-white font-['Press_Start_2P'] text-[10px] sm:text-[11px] shadow-[4px_4px_0_#000] transition text-left sm:text-center active:translate-y-1 ${
              !isDualMode && myVote === "reset"
                ? "bg-rose-500 ring-4 ring-rose-400 animate-pulse"
                : "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600"
            } ${isSpectator ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-300 group-hover:animate-bounce" />
              <span>
                {!isDualMode && myVote === "reset" ? "✓ CONFIRMADO" : "RESETEAR TODO"}
              </span>
            </div>
            <div className="text-[9px] font-['Chakra_Petch'] font-bold text-rose-200 mt-1">
              Reiniciar partida desde cero
            </div>
          </button>
        )}

      </div>
    </div>
  );
}
