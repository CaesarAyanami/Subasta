import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Trophy,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

// ============================================================================
// TOAST TYPE CONFIG
// ============================================================================
const TOAST_CONFIG = {
  trophy: {
    icon: Trophy,
    bgGradient: "from-yellow-500/20 to-amber-500/10",
    borderColor: "border-yellow-400",
    shadowColor: "shadow-[6px_6px_0_#eab308]",
    iconColor: "text-yellow-400",
    textColor: "text-yellow-400",
    glowColor: "rgba(234,179,8,0.4)",
    urgent: false,
  },
  sparkles: {
    icon: Sparkles,
    bgGradient: "from-cyan-500/20 to-blue-500/10",
    borderColor: "border-cyan-400",
    shadowColor: "shadow-[6px_6px_0_#0891b2]",
    iconColor: "text-cyan-400",
    textColor: "text-cyan-400",
    glowColor: "rgba(34,211,238,0.4)",
    urgent: false,
  },
  warning: {
    icon: AlertTriangle,
    bgGradient: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-400",
    shadowColor: "shadow-[6px_6px_0_#d97706]",
    iconColor: "text-amber-400",
    textColor: "text-amber-400",
    glowColor: "rgba(251,191,36,0.4)",
    urgent: true,
  },
  info: {
    icon: Info,
    bgGradient: "from-blue-500/20 to-indigo-500/10",
    borderColor: "border-blue-400",
    shadowColor: "shadow-[6px_6px_0_#2563eb]",
    iconColor: "text-blue-400",
    textColor: "text-blue-400",
    glowColor: "rgba(59,130,246,0.4)",
    urgent: false,
  },
  success: {
    icon: CheckCircle2,
    bgGradient: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-400",
    shadowColor: "shadow-[6px_6px_0_#059669]",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-400",
    glowColor: "rgba(16,185,129,0.4)",
    urgent: false,
  },
};

// ============================================================================
// FLOATING TOAST
// ============================================================================
export default function FloatingToast({ toast }) {
  return (
    <AnimatePresence mode="wait">
      {toast && (
        <ToastItem
          key={toast.id || toast.title}
          toast={toast}
        />
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// TOAST ITEM (con animación de entrada/salida)
// ============================================================================
function ToastItem({ toast }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const isUrgent = config.urgent;

  // Animación de entrada y salida
  const containerVariants = {
    initial: {
      opacity: 0,
      y: -40,
      scale: 0.85,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 22,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-3"
      role={isUrgent ? "alert" : "status"}
      aria-live={isUrgent ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {/* Glow detrás */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-60"
        style={{ background: config.glowColor }}
        aria-hidden="true"
      />

      {/* Contenedor principal */}
      <div
        className={`
          relative
          flex items-center gap-3
          px-4 sm:px-6 py-3
          bg-[#0d101a]/95 backdrop-blur-md
          border-4 ${config.borderColor}
          rounded-2xl
          ${config.shadowColor}
          min-w-[280px] max-w-[90vw] sm:max-w-md
        `}
      >
        {/* Fondo con gradiente */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.bgGradient} opacity-40 pointer-events-none`}
          aria-hidden="true"
        />

        {/* Icono animado */}
        <motion.div
          className={`
            relative flex-shrink-0
            p-2 rounded-lg
            bg-black/60 border-2 ${config.borderColor}
          `}
          animate={
            isUrgent
              ? { rotate: [0, -8, 8, -8, 0] }
              : { scale: [1, 1.15, 1] }
          }
          transition={{
            duration: isUrgent ? 0.6 : 1.5,
            repeat: isUrgent ? 2 : Infinity,
            repeatDelay: isUrgent ? 0.3 : 0.5,
          }}
          aria-hidden="true"
        >
          <Icon
            className={`w-5 h-5 sm:w-6 sm:h-6 ${config.iconColor}`}
            strokeWidth={2.5}
          />
        </motion.div>

        {/* Texto */}
        <div className="relative flex-1 min-w-0">
          <div
            className={`font-['Press_Start_2P'] text-[10px] sm:text-xs uppercase tracking-wider ${config.textColor} mb-1`}
          >
            {toast.title || "ARCADE EVENT"}
          </div>
          <div className="font-['Chakra_Petch'] text-xs sm:text-sm text-white font-bold leading-snug">
            {toast.message || ""}
          </div>
        </div>
      </div>
    </motion.div>
  );
}