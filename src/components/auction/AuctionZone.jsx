import React, { useEffect, useRef, useState } from "react";
import {
  Clock,
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import CharacterCard from "./CharacterCard";
import RouletteDisplay from "./RouletteDisplay";
import BiddingControls from "./BiddingControls";
import sounds from "../../services/soundEffects";

export default function AuctionZone({
  auctionState,
  pool = [],
  settings,
  players,
  mySlot,
  onBid,
  onToggleFinish,
  onRouletteFinished,
  onTimerTick,
  onTimeExpired,
}) {
  // ==========================================================================
  // NORMALIZACIÓN DE PROPS
  // Leemos de auctionState SIN destructuring con defaults engañosos.
  // Un `default = false` en destructuring sobreescribe el `??`.
  // ==========================================================================
  const {
    status = "IDLE",
    current_character = null,
    current_character_id = null,
    currentCharacter = null,
    min_price = 0,
    minAcceptancePrice = 0,
    current_bid = 0,
    currentBid = 0,
    highest_bidder_slot = null,
    highestBidder = null,
    time_left = 20,
    timeLeft = 20,
    timer_running,
    timerRunning,
  } = auctionState || {};

  const character = current_character || currentCharacter;
  const characterId = current_character_id || character?.id || "no-char";
  const minAccept = minAcceptancePrice || min_price;
  const bid = currentBid || current_bid;
  const leader = highestBidder || highest_bidder_slot;

  // ✅ FIX: usamos || en vez de ?? porque los defaults del destructuring
  // ya rellenan las variables. Si alguno es true, running debe ser true.
  const running = timer_running === true || timerRunning === true;

  // ==========================================================================
  // TIMER LOCAL
  // ==========================================================================
  const [localTime, setLocalTime] = useState(
    (typeof timeLeft === "number" ? timeLeft : time_left) ?? 20
  );
  const timeRef = useRef(localTime);
  timeRef.current = localTime;

  // ==========================================================================
  // SINCRONIZAR TIMER LOCAL CON LA PROP
  // Solo cuando arranca una subasta nueva (transición a BIDDING+running).
  // ==========================================================================
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === "BIDDING" && running && prev !== "BIDDING") {
      const initialTime =
        typeof timeLeft === "number" ? timeLeft : time_left || 20;
      setLocalTime(initialTime);
    }
    if (status === "IDLE") {
      setLocalTime(settings?.auctionTime || 20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, running]);

  // ==========================================================================
  // INTERVALO DEL CRONÓMETRO
  // ==========================================================================
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (status !== "BIDDING" || !running) return;

    intervalRef.current = setInterval(() => {
      const current = timeRef.current;

      if (current > 1) {
        sounds.playTimerTick(current <= 6);
        setLocalTime(current - 1);
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setLocalTime(0);
        onTimeExpired();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, running, onTimeExpired]);

  // ==========================================================================
  // CONFETTI / SONIDOS DE RESOLUCIÓN
  // ==========================================================================
  useEffect(() => {
    if (status === "SOLD") {
      sounds.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else if (status === "DISCARDED") {
      sounds.playDiscard();
    }
  }, [status]);

  // ==========================================================================
  // CÁLCULOS DERIVADOS
  // ==========================================================================
  const maxTime = settings?.auctionTime || 20;
  const time = localTime;
  const progressPercent = Math.max(0, Math.min(100, (time / maxTime) * 100));
  const isUrgent = time <= 5 && running;

  // ==========================================================================
  // 1. IDLE
  // ==========================================================================
  if (status === "IDLE") {
    const p1Ready = players?.player1?.ready;
    const p2Ready = players?.player2?.ready;

    return (
      <div
        className="rounded-2xl border-4 border-yellow-400 bg-[#121526] p-6 text-center shadow-[6px_6px_0_#eab308] relative overflow-hidden"
        aria-label="Zona de subasta en espera"
      >
        <div
          className="absolute -right-6 -bottom-6 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex p-4 bg-yellow-400/10 border-2 border-yellow-400/50 rounded-2xl mb-1">
            <Sparkles
              className="w-12 h-12 text-yellow-400 animate-spin"
              style={{ animationDuration: "10s" }}
              aria-hidden="true"
            />
          </div>

          <h2 className="font-['Press_Start_2P'] text-sm sm:text-base text-yellow-400 tracking-wider">
            ZONA DE SUBASTA
          </h2>

          <p className="font-['Chakra_Petch'] text-sm text-slate-300">
            {pool.length === 0 ? (
              <span className="text-rose-400 font-bold">
                ⚠️ No quedan personajes en el pool disponible. Usa los botones
                inferiores para reiniciar o añadir desechos.
              </span>
            ) : (
              "Para comenzar la subasta, ambos jugadores deben presionar su botón de [ ¡LISTO! ]"
            )}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <ReadyIndicator
              name={players?.player1?.name || "Jugador 1"}
              ready={p1Ready}
              color="cyan"
            />
            <ReadyIndicator
              name={players?.player2?.name || "Jugador 2"}
              ready={p2Ready}
              color="rose"
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 2. SELECTING
  // ==========================================================================
  if (status === "SELECTING") {
    return (
      <div
        className="rounded-2xl border-4 border-yellow-400 bg-[#121526] p-4 sm:p-6 shadow-[6px_6px_0_#eab308]"
        aria-label="Sorteando personaje"
      >
        <RouletteDisplay
          key={characterId}
          pool={pool}
          targetCharacter={character}
          animationType={settings?.animationType || "roulette"}
          onComplete={onRouletteFinished}
        />
      </div>
    );
  }

  // ==========================================================================
  // 3. SOLD
  // ==========================================================================
  if (status === "SOLD") {
    const winnerName = leader ? players?.[leader]?.name : "Ganador";
    const winnerColor =
      leader === "player1" ? "text-cyan-400" : "text-rose-400";

    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border-4 border-emerald-400 bg-[#121526] p-6 text-center shadow-[6px_6px_0_#10b981] animate-[scaleUp_0.4s_ease-out]"
      >
        <div className="inline-flex p-3 bg-emerald-400/20 border-2 border-emerald-400 rounded-full mb-3">
          <Trophy
            className="w-10 h-10 text-emerald-400 animate-bounce"
            aria-hidden="true"
          />
        </div>
        <div className="font-['Press_Start_2P'] text-xs text-emerald-400 mb-2 uppercase">
          ¡SUBASTA CONCLUIDA!
        </div>
        <h2 className="font-['Press_Start_2P'] text-base sm:text-xl text-yellow-400 mb-2">
          ¡VENDIDO A <span className={winnerColor}>{winnerName}</span>!
        </h2>
        <p className="text-sm font-['Chakra_Petch'] text-slate-300 mb-4">
          Comprado exitosamente por{" "}
          <strong className="text-yellow-400">{bid} monedas</strong>. Se ha
          añadido al inventario.
        </p>
        <div className="max-w-xs mx-auto">
          <CharacterCard
            character={character}
            size="large"
            showMinPriceBadge={false}
          />
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 4. DISCARDED
  // ==========================================================================
  if (status === "DISCARDED") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border-4 border-rose-500 bg-[#121526] p-6 text-center shadow-[6px_6px_0_#f43f5e] animate-wiggle"
      >
        <div className="inline-flex p-3 bg-rose-500/20 border-2 border-rose-500 rounded-full mb-3">
          <XCircle
            className="w-10 h-10 text-rose-500 animate-pulse"
            aria-hidden="true"
          />
        </div>
        <div className="font-['Press_Start_2P'] text-xs text-rose-400 mb-2 uppercase">
          TIEMPO AGOTADO
        </div>
        <h2 className="font-['Press_Start_2P'] text-base sm:text-lg text-white mb-2">
          ¡PERSONAJE DESECHADO!
        </h2>
        <p className="text-sm font-['Chakra_Petch'] text-slate-400 mb-4">
          No hubo pujas que cumplieran con el valor mínimo requerido (
          {minAccept} monedas). El personaje ha pasado a la lista de
          descartados.
        </p>
        <div className="max-w-xs mx-auto opacity-70 grayscale-[30%]">
          <CharacterCard
            character={character}
            size="large"
            showMinPriceBadge={false}
          />
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 5. BIDDING
  // ==========================================================================
  const leaderName = leader ? players?.[leader]?.name : null;
  const leaderColor = leader === "player1" ? "text-cyan-400" : "text-rose-400";

  return (
    <div
      className="rounded-2xl border-4 border-yellow-400 bg-[#121526] p-4 sm:p-5 shadow-[6px_6px_0_#eab308] space-y-4"
      aria-label="Subasta en curso"
    >
      {/* Cronómetro */}
      <div className="bg-black/60 rounded-xl p-3 border-2 border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock
              className={`w-5 h-5 ${
                isUrgent ? "text-rose-500 animate-spin" : "text-yellow-400"
              }`}
              aria-hidden="true"
            />
            <span className="font-['Press_Start_2P'] text-xs uppercase text-slate-300">
              TIEMPO RESTANTE
            </span>
          </div>
          <span
            role="timer"
            aria-live={isUrgent ? "assertive" : "polite"}
            aria-label={`Tiempo restante: ${time} segundos`}
            className={`font-['Press_Start_2P'] text-lg ${
              isUrgent ? "text-rose-500 animate-ping" : "text-yellow-400"
            }`}
          >
            {time}s
          </span>
        </div>

        <div
          className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={maxTime}
          aria-valuenow={time}
          aria-label="Progreso del tiempo de subasta"
        >
          <div
            className={`h-full transition-all duration-300 ${
              isUrgent
                ? "bg-rose-500"
                : "bg-gradient-to-r from-yellow-400 to-amber-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Personaje */}
      <CharacterCard
        character={character}
        size="large"
        minAcceptancePrice={minAccept}
      />

      {/* Puja actual + líder */}
      <div className="p-3 bg-black/70 border-2 border-yellow-400/80 rounded-xl flex items-center justify-between gap-3 shadow-inner">
        <div>
          <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">
            PUJA MÁS ALTA
          </div>
          <div
            className="text-xl sm:text-2xl font-['Press_Start_2P'] text-yellow-400 drop-shadow-[2px_2px_0_#000]"
            aria-live="polite"
          >
            {bid > 0 ? `${bid} MONEDAS` : "SIN PUJAS"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">
            LÍDER ACTUAL
          </div>
          <div
            className={`font-['Press_Start_2P'] text-xs sm:text-sm ${
              leaderColor || "text-slate-500"
            } truncate max-w-[150px]`}
            aria-live="polite"
          >
            {leaderName || "Nadie"}
          </div>
        </div>
      </div>

      {/* Controles */}
      <BiddingControls
        mySlot={mySlot}
        players={players}
        currentBid={bid}
        highestBidder={leader}
        minAcceptancePrice={minAccept}
        timerRunning={running}
        onBid={onBid}
        onToggleFinish={onToggleFinish}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: ReadyIndicator
// ============================================================================
function ReadyIndicator({ name, ready, color }) {
  const palette = {
    cyan: {
      readyBg:
        "bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]",
      icon: "text-cyan-400",
    },
    rose: {
      readyBg:
        "bg-rose-950/60 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
      icon: "text-rose-400",
    },
  }[color];

  return (
    <div
      className={`p-3 rounded-xl border-2 transition ${
        ready ? palette.readyBg : "bg-black/40 border-slate-700 text-slate-500"
      }`}
      aria-label={`${name}: ${ready ? "listo" : "esperando"}`}
    >
      <div className="text-[10px] font-['Press_Start_2P'] uppercase mb-1">
        {name}
      </div>
      <div className="text-xs font-['Chakra_Petch'] font-bold flex items-center justify-center gap-1">
        {ready ? (
          <>
            <CheckCircle2
              className={`w-4 h-4 ${palette.icon}`}
              aria-hidden="true"
            />
            <span>¡LISTO!</span>
          </>
        ) : (
          <span>Esperando...</span>
        )}
      </div>
    </div>
  );
}