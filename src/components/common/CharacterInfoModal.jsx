import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  Crown,
  Zap,
  Heart,
  Wind,
  Sun,
  Moon,
  HelpCircle,
  Flame,
  Coins,
  Scroll,
  Shield,
  User,
  Trophy,
  Info,
} from "lucide-react";
import { RARITY_CONFIG } from "../auction/CharacterCard";

// ============================================================================
// CONFIGURACIÓN DE ATRIBUTOS
// ============================================================================
const ATTRIBUTE_CONFIG = {
  Fuerza: { icon: Flame, color: "text-red-400", bg: "from-red-500/30 to-red-700/10", border: "border-red-500/60" },
  Vida: { icon: Heart, color: "text-emerald-400", bg: "from-emerald-500/30 to-emerald-700/10", border: "border-emerald-500/60" },
  Velocidad: { icon: Wind, color: "text-blue-400", bg: "from-blue-500/30 to-blue-700/10", border: "border-blue-500/60" },
  Luz: { icon: Sun, color: "text-yellow-300", bg: "from-yellow-500/30 to-yellow-700/10", border: "border-yellow-400/60" },
  Oscuridad: { icon: Moon, color: "text-purple-400", bg: "from-purple-500/30 to-purple-700/10", border: "border-purple-500/60" },
  LuzOscura: { icon: Sparkles, color: "text-violet-300", bg: "from-violet-500/30 to-violet-700/10", border: "border-violet-400/60" },
  Desconocido: { icon: HelpCircle, color: "text-slate-400", bg: "from-slate-500/30 to-slate-700/10", border: "border-slate-500/60" },
};

// ============================================================================
// HELPER: Obtener URL de imagen
// ============================================================================
function getImageUrl(character) {
  if (!character) return "";
  return character.image_url || character.imageUrl || "";
}

