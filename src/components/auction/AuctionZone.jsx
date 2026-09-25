import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Package,
  Trash2,
  Flame,
  Zap,
  Eye,
  Crown,
  Shield,
} from "lucide-react";
import confetti from "canvas-confetti";
import CharacterCard from "./CharacterCard";
import RouletteDisplay from "./RouletteDisplay";
import BiddingControls from "./BiddingControls";
import sounds from "../../services/soundEffects";

// ============================================================================
// CONFIGURACIÓN DE ESTADOS
// ============================================================================
const STATE_THEME = {
  IDLE: {
    border: "border-yellow-400",
    shadow: "shadow-[6px_6px_0_#eab308]",
    glow: "rgba(234,179,8,0.3)",
    bg: "from-[#121526] to-[#0d101a]",
    color: "text-yellow-400",
  },
  SELECTING: {
    border: "border-yellow-400",
    shadow: "shadow-[6px_6px_0_#eab308]",
    glow: "rgba(234,179,8,0.4)",
    bg: "from-[#121526] to-[#0d101a]",
    color: "text-yellow-400",
  },
  BIDDING: {
    border: "border-yellow-400",
    shadow: "shadow-[6px_6px_0_#eab308]",
    glow: "rgba(234,179,8,0.3)",
    bg: "from-[#121526] to-[#0d101a]",
    color: "text-yellow-400",
  },
  SOLD: {
    border: "border-emerald-400",
    shadow: "shadow-[6px_6px_0_#10b981]",
    glow: "rgba(16,185,129,0.4)",
    bg: "from-[#121526] to-[#0d101a]",
    color: "text-emerald-400",
  },
  DISCARDED: {
    border: "border-rose-500",
    shadow: "shadow-[6px_6px_0_#f43f5e]",
    glow: "rgba(244,63,94,0.4)",
    bg: "from-[#121526] to-[#0d101a]",
    color: "text-rose-400",
  },
};

