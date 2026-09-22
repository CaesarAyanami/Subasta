import React, { useState } from "react";
import { ArrowRight, RotateCcw, AlertTriangle, Sparkles } from "lucide-react";
import sounds from "../../services/soundEffects";

export default function RoundControls({
  mySlot = null,
  players,
  roundVotes = { player1: null, player2: null },
  onVote,
  onCancelVote,
  poolStats = { available: 0, used: 0, discarded: 0 },
}) {
  const p1 = players?.player1;
  const p2 = players?.player2;

  const [resetConfirm, setResetConfirm] = useState(false);

  // Votos actuales
  const p1Vote = roundVotes?.player1 || null;
  const p2Vote = roundVotes?.player2 || null;

  // Mi estado
  const isSpectator = !mySlot;
  const myVote =
    mySlot === "player1" ? p1Vote : mySlot === "player2" ? p2Vote : null;

  // Detectar contexto
  const p1Full = (p1?.inventory?.length || 0) >= 4;
  const p2Full = (p2?.inventory?.length || 0) >= 4;
  const bothFull = p1Full && p2Full;
  const hasVotes = !!p1Vote || !!p2Vote;

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  const getActionLabel = (actionKey) => {
    switch (actionKey) {
      case "next":
        return "Siguiente Ronda";
      case "next_discarded":
        return "Siguiente + Desechos";
      case "reset":
        return "Resetear Todo";
      default:
        return "Sin voto";
    }
  };

  const handleActionClick = (actionKey) => {
    sounds.playClick();

    if (actionKey === "reset" && !resetConfirm) {
      setResetConfirm(true);
      return;
    }

    setResetConfirm(false);

    if (myVote === actionKey) {
      onCancelVote(mySlot);
    } else {
      onVote(mySlot, actionKey);
    }
  };

  // ==========================================================================
  // TEXTOS DINÁMICOS
  // ==========================================================================
  const headerTitle = bothFull
    ? "¡EQUIPOS COMPLETOS (4/4)!"
    : "CONTROLES DE RONDA";

  const headerSubtitle = isSpectator
    ? "Estás en modo espectador. Los jugadores activos deciden."
    : bothFull
    ? "Ambos jugadores deben confirmar la misma opción para continuar."
    : "Pueden avanzar de ronda o reiniciar la partida en cualquier momento.";

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div
      className="bg-[#111422] border-4 border-yellow-400 rounded-2xl p-4 sm:p-5 shadow-[6px_6px_0_#000] animate-fade-in"
      aria-label="Controles de ronda"
    >
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b-2 border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles
            className="w-5 h-5 text-yellow-400 animate-spin"
            style={{ animationDuration: "10s" }}
            aria-hidden="true"
          />
          <div>
            <h3 className="font-['Press_Start_2P'] text-xs text-yellow-400">
              {headerTitle}
            </h3>
            <p className="text-[11px] font-['Chakra_Petch'] text-slate-300">
              {headerSubtitle}
            </p>
          </div>
        </div>

        {/* Indicadores de pool */}
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

      {/* Estado de confirmación — solo si hay algún voto */}
      {hasVotes && (
        <div
          className="mb-4 p-3 rounded-xl bg-black/60 border-2 border-slate-700"
          role="status"
          aria-live="polite"
        >
          <div className="text-[11px] font-['Press_Start_2P'] text-yellow-300 mb-2 flex items-center justify-between flex-wrap gap-2">
            <span>ESTADO DE CONFIRMACIÓN:</span>
            {p1Vote && p2Vote && p1Vote !== p2Vote && (
              <span className="text-rose-400 text-[10px] animate-pulse">
                ⚠️ Opciones distintas seleccionadas
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Jugador 1 */}
            <div
              className={`p-2 rounded-lg border flex items-center justify-between text-xs font-['Chakra_Petch'] ${
                p1Vote
                  ? "bg-cyan-950/60 border-cyan-400 text-cyan-200"
                  : "bg-black/30 border-slate-800 text-slate-500"
              }`}
              aria-label={`${p1?.name || "Jugador 1"}: ${
                p1Vote ? getActionLabel(p1Vote) : "esperando"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold truncate">
                <span
                  className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{p1?.name || "Jugador 1"}:</span>
              </div>
              <span className="font-['Press_Start_2P'] text-[9px] uppercase whitespace-nowrap">
                {p1Vote ? getActionLabel(p1Vote) : "Esperando..."}
              </span>
            </div>

            {/* Jugador 2 */}
            <div
              className={`p-2 rounded-lg border flex items-center justify-between text-xs font-['Chakra_Petch'] ${
                p2Vote
                  ? "bg-rose-950/60 border-rose-400 text-rose-200"
                  : "bg-black/30 border-slate-800 text-slate-500"
              }`}
              aria-label={`${p2?.name || "Jugador 2"}: ${
                p2Vote ? getActionLabel(p2Vote) : "esperando"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold truncate">
                <span
                  className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{p2?.name || "Jugador 2"}:</span>
              </div>
              <span className="font-['Press_Start_2P'] text-[9px] uppercase whitespace-nowrap">
                {p2Vote ? getActionLabel(p2Vote) : "Esperando..."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botonera */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Siguiente */}
        <ActionButton
          id="btn-round-next"
          variant="emerald"
          icon={
            <ArrowRight className="w-4 h-4 text-black" aria-hidden="true" />
          }
          title={myVote === "next" ? "✓ CONFIRMADO" : "SIGUIENTE"}
          subtitle="Pasa a usados + reinicia monedas"
          active={myVote === "next"}
          disabled={isSpectator || poolStats.available === 0}
          onClick={() => handleActionClick("next")}
          ariaLabel="Confirmar siguiente ronda"
          ariaPressed={myVote === "next"}
        />

        {/* 2. Siguiente + Desechos */}
        <ActionButton
          id="btn-round-next-discarded"
          variant="cyan"
          icon={
            <RotateCcw className="w-4 h-4 text-black" aria-hidden="true" />
          }
          title={myVote === "next_discarded" ? "✓ CONFIRMADO" : "+ DESECHOS"}
          subtitle="Recupera desechados al pool"
          active={myVote === "next_discarded"}
          disabled={isSpectator}
          onClick={() => handleActionClick("next_discarded")}
          ariaLabel="Confirmar siguiente ronda recuperando desechos"
          ariaPressed={myVote === "next_discarded"}
        />

        {/* 3. Resetear */}
        {resetConfirm ? (
          <div className="flex items-stretch gap-1">
            <button
              type="button"
              id="btn-round-reset-confirm"
              name="btn-round-reset-confirm"
              onClick={() => handleActionClick("reset")}
              aria-label="Confirmar reinicio total de la partida"
              className="flex-1 py-3 px-2 rounded-xl border-4 border-black bg-rose-600 hover:bg-rose-500 text-white font-['Press_Start_2P'] text-[10px] shadow-[3px_3px_0_#000] focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              ¿CONFIRMAR?
            </button>
            <button
              type="button"
              id="btn-round-reset-cancel"
              name="btn-round-reset-cancel"
              onClick={() => setResetConfirm(false)}
              aria-label="Cancelar reinicio"
              className="py-3 px-3 rounded-xl border-2 border-slate-600 bg-slate-800 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              No
            </button>
          </div>
        ) : (
          <ActionButton
            id="btn-round-reset"
            variant="rose"
            icon={
              <AlertTriangle
                className="w-4 h-4 text-yellow-300"
                aria-hidden="true"
              />
            }
            title={myVote === "reset" ? "✓ CONFIRMADO" : "RESETEAR TODO"}
            subtitle="Reiniciar partida desde cero"
            active={myVote === "reset"}
            disabled={isSpectator}
            onClick={() => handleActionClick("reset")}
            ariaLabel="Solicitar reinicio total de la partida"
            ariaPressed={myVote === "reset"}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: ActionButton
// ============================================================================
function ActionButton({
  id,
  variant,
  icon,
  title,
  subtitle,
  active,
  disabled,
  onClick,
  ariaLabel,
  ariaPressed,
}) {
  const palettes = {
    emerald: {
      base: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400",
      activeBg: "bg-emerald-300 ring-4 ring-emerald-400 animate-pulse",
      subtitle: "text-emerald-950",
    },
    cyan: {
      base: "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400",
      activeBg: "bg-cyan-300 ring-4 ring-cyan-400 animate-pulse",
      subtitle: "text-blue-950",
    },
    rose: {
      base: "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600",
      activeBg: "bg-rose-500 ring-4 ring-rose-400 animate-pulse",
      subtitle: "text-rose-200",
    },
  }[variant];

  const isRose = variant === "rose";
  const textColor = isRose ? "text-white" : "text-black";

  return (
    <button
      type="button"
      id={id}
      name={id}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`group py-3 px-4 rounded-xl border-4 border-black font-['Press_Start_2P'] text-[10px] sm:text-[11px] shadow-[4px_4px_0_#000] transition text-left sm:text-center active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
        active ? palettes.activeBg : palettes.base
      } ${textColor} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span>{title}</span>
      </div>
      <div
        className={`text-[9px] font-['Chakra_Petch'] font-bold mt-1 ${
          active ? "text-black" : palettes.subtitle
        }`}
      >
        {subtitle}
      </div>
    </button>
  );
}