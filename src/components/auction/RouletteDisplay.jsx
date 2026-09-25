import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Crown, Star, Gift, Flame } from "lucide-react";
import CharacterCard from "./CharacterCard";
import sounds from "../../services/soundEffects";

// ============================================================================
// CONFIGURACIÓN DE RAREZA
// ============================================================================
const RARITY_GLOW = {
  R: "#94a3b8",
  SR: "#fbbf24",
  SSR: "#22d3ee",
  UR: "#d946ef",
  LR: "#ffffff",
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function RouletteDisplay({
  pool = [],
  targetCharacter,
  animationType = "roulette",
  onComplete,
}) {
  const [phase, setPhase] = useState("spinning");
  const [displayIndex, setDisplayIndex] = useState(0);
  const [currentRarityColor, setCurrentRarityColor] = useState("text-yellow-400");

  const timerRef = useRef(null);
  const revealTimeoutRef = useRef(null);
  const startedRef = useRef(false);

  const targetId = targetCharacter?.id;
  const duration = getDurationByRarity(targetCharacter?.rarity);

  // ==========================================================================
  // ARRANQUE DE LA ANIMACIÓN
  // ==========================================================================
  useEffect(() => {
    if (!pool || pool.length === 0) return;
    if (!targetCharacter) return;
    if (startedRef.current) return;
    startedRef.current = true;

    sounds.initContext();

    const startTime = Date.now();
    let speed = 60;

    const colors = [
      "text-slate-400",
      "text-amber-400",
      "text-cyan-400",
      "text-fuchsia-400",
      "text-white",
    ];

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress > 0.6) {
        speed = 60 + Math.pow((progress - 0.6) / 0.4, 3) * 350;
      }

      sounds.playRouletteTick(1 + (1 - progress));
      setDisplayIndex((prev) => (prev + 1) % pool.length);
      setCurrentRarityColor(colors[Math.floor(Math.random() * colors.length)]);

      if (progress < 1) {
        timerRef.current = setTimeout(step, speed);
      } else {
        setPhase("revealed");
        sounds.playGachaReveal(targetCharacter.rarity);
        revealTimeoutRef.current = setTimeout(() => {
          if (onComplete) onComplete();
        }, 1800);
      }
    };

    timerRef.current = setTimeout(step, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, duration]);

  // ==========================================================================
  // DATOS DERIVADOS
  // ==========================================================================
  const activeChar =
    phase === "revealed"
      ? targetCharacter
      : pool[displayIndex] || targetCharacter;

  const targetRarity = targetCharacter?.rarity || "R";
  const isHighRarity = targetRarity === "UR" || targetRarity === "LR";
  const rarityGlow = RARITY_GLOW[targetRarity];

  return (
    <div
      className="relative w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={
        phase === "spinning" ? "Sorteando personaje" : "Personaje seleccionado"
      }
    >
      {/* ─── Fondo glow según rareza objetivo ───────────────────────────── */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${rarityGlow} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* ─── Título ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-4 text-center z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div
            animate={{ rotate: [0, -20, 20, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          >
            <Zap className="w-5 h-5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
          <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider drop-shadow-[1px_1px_0_#000]">
            {phase === "spinning" ? "¡SORTEANDO!" : "¡SELECCIONADO!"}
          </h2>
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          >
            <Zap className="w-5 h-5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
        </div>
        <p className="text-xs font-['Chakra_Petch'] font-semibold text-slate-300">
          {phase === "spinning"
            ? targetRarity === "LR"
              ? "⚡ ¡ALERTA DE ALTA ENERGÍA! ⚡"
              : targetRarity === "UR"
              ? "✨ Energía cósmica detectada..."
              : "La ruleta está decidiendo..."
            : "¡Prepárense para las pujas!"}
        </p>
      </motion.div>

      {/* ─── Animaciones según tipo ─────────────────────────────────────── */}
      <div className="relative w-full z-10">
        <AnimatePresence mode="wait">
          {phase === "spinning" ? (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {animationType === "roulette" && (
                <RouletteSpinner
                  activeChar={activeChar}
                  currentRarityColor={currentRarityColor}
                  duration={duration}
                />
              )}
              {animationType === "slot" && (
                <SlotMachine
                  activeChar={activeChar}
                  currentRarityColor={currentRarityColor}
                />
              )}
              {animationType === "card_flip" && (
                <CardFlipSpinner />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.7, rotateY: -90 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateY: 0,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.7,
                },
              }}
              className={isHighRarity ? "animate-wiggle" : ""}
            >
              <CharacterCard
                character={targetCharacter}
                size="large"
                showMinPriceBadge={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Cartel de suspenso alta rareza ─────────────────────────────── */}
      <AnimatePresence>
        {isHighRarity && phase === "spinning" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative mt-3 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-['Chakra_Petch'] font-bold z-10"
            style={{
              background: "rgba(217,70,239,0.2)",
              border: "2px solid rgba(217,70,239,0.6)",
              color: "#f0abfc",
            }}
            role="status"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </motion.div>
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ¡RANGO ALTO DETECTADO!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 🎡 ANIMACIÓN 1: RULETA HORIZONTAL
// ============================================================================
function RouletteSpinner({ activeChar, currentRarityColor, duration }) {
  const imageUrl = activeChar?.image_url || activeChar?.imageUrl || "";

  return (
    <div className="relative rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-black/95 to-slate-900/95 p-4 shadow-[0_0_40px_rgba(234,179,8,0.6)] overflow-hidden">
      {/* Marcador superior */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30"
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-yellow-400 drop-shadow-[0_2px_6px_#000]" />
      </motion.div>

      {/* Fondo con líneas de escaneo */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.15) 0px, transparent 2px, transparent 4px)",
        }}
        aria-hidden="true"
      />

      {/* Reel principal */}
      <div className="relative rounded-xl border-2 border-slate-700 bg-slate-950 p-3 overflow-hidden">
        <div className="flex items-center gap-3">
          {/* Imagen con motion */}
          <motion.div
            key={activeChar?.id}
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="w-20 h-20 rounded-lg overflow-hidden border-2 border-yellow-400 flex-shrink-0 bg-slate-900 relative"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-600">
                ?
              </div>
            )}
            {/* Brillo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <motion.span
                key={activeChar?.rarity}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-yellow-400 text-black font-bold"
              >
                {activeChar?.rarity}
              </motion.span>
              <span className="text-[10px] font-['Chakra_Petch'] text-slate-400">
                Aceptación: 0-{activeChar?.acceptance}
              </span>
            </div>
            <motion.div
              key={activeChar?.name}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="font-['Press_Start_2P'] text-xs text-white truncate mb-1"
            >
              {activeChar?.name}
            </motion.div>
            <div className="text-[10px] text-cyan-300 font-mono animate-pulse">
              &gt;&gt; BARAJEANDO POOL &lt;&lt;
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 🎰 ANIMACIÓN 2: SLOT MACHINE VERTICAL
// ============================================================================
function SlotMachine({ activeChar, currentRarityColor }) {
  const imageUrl = activeChar?.image_url || activeChar?.imageUrl || "";

  return (
    <div className="relative w-full max-w-xs mx-auto overflow-hidden rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-black via-slate-950 to-black shadow-[0_0_35px_rgba(234,179,8,0.6)]">
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 px-3 py-1.5 text-center border-b-2 border-black">
        <span className="font-['Press_Start_2P'] text-[10px] text-black tracking-wider drop-shadow-[1px_1px_0_rgba(255,255,255,0.4)]">
          ★ SLOT MACHINE ★
        </span>
      </div>

      {/* Cuerpo del slot */}
      <div className="relative p-4 flex flex-col items-center justify-center">
        {/* Línea de pago superior */}
        <div className="absolute left-4 right-4 top-3 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 pointer-events-none z-20" />

        {/* Reel vertical */}
        <div className="relative w-32 h-40 overflow-hidden rounded-xl border-2 border-slate-700 bg-black">
          {/* Fondo rayado (motion blur visual) */}
          <motion.div
            className="absolute inset-0 opacity-40 pointer-events-none z-30"
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, transparent 2px, transparent 4px)",
            }}
          />

          {/* Imagen que se mueve verticalmente */}
          <motion.div
            key={activeChar?.id}
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.08 }}
            className="absolute inset-0"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-600">
                ?
              </div>
            )}
          </motion.div>

          {/* Brillo superior e inferior */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
        </div>

        {/* Info debajo del reel */}
        <div className="mt-3 w-full text-center space-y-1.5 z-10">
          <motion.div
            key={activeChar?.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-['Press_Start_2P'] text-xs ${currentRarityColor} truncate max-w-full`}
          >
            {activeChar?.name}
          </motion.div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
            <span className="font-['Press_Start_2P'] text-[9px] text-yellow-300">
              {activeChar?.rarity}
            </span>
          </div>
        </div>

        {/* Palanca decorativa */}
        <motion.div
          className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-12 bg-gradient-to-b from-red-500 to-red-700 rounded-full border-2 border-black shadow-[2px_2px_0_#000] origin-top"
          animate={{ rotate: [-15, 15, -15] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          aria-hidden="true"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-rose-400 to-red-600 rounded-full border-2 border-black shadow-[1px_1px_0_#000]" />
        </motion.div>

        {/* Luces LED decorativas */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 🃏 ANIMACIÓN 3: CARD FLIP 3D (REAL)
// ============================================================================
function CardFlipSpinner() {
  return (
    <div className="perspective-1000 w-full max-w-xs h-80 flex items-center justify-center mx-auto">
      <div className="relative w-64 h-80 preserve-3d">
        {/* Animación continua de flip */}
        <motion.div
          className="absolute inset-0 preserve-3d"
          animate={{ rotateY: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Cara frontal (dorso) */}
          <div
            className="absolute inset-0 rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-purple-900 via-indigo-950 to-black shadow-[0_0_40px_#eab308] p-6 flex flex-col items-center justify-center text-center backface-hidden"
            style={{ transform: "rotateY(0deg)" }}
          >
            <Crown className="w-16 h-16 text-yellow-400 mb-3" strokeWidth={2.5} />
            <div className="font-['Press_Start_2P'] text-xs text-yellow-300 mb-2 tracking-wider">
              ? ? ?
            </div>
            <div className="text-[10px] font-['Chakra_Petch'] font-bold text-cyan-300">
              REVELANDO...
            </div>
          </div>

          {/* Cara trasera (mismo diseño para dar sensación de giro) */}
          <div
            className="absolute inset-0 rounded-2xl border-4 border-cyan-400 bg-gradient-to-br from-indigo-900 via-purple-950 to-black shadow-[0_0_40px_#22d3ee] p-6 flex flex-col items-center justify-center text-center backface-hidden"
            style={{ transform: "rotateY(180deg)" }}
          >
            <Star className="w-16 h-16 text-cyan-400 mb-3" strokeWidth={2.5} />
            <div className="font-['Press_Start_2P'] text-xs text-cyan-300 mb-2 tracking-wider">
              ★ ★ ★
            </div>
            <div className="text-[10px] font-['Chakra_Petch'] font-bold text-yellow-300">
              SINCRONIZANDO...
            </div>
          </div>
        </motion.div>
      </div>

      {/* Indicador de progreso */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-yellow-400"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER: duración por rareza
// ============================================================================
function getDurationByRarity(rarity) {
  switch (rarity) {
    case "LR":
      return 10000;
    case "UR":
      return 9000;
    case "SSR":
      return 7000;
    case "SR":
      return 6000;
    case "R":
    default:
      return 5000;
  }
}