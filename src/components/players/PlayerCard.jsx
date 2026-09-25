import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Check,
  CheckCircle2,
  Edit2,
  Zap,
  Lock,
  UserPlus,
  Flame,
  Crown,
  X,
} from "lucide-react";
import sounds from "../../services/soundEffects";

// ============================================================================
// CONFIG DE JUGADORES
// ============================================================================
const PLAYER_THEME = {
  player1: {
    label: "Jugador 1",
    shortLabel: "P1",
    border: "border-cyan-400 shadow-[4px_4px_0_#0891b2]",
    headerBg: "bg-gradient-to-r from-cyan-950/70 to-cyan-900/40 border-cyan-400/50",
    badge: "bg-gradient-to-r from-cyan-400 to-blue-500 text-black",
    titleColor: "text-cyan-400",
    glow: "rgba(34,211,238,0.3)",
    color: "cyan",
  },
  player2: {
    label: "Jugador 2",
    shortLabel: "P2",
    border: "border-rose-500 shadow-[4px_4px_0_#be123c]",
    headerBg: "bg-gradient-to-r from-rose-950/70 to-rose-900/40 border-rose-500/50",
    badge: "bg-gradient-to-r from-rose-500 to-red-600 text-white",
    titleColor: "text-rose-400",
    glow: "rgba(244,63,94,0.3)",
    color: "rose",
  },
};

