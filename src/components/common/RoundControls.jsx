import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Users,
} from "lucide-react";
import sounds from "../../services/soundEffects";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
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
  const headerTitle = bothFull ? "¡EQUIPOS COMPLETOS (4/4)!" : "CONTROLES DE RONDA";

  const headerSubtitle = isSpectator
    ? "Estás en modo espectador. Los jugadores activos deciden."
    : bothFull
    ? "Ambos jugadores deben confirmar la misma opción para continuar."
    : "Pueden avanzar de ronda o reiniciar la partida en cualquier momento.";

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      className="relative bg-[#111422] border-4 border-yellow-400 rounded-2xl p-4 sm:p-5 shadow-[6px_6px_0_#000] overflow-hidden"
      aria-label="Controles de ronda"
    >
      {/* Glow decorativo */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ─── Cabecera ────────────────────────────────────────────────────── */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mb-3 border-b-2 border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg border-2 border-black shadow-[2px_2px_0_#000]"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          >
            <Sparkles className="w-5 h-5 text-black" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h3 className="font-['Press_Start_2P'] text-xs text-yellow-400 drop-shadow-[1px_1px_0_#000]">
              {headerTitle}
            </h3>
            <p className="text-[11px] font-['Chakra_Petch'] text-slate-300">
              {headerSubtitle}
            </p>
          </div>
        </div>

        {/* Pool stats */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-['Chakra_Petch'] font-bold">
          <PoolStat
            label="Disponibles"
            value={poolStats.available}
            variant="emerald"
          />
          <PoolStat label="Usados" value={poolStats.used} variant="slate" />
          <PoolStat
            label="Desechados"
            value={poolStats.discarded}
            variant="rose"
          />
        </div>
      </div>

      {/* ─── Estado de confirmación ──────────────────────────────────────── */}
      <AnimatePresence>
        {hasVotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="relative mb-4"
            role="status"
            aria-live="polite"
          >
            <div className="p-3 rounded-xl bg-black/60 border-2 border-slate-700">
              <div className="text-[11px] font-['Press_Start_2P'] text-yellow-300 mb-2 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  ESTADO DE CONFIRMACIÓN
                </span>
                {p1Vote && p2Vote && p1Vote !== p2Vote && (
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-rose-400 text-[10px] flex items-center gap-1"
                  >
                    ⚠️ Opciones distintas
                  </motion.span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <VoteCard
                  name={p1?.name || "Jugador 1"}
                  vote={p1Vote}
                  color="cyan"
                  getActionLabel={getActionLabel}
                />
                <VoteCard
                  name={p2?.name || "Jugador 2"}
                  vote={p2Vote}
                  color="rose"
                  getActionLabel={getActionLabel}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Botonera ────────────────────────────────────────────────────── */}
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ActionButton
          id="btn-round-next"
          variant="emerald"
          icon={<ArrowRight className="w-4 h-4" strokeWidth={3} />}
          title={myVote === "next" ? "CONFIRMADO" : "SIGUIENTE"}
          subtitle="Pasa a usados + reinicia monedas"
          active={myVote === "next"}
          disabled={isSpectator || poolStats.available === 0}
          onClick={() => handleActionClick("next")}
          ariaLabel="Confirmar siguiente ronda"
          ariaPressed={myVote === "next"}
        />

        <ActionButton
          id="btn-round-next-discarded"
          variant="cyan"
          icon={<RotateCcw className="w-4 h-4" strokeWidth={3} />}
          title={myVote === "next_discarded" ? "CONFIRMADO" : "+ DESECHOS"}
          subtitle="Recupera desechados al pool"
          active={myVote === "next_discarded"}
          disabled={isSpectator}
          onClick={() => handleActionClick("next_discarded")}
          ariaLabel="Confirmar siguiente ronda recuperando desechos"
          ariaPressed={myVote === "next_discarded"}
        />

        {resetConfirm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-stretch gap-1.5"
          >
            <button
              type="button"
              onClick={() => handleActionClick("reset")}
              aria-label="Confirmar reinicio total de la partida"
              className="flex-1 py-3 px-2 rounded-xl border-4 border-black bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-['Press_Start_2P'] text-[10px] shadow-[3px_3px_0_#000] transition active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              ¿CONFIRMAR?
            </button>
            <button
              type="button"
              onClick={() => setResetConfirm(false)}
              aria-label="Cancelar reinicio"
              className="py-3 px-3 rounded-xl border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              No
            </button>
          </motion.div>
        ) : (
          <ActionButton
            id="btn-round-reset"
            variant="rose"
            icon={<AlertTriangle className="w-4 h-4" strokeWidth={3} />}
            title={myVote === "reset" ? "CONFIRMADO" : "RESETEAR TODO"}
            subtitle="Reiniciar partida desde cero"
            active={myVote === "reset"}
            disabled={isSpectator}
            onClick={() => handleActionClick("reset")}
            ariaLabel="Solicitar reinicio total de la partida"
            ariaPressed={myVote === "reset"}
          />
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENTE: PoolStat
// ============================================================================
function PoolStat({ label, value, variant }) {
  const palettes = {
    emerald: "bg-emerald-950/80 border-emerald-500/60 text-emerald-300",
    slate: "bg-slate-800 border-slate-600 text-slate-300",
    rose: "bg-rose-950/80 border-rose-500/60 text-rose-300",
  }[variant];

  return (
    <span
      className={`px-2.5 py-1 rounded-lg border-2 ${palettes} font-bold whitespace-nowrap`}
    >
      {label}: {value}
    </span>
  );
}

// ============================================================================
// SUB-COMPONENTE: VoteCard
// ============================================================================
function VoteCard({ name, vote, color, getActionLabel }) {
  const palette = {
    cyan: {
      active: "bg-cyan-950/60 border-cyan-400 text-cyan-200",
      dot: "bg-cyan-400",
      glow: "shadow-[0_0_10px_rgba(34,211,238,0.4)]",
    },
    rose: {
      active: "bg-rose-950/60 border-rose-400 text-rose-200",
      dot: "bg-rose-500",
      glow: "shadow-[0_0_10px_rgba(244,63,94,0.4)]",
    },
  }[color];

  const hasVoted = !!vote;

  return (
    <div
      className={`p-2.5 rounded-lg border-2 flex items-center justify-between text-xs font-['Chakra_Petch'] transition-all ${
        hasVoted
          ? `${palette.active} ${palette.glow}`
          : "bg-black/30 border-slate-800 text-slate-500"
      }`}
      aria-label={`${name}: ${vote ? getActionLabel(vote) : "esperando"}`}
    >
      <div className="flex items-center gap-2 font-bold truncate min-w-0">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            hasVoted ? palette.dot : "bg-slate-600"
          }`}
          aria-hidden="true"
        />
        <span className="truncate">{name}:</span>
      </div>
      <span className="font-['Press_Start_2P'] text-[9px] uppercase whitespace-nowrap ml-2">
        {vote ? getActionLabel(vote) : "Esperando..."}
      </span>
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
      base: "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500",
      activeBg: "bg-gradient-to-br from-emerald-300 to-teal-300 ring-4 ring-emerald-400",
      text: "text-black",
      subtitle: "text-emerald-950",
      glow: "shadow-[4px_4px_0_#000]",
    },
    cyan: {
      base: "bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500",
      activeBg: "bg-gradient-to-br from-cyan-300 to-blue-300 ring-4 ring-cyan-400",
      text: "text-black",
      subtitle: "text-blue-950",
      glow: "shadow-[4px_4px_0_#000]",
    },
    rose: {
      base: "bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600",
      activeBg: "bg-gradient-to-br from-rose-400 to-red-500 ring-4 ring-rose-400",
      text: "text-white",
      subtitle: "text-rose-200",
      glow: "shadow-[4px_4px_0_#000]",
    },
  }[variant];

  return (
    <motion.button
      type="button"
      id={id}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`group relative py-3 px-4 rounded-xl border-4 border-black font-['Press_Start_2P'] text-[10px] sm:text-[11px] transition text-left sm:text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
        active ? palettes.activeBg : palettes.base
      } ${palettes.text} ${palettes.glow} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {active && (
        <motion.div
          className="absolute inset-0 rounded-xl ring-4 ring-white/40 pointer-events-none"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-center justify-center gap-2">
        {active ? (
          <CheckCircle2 className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
        ) : (
          icon
        )}
        <span>{title}</span>
      </div>
      <div
        className={`relative text-[9px] font-['Chakra_Petch'] font-bold mt-1 ${
          active ? "text-black" : palettes.subtitle
        }`}
      >
        {subtitle}
      </div>
    </motion.button>
  );
}