import React, { useEffect, useRef } from "react";
import { Clock, Trophy, Flame, AlertOctagon, Sparkles, CheckCircle2, XCircle } from "lucide-react";
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
  userRole,
  onBid,
  onToggleFinish,
  onRouletteFinished,
  onTimerTick,
  onTimeExpired
}) {
  const {
    status,
    currentCharacter,
    minAcceptancePrice,
    currentBid,
    highestBidder,
    timeLeft,
    timerRunning
  } = auctionState;

  const timerIntervalRef = useRef(null);

  // Manejo del cronómetro de puja
  useEffect(() => {
    if (status === "BIDDING" && timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        if (timeLeft > 1) {
          // Sonido de tic-tac
          sounds.playTimerTick(timeLeft <= 6);
          onTimerTick(timeLeft - 1);
        } else {
          // Tiempo expiró (0 segundos)
          clearInterval(timerIntervalRef.current);
          onTimeExpired();
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, timerRunning, timeLeft, onTimerTick, onTimeExpired]);

  // Efecto de confeti en caso de victoria
  useEffect(() => {
    if (status === "SOLD") {
      sounds.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (status === "DISCARDED") {
      sounds.playDiscard();
    }
  }, [status]);

  const maxTime = settings?.auctionTime || 20;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  const isUrgent = timeLeft <= 5 && timerRunning;

  // 1. ESTADO: IDLE (ESPERANDO LISTO)
  if (status === "IDLE") {
    const p1Ready = players?.player1?.ready;
    const p2Ready = players?.player2?.ready;

    return (
      <div className="rounded-2xl border-4 border-yellow-400 bg-[#121526] p-6 text-center shadow-[6px_6px_0_#eab308] relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex p-4 bg-yellow-400/10 border-2 border-yellow-400/50 rounded-2xl mb-1">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          <h2 className="font-['Press_Start_2P'] text-sm sm:text-base text-yellow-400 tracking-wider">
            ZONA DE SUBASTA
          </h2>

          <p className="font-['Chakra_Petch'] text-sm text-slate-300">
            {pool.length === 0 ? (
              <span className="text-rose-400 font-bold">
                ⚠️ No quedan personajes en el pool disponible. Usa los botones inferiores para reiniciar o añadir desechos.
              </span>
            ) : (
              "Para comenzar la subasta, ambos jugadores deben presionar su botón de [ ¡LISTO! ]"
            )}
          </p>

          {/* Indicadores de estado de los jugadores */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className={`p-3 rounded-xl border-2 transition ${
              p1Ready 
                ? "bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                : "bg-black/40 border-slate-700 text-slate-500"
            }`}>
              <div className="text-[10px] font-['Press_Start_2P'] uppercase mb-1">
                {players?.player1?.name || "Jugador 1"}
              </div>
              <div className="text-xs font-['Chakra_Petch'] font-bold flex items-center justify-center gap-1">
                {p1Ready ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>¡LISTO!</span>
                  </>
                ) : (
                  <span>Esperando...</span>
                )}
              </div>
            </div>

            <div className={`p-3 rounded-xl border-2 transition ${
              p2Ready 
                ? "bg-rose-950/60 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]" 
                : "bg-black/40 border-slate-700 text-slate-500"
            }`}>
              <div className="text-[10px] font-['Press_Start_2P'] uppercase mb-1">
                {players?.player2?.name || "Jugador 2"}
              </div>
              <div className="text-xs font-['Chakra_Petch'] font-bold flex items-center justify-center gap-1">
                {p2Ready ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    <span>¡LISTO!</span>
                  </>
                ) : (
                  <span>Esperando...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ESTADO: SELECTING (RULETA / GACHA ANIMADO)
  if (status === "SELECTING") {
    return (
      <div className="rounded-2xl border-4 border-yellow-400 bg-[#121526] p-4 sm:p-6 shadow-[6px_6px_0_#eab308]">
        <RouletteDisplay
          pool={pool}
          targetCharacter={currentCharacter}
          animationType={settings?.animationType || "roulette"}
          onComplete={onRouletteFinished}
        />
      </div>
    );
  }

  // 3. ESTADO: SOLD (COMPRADO)
  if (status === "SOLD") {
    const winnerName = highestBidder ? players[highestBidder]?.name : "Ganador";
    const winnerColor = highestBidder === "player1" ? "text-cyan-400" : "text-rose-400";

    return (
      <div className="rounded-2xl border-4 border-emerald-400 bg-[#121526] p-6 text-center shadow-[6px_6px_0_#10b981] animate-[scaleUp_0.4s_ease-out]">
        <div className="inline-flex p-3 bg-emerald-400/20 border-2 border-emerald-400 rounded-full mb-3">
          <Trophy className="w-10 h-10 text-emerald-400 animate-bounce" />
        </div>
        <div className="font-['Press_Start_2P'] text-xs text-emerald-400 mb-2 uppercase">
          ¡SUBASTA CONCLUIDA!
        </div>
        <h2 className="font-['Press_Start_2P'] text-base sm:text-xl text-yellow-400 mb-2">
          ¡VENDIDO A <span className={winnerColor}>{winnerName}</span>!
        </h2>
        <p className="text-sm font-['Chakra_Petch'] text-slate-300 mb-4">
          Comprado exitosamente por <strong className="text-yellow-400">{currentBid} monedas</strong>. Se ha añadido al inventario.
        </p>
        <div className="max-w-xs mx-auto">
          <CharacterCard character={currentCharacter} size="large" showMinPriceBadge={false} />
        </div>
      </div>
    );
  }

  // 4. ESTADO: DISCARDED (DESECHADO)
  if (status === "DISCARDED") {
    return (
      <div className="rounded-2xl border-4 border-rose-500 bg-[#121526] p-6 text-center shadow-[6px_6px_0_#f43f5e] animate-wiggle">
        <div className="inline-flex p-3 bg-rose-500/20 border-2 border-rose-500 rounded-full mb-3">
          <XCircle className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>
        <div className="font-['Press_Start_2P'] text-xs text-rose-400 mb-2 uppercase">
          TIEMPO AGOTADO
        </div>
        <h2 className="font-['Press_Start_2P'] text-base sm:text-lg text-white mb-2">
          ¡PERSONAJE DESECHADO!
        </h2>
        <p className="text-sm font-['Chakra_Petch'] text-slate-400 mb-4">
          No hubo pujas que cumplieran con el valor mínimo requerido ({minAcceptancePrice} monedas). El personaje ha pasado a la lista de descartados.
        </p>
        <div className="max-w-xs mx-auto opacity-70 grayscale-[30%]">
          <CharacterCard character={currentCharacter} size="large" showMinPriceBadge={false} />
        </div>
      </div>
    );
  }

  // 5. ESTADO: BIDDING (PUJA EN CURSO)
  const leaderName = highestBidder ? players[highestBidder]?.name : null;
  const leaderColor = highestBidder === "player1" ? "text-cyan-400" : "text-rose-400";

  return (
    <div className="rounded-2xl border-4 border-yellow-400 bg-[#121526] p-4 sm:p-5 shadow-[6px_6px_0_#eab308] space-y-4">
      
      {/* Barra de Cronómetro y Alerta */}
      <div className="bg-black/60 rounded-xl p-3 border-2 border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${isUrgent ? "text-rose-500 animate-spin" : "text-yellow-400"}`} />
            <span className="font-['Press_Start_2P'] text-xs uppercase text-slate-300">
              TIEMPO RESTANTE
            </span>
          </div>
          <span className={`font-['Press_Start_2P'] text-lg ${isUrgent ? "text-rose-500 animate-ping" : "text-yellow-400"}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-300 ${
              isUrgent ? "bg-rose-500" : "bg-gradient-to-r from-yellow-400 to-amber-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tarjeta del Personaje en Subasta */}
      <CharacterCard 
        character={currentCharacter} 
        size="large" 
        minAcceptancePrice={minAcceptancePrice} 
      />

      {/* Cartel de Puja Actual y Líder */}
      <div className="p-3 bg-black/70 border-2 border-yellow-400/80 rounded-xl flex items-center justify-between gap-3 shadow-inner">
        <div>
          <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">
            PUJA MÁS ALTA
          </div>
          <div className="text-xl sm:text-2xl font-['Press_Start_2P'] text-yellow-400 drop-shadow-[2px_2px_0_#000]">
            {currentBid > 0 ? `${currentBid} MONEDAS` : "SIN PUJAS"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">
            LÍDER ACTUAL
          </div>
          <div className={`font-['Press_Start_2P'] text-xs sm:text-sm ${leaderColor || "text-slate-500"} truncate max-w-[150px]`}>
            {leaderName || "Nadie"}
          </div>
        </div>
      </div>

      {/* Controles de Puja y Finalizar */}
      <BiddingControls
        userRole={userRole}
        players={players}
        currentBid={currentBid}
        highestBidder={highestBidder}
        minAcceptancePrice={minAcceptancePrice}
        timerRunning={timerRunning}
        onBid={onBid}
        onToggleFinish={onToggleFinish}
      />

    </div>
  );
}