// ============================================================================
// COMPONENTE
// ============================================================================
export default function PlayerCard({
  playerId = "player1",
  player,
  isLocalPlayer = false,
  isOccupied = false,
  canToggleReady = true,
  onUpdateName,
  onToggleReady,
  onTakeSlot,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player?.name || "");

  useEffect(() => {
    if (!editingName) setNameInput(player?.name || "");
  }, [player?.name, editingName]);

  const theme = PLAYER_THEME[playerId] || PLAYER_THEME.player1;

  const isEmpty = !isOccupied;
  const isMine = isLocalPlayer;
  const isOtherPlayer = isOccupied && !isLocalPlayer;
  const isReady = !!player?.ready;
  const winStreak = player?.win_streak ?? 0;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim() && nameInput.trim() !== player?.name) {
      onUpdateName(playerId, nameInput.trim());
    }
    setEditingName(false);
  };

  const handleReadyClick = () => {
    if (!canToggleReady || !isMine) return;
    sounds.playReady();
    onToggleReady(playerId);
  };

  const handleTakeSlot = () => {
    sounds.playClick();
    onTakeSlot?.(playerId);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border-4 ${theme.border} bg-[#121526] p-3 sm:p-4 text-white overflow-hidden`}
      aria-label={`Panel de ${theme.label}`}
    >
      {/* Glow decorativo */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-50"
        style={{ background: theme.glow }}
        aria-hidden="true"
      />

      {/* ─── Cabecera ──────────────────────────────────────────────── */}
      <div className={`relative p-2 rounded-xl border-2 ${theme.headerBg} flex items-center justify-between gap-2 mb-3`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <motion.span
            className={`px-2 py-1 rounded-md text-[9px] font-['Press_Start_2P'] font-black uppercase ${theme.badge} shadow-[2px_2px_0_#000]`}
            whileHover={{ scale: 1.05 }}
          >
            {theme.shortLabel}
          </motion.span>

          {/* Edición de nombre */}
          <AnimatePresence mode="wait">
            {editingName && isMine ? (
              <motion.form
                key="editing"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                onSubmit={handleNameSubmit}
                className="flex items-center gap-1 overflow-hidden"
              >
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  maxLength={14}
                  aria-label="Nombre del jugador"
                  className="bg-black border-2 border-yellow-400 px-2 py-1 rounded-md text-xs font-['Press_Start_2P'] text-yellow-300 w-24 sm:w-32 outline-none focus:ring-2 focus:ring-yellow-400/50"
                  onBlur={() => setEditingName(false)}
                />
                <button
                  type="submit"
                  aria-label="Guardar nombre"
                  className="p-1.5 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  aria-label="Cancelar edición"
                  className="p-1.5 bg-rose-500/20 text-rose-300 rounded-md hover:bg-rose-500/30 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <X className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-1.5 group min-w-0 ${
                  isMine ? "cursor-pointer" : ""
                }`}
                onClick={() => isMine && setEditingName(true)}
                role={isMine ? "button" : undefined}
                tabIndex={isMine ? 0 : -1}
                onKeyDown={(e) => {
                  if (isMine && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setEditingName(true);
                  }
                }}
                aria-label={isMine ? "Click para editar tu nombre" : undefined}
              >
                <span
                  className={`font-['Press_Start_2P'] text-xs sm:text-sm ${theme.titleColor} truncate max-w-[110px] sm:max-w-[150px] drop-shadow-[1px_1px_0_#000]`}
                >
                  {player?.name || theme.label}
                </span>
                {isMine && (
                  <Edit2
                    className="w-3 h-3 text-slate-500 group-hover:text-yellow-400 transition flex-shrink-0"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Indicador de conexión */}
        {isOccupied && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 border border-emerald-500/40"
            title="Jugador en línea"
            aria-label="Jugador en línea"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        )}
      </div>

      {/* ─── Saldo ────────────────────────────────────────────────── */}
      <div className="relative bg-black/50 border-2 border-yellow-400/60 rounded-xl p-2.5 mb-3 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 min-w-0">
          <motion.div
            className="p-1.5 bg-gradient-to-br from-yellow-400/30 to-amber-500/10 border border-yellow-400 rounded-lg flex-shrink-0"
            whileHover={{ rotate: 15 }}
          >
            <Coins className="w-5 h-5 text-yellow-400" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
          <motion.div
            key={player?.coins}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg sm:text-xl font-['Press_Start_2P'] text-yellow-400 drop-shadow-[2px_2px_0_#000] truncate"
            aria-live="polite"
            aria-label={`${player?.coins ?? 20} monedas`}
          >
            {player?.coins ?? 20}{" "}
            <span className="text-[10px] text-yellow-200">MON.</span>
          </motion.div>
        </div>

        {/* Racha */}
        {winStreak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/20 border border-orange-500 flex-shrink-0"
            title={`Racha ganadora: ${winStreak}`}
            aria-label={`Racha ganadora de ${winStreak}`}
          >
            <Flame className="w-3 h-3 text-orange-400" strokeWidth={2.5} aria-hidden="true" />
            <span className="font-['Press_Start_2P'] text-[9px] text-orange-300">
              x{winStreak}
            </span>
          </motion.div>
        )}
      </div>

      {/* ─── Botones según estado ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* VACÍO */}
        {isEmpty && (
          <motion.button
            key="empty"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            type="button"
            onClick={handleTakeSlot}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Tomar el slot de ${theme.label}`}
            className="relative w-full py-3 px-3 rounded-xl border-4 border-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider shadow-[4px_4px_0_#000] focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
              <span>TOMAR SLOT</span>
            </div>
          </motion.button>
        )}

        {/* OCUPADO POR OTRO */}
        {isOtherPlayer && (
          <motion.div
            key="occupied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-3 px-3 rounded-xl border-4 border-slate-700 bg-slate-900/60 text-slate-500 font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider flex items-center justify-center gap-2"
            role="status"
            aria-label="Slot ocupado por otro jugador"
          >
            <Lock className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            <span>OCUPADO</span>
          </motion.div>
        )}

        {/* MÍO */}
        {isMine && (
          <motion.div
            key="mine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5"
          >
            <motion.button
              type="button"
              onClick={handleReadyClick}
              disabled={!canToggleReady}
              whileHover={!isReady && canToggleReady ? { scale: 1.02 } : {}}
              whileTap={!isReady && canToggleReady ? { scale: 0.98 } : {}}
              aria-pressed={isReady}
              aria-label={isReady ? "Cancelar listo" : "Marcar como listo"}
              className={`relative w-full py-3 px-3 rounded-xl border-4 font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                isReady
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-black border-black shadow-[4px_4px_0_#000]"
                  : `${theme.badge} text-white border-black shadow-[4px_4px_0_#000]`
              } ${!canToggleReady ? "opacity-60 cursor-not-allowed filter grayscale-[30%]" : "cursor-pointer"}`}
            >
              {/* Pulsing cuando NO listo */}
              {!isReady && canToggleReady && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(255,255,255,0.4)",
                      "0 0 0 8px rgba(255,255,255,0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  aria-hidden="true"
                />
              )}

              <div className="relative flex items-center justify-center gap-2">
                {isReady ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle2
                        className="w-4 h-4 text-black"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </motion.div>
                    <span>¡LISTO!</span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap
                        className="w-4 h-4 text-yellow-300"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    </motion.div>
                    <span>MARCAR LISTO</span>
                  </>
                )}
              </div>
            </motion.button>

            {!canToggleReady && (
              <p className="text-[9px] text-center text-slate-500 font-['Chakra_Petch'] italic">
                (Esperando fin de ronda)
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Etiqueta "TÚ" en la esquina */}
      {isMine && (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: -8 }}
          className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-yellow-400 text-black text-[8px] font-['Press_Start_2P'] border-2 border-black shadow-[2px_2px_0_#000] flex items-center gap-0.5"
          aria-label="Este eres tú"
        >
          <Crown className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
          TÚ
        </motion.span>
      )}
    </motion.div>
  );
}