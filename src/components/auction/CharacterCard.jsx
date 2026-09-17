import React from "react";
import { Sparkles, Coins, ShieldAlert, Star, ShieldCheck } from "lucide-react";

// Estilos temáticos de rareza
export const RARITY_CONFIG = {
  R: {
    label: "R",
    fullName: "Rare",
    badgeClass: "bg-slate-700 text-slate-200 border-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.3)]",
    cardBorder: "border-slate-500 shadow-[4px_4px_0_#334155]",
    cardGlow: "shadow-[0_0_15px_rgba(100,116,139,0.4)]",
    cardBg: "bg-gradient-to-b from-slate-900 via-slate-900 to-[#0c0e17]",
    textColor: "text-slate-300",
    particleColor: "text-slate-400"
  },
  SR: {
    label: "SR",
    fullName: "Super Rare",
    badgeClass: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-yellow-300 font-extrabold shadow-[0_0_15px_rgba(251,191,36,0.6)]",
    cardBorder: "border-amber-400 shadow-[4px_4px_0_#78350f]",
    cardGlow: "shadow-[0_0_25px_rgba(251,191,36,0.6)]",
    cardBg: "bg-gradient-to-b from-amber-950/70 via-[#1c1305] to-[#0c0e17]",
    textColor: "text-amber-300",
    particleColor: "text-yellow-400"
  },
  SSR: {
    label: "SSR",
    fullName: "Super Super Rare",
    badgeClass: "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white border-cyan-300 font-extrabold shadow-[0_0_20px_rgba(34,211,238,0.7)]",
    cardBorder: "border-cyan-400 shadow-[4px_4px_0_#0e7490]",
    cardGlow: "shadow-[0_0_30px_rgba(34,211,238,0.7),0_0_15px_rgba(168,85,247,0.5)]",
    cardBg: "bg-gradient-to-br from-[#0b2447] via-[#191938] to-[#120a2a]",
    textColor: "text-cyan-300",
    particleColor: "text-cyan-300"
  },
  UR: {
    label: "UR",
    fullName: "Ultra Rare",
    badgeClass: "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-pink-500 text-white border-fuchsia-300 font-black shadow-[0_0_25px_rgba(217,70,239,0.9)] animate-pulse",
    cardBorder: "border-fuchsia-500 shadow-[4px_4px_0_#581c87]",
    cardGlow: "shadow-[0_0_35px_rgba(217,70,239,0.8),0_0_50px_rgba(147,51,234,0.4)]",
    cardBg: "bg-gradient-to-br from-[#2c0b4d] via-[#3b0764] to-[#100320]",
    textColor: "text-fuchsia-300",
    particleColor: "text-fuchsia-400"
  },
  LR: {
    label: "LR",
    fullName: "Legendary Rare",
    badgeClass: "bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-900 border-white font-black shadow-[0_0_25px_#ffffff] tracking-wider",
    cardBorder: "border-white shadow-[0_0_35px_rgba(255,255,255,0.9),0_0_60px_rgba(236,72,153,0.3)]",
    cardGlow: "shadow-[0_0_45px_rgba(255,255,255,0.95)] animate-pulse",
    cardBg: "bg-gradient-to-br from-slate-800 via-slate-900 to-[#121420]",
    textColor: "text-slate-100",
    particleColor: "text-white"
  }
};

