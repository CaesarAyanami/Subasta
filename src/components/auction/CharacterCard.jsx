import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Coins,
  Zap,
  Sun,
  Moon,
  Flame,
  Heart,
  Wind,
  HelpCircle,
  Info,
} from "lucide-react";

// ============================================================================
// CONFIGURACIÓN DE RAREZAS
// ============================================================================
export const RARITY_CONFIG = {
  R: {
    label: "R",
    fullName: "Rare",
    badgeClass:
      "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.3)]",
    cardBorder: "border-slate-500 shadow-[4px_4px_0_#334155]",
    cardGlow: "shadow-[0_0_15px_rgba(100,116,139,0.4)]",
    cardBg: "bg-gradient-to-b from-slate-900 via-slate-900 to-[#0c0e17]",
    animatedBg: null,
    textColor: "text-slate-300",
    particleColor: "text-slate-400",
    placeholderFrom: "from-slate-700",
    placeholderTo: "to-slate-900",
    hasParticles: false,
    hasShimmer: false,
  },
  SR: {
    label: "SR",
    fullName: "Super Rare",
    badgeClass:
      "bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-yellow-300 font-extrabold shadow-[0_0_15px_rgba(251,191,36,0.6)]",
    cardBorder: "border-amber-400 shadow-[4px_4px_0_#78350f]",
    cardGlow: "shadow-[0_0_25px_rgba(251,191,36,0.5)]",
    cardBg: "bg-gradient-to-b from-amber-950/70 via-[#1c1305] to-[#0c0e17]",
    animatedBg: null,
    textColor: "text-amber-300",
    particleColor: "text-yellow-400",
    placeholderFrom: "from-amber-600",
    placeholderTo: "to-amber-950",
    hasParticles: false,
    hasShimmer: true,
  },
  SSR: {
    label: "SSR",
    fullName: "Super Super Rare",
    badgeClass:
      "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white border-cyan-300 font-extrabold shadow-[0_0_20px_rgba(34,211,238,0.7)]",
    cardBorder: "border-cyan-400 shadow-[4px_4px_0_#0e7490]",
    cardGlow:
      "shadow-[0_0_30px_rgba(34,211,238,0.6),0_0_15px_rgba(168,85,247,0.4)]",
    cardBg: "bg-gradient-to-br from-[#0b2447] via-[#191938] to-[#120a2a]",
    animatedBg:
      "linear-gradient(135deg, #0b2447 0%, #3b82f6 25%, #22d3ee 50%, #3b82f6 75%, #0b2447 100%)",
    textColor: "text-cyan-300",
    particleColor: "text-cyan-300",
    placeholderFrom: "from-cyan-600",
    placeholderTo: "to-indigo-900",
    hasParticles: false,
    hasShimmer: true,
  },
  UR: {
    label: "UR",
    fullName: "Ultra Rare",
    badgeClass:
      "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-pink-500 text-white border-fuchsia-300 font-black shadow-[0_0_25px_rgba(217,70,239,0.9)]",
    cardBorder: "border-fuchsia-500 shadow-[4px_4px_0_#581c87]",
    cardGlow:
      "shadow-[0_0_35px_rgba(217,70,239,0.7),0_0_50px_rgba(147,51,234,0.4)]",
    cardBg: "bg-gradient-to-br from-[#2c0b4d] via-[#3b0764] to-[#100320]",
    animatedBg:
      "linear-gradient(135deg, #2c0b4d 0%, #7c3aed 25%, #d946ef 50%, #7c3aed 75%, #2c0b4d 100%)",
    textColor: "text-fuchsia-300",
    particleColor: "text-fuchsia-400",
    placeholderFrom: "from-fuchsia-700",
    placeholderTo: "to-purple-950",
    hasParticles: true,
    hasShimmer: true,
  },
  LR: {
    label: "LR",
    fullName: "Legendary Rare",
    badgeClass:
      "bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-900 border-white font-black shadow-[0_0_25px_#ffffff] tracking-wider",
    cardBorder:
      "border-white shadow-[0_0_35px_rgba(255,255,255,0.8),0_0_60px_rgba(236,72,153,0.3)]",
    cardGlow: "shadow-[0_0_45px_rgba(255,255,255,0.7)]",
    cardBg: "bg-gradient-to-br from-slate-800 via-slate-900 to-[#121420]",
    animatedBg:
      "linear-gradient(135deg, #1e293b 0%, #64748b 25%, #ffffff 50%, #64748b 75%, #1e293b 100%)",
    textColor: "text-slate-100",
    particleColor: "text-white",
    placeholderFrom: "from-slate-500",
    placeholderTo: "to-slate-900",
    hasParticles: true,
    hasShimmer: true,
  },
};