// ============================================================================
// INDICADORES ROTATIVOS
// ============================================================================
const INDICATORS = [
  { id: "rarity", label: "Rareza", icon: Sparkles, color: "text-yellow-400" },
  { id: "value", label: "Valor", icon: Crown, color: "text-amber-400" },
  { id: "attribute", label: "Atributo", icon: Zap, color: "text-cyan-400" },
  { id: "race", label: "Raza", icon: Shield, color: "text-emerald-400" },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function AuctionZone({
  auctionState,
  pool = [],
  settings,
  players,
  mySlot,
  game,
  onBid,
  onToggleFinish,
  onRouletteFinished,
  onTimerTick,
  onTimeExpired,
  onCharacterInfo = null, // ← NUEVO
}) {
  // ==========================================================================
  // NORMALIZACIÓN
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
    price_modifier = 0,
    base_price = 0,
  } = auctionState || {};

  const character = current_character || currentCharacter;
  const characterId = current_character_id || character?.id || "no-char";
  const minAccept = minAcceptancePrice || min_price;
  const bid = currentBid || current_bid;
  const leader = highestBidder || highest_bidder_slot;
  const running = timer_running === true || timerRunning === true;

  // Límite de subastas
  const maxAuctions = settings?.maxAuctionsPerRound ?? 20;
  const auctionsThisRound = game?.auctions_this_round ?? 0;
  const isLimitReached = auctionsThisRound >= maxAuctions;

  // Pity
  const pityCounter = game?.pity_counter ?? 0;
  const lastPityIncrement = game?.last_pity_increment ?? 0;

  // ==========================================================================
  // TIMER LOCAL
  // ==========================================================================
  const [localTime, setLocalTime] = useState(
    (typeof timeLeft === "number" ? timeLeft : time_left) ?? 20
  );
  const timeRef = useRef(localTime);
  timeRef.current = localTime;

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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, running, onTimeExpired]);

  // ==========================================================================
  // CONFETTI / SONIDOS
  // ==========================================================================
  useEffect(() => {
    if (status === "SOLD") {
      sounds.playVictory();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#eab308", "#22d3ee", "#d946ef", "#ffffff"],
      });
    } else if (status === "DISCARDED") {
      sounds.playDiscard();
    }
  }, [status]);

  // ==========================================================================
  // CÁLCULOS
  // ==========================================================================
  const maxTime = settings?.auctionTime || 20;
  const time = localTime;
  const progressPercent = Math.max(0, Math.min(100, (time / maxTime) * 100));
  const isUrgent = time <= 5 && running;

  const theme = STATE_THEME[status] || STATE_THEME.IDLE;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="relative">
      {/* Fondo glow según estado */}
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 rounded-2xl blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${theme.glow} 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Contenido según estado */}
      <AnimatePresence mode="wait">
        {status === "IDLE" && (
          <IdleState
            key="idle"
            theme={theme}
            pool={pool}
            players={players}
            auctionsThisRound={auctionsThisRound}
            maxAuctions={maxAuctions}
            isLimitReached={isLimitReached}
            pityCounter={pityCounter}
            lastPityIncrement={lastPityIncrement}
          />
        )}

        {status === "SELECTING" && (
          <SelectingState
            key="selecting"
            theme={theme}
            characterId={characterId}
            pool={pool}
            character={character}
            animationType={settings?.animationType || "roulette"}
            onRouletteFinished={onRouletteFinished}
            priceModifier={price_modifier}
            basePrice={base_price}
          />
        )}

        {status === "SOLD" && (
          <SoldState
            key="sold"
            theme={theme}
            character={character}
            leader={leader}
            players={players}
            bid={bid}
            priceModifier={price_modifier}
            onCharacterInfo={onCharacterInfo}
          />
        )}

        {status === "DISCARDED" && (
          <DiscardedState
            key="discarded"
            theme={theme}
            character={character}
            minAccept={minAccept}
            onCharacterInfo={onCharacterInfo}
          />
        )}

        {status === "BIDDING" && (
          <BiddingState
            key="bidding"
            theme={theme}
            auctionsThisRound={auctionsThisRound}
            maxAuctions={maxAuctions}
            isLimitReached={isLimitReached}
            isUrgent={isUrgent}
            time={time}
            maxTime={maxTime}
            progressPercent={progressPercent}
            character={character}
            minAccept={minAccept}
            bid={bid}
            leader={leader}
            leaderName={leader ? players?.[leader]?.name : null}
            players={players}
            mySlot={mySlot}
            running={running}
            onBid={onBid}
            onToggleFinish={onToggleFinish}
            priceModifier={price_modifier}
            basePrice={base_price}
            onCharacterInfo={onCharacterInfo}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// IDLE STATE
// ============================================================================
function IdleState({
  theme,
  pool,
  players,
  auctionsThisRound,
  maxAuctions,
  isLimitReached,
  pityCounter,
  lastPityIncrement,
}) {
  const p1Ready = players?.player1?.ready;
  const p2Ready = players?.player2?.ready;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative rounded-2xl border-4 ${theme.border} bg-gradient-to-b ${theme.bg} p-5 sm:p-6 text-center ${theme.shadow} overflow-hidden`}
      aria-label="Zona de subasta en espera"
    >
      {/* Glow decorativo */}
      <div
        className="absolute -right-12 -bottom-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-md mx-auto space-y-4">
        {/* Icono */}
        <motion.div
          className="inline-flex p-4 bg-gradient-to-br from-yellow-400/20 to-amber-500/10 border-2 border-yellow-400/60 rounded-2xl"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles
            className="w-12 h-12 text-yellow-400"
            strokeWidth={2}
            aria-hidden="true"
          />
        </motion.div>

        {/* Título */}
        <h2 className="font-['Press_Start_2P'] text-sm sm:text-base text-yellow-400 tracking-wider drop-shadow-[2px_2px_0_#000]">
          ZONA DE SUBASTA
        </h2>

        {/* Indicador rotativo */}
        <RotatingIndicator
          pityCounter={pityCounter}
          lastPityIncrement={lastPityIncrement}
          availableCount={pool.length}
        />

        {/* Contador de sorteos */}
        <AuctionCounter
          current={auctionsThisRound}
          max={maxAuctions}
          isLimitReached={isLimitReached}
        />

        {/* Mensaje de estado */}
        <p className="font-['Chakra_Petch'] text-sm text-slate-300">
          {pool.length === 0 ? (
            <span className="text-rose-400 font-bold">
              ⚠️ No quedan personajes. Usa los botones inferiores para reiniciar.
            </span>
          ) : isLimitReached ? (
            <span className="text-rose-400 font-bold">
              ⚠️ Límite de {maxAuctions} sorteos alcanzado. Avanza de ronda.
            </span>
          ) : (
            "Ambos jugadores deben presionar [ ¡LISTO! ] para comenzar."
          )}
        </p>

        {/* Indicadores de ready */}
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
    </motion.div>
  );
}

// ============================================================================
// SELECTING STATE
// ============================================================================
function SelectingState({
  theme,
  characterId,
  pool,
  character,
  animationType,
  onRouletteFinished,
  priceModifier,
  basePrice,
}) {
  // Detectar si hubo modificador
  const hasModifier = priceModifier && priceModifier !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative rounded-2xl border-4 ${theme.border} bg-gradient-to-b ${theme.bg} p-4 sm:p-6 ${theme.shadow} overflow-hidden`}
      aria-label="Sorteando personaje"
    >
      {/* Flash de modificador (aparece arriba) */}
      <AnimatePresence>
        {hasModifier && (
          <ModifierFlash
            key="modifier"
            modifier={priceModifier}
            basePrice={basePrice}
          />
        )}
      </AnimatePresence>

      <RouletteDisplay
        key={characterId}
        pool={pool}
        targetCharacter={character}
        animationType={animationType}
        onComplete={onRouletteFinished}
      />
    </motion.div>
  );
}

