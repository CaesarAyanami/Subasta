import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Crown,
  Lock,
  UserX,
  Zap,
  Flame,
  Gamepad2,
  TrendingUp,
} from "lucide-react";
import sounds from "../../services/soundEffects";
import { MAX_INVENTORY_SLOTS } from "../../services/supabaseClient";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function BiddingControls({
  mySlot = null,
  players,
  currentBid,
  highestBidder,
  minAcceptancePrice = 0,
  timerRunning,
  onBid,
  onToggleFinish,
}) {
  const p1 = players?.player1;
  const p2 = players?.player2;

  const [p1Pending, setP1Pending] = useState(false);
  const [p2Pending, setP2Pending] = useState(false);

  // ==========================================================================
  // CÁLCULOS
  // ==========================================================================
  const nextBid =
    currentBid === 0 ? Math.max(minAcceptancePrice, 1) : currentBid + 1;

  const canPlayerBid = (player, slot) => {
    if (!player) return false;
    if (!player.client_id) return false;
    if (!timerRunning) return false;
    if (highestBidder === slot) return false;
    if (player.coins < nextBid) return false;
    if ((player.inventory?.length || 0) >= MAX_INVENTORY_SLOTS) return false;
    return true;
  };

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleBidClick = async (slot) => {
    if (!timerRunning) return;
    const player = players[slot];
    if (!player || player.coins < nextBid) return;

    sounds.playCoin();
    try {
      await onBid(slot, nextBid);
    } catch (err) {
      console.warn("[BiddingControls.bid]", err);
    }
  };

  const handleFinishClick = async (slot) => {
    if (!timerRunning) return;
    sounds.playClick();

    if (slot === "player1") setP1Pending(true);
    if (slot === "player2") setP2Pending(true);

    try {
      await onToggleFinish(slot);
    } catch (err) {
      console.warn("[BiddingControls.finish]", err);
    } finally {
      setTimeout(() => {
        if (slot === "player1") setP1Pending(false);
        if (slot === "player2") setP2Pending(false);
      }, 1500);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="w-full space-y-3">
      {/* Paneles de jugadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PlayerBiddingPanel
          slot="player1"
          player={p1}
          mySlot={mySlot}
          nextBid={nextBid}
          currentBid={currentBid}
          highestBidder={highestBidder}
          timerRunning={timerRunning}
          canBid={canPlayerBid(p1, "player1")}
          pending={p1Pending}
          onBidClick={() => handleBidClick("player1")}
          onFinishClick={() => handleFinishClick("player1")}
          color="cyan"
        />

        <PlayerBiddingPanel
          slot="player2"
          player={p2}
          mySlot={mySlot}
          nextBid={nextBid}
          currentBid={currentBid}
          highestBidder={highestBidder}
          timerRunning={timerRunning}
          canBid={canPlayerBid(p2, "player2")}
          pending={p2Pending}
          onBidClick={() => handleBidClick("player2")}
          onFinishClick={() => handleFinishClick("player2")}
          color="rose"
        />
      </div>

      {/* Consenso */}
      <ConsensusBar
        p1Finish={!!p1?.finish_requested}
        p2Finish={!!p2?.finish_requested}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: PlayerBiddingPanel
// ============================================================================
function PlayerBiddingPanel({
  slot,
  player,
  mySlot,
  nextBid,
  currentBid,
  highestBidder,
  timerRunning,
  canBid,
  pending,
  onBidClick,
  onFinishClick,
  color,
}) {
  const isP1 = slot === "player1";
  const palette = isP1
    ? {
        container: "from-cyan-950/60 to-cyan-900/30 border-cyan-500/60",
        title: "text-cyan-400",
        bidGradient: "from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400",
        glow: "rgba(34,211,238,0.3)",
        icon: Gamepad2,
        dot: "bg-cyan-400",
      }
    : {
        container: "from-rose-950/60 to-rose-900/30 border-rose-500/60",
        title: "text-rose-400",
        bidGradient: "from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400",
        glow: "rgba(244,63,94,0.3)",
        icon: Flame,
        dot: "bg-rose-500",
      };

  const isMe = mySlot === slot;
  const isOccupied = !!player?.client_id;
  const isLeading = highestBidder === slot;
  const isSpectator = !mySlot;
  const finishRequested = !!player?.finish_requested;

  // Saldo proyectado
  const coinsActuales = player?.coins ?? 0;
  const pujaComprometida = isLeading ? currentBid : 0;
  const saldoProyectado = Math.max(0, coinsActuales - pujaComprometida);

  // ==========================================================================
  // ESTADO DEL BOTÓN DE PUJA
  // ==========================================================================
  let bidButtonState = "disabled";
  let bidButtonText = `PUJAR (${nextBid} MON.)`;

  if (!isOccupied) {
    bidButtonState = "empty";
    bidButtonText = "SIN JUGADOR";
  } else if (isLeading) {
    bidButtonState = "leading";
    bidButtonText = "¡LIDERANDO!";
  } else if (isSpectator || !isMe) {
    bidButtonState = "readonly";
    bidButtonText = "SOLO LECTURA";
  } else if (!timerRunning) {
    bidButtonState = "disabled";
  } else if (canBid) {
    bidButtonState = "active";
  }

  const bidButtonClasses = {
    empty: "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed",
    leading:
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-black shadow-[4px_4px_0_#000] cursor-default",
    readonly:
      "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed",
    disabled:
      "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed",
    active: `bg-gradient-to-r ${palette.bidGradient} text-black border-black shadow-[4px_4px_0_#000] cursor-pointer hover:shadow-[5px_5px_0_#000]`,
  }[bidButtonState];

  const bidButtonDisabled =
    bidButtonState !== "active" && bidButtonState !== "leading";

  // Icono del estado del botón
  const BidButtonIcon = (() => {
    if (!isOccupied) return UserX;
    if (isLeading) return Crown;
    if (isSpectator || !isMe) return Lock;
    return Coins;
  })();

  // ==========================================================================
  // ESTADO DEL BOTÓN FINALIZAR
  // ==========================================================================
  const slotLabel = isP1 ? "P1" : "P2";

  const finishButtonLabel = pending
    ? "PROCESANDO..."
    : finishRequested
    ? `✓ CONFIRMADO (${slotLabel})`
    : `FINALIZAR (${slotLabel})`;

  const finishButtonClasses = pending
    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black border-black font-bold shadow-[2px_2px_0_#000] cursor-wait"
    : finishRequested
    ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-black border-black font-bold shadow-[2px_2px_0_#000]"
    : "bg-black/60 hover:bg-amber-500/20 text-slate-300 border-slate-700 hover:border-amber-400/60";

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-3 rounded-xl border-2 bg-gradient-to-br ${palette.container} space-y-2.5 overflow-hidden`}
    >
      {/* Glow decorativo */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40"
        style={{ background: palette.glow }}
        aria-hidden="true"
      />

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full ${palette.dot} flex-shrink-0`} aria-hidden="true" />
          <span
            className={`font-['Press_Start_2P'] text-[10px] uppercase truncate ${palette.title}`}
          >
            {player?.name || (isP1 ? "Jugador 1" : "Jugador 2")}
          </span>
        </div>
        <span
          className={`text-[10px] font-['Chakra_Petch'] whitespace-nowrap transition-colors ${
            pujaComprometida > 0 ? "text-yellow-300 font-bold" : "text-slate-300"
          }`}
          aria-live="polite"
          aria-label={`Saldo disponible: ${saldoProyectado} monedas`}
        >
          <Coins className="w-3 h-3 inline mr-0.5" aria-hidden="true" />
          <strong className="text-yellow-400">
            {saldoProyectado}
          </strong>{" "}
          mon.
        </span>
      </div>

      {/* ─── Botón de puja ──────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={onBidClick}
        disabled={bidButtonDisabled}
        whileHover={!bidButtonDisabled ? { scale: 1.02 } : {}}
        whileTap={!bidButtonDisabled ? { scale: 0.98 } : {}}
        aria-label={`Pujar por ${nextBid} monedas`}
        aria-disabled={bidButtonDisabled}
        className={`relative w-full py-3 px-4 rounded-xl font-['Press_Start_2P'] text-[11px] border-4 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 ${bidButtonClasses}`}
      >
        {/* Pulsing para active */}
        {bidButtonState === "active" && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0.4)", "0 0 0 8px rgba(255,255,255,0)"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            aria-hidden="true"
          />
        )}

        <div className="relative flex items-center justify-center gap-2">
          <BidButtonIcon className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          <span>{bidButtonText}</span>
        </div>
      </motion.button>

      {/* ─── Botón finalizar ────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={onFinishClick}
        disabled={!timerRunning || isSpectator || !isMe || pending}
        whileTap={!pending ? { scale: 0.98 } : {}}
        aria-pressed={finishRequested}
        aria-busy={pending}
        aria-label={
          pending
            ? "Procesando solicitud"
            : finishRequested
            ? "Retirar solicitud"
            : "Solicitar finalizar subasta"
        }
        className={`relative w-full py-2 px-3 rounded-lg text-[10px] font-['Press_Start_2P'] border-2 transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${finishButtonClasses} ${
          !timerRunning || isSpectator || !isMe ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className="flex items-center justify-center gap-1.5">
          <AnimatePresence mode="wait">
            {pending ? (
              <motion.span
                key="pending"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              </motion.span>
            ) : finishRequested ? (
              <motion.span
                key="requested"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
          <span>{finishButtonLabel}</span>
        </span>
      </motion.button>

      {/* ─── Badge "TÚ" si es mi panel ─────────────────────────────── */}
      {isMe && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-yellow-400 text-black text-[8px] font-['Press_Start_2P'] border border-black shadow-[1px_1px_0_#000]"
          aria-label="Este es tu panel"
        >
          TÚ
        </motion.span>
      )}
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENTE: ConsensusBar
// ============================================================================
function ConsensusBar({ p1Finish, p2Finish }) {
  return (
    <div
      className="relative rounded-xl p-2.5 bg-gradient-to-r from-black/60 via-black/70 to-black/60 border-2 border-slate-700/80"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className="text-[10px] font-['Chakra_Petch'] text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" aria-hidden="true" />
          Consenso para finalizar:
        </span>

        <div className="flex items-center gap-2">
          <FinishBadge label="P1" active={p1Finish} color="cyan" />
          <FinishBadge label="P2" active={p2Finish} color="rose" />
        </div>

        {p1Finish && p2Finish && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[10px] font-['Press_Start_2P'] text-emerald-400 flex items-center gap-1"
          >
            <Zap className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
            ¡LISTO!
          </motion.span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: FinishBadge
// ============================================================================
function FinishBadge({ label, active, color }) {
  const palette = {
    cyan: {
      active: "bg-gradient-to-r from-cyan-500 to-blue-500 text-black border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
      idle: "bg-slate-800 text-slate-500 border-slate-700",
    },
    rose: {
      active: "bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
      idle: "bg-slate-800 text-slate-500 border-slate-700",
    },
  }[color];

  return (
    <motion.span
      animate={active ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`px-2 py-0.5 rounded-md text-[9px] font-['Press_Start_2P'] border-2 transition-all ${
        active ? palette.active : palette.idle
      }`}
      aria-label={`${label}: ${active ? "listo" : "pendiente"}`}
    >
      {label}: {active ? "LISTO" : "PENDIENTE"}
    </motion.span>
  );
}