// ============================================================================
// CONFIGURACIÓN DE ATRIBUTOS
// ============================================================================
const ATTRIBUTE_CONFIG = {
  Fuerza: { icon: Flame, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/60" },
  Vida: { icon: Heart, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/60" },
  Velocidad: { icon: Wind, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/60" },
  Luz: { icon: Sun, color: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-400/60" },
  Oscuridad: { icon: Moon, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/60" },
  LuzOscura: { icon: Sparkles, color: "text-violet-300", bg: "bg-violet-500/20", border: "border-violet-400/60" },
  Desconocido: { icon: HelpCircle, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/60" },
};

// ============================================================================
// HELPERS
// ============================================================================
function getImageUrl(character) {
  if (!character) return "";
  return character.image_url || character.imageUrl || "";
}

// ============================================================================
// SUB: ImageWithFallback
// ============================================================================
function ImageWithFallback({
  src,
  alt,
  rarity = "R",
  name = "?",
  containerClassName = "",
  imgClassName = "",
}) {
  const [errored, setErrored] = useState(false);
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.R;

  if (errored || !src) {
    const initial = (name || "?").trim().charAt(0).toUpperCase();
    return (
      <div
        role="img"
        aria-label={alt || "Sin imagen"}
        className={`flex items-center justify-center bg-gradient-to-br ${config.placeholderFrom} ${config.placeholderTo} ${containerClassName}`}
      >
        <span className="font-['Press_Start_2P'] text-2xl sm:text-4xl text-white/90 drop-shadow-[2px_2px_0_#000] select-none">
          {initial}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${containerClassName} ${imgClassName}`}
      onError={() => setErrored(true)}
    />
  );
}

// ============================================================================
// SUB: Particles
// ============================================================================
function Particles({ rarity }) {
  const isLR = rarity === "LR";
  const color = isLR ? "#ffffff" : "#d946ef";
  const color2 = isLR ? "#fbbf24" : "#a855f7";

  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${15 + ((i * 37) % 70)}%`,
    top: `${10 + ((i * 53) % 80)}%`,
    delay: (i * 0.4) % 3,
    duration: 3 + (i % 3),
    size: 4 + (i % 3) * 2,
    color: i % 2 === 0 ? color : color2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// SUB: Shimmer
// ============================================================================
function Shimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
      />
    </div>
  );
}

// ============================================================================
// SUB: AttributeBadge
// ============================================================================
function AttributeBadge({ attribute }) {
  const config = ATTRIBUTE_CONFIG[attribute] || ATTRIBUTE_CONFIG.Desconocido;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${config.border} ${config.bg} ${config.color} text-[9px] font-['Chakra_Petch'] font-bold`}
      title={`Atributo: ${attribute}`}
    >
      <Icon className="w-2.5 h-2.5" strokeWidth={2.5} aria-hidden="true" />
      {attribute}
    </span>
  );
}

// ============================================================================
// SUB: RaceBadge
// ============================================================================
function RaceBadge({ race }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-cyan-500/60 bg-cyan-500/20 text-cyan-300 text-[9px] font-['Chakra_Petch'] font-bold"
      title={`Raza: ${race}`}
    >
      {race}
    </span>
  );
}

// ============================================================================
// SUB: InfoButton (NUEVO)
// ============================================================================
function InfoButton({ onClick, variant = "corner" }) {
  // variant: "corner" (arriba-derecha) | "inline" (junto al nombre)
  const isCorner = variant === "corner";

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      whileHover={{ scale: 1.15, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Ver información del personaje"
      title="Ver información"
      className={`${
        isCorner
          ? "absolute top-2 right-2 z-30"
          : "relative ml-auto"
      } p-1.5 rounded-lg bg-black/70 hover:bg-cyan-500/40 text-cyan-300 hover:text-cyan-200 border-2 border-cyan-500/60 hover:border-cyan-400 backdrop-blur-sm transition shadow-[2px_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-cyan-400`}
    >
      <Info className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
    </motion.button>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function CharacterCard({
  character,
  size = "large",
  minAcceptancePrice = null,
  showMinPriceBadge = true,
  onClick = null,
  onInfo = null, // ← NUEVO: callback para abrir el modal de info
}) {
  if (!character) {
    return (
      <div
        className="w-full h-64 border-4 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-600 bg-black/30"
        aria-label="Sin personaje asignado"
      >
        <Sparkles className="w-10 h-10 mb-2 animate-pulse text-slate-700" aria-hidden="true" />
        <span className="font-['Press_Start_2P'] text-xs uppercase">Sin personaje</span>
      </div>
    );
  }

  const rarity = character.rarity || "R";
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.R;
  const isHighRarity = rarity === "UR" || rarity === "LR";
  const imageSrc = getImageUrl(character);

  const races = Array.isArray(character.races) ? character.races : [];
  const hasAttribute = character.attribute && character.attribute !== "Desconocido";

  // ==========================================================================
  // TAMAÑO: LARGE
  // ==========================================================================
  if (size === "large") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative group rounded-2xl border-4 ${config.cardBorder} ${config.cardGlow} p-4 text-white overflow-hidden ${config.cardBg}`}
        aria-label={`${character.name || "Personaje"}, rareza ${rarity}`}
      >
        {/* Fondo animado (UR/LR/SSR) */}
        {config.animatedBg && (
          <div className="absolute inset-0 opacity-40 animate-gradient" style={{ backgroundImage: config.animatedBg }} aria-hidden="true" />
        )}

        {/* Partículas (UR/LR) */}
        {config.hasParticles && <Particles rarity={rarity} />}

        {/* Shimmer (SR+) */}
        {config.hasShimmer && <Shimmer />}

        {/* Botón de Info (arriba-derecha) */}
        {onInfo && <InfoButton onClick={() => onInfo(character)} variant="corner" />}

        {/* Contenido */}
        <div className="relative z-20">
          {/* Badges superiores */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <motion.span
                className={`px-3 py-1 rounded-lg border-2 text-xs font-['Press_Start_2P'] uppercase ${config.badgeClass}`}
                animate={isHighRarity ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {config.label}
              </motion.span>
              <span className="text-xs font-['Chakra_Petch'] font-semibold text-slate-300 uppercase tracking-wider hidden sm:inline">
                {config.fullName}
              </span>
            </div>

            {showMinPriceBadge && (
              <div className="flex items-center gap-1.5 bg-black/70 border border-yellow-400/60 px-2.5 py-1 rounded-lg">
                <Coins className="w-3.5 h-3.5 text-yellow-400" aria-hidden="true" />
                <div className="text-[11px] font-['Chakra_Petch'] font-bold text-yellow-300">
                  {minAcceptancePrice !== null && minAcceptancePrice !== undefined ? (
                    <span>
                      Min. Requerido: <strong className="text-white text-xs">{minAcceptancePrice}</strong> mon.
                    </span>
                  ) : (
                    <span>
                      Aceptación: <strong>0-{character.acceptance ?? 1}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Imagen */}
          <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border-2 border-black/80 bg-black/50 mb-3 shadow-inner">
            <ImageWithFallback
              src={imageSrc}
              alt={character.name || "Personaje"}
              rarity={rarity}
              name={character.name}
              containerClassName="w-full h-full"
              imgClassName="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" aria-hidden="true" />

            <div className="absolute bottom-2 left-3 right-3">
              <h3 className="font-['Press_Start_2P'] text-sm sm:text-base text-white drop-shadow-[2px_2px_0_#000] truncate">
                {character.name}
              </h3>
            </div>
          </div>

          {/* Badges de atributo + razas */}
          {(hasAttribute || races.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {hasAttribute && <AttributeBadge attribute={character.attribute} />}
              {races.slice(0, 3).map((r) => (
                <RaceBadge key={r} race={r} />
              ))}
              {races.length > 3 && (
                <span className="text-[9px] text-slate-500 font-['Chakra_Petch']">+{races.length - 3}</span>
              )}
            </div>
          )}

          {/* Descripción */}
          {character.description && (
            <p className="text-xs font-['Chakra_Petch'] text-slate-300 line-clamp-2 italic px-1">
              "{character.description}"
            </p>
          )}
        </div>

        {/* Corner ornament (UR/LR) */}
        {isHighRarity && (
          <>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/60 rounded-tl-2xl pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/60 rounded-br-2xl pointer-events-none" aria-hidden="true" />
          </>
        )}
      </motion.div>
    );
  }

  // ==========================================================================
  // TAMAÑO: SLOT
  // ==========================================================================
  if (size === "slot") {
    const isClickable = !!onClick;
    return (
      <motion.div
        onClick={onClick}
        whileHover={isClickable ? { scale: 1.02 } : {}}
        whileTap={isClickable ? { scale: 0.98 } : {}}
        className={`relative rounded-xl border-2 ${config.cardBorder} ${config.cardBg} p-2 flex items-center gap-3 overflow-hidden shadow-[2px_2px_0_#000] ${
          isClickable ? "cursor-pointer" : ""
        }`}
        aria-label={`${character.name || "Personaje"}, ${rarity}${
          character.winningBid || character.winning_bid
            ? `, comprado por ${character.winningBid || character.winning_bid} monedas`
            : ""
        }`}
      >
        {/* Fondo animado sutil */}
        {config.animatedBg && (
          <div className="absolute inset-0 opacity-30 animate-gradient-fast" style={{ backgroundImage: config.animatedBg }} aria-hidden="true" />
        )}

        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-black/80 flex-shrink-0 bg-black">
          <ImageWithFallback
            src={imageSrc}
            alt={character.name || "Personaje"}
            rarity={rarity}
            name={character.name}
            containerClassName="w-full h-full"
            imgClassName="w-full h-full object-cover"
          />
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-['Press_Start_2P'] uppercase ${config.badgeClass}`}>
              {config.label}
            </span>
            <span className="font-['Press_Start_2P'] text-[10px] text-white truncate drop-shadow-[1px_1px_0_#000]">
              {character.name}
            </span>
          </div>
          <div className="text-[10px] font-['Chakra_Petch'] text-slate-400 flex items-center gap-1">
            <Coins className="w-3 h-3 text-yellow-400" aria-hidden="true" />
            <span>
              Comprado por:{" "}
              <strong className="text-yellow-300">
                {character.winningBid || character.winning_bid || character.acceptance || 1}
              </strong>
            </span>
          </div>
        </div>

        {/* Botón Info en modo slot (opcional) */}
        {onInfo && (
          <div className="relative flex-shrink-0">
            <InfoButton onClick={() => onInfo(character)} variant="inline" />
          </div>
        )}
      </motion.div>
    );
  }

  // ==========================================================================
  // TAMAÑO: MINI
  // ==========================================================================
  return (
    <div
      className={`flex items-center gap-2 p-1.5 rounded-lg border ${config.cardBorder} ${config.cardBg}`}
      aria-label={`${character.name || "Personaje"}, ${rarity}`}
    >
      <div className="w-8 h-8 rounded overflow-hidden border border-black flex-shrink-0">
        <ImageWithFallback
          src={imageSrc}
          alt={character.name || "Personaje"}
          rarity={rarity}
          name={character.name}
          containerClassName="w-full h-full"
          imgClassName="w-full h-full object-cover"
        />
      </div>
      <span className={`px-1.5 py-0.5 rounded text-[9px] font-['Press_Start_2P'] ${config.badgeClass}`}>
        {config.label}
      </span>
      <span className="text-xs font-['Chakra_Petch'] font-bold text-white truncate max-w-[120px]">
        {character.name}
      </span>
    </div>
  );
}