export default function CharacterCard({ 
  character, 
  size = "large", 
  minAcceptancePrice = null,
  showMinPriceBadge = true,
  onClick = null
}) {
  if (!character) {
    return (
      <div className="w-full h-64 border-4 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-600 bg-black/30">
        <Sparkles className="w-10 h-10 mb-2 animate-pulse text-slate-700" />
        <span className="font-['Press_Start_2P'] text-xs uppercase">Sin personaje</span>
      </div>
    );
  }

  const rarity = character.rarity || "R";
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.R;
  const isLR = rarity === "LR";
  const isUR = rarity === "UR";

  // Si es tamaño grande (Zona central de subasta)
  if (size === "large") {
    return (
      <div 
        className={`relative group rounded-2xl border-4 ${config.cardBorder} ${config.cardGlow} ${config.cardBg} p-4 text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.01]`}
      >
        {/* Efecto de estrellas y partículas para LR */}
        {isLR && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="absolute top-2 left-4 text-yellow-300 animate-spin text-lg" style={{ animationDuration: '6s' }}>✦</div>
            <div className="absolute top-8 right-6 text-white animate-bounce text-xl">★</div>
            <div className="absolute bottom-10 left-8 text-cyan-200 animate-pulse text-base">✦</div>
            <div className="absolute bottom-4 right-10 text-yellow-200 animate-spin text-lg" style={{ animationDuration: '4s' }}>★</div>
            {/* Brillo holográfico barrido */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          </div>
        )}

        {/* Efecto cósmico para UR */}
        {isUR && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="absolute top-3 right-4 text-fuchsia-300 animate-pulse text-lg">✨</div>
            <div className="absolute bottom-6 left-5 text-purple-300 animate-bounce text-base">✨</div>
          </div>
        )}

        {/* Insignia de Rareza y Aceptación */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-20">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg border-2 text-xs font-['Press_Start_2P'] uppercase ${config.badgeClass}`}>
              {config.label}
            </span>
            <span className="text-xs font-['Chakra_Petch'] font-semibold text-slate-300 uppercase tracking-wider hidden sm:inline">
              {config.fullName}
            </span>
          </div>

          {/* Rango de Aceptación / Precio Mínimo Sorteado */}
          {showMinPriceBadge && (
            <div className="flex items-center gap-1.5 bg-black/70 border border-yellow-400/60 px-2.5 py-1 rounded-lg">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <div className="text-[11px] font-['Chakra_Petch'] font-bold text-yellow-300">
                {minAcceptancePrice !== null && minAcceptancePrice !== undefined ? (
                  <span>Min. Requerido: <strong className="text-white text-xs">{minAcceptancePrice}</strong> mon.</span>
                ) : (
                  <span>Aceptación: <strong>0-{character.acceptance ?? 1}</strong></span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contenedor de Imagen */}
        <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border-2 border-black/80 bg-black/50 mb-3 shadow-inner">
          <img 
            src={character.imageUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500"} 
            alt={character.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500";
            }}
          />
          {/* Sombra inferior en la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Nombre en la imagen */}
          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="font-['Press_Start_2P'] text-sm sm:text-base text-white drop-shadow-[2px_2px_0_#000] truncate">
              {character.name}
            </h3>
          </div>
        </div>

        {/* Descripción corta */}
        {character.description && (
          <p className="text-xs font-['Chakra_Petch'] text-slate-300 line-clamp-2 italic px-1">
            "{character.description}"
          </p>
        )}
      </div>
    );
  }

  // Si es tamaño slot (Ranuras de inventario de Jugador 1 o 2)
  if (size === "slot") {
    return (
      <div 
        onClick={onClick}
        className={`relative rounded-xl border-2 ${config.cardBorder} ${config.cardBg} p-2 flex items-center gap-3 overflow-hidden shadow-[2px_2px_0_#000] ${onClick ? 'cursor-pointer hover:brightness-110' : ''}`}
      >
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-black/80 flex-shrink-0 bg-black">
          <img 
            src={character.imageUrl} 
            alt={character.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-['Press_Start_2P'] uppercase ${config.badgeClass}`}>
              {config.label}
            </span>
            <span className="font-['Press_Start_2P'] text-[10px] text-white truncate drop-shadow-[1px_1px_0_#000]">
              {character.name}
            </span>
          </div>
          <div className="text-[10px] font-['Chakra_Petch'] text-slate-400 flex items-center gap-1">
            <Coins className="w-3 h-3 text-yellow-400" />
            <span>Comprado por: <strong className="text-yellow-300">{character.winningBid || character.acceptance || 1}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Mini / Table View (para tabla de Admin)
  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${config.cardBorder} ${config.cardBg}`}>
      <img 
        src={character.imageUrl} 
        alt={character.name} 
        className="w-8 h-8 rounded object-cover border border-black"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500";
        }}
      />
      <span className={`px-1.5 py-0.5 rounded text-[9px] font-['Press_Start_2P'] ${config.badgeClass}`}>
        {config.label}
      </span>
      <span className="text-xs font-['Chakra_Petch'] font-bold text-white truncate max-w-[120px]">
        {character.name}
      </span>
    </div>
  );
}