// ============================================================================
// COMPONENTE
// ============================================================================
export default function CharacterInfoModal({ isOpen, onClose, character }) {
  const closeButtonRef = useRef(null);

  // ESC + focus + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    closeButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Datos del personaje
  const rarity = character?.rarity || "R";
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.R;
  const isHighRarity = rarity === "UR" || rarity === "LR";
  const imageSrc = getImageUrl(character);
  const races = Array.isArray(character?.races) ? character.races : [];
  const traits = Array.isArray(character?.traits) ? character.traits : [];
  const attribute = character?.attribute || "Desconocido";
  const attributeConfig = ATTRIBUTE_CONFIG[attribute] || ATTRIBUTE_CONFIG.Desconocido;
  const AttributeIcon = attributeConfig.icon;
  const hasWon = !!(character?.wonBy || character?.won_by || character?.winningBid || character?.winning_bid);
  const winnerName = character?.wonBy || character?.won_by || null;
  const winningBid = character?.winningBid || character?.winning_bid || 0;

  return (
    <AnimatePresence>
      {isOpen && character && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-modal-title"
            className={`relative bg-gradient-to-br from-[#151928] to-[#0f1524] border-4 ${config.cardBorder} rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-[8px_8px_0_#000] text-white`}
          >
            {/* Fondo animado por rareza */}
            {config.animatedBg && (
              <div
                className="absolute inset-0 opacity-30 animate-gradient"
                style={{ backgroundImage: config.animatedBg }}
                aria-hidden="true"
              />
            )}

            {/* Glow decorativo */}
            <div
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
              style={{ background: config.glowColor }}
              aria-hidden="true"
            />

            {/* Partículas para alta rareza */}
            {isHighRarity && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      left: `${10 + ((i * 43) % 80)}%`,
                      top: `${15 + ((i * 67) % 70)}%`,
                      background: config.particleColor,
                      boxShadow: `0 0 8px ${config.particleColor}`,
                    }}
                    animate={{
                      y: [-8, 8, -8],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 3 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </div>
            )}

            {/* ─── Cabecera ─────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between p-4 sm:p-5 pb-3 border-b-2 border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`p-2.5 bg-gradient-to-br ${config.badgeClass} rounded-xl border-2 border-black shadow-[3px_3px_0_#000]`}
                  aria-hidden="true"
                >
                  <Crown className="w-6 h-6" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <span className="font-['Press_Start_2P'] text-[10px] text-slate-400 uppercase tracking-wider">
                    Ficha del Personaje
                  </span>
                  <h2
                    id="info-modal-title"
                    className="font-['Press_Start_2P'] text-sm sm:text-base text-white drop-shadow-[2px_2px_0_#000] mt-0.5"
                  >
                    {character.name || "Sin nombre"}
                  </h2>
                </div>
              </div>

              <motion.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Cerrar ficha"
                className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              </motion.button>
            </div>

            {/* ─── Contenido ────────────────────────────────────────── */}
            <div className="relative overflow-y-auto max-h-[calc(92vh-140px)] p-4 sm:p-5 space-y-4">
              {/* ─── Hero: Imagen + Nombre ──────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Imagen */}
                <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-black/80 bg-black/50 shadow-inner">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={character.name || "Personaje"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                      <span className="font-['Press_Start_2P'] text-6xl text-white/80">
                        {(character.name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Overlay degradado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Info lateral */}
                <div className="space-y-3 flex flex-col justify-between">
                  {/* Rareza */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-lg border-2 text-sm font-['Press_Start_2P'] uppercase ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                      {isHighRarity && (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles className="w-5 h-5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
                        </motion.div>
                      )}
                    </div>
                    <div className="text-xs font-['Chakra_Petch'] font-semibold text-slate-300 uppercase tracking-wider">
                      {config.fullName}
                    </div>
                  </div>

                  {/* Aceptación */}
                  <div className="p-3 rounded-xl bg-black/60 border-2 border-yellow-400/60 flex items-center gap-3">
                    <div className="p-2 bg-yellow-400/20 rounded-lg border border-yellow-400 flex-shrink-0">
                      <Coins className="w-5 h-5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-[10px] font-['Press_Start_2P'] text-yellow-400 uppercase">
                        Aceptación
                      </div>
                      <div className="text-lg font-['Press_Start_2P'] text-yellow-300">
                        0 - {character.acceptance ?? 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Descripción ────────────────────────────────── */}
              {character.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-black/40 border-2 border-slate-700/60"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Scroll className="w-4 h-4 text-slate-400" strokeWidth={2.5} aria-hidden="true" />
                    <span className="font-['Press_Start_2P'] text-[10px] text-slate-400 uppercase">
                      Lore
                    </span>
                  </div>
                  <p className="text-sm font-['Chakra_Petch'] text-slate-200 italic leading-relaxed">
                    "{character.description}"
                  </p>
                </motion.div>
              )}

              {/* ─── Atributos (atributo + razas + traits) ─────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 to-fuchsia-950/20 border-2 border-purple-500/40 space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-purple-500/30">
                  <Shield className="w-4 h-4 text-purple-400" strokeWidth={2.5} aria-hidden="true" />
                  <span className="font-['Press_Start_2P'] text-[10px] text-purple-300 uppercase">
                    Atributos del Personaje
                  </span>
                </div>

                {/* Atributo */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border-2 bg-gradient-to-br ${attributeConfig.bg} ${attributeConfig.border} flex-shrink-0`}
                  >
                    <AttributeIcon className={`w-5 h-5 ${attributeConfig.color}`} strokeWidth={2.5} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase">
                      Atributo
                    </div>
                    <div className={`font-['Press_Start_2P'] text-sm ${attributeConfig.color} truncate`}>
                      {attribute}
                    </div>
                  </div>
                </div>

                {/* Razas */}
                {races.length > 0 && (
                  <div>
                    <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase mb-1.5">
                      Razas
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {races.map((race) => (
                        <span
                          key={race}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-['Chakra_Petch'] font-bold border-2 border-cyan-500/60 bg-cyan-500/20 text-cyan-300"
                        >
                          {race}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Características */}
                {traits.length > 0 && (
                  <div>
                    <div className="text-[10px] font-['Press_Start_2P'] text-slate-400 uppercase mb-1.5">
                      Características
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {traits.map((trait) => (
                        <span
                          key={trait}
                          className="px-2 py-1 rounded-lg text-[10px] font-['Chakra_Petch'] font-bold border border-fuchsia-500/60 bg-fuchsia-500/20 text-fuchsia-300"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ─── Inventario (si fue ganado) ─────────────────── */}
              {hasWon && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-teal-950/30 border-2 border-emerald-500/50"
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-emerald-500/30">
                    <Trophy className="w-4 h-4 text-emerald-400" strokeWidth={2.5} aria-hidden="true" />
                    <span className="font-['Press_Start_2P'] text-[10px] text-emerald-300 uppercase">
                      Ganado en subasta
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {winnerName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-400" strokeWidth={2.5} aria-hidden="true" />
                        <span className="font-['Chakra_Petch'] text-sm text-slate-300">
                          Por <strong className="text-emerald-300">{winnerName}</strong>
                        </span>
                      </div>
                    )}
                    {winningBid > 0 && (
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
                        <span className="font-['Chakra_Petch'] text-sm text-slate-300">
                          Por <strong className="text-yellow-300">{winningBid} monedas</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ─── Footer ───────────────────────────────────────────── */}
            <div className="relative p-4 sm:p-5 border-t-2 border-white/10 bg-black/30">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-['Press_Start_2P'] text-xs rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-yellow-200"
              >
                CERRAR
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}