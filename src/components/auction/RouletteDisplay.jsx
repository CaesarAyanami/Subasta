import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Zap, Flame, Crown } from "lucide-react";
import CharacterCard, { RARITY_CONFIG } from "./CharacterCard";
import sounds from "../../services/soundEffects";

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
  const intervalRef = useRef(null);
  const revealTimeoutRef = useRef(null);

  // ⚠️ FIX: congelar pool y targetCharacter al montar.
  // Si el padre re-renderiza y nos pasa nuevas referencias, NO queremos
  // reiniciar la animación. Solo la primera vez es válido.
  const frozenPoolRef = useRef(pool);
  const frozenTargetRef = useRef(targetCharacter);
  const animationStartedRef = useRef(false);

  // Guardar el pool objetivo la PRIMERA vez que hay datos válidos
  if (!animationStartedRef.current && pool.length > 0 && targetCharacter) {
    frozenPoolRef.current = pool;
    frozenTargetRef.current = targetCharacter;
  }

  const frozenPool = frozenPoolRef.current;
  const frozenTarget = frozenTargetRef.current;

  // Calcular duración según rareza del personaje CONGELADO
  const duration = getDurationByRarity(frozenTarget?.rarity);

  // ⚠️ FIX CRÍTICO: el useEffect depende SOLO del id del personaje objetivo
  // (string primitivo). Si el padre nos pasa un nuevo objeto con el mismo id,
  // no se re-ejecuta. Solo se re-ejecuta si cambia el id del personaje.
  const targetId = frozenTarget?.id;

  useEffect(() => {
    if (!frozenPool.length || !frozenTarget) return;
    if (animationStartedRef.current) return; // ya arrancó, no reiniciar

    animationStartedRef.current = true;

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

      setDisplayIndex((prev) => (prev + 1) % frozenPool.length);
      setCurrentRarityColor(colors[Math.floor(Math.random() * colors.length)]);

      if (progress < 1) {
        timerRef.current = setTimeout(step, speed);
      } else {
        setPhase("revealed");
        sounds.playGachaReveal(frozenTarget.rarity);
        revealTimeoutRef.current = setTimeout(() => {
          if (onComplete) onComplete();
        }, 1500);
      }
    };

    timerRef.current = setTimeout(step, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
    // ⚠️ Dependencias intencionalmente mínimas:
    // - targetId: si cambia el personaje objetivo, sí queremos reiniciar
    // - duration: derivada del target, cambia con él
    // NO incluimos frozenPool ni frozenTarget porque son refs (estables)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, duration]);

  // Resetear cuando cambia el target (nueva subasta)
  useEffect(() => {
    if (!targetId) return;
    // Si el id cambió respecto al que tenemos congelado, resetear todo
    if (frozenTargetRef.current?.id !== targetId) {
      frozenTargetRef.current = targetCharacter;
      animationStartedRef.current = false;
      setPhase("spinning");
      setDisplayIndex(0);
    }
  }, [targetId, targetCharacter]);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  const activeChar =
    phase === "revealed"
      ? frozenTarget
      : frozenPool[displayIndex] || frozenTarget;

  const isHighRarity =
    frozenTarget?.rarity === "UR" || frozenTarget?.rarity === "LR";

  // Normalizar imagen (snake_case vs camelCase)
  const activeImageUrl = activeChar?.image_url || activeChar?.imageUrl || "";

  return (
    <div
      className={`relative w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center transition-all ${
        phase === "revealed" && isHighRarity ? "animate-wiggle" : ""
      }`}
    >
      {/* Título */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap
            className="w-5 h-5 text-yellow-400 animate-bounce"
            aria-hidden="true"
          />
          <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider">
            {phase === "spinning"
              ? "¡SORTEANDO PERSONAJE!"
              : "¡PERSONAJE SELECCIONADO!"}
          </h2>
          <Zap
            className="w-5 h-5 text-yellow-400 animate-bounce"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs font-['Chakra_Petch'] font-semibold text-slate-300">
          {phase === "spinning"
            ? frozenTarget?.rarity === "LR"
              ? "⚡ ¡ALERTA DE ALTA ENERGÍA DETECTADA! ⚡"
              : "La ruleta arcade está decidiendo..."
            : "¡Prepárense para iniciar las pujas!"}
        </p>
      </div>

      {/* 1. CARD FLIP */}
      {animationType === "card_flip" && (
        <div className="perspective-1000 w-full max-w-xs h-80 flex items-center justify-center my-2">
          {phase === "spinning" ? (
            <div
              className="w-64 h-80 rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-purple-900 via-indigo-950 to-black shadow-[0_0_30px_#eab308] p-6 flex flex-col items-center justify-center text-center animate-[spin_2s_linear_infinite] transform-gpu"
              aria-hidden="true"
            >
              <Crown className="w-16 h-16 text-yellow-400 animate-pulse mb-3" />
              <div className="font-['Press_Start_2P'] text-xs text-yellow-300 mb-2">
                ? ? ?
              </div>
              <div className="text-xs font-['Chakra_Petch'] font-bold text-cyan-300 animate-pulse">
                Sincronizando Gacha...
              </div>
            </div>
          ) : (
            <div className="w-full animate-[bounce_0.6s_ease-out]">
              <CharacterCard
                character={frozenTarget}
                size="large"
                showMinPriceBadge={false}
              />
            </div>
          )}
        </div>
      )}

      {/* 2. SLOT MACHINE */}
      {animationType === "slot" && (
        <div className="w-full max-w-xs overflow-hidden rounded-2xl border-4 border-yellow-400 bg-black shadow-[0_0_25px_rgba(234,179,8,0.5)] my-2">
          <div className="bg-yellow-400/20 px-3 py-1 text-center border-b-2 border-yellow-400 text-[10px] font-['Press_Start_2P'] text-yellow-300">
            [ SLOT REEL ]
          </div>
          <div className="p-4 flex flex-col items-center justify-center">
            {phase === "spinning" ? (
              <div
                className="h-64 flex flex-col items-center justify-center space-y-3 animate-pulse"
                aria-hidden="true"
              >
                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-600 bg-slate-900">
                  {activeImageUrl ? (
                    <img
                      src={activeImageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover blur-[0.5px]"
                    />
                  ) : null}
                </div>
                <div
                  className={`font-['Press_Start_2P'] text-xs ${currentRarityColor} truncate max-w-[200px]`}
                >
                  {activeChar?.name}
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-slate-800 text-slate-300">
                  {activeChar?.rarity}
                </div>
              </div>
            ) : (
              <CharacterCard
                character={frozenTarget}
                size="large"
                showMinPriceBadge={false}
              />
            )}
          </div>
        </div>
      )}

      {/* 3. RULETA (DEFAULT) */}
      {animationType === "roulette" && (
        <div className="w-full max-w-sm my-2">
          {phase === "spinning" ? (
            <div
              className="relative rounded-2xl border-4 border-yellow-400 bg-black/90 p-4 shadow-[0_0_30px_rgba(234,179,8,0.5)]"
              aria-hidden="true"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-yellow-400 drop-shadow-[0_2px_4px_#000]" />
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-950 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-yellow-400 flex-shrink-0 bg-slate-900">
                    {activeImageUrl ? (
                      <img
                        src={activeImageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-yellow-400 text-black font-bold">
                        {activeChar?.rarity}
                      </span>
                      <span className="text-[10px] font-['Chakra_Petch'] text-slate-400">
                        Aceptación: 0-{activeChar?.acceptance}
                      </span>
                    </div>
                    <div className="font-['Press_Start_2P'] text-xs text-white truncate mb-1">
                      {activeChar?.name}
                    </div>
                    <div className="text-[10px] text-cyan-300 font-mono animate-pulse">
                      &gt;&gt; BARAJEANDO POOL &lt;&lt;
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 h-full transition-all"
                  style={{
                    animation: `pulse 1s infinite, widthFill ${duration}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="animate-[scaleUp_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
              <CharacterCard
                character={frozenTarget}
                size="large"
                showMinPriceBadge={false}
              />
            </div>
          )}
        </div>
      )}

      {/* Cartel de suspenso alta rareza */}
      {isHighRarity && phase === "spinning" && (
        <div
          className="mt-3 px-3 py-1 bg-fuchsia-950/80 border-2 border-fuchsia-500 rounded-lg animate-pulse flex items-center gap-2 text-fuchsia-300 text-xs font-['Chakra_Petch'] font-bold"
          role="status"
        >
          <Sparkles
            className="w-4 h-4 text-fuchsia-400"
            aria-hidden="true"
          />
          <span>¡RANGO ALTO DETECTADO! AUMENTANDO SUSPENSO...</span>
        </div>
      )}
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