// ============================================================================
// SOLD STATE
// ============================================================================
function SoldState({ theme, character, leader, players, bid, onCharacterInfo }) {
  const winnerName = leader ? players?.[leader]?.name : "Ganador";
  const winnerColor = leader === "player1" ? "text-cyan-400" : "text-rose-400";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      role="status"
      aria-live="polite"
      className={`relative rounded-2xl border-4 ${theme.border} bg-gradient-to-b ${theme.bg} p-6 text-center ${theme.shadow} overflow-hidden`}
    >
      <div className="relative max-w-md mx-auto space-y-4">
        {/* Icono trofeo animado */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          className="inline-flex p-3 bg-gradient-to-br from-emerald-400/30 to-teal-500/10 border-2 border-emerald-400 rounded-full"
        >
          <Trophy
            className="w-10 h-10 text-emerald-400"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </motion.div>

        <div className="font-['Press_Start_2P'] text-xs text-emerald-400 uppercase tracking-wider">
          ¡SUBASTA CONCLUIDA!
        </div>

        <h2 className="font-['Press_Start_2P'] text-base sm:text-xl text-yellow-400 drop-shadow-[2px_2px_0_#000]">
          ¡VENDIDO A <span className={winnerColor}>{winnerName}</span>!
        </h2>

        <p className="text-sm font-['Chakra_Petch'] text-slate-300">
          Comprado por{" "}
          <strong className="text-yellow-400">{bid} monedas</strong>. Añadido al
          inventario.
        </p>

        <div className="max-w-xs mx-auto">
          <CharacterCard
            character={character}
            size="large"
            showMinPriceBadge={false}
            onInfo={onCharacterInfo}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// DISCARDED STATE
// ============================================================================
function DiscardedState({ theme, character, minAccept, onCharacterInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, rotate: [0, -2, 2, -2, 2, 0] }}
      transition={{ duration: 0.5 }}
      role="status"
      aria-live="polite"
      className={`relative rounded-2xl border-4 ${theme.border} bg-gradient-to-b ${theme.bg} p-6 text-center ${theme.shadow} overflow-hidden`}
    >
      <div className="relative max-w-md mx-auto space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex p-3 bg-gradient-to-br from-rose-500/30 to-red-600/10 border-2 border-rose-500 rounded-full"
        >
          <XCircle
            className="w-10 h-10 text-rose-500"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </motion.div>

        <div className="font-['Press_Start_2P'] text-xs text-rose-400 uppercase tracking-wider">
          TIEMPO AGOTADO
        </div>

        <h2 className="font-['Press_Start_2P'] text-base sm:text-lg text-white drop-shadow-[2px_2px_0_#000]">
          ¡PERSONAJE DESECHADO!
        </h2>

        <p className="text-sm font-['Chakra_Petch'] text-slate-400">
          No hubo pujas que cumplieran el mínimo requerido ({minAccept} monedas).
        </p>

        <div className="max-w-xs mx-auto opacity-70 grayscale-[30%]">
          <CharacterCard
            character={character}
            size="large"
            showMinPriceBadge={false}
            onInfo={onCharacterInfo}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// BIDDING STATE
// ============================================================================
function BiddingState({
  theme,
  auctionsThisRound,
  maxAuctions,
  isLimitReached,
  isUrgent,
  time,
  maxTime,
  progressPercent,
  character,
  minAccept,
  bid,
  leader,
  leaderName,
  players,
  mySlot,
  running,
  onBid,
  onToggleFinish,
  priceModifier,
  basePrice,
  onCharacterInfo,
}) {
  const leaderColor = leader === "player1" ? "text-cyan-400" : "text-rose-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative rounded-2xl border-4 ${theme.border} bg-gradient-to-b ${theme.bg} p-4 sm:p-5 ${theme.shadow} space-y-4 overflow-hidden`}
      aria-label="Subasta en curso"
    >
      {/* Contador de sorteos */}
      <AuctionCounter
        current={auctionsThisRound}
        max={maxAuctions}
        isLimitReached={isLimitReached}
        compact
      />

      {/* Cronómetro */}
      <Timer
        time={time}
        maxTime={maxTime}
        progressPercent={progressPercent}
        isUrgent={isUrgent}
      />

      {/* Personaje */}
      <CharacterCard
        character={character}
        size="large"
        minAcceptancePrice={minAccept}
        onInfo={onCharacterInfo}
      />

      {/* Puja actual + Líder */}
      <BidLeaderDisplay
        bid={bid}
        leader={leader}
        leaderName={leaderName}
        leaderColor={leaderColor}
        priceModifier={priceModifier}
        basePrice={basePrice}
      />

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
    </motion.div>
  );
}

// ============================================================================
// SUB: Timer
// ============================================================================
function Timer({ time, maxTime, progressPercent, isUrgent }) {
  return (
    <div
      className={`relative bg-black/60 rounded-xl p-3 border-2 transition-colors ${
        isUrgent ? "border-rose-500/60" : "border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isUrgent ? { rotate: 360 } : {}}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          >
            <Clock
              className={`w-5 h-5 ${
                isUrgent ? "text-rose-500" : "text-yellow-400"
              }`}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </motion.div>
          <span className="font-['Press_Start_2P'] text-xs uppercase text-slate-300">
            TIEMPO
          </span>
        </div>
        <motion.span
          role="timer"
          aria-live={isUrgent ? "assertive" : "polite"}
          aria-label={`Tiempo restante: ${time} segundos`}
          animate={
            isUrgent
              ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }
              : {}
          }
          transition={{ duration: 0.8, repeat: Infinity }}
          className={`font-['Press_Start_2P'] text-2xl ${
            isUrgent ? "text-rose-500" : "text-yellow-400"
          } drop-shadow-[2px_2px_0_#000]`}
        >
          {time}s
        </motion.span>
      </div>

      <div
        className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 relative"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxTime}
        aria-valuenow={time}
        aria-label="Progreso del tiempo"
      >
        <motion.div
          className={`h-full ${
            isUrgent
              ? "bg-gradient-to-r from-rose-600 via-rose-500 to-red-600"
              : "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
          }`}
          style={{ width: `${progressPercent}%` }}
          animate={isUrgent ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// SUB: BidLeaderDisplay
// ============================================================================
function BidLeaderDisplay({
  bid,
  leader,
  leaderName,
  leaderColor,
  priceModifier,
  basePrice,
}) {
  const hasModifier = priceModifier && priceModifier !== 0;

  return (
    <div className="relative p-3 bg-black/70 border-2 border-yellow-400/80 rounded-xl space-y-2 shadow-inner overflow-hidden">
      {/* Modificador badge si aplica */}
      {hasModifier && (
        <div className="flex items-center justify-center">
          <ModifierBadge
            modifier={priceModifier}
            basePrice={basePrice}
            finalPrice={bid}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
            PUJA MÁS ALTA
          </div>
          <motion.div
            key={bid}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xl sm:text-2xl font-['Press_Start_2P'] text-yellow-400 drop-shadow-[2px_2px_0_#000]"
            aria-live="polite"
          >
            {bid > 0 ? `${bid}` : "—"}
            {bid > 0 && (
              <span className="text-xs text-yellow-200 ml-1">MON</span>
            )}
          </motion.div>
        </div>

        <div className="text-right min-w-0">
          <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase flex items-center gap-1 justify-end">
            <Crown className="w-3 h-3" aria-hidden="true" />
            LÍDER
          </div>
          <motion.div
            key={leaderName}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`font-['Press_Start_2P'] text-xs sm:text-sm ${
              leaderColor || "text-slate-500"
            } truncate max-w-[130px]`}
            aria-live="polite"
          >
            {leaderName || "Nadie"}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB: ModifierFlash
// ============================================================================
function ModifierFlash({ modifier, basePrice }) {
  const isPositive = modifier > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const label = isPositive ? "OFERTA" : "CONTRAOFERTA";
  const color = isPositive
    ? "from-rose-500 to-red-600 border-rose-300"
    : "from-emerald-500 to-teal-600 border-emerald-300";
  const textColor = "text-white";
  const finalPrice = basePrice + modifier;

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      role="status"
      aria-live="assertive"
    >
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color} blur-lg opacity-60`}
          aria-hidden="true"
        />
        <div
          className={`relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${color} border-2 ${color.split(" ").pop()} rounded-xl shadow-[4px_4px_0_#000]`}
        >
          <Icon className={`w-4 h-4 ${textColor}`} strokeWidth={3} aria-hidden="true" />
          <span className={`font-['Press_Start_2P'] text-[10px] ${textColor}`}>
            {label}
          </span>
          <span className={`font-['Press_Start_2P'] text-xs ${textColor} drop-shadow-[1px_1px_0_#000]`}>
            {isPositive ? `+${modifier}` : modifier}
          </span>
        </div>
        <p className="text-center text-[9px] font-['Chakra_Petch'] text-white/80 mt-1">
          {basePrice} → {finalPrice} monedas
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB: ModifierBadge
// ============================================================================
function ModifierBadge({ modifier, basePrice, finalPrice }) {
  const isPositive = modifier > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 ${
        isPositive
          ? "bg-rose-950/60 border-rose-500/70 text-rose-300"
          : "bg-emerald-950/60 border-emerald-500/70 text-emerald-300"
      }`}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
      <span className="font-['Press_Start_2P'] text-[9px]">
        {isPositive ? "OFERTA" : "CONTRAOFERTA"}
      </span>
      <span className="font-['Press_Start_2P'] text-[10px] text-white">
        {isPositive ? `+${modifier}` : modifier}
      </span>
      <span className="font-['Chakra_Petch'] text-[9px] text-slate-400">
        ({basePrice} → {finalPrice})
      </span>
    </motion.div>
  );
}

// ============================================================================
// SUB: RotatingIndicator
// ============================================================================
function RotatingIndicator({ pityCounter, lastPityIncrement, availableCount }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % INDICATORS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const indicator = INDICATORS[index];
  const Icon = indicator.icon;

  const getMessage = () => {
    if (indicator.id === "rarity") {
      if (pityCounter >= 90) return "⚡ ¡RANGO ALTO GARANTIZADO!";
      if (pityCounter >= 60) return "🔮 Rareza superior próxima...";
      if (pityCounter >= 30) return "✨ Energía elevada detectada...";
      return "🎲 Sortear rareza...";
    }
    if (indicator.id === "value") {
      return "💎 Calculando valor de aceptación...";
    }
    if (indicator.id === "attribute") {
      return "⚔️ Consultando atributo...";
    }
    if (indicator.id === "race") {
      return "🧬 Identificando raza...";
    }
    return "";
  };

  return (
    <div className="flex items-center justify-center gap-2 min-h-[20px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={indicator.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <Icon className={`w-4 h-4 ${indicator.color}`} strokeWidth={2.5} aria-hidden="true" />
          <span className={`font-['Chakra_Petch'] text-xs font-bold ${indicator.color}`}>
            {getMessage()}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SUB: AuctionCounter
// ============================================================================
function AuctionCounter({ current, max, isLimitReached, compact = false }) {
  const percent = Math.min(100, (current / max) * 100);
  const colorBar = isLimitReached
    ? "bg-rose-500"
    : percent >= 75
    ? "bg-amber-500"
    : "bg-emerald-500";
  const colorText = isLimitReached
    ? "text-rose-400"
    : percent >= 75
    ? "text-amber-400"
    : "text-emerald-400";

  return (
    <div
      className={`bg-black/50 border-2 rounded-xl ${
        isLimitReached ? "border-rose-500/60" : "border-slate-700"
      } ${compact ? "p-2" : "p-3"}`}
      role="status"
      aria-live="polite"
      aria-label={`Sorteo ${current} de ${max}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {isLimitReached ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Package className="w-3.5 h-3.5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
          )}
          <span className="font-['Press_Start_2P'] text-[9px] uppercase text-slate-300">
            {isLimitReached ? "LÍMITE" : "SORTEO"}
          </span>
        </div>
        <span className={`font-['Press_Start_2P'] ${colorText} ${compact ? "text-[10px]" : "text-xs"}`}>
          {current} / {max}
        </span>
      </div>
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className={`h-full ${colorBar}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// SUB: ReadyIndicator
// ============================================================================
function ReadyIndicator({ name, ready, color }) {
  const palette = {
    cyan: {
      readyBg: "bg-gradient-to-br from-cyan-950/80 to-cyan-900/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]",
      icon: "text-cyan-400",
    },
    rose: {
      readyBg: "bg-gradient-to-br from-rose-950/80 to-rose-900/60 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]",
      icon: "text-rose-400",
    },
  }[color];

  return (
    <motion.div
      animate={ready ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`p-3 rounded-xl border-2 transition-all ${
        ready ? palette.readyBg : "bg-black/40 border-slate-700 text-slate-500"
      }`}
      aria-label={`${name}: ${ready ? "listo" : "esperando"}`}
    >
      <div className="text-[10px] font-['Press_Start_2P'] uppercase mb-1 truncate">
        {name}
      </div>
      <div className="text-xs font-['Chakra_Petch'] font-bold flex items-center justify-center gap-1">
        {ready ? (
          <>
            <CheckCircle2 className={`w-4 h-4 ${palette.icon}`} strokeWidth={2.5} aria-hidden="true" />
            <span>¡LISTO!</span>
          </>
        ) : (
          <span>Esperando...</span>
        )}
      </div>
    </motion.div>
  );
}