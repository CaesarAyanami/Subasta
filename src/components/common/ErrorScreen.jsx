import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";

// ============================================================================
// ERROR SCREEN — Rediseño arcade moderno
// ============================================================================
export default function ErrorScreen({ error, onRetry }) {
  // Detecta si es un error de conexión (heurística)
  const isNetworkError =
    typeof error === "string" &&
    (error.toLowerCase().includes("network") ||
      error.toLowerCase().includes("fetch") ||
      error.toLowerCase().includes("conexión") ||
      error.toLowerCase().includes("supabase"));

  const Icon = isNetworkError ? WifiOff : AlertTriangle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen bg-[#0d101a] text-white flex flex-col items-center justify-center gap-6 p-6 text-center overflow-hidden relative"
    >
      {/* ─── Fondo ────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(244,63,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 40%, transparent 100%)",
          }}
        />
      </div>

      {/* ─── Contenido ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-5 max-w-md"
      >
        {/* Icono con glow */}
        <motion.div
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative p-4 bg-gradient-to-br from-rose-600 to-red-800 rounded-2xl border-4 border-black shadow-[6px_6px_0_#000]"
          aria-hidden="true"
        >
          <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Título */}
        <div>
          <h1 className="font-['Press_Start_2P'] text-base sm:text-xl text-rose-400 tracking-wider drop-shadow-[2px_2px_0_#000]">
            {isNetworkError ? "SIN CONEXIÓN" : "UPS, ALGO FALLÓ"}
          </h1>
          <div className="mt-1 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded-full" />
        </div>

        {/* Mensaje */}
        <div className="p-4 bg-black/60 border-2 border-rose-500/40 rounded-xl w-full">
          <p className="font-['Chakra_Petch'] text-sm text-slate-200 leading-relaxed">
            {isNetworkError
              ? "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo."
              : error || "Ocurrió un error inesperado. Intenta recargar la página."}
          </p>
        </div>

        {/* Detalle técnico (opcional, colapsado) */}
        {error && !isNetworkError && (
          <details className="w-full text-left">
            <summary className="cursor-pointer font-['Chakra_Petch'] text-[10px] text-slate-500 hover:text-slate-300 transition">
              Ver detalles técnicos
            </summary>
            <pre className="mt-2 p-2 bg-black/60 border border-slate-800 rounded text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
              {error}
            </pre>
          </details>
        )}

        {/* Botón reintentar */}
        <motion.button
          type="button"
          onClick={onRetry}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-['Press_Start_2P'] text-xs rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" strokeWidth={3} />
          <span>REINTENTAR</span>
        </motion.button>
      </motion.div>
    </div>
  );
}