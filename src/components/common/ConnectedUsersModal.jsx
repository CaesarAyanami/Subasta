import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Users,
  Gamepad2,
  Flame,
  Eye,
  Crown,
  Shield,
} from "lucide-react";

// ============================================================================
// ROLES — Configuración de badges por slot
// ============================================================================
const ROLE_CONFIG = {
  player1: {
    label: "JUGADOR 1",
    shortLabel: "P1",
    icon: Gamepad2,
    bg: "bg-gradient-to-r from-cyan-400 to-blue-500",
    textColor: "text-black",
    border: "border-cyan-300",
    glow: "shadow-[0_0_12px_rgba(34,211,238,0.6)]",
    color: "cyan",
    weight: 0,
  },
  player2: {
    label: "JUGADOR 2",
    shortLabel: "P2",
    icon: Flame,
    bg: "bg-gradient-to-r from-rose-500 to-red-600",
    textColor: "text-white",
    border: "border-rose-300",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.6)]",
    color: "rose",
    weight: 1,
  },
  spectator: {
    label: "ESPECTADOR",
    shortLabel: "ESP",
    icon: Eye,
    bg: "bg-gradient-to-r from-slate-600 to-slate-700",
    textColor: "text-slate-200",
    border: "border-slate-500",
    glow: "shadow-[0_0_8px_rgba(148,163,184,0.3)]",
    color: "slate",
    weight: 2,
  },
};

// ============================================================================
// MODAL
// ============================================================================
export default function ConnectedUsersModal({
  isOpen,
  onClose,
  connectedUsers = [],
  mySlot = null,
}) {
  const closeButtonRef = useRef(null);

  // --------------------------------------------------------------------------
  // ESC + focus + scroll lock
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Ordenar: yo → P1 → P2 → espectadores
  // --------------------------------------------------------------------------
  const sortedUsers = [...connectedUsers].sort((a, b) => {
    const isAMe = !!mySlot && a.slot === mySlot;
    const isBMe = !!mySlot && b.slot === mySlot;
    if (isAMe && !isBMe) return -1;
    if (isBMe && !isAMe) return 1;

    const wa = ROLE_CONFIG[a.slot]?.weight ?? 2;
    const wb = ROLE_CONFIG[b.slot]?.weight ?? 2;
    return wa - wb;
  });

  const playerCount = connectedUsers.filter(
    (u) => u.slot === "player1" || u.slot === "player2"
  ).length;
  const spectatorCount = connectedUsers.length - playerCount;

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="connected-users-title"
            aria-describedby="connected-users-desc"
            className="relative bg-[#151928] border-4 border-yellow-400 rounded-2xl max-w-md w-full p-5 shadow-[8px_8px_0_#eab308] text-white overflow-hidden"
          >
            {/* Glow decorativo fondo */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* ─── Cabecera ────────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between border-b-2 border-yellow-400/40 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-black rounded-lg shadow-[2px_2px_0_#000]"
                  aria-hidden="true"
                >
                  <Users className="w-5 h-5 text-black" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h2
                    id="connected-users-title"
                    className="font-['Press_Start_2P'] text-xs sm:text-sm text-yellow-400 tracking-wider drop-shadow-[1px_1px_0_#000]"
                  >
                    USUARIOS EN LA SALA
                  </h2>
                  <p
                    id="connected-users-desc"
                    className="text-[11px] text-slate-400 font-['Chakra_Petch']"
                  >
                    {connectedUsers.length}{" "}
                    {connectedUsers.length === 1
                      ? "persona conectada"
                      : "personas conectadas"}{" "}
                    en tiempo real
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

            {/* ─── Resumen ─────────────────────────────────────────────── */}
            {connectedUsers.length > 0 && (
              <div className="relative flex items-center justify-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/60 text-cyan-300 text-[10px] font-['Press_Start_2P'] flex items-center gap-1.5">
                  <Crown className="w-3 h-3" aria-hidden="true" />
                  {playerCount} en juego
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-600 text-slate-400 text-[10px] font-['Press_Start_2P'] flex items-center gap-1.5">
                  <Shield className="w-3 h-3" aria-hidden="true" />
                  {spectatorCount}{" "}
                  {spectatorCount === 1 ? "espectador" : "espectadores"}
                </span>
              </div>
            )}

            {/* ─── Lista ───────────────────────────────────────────────── */}
            <div
              className="relative space-y-2 max-h-72 overflow-y-auto pr-1 mb-4"
              role="list"
              aria-live="polite"
              aria-label="Lista de usuarios conectados"
            >
              {connectedUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-['Chakra_Petch'] text-xs">
                  No hay otros usuarios detectados aún.
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {sortedUsers.map((user, idx) => {
                    const isMe = !!mySlot && user.slot === mySlot;
                    const role = ROLE_CONFIG[user.slot] || ROLE_CONFIG.spectator;
                    const Icon = role.icon;

                    return (
                      <motion.div
                        key={user.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.03 }}
                        role="listitem"
                        className={`relative p-3 rounded-xl border-2 flex items-center justify-between gap-3 transition-all ${
                          isMe
                            ? "bg-yellow-400/10 border-yellow-400/80 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                            : "bg-[#0d101a] border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        {/* Indicador "TÚ" */}
                        {isMe && (
                          <span
                            className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded bg-yellow-400 text-black text-[8px] font-['Press_Start_2P'] border border-black shadow-[1px_1px_0_#000]"
                            aria-label="Este eres tú"
                          >
                            TÚ
                          </span>
                        )}

                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Punto de conexión animado */}
                          <div className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
                            <span
                              className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75"
                              aria-hidden="true"
                            />
                            <span
                              className="relative w-2 h-2 rounded-full bg-emerald-500"
                              aria-hidden="true"
                            />
                          </div>

                          <div className="min-w-0">
                            <span className="font-['Chakra_Petch'] font-bold text-sm text-white truncate block max-w-[130px]">
                              {user.name || "Jugador"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-['Chakra_Petch']">
                              En línea ahora
                            </span>
                          </div>
                        </div>

                        {/* Badge de rol */}
                        <span
                          className={`
                            px-2 py-1 rounded-lg
                            text-[9px] font-['Press_Start_2P']
                            border-2 ${role.border}
                            ${role.bg} ${role.textColor}
                            flex items-center gap-1 whitespace-nowrap
                            ${role.glow}
                          `}
                        >
                          <Icon className="w-3 h-3" aria-hidden="true" strokeWidth={2.5} />
                          {role.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* ─── Botón cerrar ────────────────────────────────────────── */}
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-['Press_Start_2P'] text-xs rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transition focus:outline-none focus:ring-2 focus:ring-yellow-200"
            >
              CERRAR
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}