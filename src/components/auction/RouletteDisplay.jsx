import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Zap, Flame, Crown } from "lucide-react";
import CharacterCard, { RARITY_CONFIG } from "./CharacterCard";
import sounds from "../../services/soundEffects";

export default function RouletteDisplay({ 
  pool = [], 
  targetCharacter, 
  animationType = "roulette", // 'roulette' | 'slot' | 'card_flip'
  onComplete 
}) {
  const [phase, setPhase] = useState("spinning"); // 'spinning' | 'revealed'
  const [displayIndex, setDisplayIndex] = useState(0);
  const [currentRarityColor, setCurrentRarityColor] = useState("text-yellow-400");
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // Calcular duración según rareza del personaje objetivo
  // R/SR: 5-6s, SSR: 7s, UR: 9s, LR: 10s
  const getDurationByRarity = (rarity) => {
    switch (rarity) {
      case "LR": return 10000;
      case "UR": return 9000;
      case "SSR": return 7000;
      case "SR": return 6000;
      case "R":
      default: return 5000;
    }
  };

  const duration = getDurationByRarity(targetCharacter?.rarity);

  useEffect(() => {
    if (!pool.length || !targetCharacter) return;

    sounds.initContext();
    const startTime = Date.now();
    let speed = 60; // ms por cambio inicial (muy rápido)

    const colors = ["text-slate-400", "text-amber-400", "text-cyan-400", "text-fuchsia-400", "text-white"];

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Desaceleración progresiva cúbica al final
      if (progress > 0.6) {
        speed = 60 + Math.pow((progress - 0.6) / 0.4, 3) * 350;
      }

      // Sonido de clic/ruleta
      sounds.playRouletteTick(1 + (1 - progress));

      // Cambiar índice visual
      setDisplayIndex((prev) => (prev + 1) % pool.length);
      setCurrentRarityColor(colors[Math.floor(Math.random() * colors.length)]);

      if (progress < 1) {
        timerRef.current = setTimeout(step, speed);
      } else {
        // Fin de la ruleta: REVELAR
        setPhase("revealed");
        sounds.playGachaReveal(targetCharacter.rarity);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1500);
      }
    };

    timerRef.current = setTimeout(step, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pool, targetCharacter, duration]);

  const activeChar = phase === "revealed" ? targetCharacter : pool[displayIndex] || targetCharacter;
  const isHighRarity = targetCharacter?.rarity === "UR" || targetCharacter?.rarity === "LR";

  return (
    <div className={`relative w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center transition-all ${
      phase === "revealed" && isHighRarity ? "animate-wiggle" : ""
    }`}>
      
      {/* Título de Ruleta */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />
          <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider">
            {phase === "spinning" ? "¡SORTEANDO PERSONAJE!" : "¡PERSONAJE SELECCIONADO!"}
          </h2>
          <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />
        </div>
        <p className="text-xs font-['Chakra_Petch'] font-semibold text-slate-300">
          {phase === "spinning" 
            ? (targetCharacter?.rarity === "LR" ? "⚡ ¡ALERTA DE ALTA ENERGÍA DETECTADA! ⚡" : "La ruleta arcade está decidiendo...")
            : "¡Prepárense para iniciar las pujas!"}
        </p>
      </div>

      {/* RENDER SEGÚN TIPO DE ANIMACIÓN */}

      {/* 1. ANIMACIÓN: CARTA GIRATORIA 3D (CARD FLIP) */}
      {animationType === "card_flip" && (
        <div className="perspective-1000 w-full max-w-xs h-80 flex items-center justify-center my-2">
          {phase === "spinning" ? (
            <div className="w-64 h-80 rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-purple-900 via-indigo-950 to-black shadow-[0_0_30px_#eab308] p-6 flex flex-col items-center justify-center text-center animate-[spin_2s_linear_infinite] transform-gpu">
              <Crown className="w-16 h-16 text-yellow-400 animate-pulse mb-3" />
              <div className="font-['Press_Start_2P'] text-xs text-yellow-300 mb-2">? ? ?</div>
              <div className="text-xs font-['Chakra_Petch'] font-bold text-cyan-300 animate-pulse">
                Sincronizando Gacha...
              </div>
            </div>
          ) : (
            <div className="w-full animate-[bounce_0.6s_ease-out]">
              <CharacterCard character={targetCharacter} size="large" showMinPriceBadge={false} />
            </div>
          )}
        </div>
      )}

      {/* 2. ANIMACIÓN: SLOT MACHINE (CARRETE VERTICAL) */}
      {animationType === "slot" && (
        <div className="w-full max-w-xs overflow-hidden rounded-2xl border-4 border-yellow-400 bg-black shadow-[0_0_25px_rgba(234,179,8,0.5)] my-2">
          <div className="bg-yellow-400/20 px-3 py-1 text-center border-b-2 border-yellow-400 text-[10px] font-['Press_Start_2P'] text-yellow-300">
            [ SLOT REEL ]
          </div>
          <div className="p-4 flex flex-col items-center justify-center">
            {phase === "spinning" ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3 animate-pulse">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-600 bg-slate-900">
                  <img 
                    src={activeChar?.imageUrl} 
                    alt="spinning" 
                    className="w-full h-full object-cover blur-[0.5px]"
                  />
                </div>
                <div className={`font-['Press_Start_2P'] text-xs ${currentRarityColor} truncate max-w-[200px]`}>
                  {activeChar?.name}
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P'] bg-slate-800 text-slate-300">
                  {activeChar?.rarity}
                </div>
              </div>
            ) : (
              <CharacterCard character={targetCharacter} size="large" showMinPriceBadge={false} />
            )}
          </div>
        </div>
      )}

      {/* 3. ANIMACIÓN: RULETA HORIZONTAL / ARCADE STRIP (DEFAULT) */}
      {animationType === "roulette" && (
        <div className="w-full max-w-sm my-2">
          {phase === "spinning" ? (
            <div className="relative rounded-2xl border-4 border-yellow-400 bg-black/90 p-4 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              {/* Marcador central de ruleta */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-yellow-400 drop-shadow-[0_2px_4px_#000]" />
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-950 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-yellow-400 flex-shrink-0">
                    <img 
                      src={activeChar?.imageUrl} 
                      alt="reel" 
                      className="w-full h-full object-cover"
                    />
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

              {/* Barra de progreso de la ruleta */}
              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 h-full transition-all"
                  style={{ 
                    animation: `pulse 1s infinite, widthFill ${duration}ms linear forwards` 
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="animate-[scaleUp_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
              <CharacterCard character={targetCharacter} size="large" showMinPriceBadge={false} />
            </div>
          )}
        </div>
      )}

      {/* Cartel de Suspenso para Alta Rareza */}
      {isHighRarity && phase === "spinning" && (
        <div className="mt-3 px-3 py-1 bg-fuchsia-950/80 border-2 border-fuchsia-500 rounded-lg animate-pulse flex items-center gap-2 text-fuchsia-300 text-xs font-['Chakra_Petch'] font-bold">
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
          <span>¡RANGO ALTO DETECTADO! AUMENTANDO SUSPENSO...</span>
        </div>
      )}
    </div>
  );
}
