import React, { useState } from "react";
import {
  Coins,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import sounds from "../../services/soundEffects";
import { MAX_INVENTORY_SLOTS } from "../../services/supabaseClient";

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

  // ==========================================================================
  // ESTADO LOCAL DE FEEDBACK
  // ==========================================================================
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
    <div className="w-full space-y-4">
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

      {/* Estado de consenso */}
      <div
        className="text-center p-2 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-['Chakra_Petch'] text-slate-400 flex items-center justify-center gap-4 flex-wrap"
        role="status"
        aria-live="polite"
      >
        <span>Consenso para terminar anticipadamente:</span>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
              p1?.finish_requested
                ? "bg-green-500/20 text-green-300 border-green-500"
                : "bg-slate-800 text-slate-500 border-slate-800"
            }`}
            aria-label={`Jugador 1: ${
              p1?.finish_requested ? "listo para finalizar" : "pendiente"
            }`}
          >
            P1: {p1?.finish_requested ? "LISTO" : "PENDIENTE"}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
              p2?.finish_requested
                ? "bg-green-500/20 text-green-300 border-green-500"
                : "bg-slate-800 text-slate-500 border-slate-800"
            }`}
            aria-label={`Jugador 2: ${
              p2?.finish_requested ? "listo para finalizar" : "pendiente"
            }`}
          >
            P2: {p2?.finish_requested ? "LISTO" : "PENDIENTE"}
          </span>
        </div>
      </div>
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
  const palette = {
    cyan: {
      container: "bg-cyan-950/40 border-cyan-500/60",
      title: "text-cyan-400",
      bidGradient:
        "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400",
    },
    rose: {
      container: "bg-rose-950/40 border-rose-500/60",
      title: "text-rose-400",
      bidGradient:
        "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400",
    },
  }[color];

  const isMe = mySlot === slot;
  const isOccupied = !!player?.client_id;
  const isLeading = highestBidder === slot;
  const isSpectator = !mySlot;
  const finishRequested = !!player?.finish_requested;

  // ==========================================================================
  // FIX 3: SALDO PROYECTADO
  // Mostramos cuánto le quedaría al jugador SI GANARA la subasta con la puja
  // más alta que ha hecho. Si está liderando, su puja es `currentBid`; si no,
  // no ha comprometido nada visible y muestra su saldo completo.
  // ==========================================================================
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
    bidButtonText = "¡LIDERANDO PUJA!";
  } else if (isSpectator || !isMe) {
    bidButtonState = "readonly";
    bidButtonText = "SOLO LECTURA";
  } else if (!timerRunning) {
    bidButtonState = "disabled";
  } else if (canBid) {
    bidButtonState = "active";
  }

  const bidButtonClasses = {
    empty:
      "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed",
    leading:
      "bg-emerald-600 text-white border-black shadow-[3px_3px_0_#000] cursor-default",
    readonly:
      "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed",
    disabled:
      "bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed",
    active: `${palette.bidGradient} text-black border-black shadow-[4px_4px_0_#000] cursor-pointer hover:shadow-[5px_5px_0_#000] hover:-translate-y-0.5`,
  }[bidButtonState];

  const bidButtonDisabled =
    bidButtonState !== "active" && bidButtonState !== "leading";

  // ==========================================================================
  // ESTADO DEL BOTÓN FINALIZAR
  // ==========================================================================
  const slotLabel = slot === "player1" ? "P1" : "P2";

  const finishButtonLabel = pending
    ? "PROCESANDO..."
    : finishRequested
    ? `✓ FINALIZAR PEDIDO (${slotLabel})`
    : `FINALIZAR SUBASTA (${slotLabel})`;

  const finishButtonClasses = pending
    ? "bg-amber-500 text-black border-black font-bold shadow-[2px_2px_0_#000] animate-pulse cursor-wait"
    : finishRequested
    ? "bg-amber-400 text-black border-black font-bold shadow-[2px_2px_0_#000] hover:bg-amber-300"
    : "bg-black/60 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400/60";

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className={`p-3 border-2 rounded-xl space-y-2 ${palette.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-['Press_Start_2P'] text-[10px] uppercase truncate ${palette.title}`}
        >
          {player?.name || (slot === "player1" ? "Jugador 1" : "Jugador 2")}
        </span>
        <span
          className={`text-[10px] font-['Chakra_Petch'] whitespace-nowrap transition-colors ${
            pujaComprometida > 0 ? "text-yellow-300" : "text-slate-300"
          }`}
          aria-live="polite"
          aria-label={`Saldo disponible: ${saldoProyectado} monedas`}
        >
          Saldo:{" "}
          <strong className="text-yellow-400 font-bold">
            {saldoProyectado}
          </strong>{" "}
          mon.
        </span>
      </div>

      {/* Botón de puja */}
      <button
        type="button"
        id={`btn-bid-${slot}`}
        name={`btn-bid-${slot}`}
        onClick={onBidClick}
        disabled={bidButtonDisabled}
        aria-label={`Pujar por ${nextBid} monedas`}
        aria-disabled={bidButtonDisabled}
        className={`w-full py-3 px-4 rounded-xl font-['Press_Start_2P'] text-xs border-4 transition-all transform active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${bidButtonClasses}`}
      >
        <div className="flex items-center justify-center gap-2">
          <Coins
            className="w-4 h-4 text-yellow-300"
            aria-hidden="true"
          />
          <span>{bidButtonText}</span>
        </div>
      </button>

      {/* Botón Finalizar */}
      <button
        type="button"
        id={`btn-finish-${slot}`}
        name={`btn-finish-${slot}`}
        onClick={onFinishClick}
        disabled={!timerRunning || isSpectator || !isMe || pending}
        aria-pressed={finishRequested}
        aria-busy={pending}
        aria-label={
          pending
            ? "Procesando solicitud de finalizar"
            : finishRequested
            ? "Retirar solicitud de finalizar"
            : "Solicitar finalizar la subasta"
        }
        className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-['Press_Start_2P'] border-2 transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${finishButtonClasses} ${
          !timerRunning || isSpectator || !isMe
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        <span className="flex items-center justify-center gap-1.5">
          {pending && (
            <Loader2
              className="w-3 h-3 animate-spin"
              aria-hidden="true"
            />
          )}
          {!pending && finishRequested && (
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
          )}
          {!pending && !finishRequested && (
            <AlertCircle className="w-3 h-3 opacity-60" aria-hidden="true" />
          )}
          <span>{finishButtonLabel}</span>
        </span>
      </button>
    </div>
  );
}