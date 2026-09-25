import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Sparkles } from "lucide-react";

// ============================================================================
// LOADING SCREEN — Animación arcade épica
// ============================================================================
export default function LoadingScreen() {
  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación"
      className="min-h-screen bg-[#0d101a] text-white flex flex-col items-center justify-center gap-6 overflow-hidden relative"
    >
      {/* ─── Fondo animado ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 40%, transparent 100%)",
          }}
        />

        {/* Glow dorado central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" />

        {/* Glow cyan superior */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px]" />

        {/* Glow fucsia inferior */}
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      {/* ─── Contenido ────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center gap-6 px-6"
      >
        {/* Icono arcade */}
        <motion.div
          variants={itemVariants}
          className="relative"
          aria-hidden="true"
        >
          <motion.div
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative p-5 sm:p-6 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-2xl border-4 border-black shadow-[6px_6px_0_#000]"
          >
            <Gamepad2 className="w-12 h-12 sm:w-14 sm:h-14 text-black" strokeWidth={2.5} />
          </motion.div>

          {/* Sparkle flotante */}
          <motion.div
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </motion.div>
        </motion.div>

        {/* Título */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <span className="font-['Press_Start_2P'] text-lg sm:text-2xl text-yellow-400 tracking-wider drop-shadow-[3px_3px_0_#000] text-glow-gold">
            ARCADE
          </span>
          <span className="font-['Press_Start_2P'] text-lg sm:text-2xl text-cyan-400 tracking-wider drop-shadow-[3px_3px_0_#000] text-glow-cyan">
            AUCTION
          </span>
        </motion.div>

        {/* Barra de progreso animada */}
        <motion.div
          variants={itemVariants}
          className="w-64 sm:w-80 max-w-full"
          aria-hidden="true"
        >
          <div className="h-2 bg-black/60 border-2 border-slate-700 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-cyan-400 to-fuchsia-400"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: "60%" }}
            />
          </div>
        </motion.div>

        {/* Texto de carga */}
        <motion.p
          variants={itemVariants}
          className="font-['Press_Start_2P'] text-[10px] sm:text-xs text-slate-300 tracking-widest"
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            CARGANDO...
          </motion.span>
        </motion.p>
      </motion.div>

      {/* Texto para screen readers */}
      <span className="sr-only">
        Cargando la aplicación, por favor espera
      </span>
    </div>
  );
}