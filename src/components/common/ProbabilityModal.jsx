import React, { useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  TrendingUp,
  Sparkles,
  Crown,
  Zap,
  Award,
  Percent,
  Info,
} from "lucide-react";

// ============================================================================
// CONSTANTES DE PROBABILIDAD
// ============================================================================
const BASE_WEIGHTS = {
  rarity: { R: 32, SR: 30, SSR: 20, UR: 12, LR: 6 },
  value: { 1: 25, 2: 25, 3: 20, 4: 15, 5: 8, 6: 5, 7: 2 },
};

const RARITY_COLORS = {
  R: { text: "text-slate-300", bg: "from-slate-600 to-slate-700", bar: "bg-slate-400" },
  SR: { text: "text-amber-300", bg: "from-amber-400 to-yellow-500", bar: "bg-amber-400" },
  SSR: { text: "text-cyan-300", bg: "from-cyan-400 to-blue-500", bar: "bg-cyan-400" },
  UR: { text: "text-fuchsia-300", bg: "from-fuchsia-500 to-purple-600", bar: "bg-fuchsia-500" },
  LR: { text: "text-white", bg: "from-slate-100 to-white", bar: "bg-white" },
};

// ============================================================================
// MODAL
// ============================================================================
export default function ProbabilityModal({
  isOpen,
  onClose,
  game,
  settings,
}) {
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

  // ==========================================================================
  // CÁLCULOS
  // ==========================================================================
  const pityCounter = game?.pity_counter ?? 0;
  const lastPityIncrement = game?.last_pity_increment ?? 0;
  const maxPity = settings?.pityThreshold ?? 100;

  // Multiplicador según pity
  const rarityMultiplier = useMemo(() => {
    if (pityCounter >= 100) return 1000;
    if (pityCounter >= 90) return 4;
    if (pityCounter >= 60) return 2.5;
    if (pityCounter >= 30) return 1.5;
    return 1;
  }, [pityCounter]);

  // Probabilidades ajustadas por pity
  const rarityProbabilities = useMemo(() => {
    const adjusted = {};
    let total = 0;

    for (const [rarity, weight] of Object.entries(BASE_WEIGHTS.rarity)) {
      const isHigh = rarity === "UR" || rarity === "LR";
      const adjustedWeight = isHigh ? weight * rarityMultiplier : weight;
      adjusted[rarity] = adjustedWeight;
      total += adjustedWeight;
    }

    const normalized = {};
    for (const [rarity, weight] of Object.entries(adjusted)) {
      normalized[rarity] = (weight / total) * 100;
    }
    return normalized;
  }, [rarityMultiplier]);

  // Probabilidades de valor
  const valueProbabilities = useMemo(() => {
    const adjusted = {};
    let total = 0;

    for (const [value, weight] of Object.entries(BASE_WEIGHTS.value)) {
      const isHigh = parseInt(value) >= 5;
      const adjustedWeight = isHigh ? weight * rarityMultiplier : weight;
      adjusted[value] = adjustedWeight;
      total += adjustedWeight;
    }

    const normalized = {};
    for (const [value, weight] of Object.entries(adjusted)) {
      normalized[value] = (weight / total) * 100;
    }
    return normalized;
  }, [rarityMultiplier]);

  // Probabilidad de UR+ (combinada)
  const urPlusProb = rarityProbabilities.UR + rarityProbabilities.LR;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <AnimatePresence>
      {isOpen && (
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
            aria-labelledby="probability-modal-title"
            className="relative bg-gradient-to-b from-[#151928] to-[#0f1524] border-4 border-yellow-400 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-[8px_8px_0_#eab308] text-white"
          >
            {/* Glow decorativos */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

            {/* ─── Cabecera ─────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between border-b-2 border-yellow-400/40 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg border-2 border-black shadow-[2px_2px_0_#000]"
                  aria-hidden="true"
                >
                  <Percent className="w-5 h-5 text-black" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h2
                    id="probability-modal-title"
                    className="font-['Press_Start_2P'] text-xs sm:text-sm text-cyan-400 tracking-wider drop-shadow-[1px_1px_0_#000]"
                  >
                    PROBABILIDADES
                  </h2>
                  <p className="text-[11px] font-['Chakra_Petch'] text-slate-400">
                    Estado actual del sistema de gacha
                  </p>
                </div>
              </div>
              <motion.button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              </motion.button>
            </div>

            {/* ─── Contenido ────────────────────────────────────────── */}
            <div className="relative overflow-y-auto max-h-[calc(90vh-140px)] p-4 sm:p-5 space-y-5">
              {/* ─── Pity Counter ─────────────────────────────────── */}
              <PityCounter
                value={pityCounter}
                max={maxPity}
                lastIncrement={lastPityIncrement}
                multiplier={rarityMultiplier}
              />

              {/* ─── Probabilidad UR+ ─────────────────────────────── */}
              <UrPlusCard probability={urPlusProb} />

              {/* ─── Grid de Rarezas ──────────────────────────────── */}
              <Section
                icon={Crown}
                title="Probabilidad por Rareza"
                subtitle="Ajustada según el pity actual"
                color="fuchsia"
              >
                <div className="space-y-2">
                  {Object.entries(rarityProbabilities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([rarity, prob]) => (
                      <ProbabilityBar
                        key={rarity}
                        label={rarity}
                        probability={prob}
                        colors={RARITY_COLORS[rarity]}
                        highlight={rarity === "UR" || rarity === "LR"}
                      />
                    ))}
                </div>
              </Section>

              {/* ─── Grid de Valores ──────────────────────────────── */}
              <Section
                icon={Award}
                title="Probabilidad por Aceptación"
                subtitle="Valor del personaje (0-7)"
                color="cyan"
              >
                <div className="space-y-2">
                  {Object.entries(valueProbabilities)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([value, prob]) => (
                      <ProbabilityBar
                        key={value}
                        label={`Acept. ${value}`}
                        probability={prob}
                        colors={{
                          text: parseInt(value) >= 5 ? "text-amber-300" : "text-slate-300",
                          bar: parseInt(value) >= 5 ? "bg-amber-400" : "bg-slate-400",
                        }}
                        highlight={parseInt(value) >= 5}
                      />
                    ))}
                </div>
              </Section>

              {/* ─── Info adicional ───────────────────────────────── */}
              <div className="p-3 bg-blue-950/40 border-2 border-blue-500/40 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                  <p className="text-[11px] font-['Chakra_Petch'] text-blue-200 leading-relaxed">
                    El <strong>pity</strong> aumenta un 1-5% con cada subasta sin UR/LR o valor ≥5. Se resetea cuando sale uno de estos. Al llegar al 100%, se garantiza uno.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Footer ───────────────────────────────────────────── */}
            <div className="relative p-4 sm:p-5 border-t-2 border-yellow-400/40 bg-black/30">
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

// ============================================================================
// SUB-COMPONENTE: PityCounter
// ============================================================================
function PityCounter({ value, max, lastIncrement, multiplier }) {
  const percent = Math.min(100, (value / max) * 100);
  const isUrgent = percent >= 90;
  const isWarning = percent >= 60 && !isUrgent;

  const colorBar = isUrgent
    ? "from-rose-500 via-red-500 to-orange-500"
    : isWarning
    ? "from-amber-400 to-orange-500"
    : "from-cyan-400 to-blue-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border-2 p-4 overflow-hidden ${
        isUrgent
          ? "border-rose-500/60 bg-rose-950/20"
          : isWarning
          ? "border-amber-500/60 bg-amber-950/20"
          : "border-cyan-500/40 bg-cyan-950/20"
      }`}
    >
      {/* Glow pulsante cuando urgente */}
      {isUrgent && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ boxShadow: ["0 0 0 0 rgba(244,63,94,0.5)", "0 0 0 12px rgba(244,63,94,0)"] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-hidden="true"
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isUrgent ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <TrendingUp
                className={`w-5 h-5 ${isUrgent ? "text-rose-400" : isWarning ? "text-amber-400" : "text-cyan-400"}`}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </motion.div>
            <span className="font-['Press_Start_2P'] text-[10px] uppercase text-slate-200">
              Contador de Pity
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lastIncrement > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-[9px] font-['Press_Start_2P'] flex items-center gap-1"
              >
                <Zap className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                +{lastIncrement}%
              </motion.span>
            )}
            <span
              className={`font-['Press_Start_2P'] text-lg ${
                isUrgent ? "text-rose-400" : isWarning ? "text-amber-400" : "text-cyan-400"
              } drop-shadow-[1px_1px_0_#000]`}
            >
              {value}%
            </span>
          </div>
        </div>

        {/* Barra */}
        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
          <motion.div
            className={`h-full bg-gradient-to-r ${colorBar}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, type: "spring" }}
          />
        </div>

        {/* Multiplicador actual */}
        <div className="flex items-center justify-between mt-2 text-[10px] font-['Chakra_Petch']">
          <span className="text-slate-400">
            Pity: <strong className="text-white">{value}%</strong> / {max}%
          </span>
          {multiplier > 1 && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
              Boost UR/LR: ×{multiplier}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENTE: UrPlusCard
// ============================================================================
function UrPlusCard({ probability }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative rounded-xl border-2 border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-950/40 to-purple-950/40 p-4 overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-fuchsia-500/30 rounded-full blur-2xl" aria-hidden="true" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="p-2.5 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-lg border-2 border-black shadow-[2px_2px_0_#000]"
            aria-hidden="true"
          >
            <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div className="font-['Press_Start_2P'] text-[10px] text-fuchsia-300 uppercase">
              Prob. UR / LR
            </div>
            <div className="text-[10px] text-slate-400 font-['Chakra_Petch']">
              Chance combinada de alta rareza
            </div>
          </div>
        </div>
        <motion.div
          key={probability}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-['Press_Start_2P'] text-2xl sm:text-3xl text-white drop-shadow-[2px_2px_0_#000] text-glow-white"
        >
          {probability.toFixed(1)}%
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENTE: Section
// ============================================================================
function Section({ icon: Icon, title, subtitle, color, children }) {
  const palettes = {
    fuchsia: { border: "border-fuchsia-500/40", icon: "text-fuchsia-400", title: "text-fuchsia-300" },
    cyan: { border: "border-cyan-500/40", icon: "text-cyan-400", title: "text-cyan-300" },
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 ${palettes.border} bg-black/30 p-4`}
    >
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${palettes.border}`}>
        <Icon className={`w-4 h-4 ${palettes.icon}`} strokeWidth={2.5} aria-hidden="true" />
        <div>
          <div className={`font-['Press_Start_2P'] text-[10px] ${palettes.title} uppercase`}>
            {title}
          </div>
          {subtitle && (
            <div className="text-[10px] text-slate-500 font-['Chakra_Petch']">{subtitle}</div>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ============================================================================
// SUB-COMPONENTE: ProbabilityBar
// ============================================================================
function ProbabilityBar({ label, probability, colors, highlight }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] font-['Chakra_Petch']">
        <div className="flex items-center gap-2">
          <span className={`font-['Press_Start_2P'] text-[10px] ${colors.text}`}>
            {label}
          </span>
          {highlight && (
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" strokeWidth={3} aria-hidden="true" />
          )}
        </div>
        <span className={`font-['Press_Start_2P'] text-[10px] ${colors.text}`}>
          {probability.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <motion.div
          className={`h-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${probability}%` }}
          transition={{ duration: 0.5, type: "spring" }}
        />
      </div>
    </div>
  );
}